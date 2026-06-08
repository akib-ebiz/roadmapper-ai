const AppError = require('./AppError');

const NotFoundError = (resource = 'Resource') =>
  new AppError(`${resource} not found`, 404);

const UnauthorizedError = (msg = 'Unauthorized') => new AppError(msg, 401);

const ForbiddenError = (msg = 'Access denied') => new AppError(msg, 403);

const ValidationError = (msg = 'Validation failed') => new AppError(msg, 400);

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
};
