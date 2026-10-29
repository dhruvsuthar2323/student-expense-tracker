const User = require('../models/User');
const { generateToken, clearToken } = require('../utils/generateToken');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { getLevelInfo } = require('../utils/gamification');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validate input
    const { isValid, errors } = validateRegister({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user (password is hashed by the pre-save hook)
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate JWT and set cookie
    generateToken(res, user._id);

    // Return user data without password
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          preferences: user.preferences,
          createdAt: user.createdAt,
          xp: user.xp,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastActivityDate: user.lastActivityDate,
          gamification: getLevelInfo(user.xp),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const { isValid, errors } = validateLogin({ email, password });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Find user and explicitly include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password'
    );

    // Generic error to avoid revealing which field is wrong
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT and set cookie
    generateToken(res, user._id);

    // Return user data without password
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          preferences: user.preferences,
          createdAt: user.createdAt,
          xp: user.xp,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastActivityDate: user.lastActivityDate,
          gamification: getLevelInfo(user.xp),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out the current user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  clearToken(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get the current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  // req.user is set by the protect middleware (password already excluded)
  const userData = req.user.toObject();
  userData.gamification = getLevelInfo(userData.xp || 0);

  res.status(200).json({
    success: true,
    data: {
      user: userData,
    },
  });
};

module.exports = { register, login, logout, getMe };
