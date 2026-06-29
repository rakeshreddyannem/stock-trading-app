const axios = require('axios');
const { Stock } = require('../Schemas');

// Fetch live stock price from Finnhub API with 1-minute database caching
const fetchAndUpdateStock = async (stock) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
        console.warn("No FINNHUB_API_KEY set in server environment!");
        return stock;
    }

    const CACHE_DURATION_MS = 60 * 1000; // 1 minute cache
    const now = new Date();

    // If stock price was updated within the last minute, return cached version
    if (stock.lastUpdated && (now - stock.lastUpdated) < CACHE_DURATION_MS) {
        return stock;
    }

    try {
        const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=${apiKey}`,
            { timeout: 5000 }
        );

        const data = response.data;
        if (data && typeof data.c === 'number' && data.c > 0) {
            stock.currentPrice = data.c;
            stock.lastUpdated = now;
            await stock.save();
        }
    } catch (error) {
        console.error(`Failed to fetch live price for ${stock.ticker} from Finnhub:`, error.message);
        // Fall back to the cached stock details currently in DB
    }

    return stock;
};

const getAllStocks = async (req, res) => {
    try {
        const stocks = await Stock.find({});
        const updatedStocks = await Promise.all(stocks.map(fetchAndUpdateStock));
        res.json(updatedStocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStockByTicker = async (req, res) => {
    try {
        let stock = await Stock.findOne({ ticker: req.params.ticker.toUpperCase() });
        if (stock) {
            stock = await fetchAndUpdateStock(stock);
            res.json(stock);
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllStocks, getStockByTicker };
