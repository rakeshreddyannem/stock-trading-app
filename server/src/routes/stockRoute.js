const express = require('express');
const router = express.Router();
const { getAllStocks, getStockByTicker } = require('../controllers/stockController');

router.get('/', getAllStocks);
router.get('/:ticker', getStockByTicker);

module.exports = router;
