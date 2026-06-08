const logger = require('../logger');
const { AppError } = require('../errors');

/**
 * Global error handling middleware
 * Catches all errors thrown in route handlers/services
 */
const errorHandler = (err, req, res, _next) => {
  // Log every error
  logger.error(`${err.message}`, { stack: err.stack, url: req.url, method: req.method });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Operational / known errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Unknown errors — don't leak details in production
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message;

  return res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
