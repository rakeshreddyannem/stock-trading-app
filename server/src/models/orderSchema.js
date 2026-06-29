const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true
    },
    ticker: {
        type: String,
        required: true
    },
    companyName: String,
    price: Number,
    count: Number,
    totalPrice: Number,
    stockType: String,
    orderType: {
        type: String,
        enum: ['BUY', 'SELL']
    },
    orderStatus: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'FAILED']
    }
});

module.exports = mongoose.model('StockOrder', orderSchema);
