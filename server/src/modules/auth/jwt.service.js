const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * Generate a signed JWT token
 * @param {{ userId: string, email: string, role: string }} payload
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {{ userId: string, email: string, role: string, iat: number, exp: number }}
 * @throws JsonWebTokenError | TokenExpiredError
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Decode a JWT token without verifying signature
 * @param {string} token
 * @returns {object|null}
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = { generateToken, verifyToken, decodeToken };
