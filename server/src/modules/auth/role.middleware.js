const { ForbiddenError } = require('../../common/errors');

/**
 * roleMiddleware — restricts access to specific roles
 * Must be used AFTER authMiddleware
 *
 * Usage:
 *   router.post('/courses', authMiddleware, roleMiddleware('instructor'), createCourse)
 *   router.get('/admin', authMiddleware, roleMiddleware('admin', 'instructor'), handler)
 *
 * @param {...string} roles - allowed roles
 */
const roleMiddleware = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ForbiddenError('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}`));
    }

    return next();
  };
};

module.exports = roleMiddleware;
