const authRepository = require('./auth.repository');
const { hashPassword, comparePassword } = require('./password.service');
const { generateToken } = require('./jwt.service');
const { AppError } = require('../../common/errors');
const logger = require('../../common/logger');

/**
 * Register a new user
 * @param {{ name, email, password, role }} data
 * @returns {{ message: string }}
 */
const register = async ({ name, email, password, role }) => {
  // Check for duplicate email
  const exists = await authRepository.emailExists(email);
  if (exists) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password before storing
  const hashedPassword = await hashPassword(password);

  await authRepository.createUser({ name, email, password: hashedPassword, role });

  logger.info(`New user registered: ${email} [${role}]`);

  return { message: 'User registered successfully' };
};

/**
 * Login a user and return JWT + user info
 * @param {{ email, password }} credentials
 * @returns {{ token: string, user: object }}
 */
const login = async ({ email, password }) => {
  // Fetch user with password field
  const user = await authRepository.findByEmail(email, true);

  if (!user) {
    // Use generic message to avoid user enumeration
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account suspended. Contact support.', 403);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({ userId: user._id, email: user.email, role: user.role });

  logger.info(`User logged in: ${email}`);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Get current user profile by ID
 * @param {string} userId
 * @returns {object} user
 */
const getMe = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

module.exports = { register, login, getMe };
