import api from './axiosInstance'

/**
 * Get all users with filters and pagination
 * @param {{ role?: string, status?: string, search?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string }} filters
 */
const getUsers = async (filters = {}) => {
  const res = await api.get('/admin/users', { params: filters })
  return res.data.data // { users, pagination }
}

/**
 * Get user details by ID
 * @param {string} userId
 */
const getUser = async (userId) => {
  const res = await api.get(`/admin/users/${userId}`)
  return res.data.data
}

/**
 * Update user role
 * @param {string} userId
 * @param {{ role: string, reason: string }} data
 */
const updateUserRole = async (userId, data) => {
  const res = await api.patch(`/admin/users/${userId}/role`, data)
  return res.data.data
}

/**
 * Suspend user account
 * @param {string} userId
 * @param {{ reason: string }} data
 */
const suspendUser = async (userId, data) => {
  const res = await api.patch(`/admin/users/${userId}/suspend`, data)
  return res.data.data
}

/**
 * Activate user account
 * @param {string} userId
 * @param {{ reason?: string }} data
 */
const activateUser = async (userId, data = {}) => {
  const res = await api.patch(`/admin/users/${userId}/activate`, data)
  return res.data.data
}

/**
 * Delete user account
 * @param {string} userId
 * @param {{ reason: string }} data
 */
const deleteUser = async (userId, data) => {
  const res = await api.delete(`/admin/users/${userId}`, { data })
  return res.data.data
}

/**
 * Search users by query
 * @param {string} query
 * @param {{ role?: string, status?: string }} filters
 */
const searchUsers = async (query, filters = {}) => {
  const res = await api.get('/admin/users/search', {
    params: { q: query, ...filters }
  })
  return res.data.data // { users }
}

/**
 * Get audit logs with filters
 * @param {{ action?: string, userId?: string, adminId?: string, page?: number, limit?: number, startDate?: string, endDate?: string }} filters
 */
const getAuditLogs = async (filters = {}) => {
  const res = await api.get('/admin/audit-logs', { params: filters })
  return res.data.data // { logs, pagination }
}

/**
 * Get audit history for a specific user
 * @param {string} userId
 * @param {{ page?: number, limit?: number }} pagination
 */
const getUserAuditHistory = async (userId, pagination = {}) => {
  const res = await api.get(`/admin/audit-logs/user/${userId}`, { params: pagination })
  return res.data.data // { logs, pagination }
}

/**
 * Get audit history for a specific admin
 * @param {string} adminId
 * @param {{ page?: number, limit?: number }} pagination
 */
const getAdminAuditHistory = async (adminId, pagination = {}) => {
  const res = await api.get(`/admin/audit-logs/admin/${adminId}`, { params: pagination })
  return res.data.data // { logs, pagination }
}

export default {
  getUsers,
  getUser,
  updateUserRole,
  suspendUser,
  activateUser,
  deleteUser,
  searchUsers,
  getAuditLogs,
  getUserAuditHistory,
  getAdminAuditHistory,
}
