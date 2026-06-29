const express = require('express');
const router = express.Router();
const { getTransactions, getAllTransactions } = require('../controllers/transactionController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getTransactions);
router.get('/all', protect, admin, getAllTransactions);

module.exports = router;
