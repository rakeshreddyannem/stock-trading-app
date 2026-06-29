const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    })
);

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/security.log'),
            level: 'info'
        })
    ]
});

// Helper for security specific logs
const logSecurity = (action, email, ip, details = '') => {
    logger.info(`SECURITY_EVENT | Action: ${action} | Email: ${email} | IP: ${ip} | Details: ${details}`);
};

module.exports = { logger, logSecurity };
