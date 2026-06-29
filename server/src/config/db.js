const mongoose = require('mongoose');
const Stock = require('../models/stockSchema');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected...");
        
        // Seed default stocks if empty
        const count = await Stock.countDocuments();
        if (count === 0) {
            console.log("Seeding default stocks...");
            await Stock.create([
                { ticker: 'AAPL', companyName: 'Apple Inc.', currentPrice: 182.52, marketCap: 2850000000000, volume: 52000000 },
                { ticker: 'MSFT', companyName: 'Microsoft Corporation', currentPrice: 421.90, marketCap: 3130000000000, volume: 23000000 },
                { ticker: 'GOOGL', companyName: 'Alphabet Inc.', currentPrice: 173.96, marketCap: 2150000000000, volume: 27000000 },
                { ticker: 'AMZN', companyName: 'Amazon.com Inc.', currentPrice: 185.50, marketCap: 1920000000000, volume: 35000000 },
                { ticker: 'TSLA', companyName: 'Tesla Inc.', currentPrice: 177.46, marketCap: 565000000000, volume: 84000000 },
                { ticker: 'NVDA', companyName: 'NVIDIA Corporation', currentPrice: 875.12, marketCap: 2180000000000, volume: 45000000 },
                { ticker: 'META', companyName: 'Meta Platforms, Inc.', currentPrice: 485.30, marketCap: 1240000000000, volume: 18000000 },
                { ticker: 'NFLX', companyName: 'Netflix, Inc.', currentPrice: 610.50, marketCap: 260000000000, volume: 4000000 },
                { ticker: 'AMD', companyName: 'Advanced Micro Devices, Inc.', currentPrice: 160.20, marketCap: 258000000000, volume: 60000000 }
            ]);
            console.log("Default stocks seeded successfully!");
        }
    } catch (error) {
        console.error("Database connection/seeding failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
