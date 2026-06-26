const { User, Portfolio } = require('../Schemas');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id, userType) => {
    return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password, userType } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            userType: userType || 'user'
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                virtualCashBalance: user.virtualCashBalance,
                token: generateToken(user._id, user.userType)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                virtualCashBalance: user.virtualCashBalance,
                token: generateToken(user._id, user.userType)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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

module.exports = { registerUser, loginUser, createPortfolio, getPortfolios };
