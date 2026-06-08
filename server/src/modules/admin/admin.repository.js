const User = require('../users/user.model');

/**
 * Get all users with filters and pagination
 */
const getAllUsers = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
  const { role, search, status } = filters;

  const query = User.find();

  // Apply filters
  if (role) {
    query.where('role').equals(role);
  }

  if (status === 'active') {
    query.where('isActive').equals(true);
  } else if (status === 'suspended') {
    query.where('isActive').equals(false);
  }

  if (search) {
    query.where({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    });
  }

  // Apply sorting
  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
  query.sort(sortObj);

  // Apply pagination
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);

  const users = await query.lean();
  const total = await User.countDocuments(query.getFilter());

  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).lean();
  return user;
};

/**
 * Suspend user account
 */
const suspendUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  ).lean();
  return user;
};

/**
 * Activate user account
 */
const activateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    { new: true }
  ).lean();
  return user;
};

/**
 * Delete user account (soft delete by setting isActive to false)
 */
const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId).lean();
  return user;
};

/**
 * Search users by query
 */
const searchUsers = async (query, filters = {}) => {
  const { role, status } = filters;

  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
  };

  if (role) {
    searchQuery.role = role;
  }

  if (status === 'active') {
    searchQuery.isActive = true;
  } else if (status === 'suspended') {
    searchQuery.isActive = false;
  }

  const users = await User.find(searchQuery).limit(50).lean();
  return users;
};

/**
 * Update user role
 */
const updateUserRole = async (userId, newRole) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true }
  ).lean();
  return user;
};

module.exports = {
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
  deleteUser,
  searchUsers,
  updateUserRole,
};
