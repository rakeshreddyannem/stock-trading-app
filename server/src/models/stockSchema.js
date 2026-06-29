const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    ticker: {
        type: String,
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        required: true
    },
    currentPrice: Number,
    marketCap: Number,
    volume: Number,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Stock', stockSchema);
