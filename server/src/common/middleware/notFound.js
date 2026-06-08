const { AppError } = require('../errors');

/**
 * 404 handler — catches all unmatched routes
 */
const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = notFound;
