const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Budget amount must be greater than 0'],
    },

    period: {
      type: String,
      enum: ['monthly', 'weekly'],
      default: 'monthly',
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);
