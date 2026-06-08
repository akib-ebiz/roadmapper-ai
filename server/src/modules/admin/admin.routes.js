const { Router } = require('express');
const {
  getUsers,
  getUser,
  updateUserRole,
  suspendUser,
  activateUser,
  deleteUser,
  searchUsers,
} = require('./admin.controller');
const {
  getAuditLogs,
  getUserAuditHistory,
  getAdminAuditHistory,
} = require('./audit.controller');
const {
  validate,
  validateQuery,
  suspendUserSchema,
  activateUserSchema,
  deleteUserSchema,
  updateRoleSchema,
  userFiltersSchema,
  auditLogFiltersSchema,
} = require('./admin.validator');
const authMiddleware = require('../auth/auth.middleware');
const roleMiddleware = require('../auth/role.middleware');

const router = Router();

/**
 * All admin routes require authentication and admin role
 */
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

/**
 * @route  GET /api/v1/admin/users
 * @access Admin
 * @desc   Get all users with filters and pagination
 */
router.get('/users', validateQuery(userFiltersSchema), getUsers);

/**
 * @route  GET /api/v1/admin/users/search
 * @access Admin
 * @desc   Search users by query
 */
router.get('/users/search', searchUsers);

/**
 * @route  GET /api/v1/admin/users/:id
 * @access Admin
 * @desc   Get user details by ID
 */
router.get('/users/:id', getUser);

/**
 * @route  PATCH /api/v1/admin/users/:id/role
 * @access Admin
 * @desc   Update user role
 */
router.patch('/users/:id/role', validate(updateRoleSchema), updateUserRole);

/**
 * @route  PATCH /api/v1/admin/users/:id/suspend
 * @access Admin
 * @desc   Suspend user account
 */
router.patch('/users/:id/suspend', validate(suspendUserSchema), suspendUser);

/**
 * @route  PATCH /api/v1/admin/users/:id/activate
 * @access Admin
 * @desc   Activate user account
 */
router.patch('/users/:id/activate', validate(activateUserSchema), activateUser);

/**
 * @route  DELETE /api/v1/admin/users/:id
 * @access Admin
 * @desc   Delete user account
 */
router.delete('/users/:id', validate(deleteUserSchema), deleteUser);

/**
 * @route  GET /api/v1/admin/audit-logs
 * @access Admin
 * @desc   Get all audit logs with filters and pagination
 */
router.get('/audit-logs', validateQuery(auditLogFiltersSchema), getAuditLogs);

/**
 * @route  GET /api/v1/admin/audit-logs/user/:userId
 * @access Admin
 * @desc   Get audit history for a specific user
 */
router.get('/audit-logs/user/:userId', getUserAuditHistory);

/**
 * @route  GET /api/v1/admin/audit-logs/admin/:adminId
 * @access Admin
 * @desc   Get audit history for a specific admin
 */
router.get('/audit-logs/admin/:adminId', getAdminAuditHistory);

module.exports = router;
