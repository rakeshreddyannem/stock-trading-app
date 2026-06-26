const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    ticker: String,
    companyName: String,
    quantity: Number,
    avgPurchasePrice: Number
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    portfolioName: {
        type: String,
        required: true
    },
    holdings: [holdingSchema]
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
