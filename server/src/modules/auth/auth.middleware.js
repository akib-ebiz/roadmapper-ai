const { verifyToken } = require('./jwt.service');
const { UnauthorizedError } = require('../../common/errors');

/**
 * authMiddleware — verifies JWT from Authorization header
 * Attaches decoded user to req.user = { userId, email, role }
 */
const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(UnauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, email, role, iat, exp }
    return next();
  } catch (err) {
    // JsonWebTokenError and TokenExpiredError are handled by errorHandler
    return next(err);
  }
};

module.exports = authMiddleware;
