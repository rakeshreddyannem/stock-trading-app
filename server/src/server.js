const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { logger } = require('./config/logger');

dotenv.config();

connectDB();

const app = express();

// Secure HTTP headers
app.use(helmet());

// NoSQL Injection protection
app.use(mongoSanitize());

// CORS configuration (allow requests from frontend Vite port 5173 only)
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// HTTP request logging via morgan and winston
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Global Rate Limiter: max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Specific Auth Rate Limiter for login/register: max 5 requests per 1 minute
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { message: 'Too many authentication attempts. Please try again in a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// App routes
app.use('/api/auth', require('./routes/userRoute'));
app.use('/api/trade/order', require('./routes/orderRoute'));
app.use('/api/transactions', require('./routes/transactionRoute'));
app.use('/api/stocks', require('./routes/stockRoute'));

// Global Error Handler Middleware (Error Message Security)
app.use((err, req, res, next) => {
    logger.error(`Unhandled Error: ${err.message}\nStack: ${err.stack}`);
    
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred on the server.' 
        : err.message;
        
    res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
