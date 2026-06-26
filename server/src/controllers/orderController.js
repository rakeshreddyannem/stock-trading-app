const { StockOrder, User, Portfolio, Transaction } = require('../Schemas');

const createOrder = async (req, res) => {
    try {
        const { portfolioId, ticker, companyName, price, count, stockType, orderType } = req.body;
        const totalPrice = price * count;
        
        const user = await User.findById(req.user.id);
        const portfolio = await Portfolio.findOne({ _id: portfolioId, userId: req.user.id });

        if (!user || !portfolio) {
            return res.status(404).json({ message: 'User or Portfolio not found' });
        }

        if (orderType === 'BUY') {
            if (user.virtualCashBalance < totalPrice) {
                return res.status(400).json({ message: 'Insufficient funds' });
            }
            user.virtualCashBalance -= totalPrice;
            await user.save();

            const existingHolding = portfolio.holdings.find(h => h.ticker === ticker);
            if (existingHolding) {
                const totalCost = (existingHolding.quantity * existingHolding.avgPurchasePrice) + totalPrice;
                existingHolding.quantity += count;
                existingHolding.avgPurchasePrice = totalCost / existingHolding.quantity;
            } else {
                portfolio.holdings.push({ ticker, companyName, quantity: count, avgPurchasePrice: price });
            }
            await portfolio.save();
        } else if (orderType === 'SELL') {
            const existingHolding = portfolio.holdings.find(h => h.ticker === ticker);
            if (!existingHolding || existingHolding.quantity < count) {
                return res.status(400).json({ message: 'Insufficient stock quantity to sell' });
            }
            user.virtualCashBalance += totalPrice;
            await user.save();

            existingHolding.quantity -= count;
            if (existingHolding.quantity === 0) {
                portfolio.holdings = portfolio.holdings.filter(h => h.ticker !== ticker);
            }
            await portfolio.save();
        } else {
            return res.status(400).json({ message: 'Invalid order type' });
        }

        const order = await StockOrder.create({
            userId: req.user.id,
            portfolioId,
            ticker,
            companyName,
            price,
            count,
            totalPrice,
            stockType,
            orderType,
            orderStatus: 'COMPLETED'
        });

        await Transaction.create({
            userId: req.user.id,
            transactionType: orderType,
            paymentMode: 'VIRTUAL_CASH',
            amount: totalPrice
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await StockOrder.find({ userId: req.user.id }).sort({ _id: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders };
