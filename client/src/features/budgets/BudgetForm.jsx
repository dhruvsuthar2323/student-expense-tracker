import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EXPENSE_CATEGORIES, CURRENCY } from '../../lib/constants';

const INPUT_CLASS =
  'w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all';

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
];

/**
 * BudgetForm — create or edit a budget.
 * Props:
 *  - onSubmit(formData) — called with { category, amount, period, startDate, endDate }
 *  - editingBudget — budget object when editing, null for create
 *  - onCancelEdit() — cancel editing
 *  - isSubmitting — loading state
 */
export default function BudgetForm({
  onSubmit,
  editingBudget = null,
  onCancelEdit,
  isSubmitting = false,
}) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});

  // Prefill when editing
  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category || '');
      setAmount(String(editingBudget.amount || ''));
      setPeriod(editingBudget.period || 'monthly');
      setStartDate(
        editingBudget.startDate
          ? new Date(editingBudget.startDate).toISOString().split('T')[0]
          : ''
      );
      setEndDate(
        editingBudget.endDate
          ? new Date(editingBudget.endDate).toISOString().split('T')[0]
          : ''
      );
      setErrors({});
    } else {
      resetForm();
    }
  }, [editingBudget]);

  const resetForm = () => {
    setCategory('');
    setAmount('');
    setPeriod('monthly');
    setStartDate('');
    setEndDate('');
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Please select a category.';
    if (!amount || parseFloat(amount) <= 0)
      errs.amount = `Budget amount must be greater than ${CURRENCY}0.`;
    if (!startDate) errs.startDate = 'Start date is required.';
    if (!endDate) errs.endDate = 'End date is required.';
    if (startDate && endDate && startDate > endDate)
      errs.endDate = 'End date cannot be before start date.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      category,
      amount: parseFloat(amount),
      period,
      startDate,
      endDate,
    });
    if (!editingBudget) resetForm();
  };

  const isEditing = !!editingBudget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {isEditing ? '✏️ Edit Budget' : '➕ Create Budget'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label
            htmlFor="budget-category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category
          </label>
          <select
            id="budget-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${INPUT_CLASS} appearance-none`}
            aria-label="Budget category"
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="budget-amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Budget Amount ({CURRENCY})
          </label>
          <input
            id="budget-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10000"
            className={INPUT_CLASS}
            aria-label="Budget amount"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
          )}
        </div>

        {/* Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Period
          </label>
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  period === opt.value
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label={opt.label}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start & End Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="budget-start"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Start Date
            </label>
            <input
              id="budget-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLASS}
              aria-label="Budget start date"
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="budget-end"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              End Date
            </label>
            <input
              id="budget-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={INPUT_CLASS}
              aria-label="Budget end date"
            />
            {errors.endDate && (
              <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-white bg-primary-600 hover:bg-primary-700 font-semibold transition-all shadow-lg shadow-primary-500/25 ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Budget'
              : 'Create Budget'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
