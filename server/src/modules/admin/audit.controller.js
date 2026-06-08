const auditService = require('./audit.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/response');

/**
 * GET /api/v1/admin/audit-logs
 * Get all audit logs with filters and pagination
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query, req.query);
  return sendSuccess(res, result, 'Audit logs retrieved successfully');
});

/**
 * GET /api/v1/admin/audit-logs/user/:userId
 * Get audit history for a specific user
 */
const getUserAuditHistory = asyncHandler(async (req, res) => {
  const result = await auditService.getUserAuditHistory(req.params.userId, req.query);
  return sendSuccess(res, result, 'User audit history retrieved successfully');
});

/**
 * GET /api/v1/admin/audit-logs/admin/:adminId
 * Get audit history for a specific admin
 */
const getAdminAuditHistory = asyncHandler(async (req, res) => {
  const result = await auditService.getAdminAuditHistory(req.params.adminId, req.query);
  return sendSuccess(res, result, 'Admin audit history retrieved successfully');
});

module.exports = {
  getAuditLogs,
  getUserAuditHistory,
  getAdminAuditHistory,
};
