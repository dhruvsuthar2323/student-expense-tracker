const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Allowed expense categories (must match frontend constants)
const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Other',
];

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, amount, period, startDate, endDate } = req.body;

    // Validate category
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Please select a category.',
      });
    }
    if (!EXPENSE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Budgets can only be created for expense categories.',
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be greater than ₹0.',
      });
    }

    // Validate period
    if (period && !['monthly', 'weekly'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid budget period.',
      });
    }

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required.',
      });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date.',
      });
    }

    // Check for duplicate active budget
    const duplicate = await Budget.findOne({
      user: req.user._id,
      category,
      period: period || 'monthly',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${period || 'monthly'} ${category} budget for this period.`,
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      period: period || 'monthly',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create budget',
      error: error.message,
    });
  }
};

// @desc    Get all budgets with spending data
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: budget.user,
              type: 'expense',
              category: budget.category,
              date: { $gte: budget.startDate, $lte: budget.endDate },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalSpent = spent.length > 0 ? spent[0].total : 0;

        return {
          ...budget.toObject(),
          spent: totalSpent,
          remaining: budget.amount - totalSpent,
          percentageUsed:
            budget.amount > 0
              ? Math.round((totalSpent / budget.amount) * 100)
              : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: budgetsWithSpending.length,
      budgets: budgetsWithSpending,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
      error: error.message,
    });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    const { category, amount, period, startDate, endDate } = req.body;

    // Validate category if provided
    if (category && !EXPENSE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Budgets can only be created for expense categories.',
      });
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be greater than ₹0.',
      });
    }

    // Validate period if provided
    if (period && !['monthly', 'weekly'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid budget period.',
      });
    }

    // Validate dates
    const newStart = startDate ? new Date(startDate) : budget.startDate;
    const newEnd = endDate ? new Date(endDate) : budget.endDate;
    if (newStart > newEnd) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date.',
      });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      budget: updatedBudget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
      error: error.message,
    });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget',
      error: error.message,
    });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};
