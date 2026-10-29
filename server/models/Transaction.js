 const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema); 