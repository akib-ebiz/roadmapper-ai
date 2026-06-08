const AuditLog = require('../../models/AuditLog');
const logger = require('../../common/logger');

/**
 * Log an admin action
 */
const logAction = async (adminId, action, targetId, targetType, reason, metadata = {}, ipAddress) => {
  try {
    const auditLog = await AuditLog.create({
      adminId,
      action,
      targetUserId: targetType === 'USER' ? targetId : null,
      targetType,
      targetId,
      reason,
      metadata,
      ipAddress,
    });

    logger.info(`Audit log created: ${action} by admin ${adminId} on ${targetType} ${targetId}`);
    return auditLog;
  } catch (error) {
    logger.error(`Failed to create audit log: ${error.message}`);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
};

/**
 * Get audit logs with filters and pagination
 */
const getAuditLogs = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20, action, userId, adminId, startDate, endDate } = filters;
  const { sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

  const query = AuditLog.find();

  // Apply filters
  if (action) {
    query.where('action').equals(action);
  }

  if (userId) {
    query.where('targetUserId').equals(userId);
  }

  if (adminId) {
    query.where('adminId').equals(adminId);
  }

  if (startDate) {
    query.where('createdAt').gte(new Date(startDate));
  }

  if (endDate) {
    query.where('createdAt').lte(new Date(endDate));
  }

  // Apply sorting
  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
  query.sort(sortObj);

  // Apply pagination
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);

  // Populate admin details
  query.populate('adminId', 'name email role');
  query.populate('targetUserId', 'name email role');

  const logs = await query.lean();
  const total = await AuditLog.countDocuments(query.getFilter());

  return {
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get audit history for a specific user
 */
const getUserAuditHistory = async (userId, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;

  const query = AuditLog.find({ targetUserId: userId });

  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);
  query.sort({ createdAt: -1 });

  query.populate('adminId', 'name email role');

  const logs = await query.lean();
  const total = await AuditLog.countDocuments({ targetUserId: userId });

  return {
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get audit history for a specific admin
 */
const getAdminAuditHistory = async (adminId, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;

  const query = AuditLog.find({ adminId });

  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);
  query.sort({ createdAt: -1 });

  query.populate('targetUserId', 'name email role');

  const logs = await query.lean();
  const total = await AuditLog.countDocuments({ adminId });

  return {
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  logAction,
  getAuditLogs,
  getUserAuditHistory,
  getAdminAuditHistory,
};
