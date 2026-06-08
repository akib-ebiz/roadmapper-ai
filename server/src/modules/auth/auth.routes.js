const { Router } = require('express');
const { register, login, getMe } = require('./auth.controller');
const { validate, registerSchema, loginSchema } = require('./auth.validator');
const authMiddleware = require('./auth.middleware');
const { authLimiter } = require('../../common/middleware/rateLimiter');

const router = Router();

// Apply strict rate limiting to all auth routes
router.use(authLimiter);

/**
 * @route  POST /api/v1/auth/register
 * @access Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route  POST /api/v1/auth/login
 * @access Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route  GET /api/v1/auth/me
 * @access Private
 */
router.get('/me', authMiddleware, getMe);

module.exports = router;
