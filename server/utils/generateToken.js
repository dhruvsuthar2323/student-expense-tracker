const jwt = require('jsonwebtoken');

/**
 * Generate a JWT for the given user ID and set it as an HTTP-only cookie.
 *
 * @param {object} res - Express response object
 * @param {string} userId - The user's MongoDB _id
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

/**
 * Clear the authentication cookie.
 *
 * @param {object} res - Express response object
 */
const clearToken = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0), // Expire immediately
  });
};

module.exports = { generateToken, clearToken };
