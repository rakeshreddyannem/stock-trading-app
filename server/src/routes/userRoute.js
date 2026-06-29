const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');
const { protect, verified, admin } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/portfolios', protect, verified, createPortfolio);
router.get('/portfolios/:userId', protect, getPortfolios);
router.get('/users', protect, admin, getAllUsers);
router.post('/deposit', protect, verified, depositFunds);
router.post('/withdraw', protect, verified, withdrawFunds);

// Verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

// Password Reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// MFA routes
router.post('/mfa/setup', protect, setupMfa);
router.post('/mfa/verify', protect, verifyMfa);
router.post('/mfa/disable', protect, disableMfa);
router.post('/mfa/login-verify', loginVerifyMfa);

module.exports = router;
