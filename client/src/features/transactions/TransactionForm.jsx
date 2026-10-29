import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineX } from 'react-icons/hi';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CURRENCY } from '../../lib/constants';
import { suggestCategory } from '../smart/engine';

const INITIAL_FORM = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

/**
 * TransactionForm — Add or Edit a transaction.
 *
 * Props:
 *  - onSubmit(formData) — called with validated form data
 *  - editingTransaction — if provided, form enters edit mode
 *  - onCancelEdit — called when user cancels edit
 *  - isSubmitting — disables the form while request is in flight
 */
export default function TransactionForm({
  onSubmit,
  editingTransaction = null,
  onCancelEdit,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [suggestion, setSuggestion] = useState(null);

  const isEditing = !!editingTransaction;

  // Populate form when editing
  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        amount: String(editingTransaction.amount),
        category: editingTransaction.category,
        description: editingTransaction.description || '',
        date: editingTransaction.date
          ? new Date(editingTransaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
      setErrors({});
    }
  }, [editingTransaction]);

  const categories =
    form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // When type changes and the current category isn't in the new list, reset it
  const handleTypeChange = (newType) => {
    const newCategories =
      newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((prev) => ({
      ...prev,
      type: newType,
      category: newCategories.includes(prev.category) ? prev.category : '',
    }));
  };

  const validate = () => {
    const errs = {};
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount)) {
      errs.amount = 'Please enter a valid amount.';
    } else if (amount <= 0) {
      errs.amount = 'Amount must be greater than 0.';
    }
    if (!form.category) {
      errs.category = 'Please select a category.';
    }
    if (!form.date) {
      errs.date = 'Please select a date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
    });
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {isEditing ? '✏️ Edit Transaction' : '➕ Add Transaction'}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              handleReset();
              onCancelEdit?.();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Type toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                    : 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t === 'income' ? '💰 Income' : '💸 Expense'}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Amount ({CURRENCY})
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            {CURRENCY}
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border ${
              errors.amount
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-600'
            } text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border ${
            errors.category
              ? 'border-red-400 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-600'
          } text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none`}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Date
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border ${
            errors.date
              ? 'border-red-400 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-600'
          } text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => {
            const desc = e.target.value;
            setForm({ ...form, description: desc });
            // Auto-suggest category if not editing and no category selected
            if (!isEditing && !form.category && form.type === 'expense') {
              const suggested = suggestCategory(desc);
              setSuggestion(suggested && EXPENSE_CATEGORIES.includes(suggested) ? suggested : null);
            } else {
              setSuggestion(null);
            }
          }}
          maxLength={200}
          placeholder="What was this for?"
          className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
        {suggestion && !form.category && (
          <button
            type="button"
            onClick={() => {
              setForm({ ...form, category: suggestion });
              setSuggestion(null);
            }}
            className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
          >
            <span>🧠</span>
            <span>Suggested: {suggestion}</span>
          </button>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 py-2.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 ${
            form.type === 'income'
              ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25'
              : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
          } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isSubmitting
            ? isEditing
              ? 'Updating...'
              : 'Adding...'
            : isEditing
            ? 'Update Transaction'
            : 'Add Transaction'}
        </button>
        {!isEditing && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </motion.form>
  );
}

