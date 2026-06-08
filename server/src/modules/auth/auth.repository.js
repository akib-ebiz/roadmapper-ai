const User = require('../users/user.model');

/**
 * Find a user by email.
 * selectPassword: include hashed password field (needed for login comparison)
 */
const findByEmail = async (email, selectPassword = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  if (selectPassword) query.select('+password');
  return query.lean();
};

/**
 * Find a user by ID
 */
const findById = async (id) => {
  return User.findById(id).lean();
};

/**
 * Create a new user document
 */
const createUser = async (data) => {
  const user = await User.create(data);
  return user.toObject();
};

/**
 * Check if email already exists
 */
const emailExists = async (email) => {
  const count = await User.countDocuments({ email: email.toLowerCase() });
  return count > 0;
};

module.exports = { findByEmail, findById, createUser, emailExists };
