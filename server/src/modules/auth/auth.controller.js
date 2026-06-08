const authService = require('./auth.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/response');

/**
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendCreated(res, {}, result.message);
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  return sendSuccess(res, { token, user }, 'Login successful');
});

/**
 * GET /api/v1/auth/me
 * Protected — requires authMiddleware
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  return sendSuccess(res, user, 'User retrieved');
});

module.exports = { register, login, getMe };
