const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verify JWT from HTTP-only cookie.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  const token = req.cookies.token;

  // No token provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — please log in',
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired — please log in again',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
};

module.exports = { protect };
