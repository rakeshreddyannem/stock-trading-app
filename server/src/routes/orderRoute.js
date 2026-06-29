const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getAllOrders } = require('../controllers/orderController');
const { protect, verified, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, verified, createOrder)
    .get(protect, getOrders);

router.get('/all', protect, admin, getAllOrders);

module.exports = router;
