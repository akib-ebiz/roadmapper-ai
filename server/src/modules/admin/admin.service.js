const adminRepository = require('./admin.repository');
const auditService = require('./audit.service');
const { AppError } = require('../../common/errors');
const logger = require('../../common/logger');

/**
 * Get list of users with filters and pagination
 */
const getUserList = async (filters, pagination) => {
  const result = await adminRepository.getAllUsers(filters, pagination);
  return result;
};

/**
 * Get user details by ID
 */
const getUserDetails = async (userId) => {
  const user = await adminRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Suspend user account
 */
const suspendUserAccount = async (userId, adminId, reason, ipAddress) => {
  // Check if user exists
  const user = await adminRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent self-suspension
  if (userId === adminId) {
    throw new AppError('Cannot suspend your own account', 400);
  }

  // Check if already suspended
  if (!user.isActive) {
    throw new AppError('User is already suspended', 400);
  }

  const updatedUser = await adminRepository.suspendUser(userId);

  // Log audit action
  await auditService.logAction(
    adminId,
    'SUSPEND_USER',
    userId,
    'USER',
    reason,
    { previousStatus: user.isActive, newStatus: false },
    ipAddress
  );

  logger.info(`User suspended: ${user.email} by admin: ${adminId}, reason: ${reason}`);

  return updatedUser;
};

/**
 * Activate user account
 */
const activateUserAccount = async (userId, adminId, reason, ipAddress) => {
  // Check if user exists
  const user = await adminRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if already active
  if (user.isActive) {
    throw new AppError('User is already active', 400);
  }

  const updatedUser = await adminRepository.activateUser(userId);

  // Log audit action
  await auditService.logAction(
    adminId,
    'ACTIVATE_USER',
    userId,
    'USER',
    reason,
    { previousStatus: user.isActive, newStatus: true },
    ipAddress
  );

  logger.info(`User activated: ${user.email} by admin: ${adminId}, reason: ${reason}`);

  return updatedUser;
};

/**
 * Delete user account
 */
const deleteUserAccount = async (userId, adminId, reason, ipAddress) => {
  // Check if user exists
  const user = await adminRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent self-deletion
  if (userId === adminId) {
    throw new AppError('Cannot delete your own account', 400);
  }

  const deletedUser = await adminRepository.deleteUser(userId);

  // Log audit action
  await auditService.logAction(
    adminId,
    'DELETE_USER',
    userId,
    'USER',
    reason,
    { userEmail: user.email, userRole: user.role },
    ipAddress
  );

  logger.info(`User deleted: ${user.email} by admin: ${adminId}, reason: ${reason}`);

  return deletedUser;
};

/**
 * Update user role
 */
const updateUserRole = async (userId, newRole, adminId, reason, ipAddress) => {
  // Check if user exists
  const user = await adminRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent self-role change
  if (userId === adminId) {
    throw new AppError('Cannot change your own role', 400);
  }

  // Check if role is the same
  if (user.role === newRole) {
    throw new AppError('User already has this role', 400);
  }

  const updatedUser = await adminRepository.updateUserRole(userId, newRole);

  // Log audit action
  await auditService.logAction(
    adminId,
    'UPDATE_ROLE',
    userId,
    'USER',
    reason,
    { previousRole: user.role, newRole },
    ipAddress
  );

  logger.info(`User role updated: ${user.email} from ${user.role} to ${newRole} by admin: ${adminId}, reason: ${reason}`);

  return updatedUser;
};

/**
 * Search users
 */
const searchUsers = async (query, filters) => {
  const users = await adminRepository.searchUsers(query, filters);
  return users;
};

module.exports = {
  getUserList,
  getUserDetails,
  suspendUserAccount,
  activateUserAccount,
  deleteUserAccount,
  updateUserRole,
  searchUsers,
};
