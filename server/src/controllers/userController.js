const { User, Portfolio, Transaction } = require('../Schemas');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { logSecurity, logger } = require('../config/logger');

const generateToken = (id, userType) => {
    return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateTempMfaToken = (id) => {
    return jwt.sign({ id, tempMfa: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password, userType } = req.body;

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address format' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            logSecurity('REGISTER_FAIL', email, req.ip, 'Email already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            userType: userType || 'user',
            isVerified: true,
            verificationToken,
            verificationTokenExpires
        });

        if (user) {
            const verifyLink = `http://localhost:5173/?verifyToken=${verificationToken}`;
            logger.info(`[DEMO] Email verification link for ${email}: ${verifyLink}`);
            logSecurity('REGISTER_SUCCESS', email, req.ip, `UserId: ${user._id}`);

            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                virtualCashBalance: user.virtualCashBalance,
                isVerified: user.isVerified,
                token: generateToken(user._id, user.userType),
                demoVerificationLink: verifyLink
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            logSecurity('LOGIN_FAIL', email, req.ip, 'User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check account lockout
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingMin = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
            logSecurity('LOGIN_FAIL_LOCKED', email, req.ip, `Account locked for ${remainingMin} more mins`);
            return res.status(423).json({
                message: `Account is temporarily locked due to consecutive failed attempts. Try again in ${remainingMin} minutes.`
            });
        }

        // If lock expired, reset lockout stats
        if (user.lockUntil && user.lockUntil <= Date.now()) {
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Reset lockout counters on success
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();

            logSecurity('LOGIN_CREDENTIALS_OK', email, req.ip, `MFA Active: ${user.isMfaEnabled}`);

            // Normal login (MFA bypassed)
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                virtualCashBalance: user.virtualCashBalance,
                isVerified: user.isVerified,
                isMfaEnabled: user.isMfaEnabled,
                token: generateToken(user._id, user.userType)
            });
        } else {
            // Increment failed login count
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins lockout
                logSecurity('ACCOUNT_LOCKED', email, req.ip, '5 failed attempts, locking account');
            } else {
                logSecurity('LOGIN_FAIL_PWD', email, req.ip, `Failed attempt ${user.failedLoginAttempts}/5`);
            }
            await user.save();

            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        logSecurity('EMAIL_VERIFIED', user.email, req.ip, `UserId: ${user._id}`);
        res.json({ message: 'Email verified successfully!' });
    } catch (error) {
        logger.error(`Email verification error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred during verification.' });
    }
};

const resendVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const verifyLink = `http://localhost:5173/?verifyToken=${verificationToken}`;
        logger.info(`[DEMO] Resent verification link for ${user.email}: ${verifyLink}`);
        logSecurity('RESEND_VERIFICATION', user.email, req.ip);

        res.json({
            message: 'Verification link resent successfully.',
            demoVerificationLink: verifyLink
        });
    } catch (error) {
        logger.error(`Resend verification error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred resending verification.' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            logSecurity('FORGOT_PASSWORD_FAIL', email, req.ip, 'Email not registered');
            return res.json({ message: 'If an account with that email exists, a password reset link has been logged to the console.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        const resetLink = `http://localhost:5173/?resetToken=${resetToken}`;
        logger.info(`[DEMO] Password reset link for ${email}: ${resetLink}`);
        logSecurity('FORGOT_PASSWORD_SUCCESS', email, req.ip);

        res.json({
            message: 'If an account with that email exists, a password reset link has been logged to the console.',
            demoResetLink: resetLink
        });
    } catch (error) {
        logger.error(`Forgot password error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred during request.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).'
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        logSecurity('PASSWORD_RESET_SUCCESS', user.email, req.ip, `UserId: ${user._id}`);
        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        logger.error(`Reset password error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred resetting password.' });
    }
};

const setupMfa = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const secret = speakeasy.generateSecret({ name: `SBStocks:${user.email}` });
        user.mfaSecret = secret.base32;
        await user.save();

        const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
        logSecurity('MFA_SETUP_INIT', user.email, req.ip);

        res.json({
            secret: secret.base32,
            qrCode: qrCodeDataUrl
        });
    } catch (error) {
        logger.error(`MFA setup error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred preparing MFA.' });
    }
};

const verifyMfa = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.mfaSecret) {
            return res.status(400).json({ message: 'MFA setup not initialized.' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (verified) {
            user.isMfaEnabled = true;
            await user.save();
            logSecurity('MFA_ENABLED', user.email, req.ip);
            res.json({ message: 'MFA activated successfully.' });
        } else {
            logSecurity('MFA_ENABLE_FAIL', user.email, req.ip, 'Incorrect code entered');
            res.status(400).json({ message: 'Invalid verification code. Try again.' });
        }
    } catch (error) {
        logger.error(`MFA verify error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred during verification.' });
    }
};

const disableMfa = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.isMfaEnabled) {
            return res.status(400).json({ message: 'MFA is not enabled.' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (verified) {
            user.isMfaEnabled = false;
            user.mfaSecret = undefined;
            await user.save();
            logSecurity('MFA_DISABLED', user.email, req.ip);
            res.json({ message: 'MFA disabled successfully.' });
        } else {
            logSecurity('MFA_DISABLE_FAIL', user.email, req.ip, 'Incorrect code entered');
            res.status(400).json({ message: 'Invalid verification code. Try again.' });
        }
    } catch (error) {
        logger.error(`MFA disable error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred disabling MFA.' });
    }
};

const loginVerifyMfa = async (req, res) => {
    try {
        const { mfaToken, code } = req.body;
        
        let decoded;
        try {
            decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'MFA session expired. Please sign in again.' });
        }

        if (!decoded || !decoded.tempMfa) {
            return res.status(401).json({ message: 'Invalid session context.' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (verified) {
            logSecurity('LOGIN_MFA_SUCCESS', user.email, req.ip);
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                virtualCashBalance: user.virtualCashBalance,
                isVerified: user.isVerified,
                isMfaEnabled: user.isMfaEnabled,
                token: generateToken(user._id, user.userType)
            });
        } else {
            logSecurity('LOGIN_MFA_FAIL', user.email, req.ip, 'Incorrect TOTP code');
            res.status(401).json({ message: 'Invalid verification code.' });
        }
    } catch (error) {
        logger.error(`Login MFA verify error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred during verification.' });
    }
};

const createPortfolio = async (req, res) => {
    try {
        const { portfolioName } = req.body;
        const portfolio = await Portfolio.create({
            userId: req.user.id,
            portfolioName,
            holdings: []
        });
        res.status(201).json(portfolio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPortfolios = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (req.user.id !== userId && req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const portfolios = await Portfolio.find({ userId });
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires -mfaSecret');
        res.json(users);
    } catch (error) {
        logger.error(`Get all users error: ${error.message}`);
        res.status(500).json({ message: 'An error occurred fetching users list.' });
    }
};

const depositFunds = async (req, res) => {
    try {
        const { amount, paymentMode } = req.body;
        const userId = req.user.id;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Please provide a valid deposit amount greater than zero' });
        }

        const allowedModes = ['UPI', 'NET_BANKING', 'CARD'];
        if (!paymentMode || !allowedModes.includes(paymentMode)) {
            return res.status(400).json({ message: 'Invalid payment method selected' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.virtualCashBalance += parseFloat(amount);
        await user.save();

        await Transaction.create({
            userId,
            transactionType: 'DEPOSIT',
            paymentMode,
            amount: parseFloat(amount)
        });

        logger.info(`User ${user.email} deposited $${amount} via ${paymentMode}`);

        const updatedUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            userType: user.userType,
            virtualCashBalance: user.virtualCashBalance,
            isVerified: user.isVerified,
            isMfaEnabled: user.isMfaEnabled
        };

        res.json({
            message: `Successfully deposited $${amount}!`,
            user: updatedUser
        });
    } catch (error) {
        logger.error(`Deposit error: ${error.message}`);
        res.status(500).json({ message: 'Failed to process deposit' });
    }
};

const withdrawFunds = async (req, res) => {
    try {
        const { amount, paymentMode } = req.body;
        const userId = req.user.id;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Please provide a valid withdrawal amount greater than zero' });
        }

        const allowedModes = ['UPI', 'NET_BANKING', 'CARD'];
        if (!paymentMode || !allowedModes.includes(paymentMode)) {
            return res.status(400).json({ message: 'Invalid payment method selected' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.virtualCashBalance < parseFloat(amount)) {
            return res.status(400).json({ message: 'Insufficient balance to make this withdrawal' });
        }

        user.virtualCashBalance -= parseFloat(amount);
        await user.save();

        await Transaction.create({
            userId,
            transactionType: 'WITHDRAWAL',
            paymentMode,
            amount: parseFloat(amount)
        });

        logger.info(`User ${user.email} withdrew $${amount} via ${paymentMode}`);

        const updatedUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            userType: user.userType,
            virtualCashBalance: user.virtualCashBalance,
            isVerified: user.isVerified,
            isMfaEnabled: user.isMfaEnabled
        };

        res.json({
            message: `Successfully withdrew $${amount}!`,
            user: updatedUser
        });
    } catch (error) {
        logger.error(`Withdrawal error: ${error.message}`);
        res.status(500).json({ message: 'Failed to process withdrawal' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    createPortfolio,
    getPortfolios,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    setupMfa,
    verifyMfa,
    disableMfa,
    loginVerifyMfa,
    getAllUsers,
    depositFunds,
    withdrawFunds
};
