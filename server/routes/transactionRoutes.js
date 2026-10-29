const express = require('express');

const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All transaction routes require authentication
router.use(protect);

// Create a transaction
router.post('/', createTransaction);

// Get all transactions for logged-in user
router.get('/', getTransactions);

// Update a transaction
router.put('/:id', updateTransaction);

// Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router;