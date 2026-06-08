const adminService = require('./admin.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/response');

/**
 * GET /api/v1/admin/users
 * Get all users with filters and pagination
 */
const getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUserList(req.query, req.query);
  return sendSuccess(res, result, 'Users retrieved successfully');
});

/**
 * GET /api/v1/admin/users/:id
 * Get user details by ID
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await adminService.getUserDetails(req.params.id);
  return sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * PATCH /api/v1/admin/users/:id/role
 * Update user role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const user = await adminService.updateUserRole(
    req.params.id,
    req.body.role,
    req.user.userId,
    req.body.reason,
    ipAddress
  );
  return sendSuccess(res, user, 'User role updated successfully');
});

/**
 * PATCH /api/v1/admin/users/:id/suspend
 * Suspend user account
 */
const suspendUser = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const user = await adminService.suspendUserAccount(
    req.params.id,
    req.user.userId,
    req.body.reason,
    ipAddress
  );
  return sendSuccess(res, user, 'User suspended successfully');
});

/**
 * PATCH /api/v1/admin/users/:id/activate
 * Activate user account
 */
const activateUser = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const user = await adminService.activateUserAccount(
    req.params.id,
    req.user.userId,
    req.body.reason,
    ipAddress
  );
  return sendSuccess(res, user, 'User activated successfully');
});

/**
 * DELETE /api/v1/admin/users/:id
 * Delete user account
 */
const deleteUser = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const user = await adminService.deleteUserAccount(
    req.params.id,
    req.user.userId,
    req.body.reason,
    ipAddress
  );
  return sendSuccess(res, user, 'User deleted successfully');
});

/**
 * GET /api/v1/admin/users/search
 * Search users
 */
const searchUsers = asyncHandler(async (req, res) => {
  const users = await adminService.searchUsers(req.query.q, req.query);
  return sendSuccess(res, { users }, 'Users found successfully');
});

module.exports = {
  getUsers,
  getUser,
  updateUserRole,
  suspendUser,
  activateUser,
  deleteUser,
  searchUsers,
};
