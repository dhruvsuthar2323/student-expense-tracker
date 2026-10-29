const express = require('express');

const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All budget routes require authentication
router.use(protect);

// Create a budget
router.post('/', createBudget);

// Get all budgets for logged-in user
router.get('/', getBudgets);

// Update a budget
router.put('/:id', updateBudget);

// Delete a budget
router.delete('/:id', deleteBudget);

module.exports = router;
