const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { calculateStreak, XP_TRANSACTION, XP_DAILY_BONUS, getLevelInfo } = require('../utils/gamification');

// Create a new transaction
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      description,
      date,
    });

    // ── Gamification: award XP + update streak ──
    const user = await User.findById(req.user._id);
    const prevLevel = getLevelInfo(user.xp).level;

    // Check if first tx of the day
    const txDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const lastActivity = user.lastActivityDate
      ? new Date(user.lastActivityDate).toISOString().split('T')[0]
      : null;
    const isFirstOfDay = lastActivity !== txDate;

    let xpGained = XP_TRANSACTION;
    if (isFirstOfDay) xpGained += XP_DAILY_BONUS;

    user.xp += xpGained;

    // Update streak
    const streakData = calculateStreak(user, txDate);
    user.currentStreak = streakData.currentStreak;
    user.longestStreak = streakData.longestStreak;
    user.lastActivityDate = streakData.lastActivityDate;

    await user.save();

    const newLevelInfo = getLevelInfo(user.xp);
    const leveledUp = newLevelInfo.level > prevLevel;

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction,
      gamification: {
        xpGained,
        leveledUp,
        ...newLevelInfo,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message,
    });
  }
};

// Get all transactions for logged-in user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message,
    });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message,
    });
  }
};


// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message
    });
  }
};
module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
};