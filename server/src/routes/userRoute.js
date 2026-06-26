const express = require('express');
const router = express.Router();
const { registerUser, loginUser, createPortfolio, getPortfolios } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/portfolios', protect, createPortfolio);
router.get('/portfolios/:userId', protect, getPortfolios);

module.exports = router;
