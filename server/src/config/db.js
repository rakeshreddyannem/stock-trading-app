const mongoose = require('mongoose');
const Stock = require('../models/stockSchema');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected...");
        
        // Idempotent seeding of default stocks
        console.log("Syncing default stocks in database...");
        const defaultStocks = [
            { ticker: 'AAPL', companyName: 'Apple Inc.', currentPrice: 182.52, marketCap: 2850000000000, volume: 52000000 },
            { ticker: 'MSFT', companyName: 'Microsoft Corporation', currentPrice: 421.90, marketCap: 3130000000000, volume: 23000000 },
            { ticker: 'GOOGL', companyName: 'Alphabet Inc.', currentPrice: 173.96, marketCap: 2150000000000, volume: 27000000 },
            { ticker: 'AMZN', companyName: 'Amazon.com Inc.', currentPrice: 185.50, marketCap: 1920000000000, volume: 35000000 },
            { ticker: 'TSLA', companyName: 'Tesla Inc.', currentPrice: 177.46, marketCap: 565000000000, volume: 84000000 },
            { ticker: 'NVDA', companyName: 'NVIDIA Corporation', currentPrice: 875.12, marketCap: 2180000000000, volume: 45000000 },
            { ticker: 'META', companyName: 'Meta Platforms, Inc.', currentPrice: 485.30, marketCap: 1240000000000, volume: 18000000 },
            { ticker: 'NFLX', companyName: 'Netflix, Inc.', currentPrice: 610.50, marketCap: 260000000000, volume: 4000000 },
            { ticker: 'AMD', companyName: 'Advanced Micro Devices, Inc.', currentPrice: 160.20, marketCap: 258000000000, volume: 60000000 },
            { ticker: 'JPM', companyName: 'JPMorgan Chase & Co.', currentPrice: 195.40, marketCap: 560000000000, volume: 10000000 },
            { ticker: 'V', companyName: 'Visa Inc.', currentPrice: 275.20, marketCap: 570000000000, volume: 6000000 },
            { ticker: 'JNJ', companyName: 'Johnson & Johnson', currentPrice: 156.40, marketCap: 375000000000, volume: 8000000 },
            { ticker: 'WMT', companyName: 'Walmart Inc.', currentPrice: 60.15, marketCap: 480000000000, volume: 15000000 },
            { ticker: 'PG', companyName: 'Procter & Gamble Co.', currentPrice: 162.10, marketCap: 385000000000, volume: 6500000 },
            { ticker: 'XOM', companyName: 'Exxon Mobil Corporation', currentPrice: 118.30, marketCap: 470000000000, volume: 16000000 },
            { ticker: 'LLY', companyName: 'Eli Lilly and Company', currentPrice: 760.10, marketCap: 720000000000, volume: 3000000 },
            { ticker: 'MA', companyName: 'Mastercard Incorporated', currentPrice: 475.30, marketCap: 440000000000, volume: 3500000 },
            { ticker: 'AVGO', companyName: 'Broadcom Inc.', currentPrice: 1350.00, marketCap: 630000000000, volume: 2000000 },
            { ticker: 'HD', companyName: 'The Home Depot, Inc.', currentPrice: 382.40, marketCap: 380000000000, volume: 4500000 },
            { ticker: 'CVX', companyName: 'Chevron Corporation', currentPrice: 155.60, marketCap: 290000000000, volume: 9000000 },
            { ticker: 'MRK', companyName: 'Merck & Co., Inc.', currentPrice: 122.50, marketCap: 310000000000, volume: 8000000 },
            { ticker: 'ABBV', companyName: 'AbbVie Inc.', currentPrice: 178.40, marketCap: 315000000000, volume: 5500000 },
            { ticker: 'PEP', companyName: 'PepsiCo, Inc.', currentPrice: 168.50, marketCap: 230000000000, volume: 5000000 },
            { ticker: 'KO', companyName: 'The Coca-Cola Company', currentPrice: 61.20, marketCap: 265000000000, volume: 12000000 },
            { ticker: 'COST', companyName: 'Costco Wholesale Corporation', currentPrice: 725.60, marketCap: 320000000000, volume: 2500000 },
            { ticker: 'TSM', companyName: 'Taiwan Semiconductor Manufacturing Co.', currentPrice: 140.20, marketCap: 728000000000, volume: 14000000 },
            { ticker: 'ADBE', companyName: 'Adobe Inc.', currentPrice: 485.20, marketCap: 220000000000, volume: 4000000 },
            { ticker: 'CRM', companyName: 'Salesforce, Inc.', currentPrice: 295.10, marketCap: 285000000000, volume: 6000000 },
            { ticker: 'DIS', companyName: 'The Walt Disney Company', currentPrice: 112.50, marketCap: 205000000000, volume: 8000000 },
            { ticker: 'NKE', companyName: 'NIKE, Inc.', currentPrice: 94.80, marketCap: 140000000000, volume: 7000000 },
            { ticker: 'ORCL', companyName: 'Oracle Corporation', currentPrice: 125.40, marketCap: 345000000000, volume: 11000000 },
            { ticker: 'BAC', companyName: 'Bank of America Corporation', currentPrice: 37.20, marketCap: 295000000000, volume: 38000000 },
            { ticker: 'PYPL', companyName: 'PayPal Holdings, Inc.', currentPrice: 64.50, marketCap: 70000000000, volume: 9000000 },
            { ticker: 'INTC', companyName: 'Intel Corporation', currentPrice: 30.10, marketCap: 128000000000, volume: 45000000 }
        ];

        for (const stockData of defaultStocks) {
            await Stock.updateOne(
                { ticker: stockData.ticker },
                { $setOnInsert: stockData },
                { upsert: true }
            );
        }
        console.log("Default stocks seeded/synced successfully!");
    } catch (error) {
        console.error("Database connection/seeding failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
