import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import api from '../lib/api';
import { CURRENCY } from '../lib/constants';
import PageHeader from '../components/common/PageHeader';
import BudgetForm from '../features/budgets/BudgetForm';
import BudgetCard from '../features/budgets/BudgetCard';
import BudgetDeleteModal from '../features/budgets/BudgetDeleteModal';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
];

function formatINR(val) {
  return Math.abs(val).toLocaleString('en-IN');
}

export default function BudgetsPage() {
  const shouldReduceMotion = useReducedMotion();

  // Data
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter
  const [periodFilter, setPeriodFilter] = useState('all');

  // Fetch
  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get('/budgets');
      if (data.success) {
        setBudgets(data.budgets);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setFetchError('Session expired. Please log in again.');
      } else {
        setFetchError(
          err.response?.data?.message || 'Unable to load your budgets.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Filtered budgets
  const filteredBudgets = useMemo(() => {
    if (periodFilter === 'all') return budgets;
    return budgets.filter((b) => b.period === periodFilter);
  }, [budgets, periodFilter]);

  // Summary
  const summary = useMemo(() => {
    const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const overCount = budgets.filter((b) => b.percentageUsed >= 100).length;
    return { totalBudgeted, totalSpent, totalRemaining, overCount };
  }, [budgets]);

  // Create / Update
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingBudget) {
        const { data } = await api.put(
          `/budgets/${editingBudget._id}`,
          formData
        );
        if (data.success) {
          toast.success('Budget updated successfully');
          setEditingBudget(null);
          setShowForm(false);
          await fetchBudgets();
        }
      } else {
        const { data } = await api.post('/budgets', formData);
        if (data.success) {
          toast.success('Budget created! 🎯');
          setShowForm(false);
          await fetchBudgets();
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (editingBudget
          ? 'Failed to update budget.'
          : 'Failed to create budget.');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { data } = await api.delete(`/budgets/${deleteTarget._id}`);
      if (data.success) {
        toast.success('Budget deleted');
        setDeleteTarget(null);
        await fetchBudgets();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete budget.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setShowForm(false);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Budgets"
          emoji="🎯"
          subtitle="Set limits and stay on track with your spending."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-20 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (fetchError) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Budgets"
          emoji="🎯"
          subtitle="Set limits and stay on track with your spending."
        />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">
            {fetchError}
          </p>
          <button
            onClick={fetchBudgets}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header + Create button */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader
          title="Budgets"
          emoji="🎯"
          subtitle="Set limits and stay on track with your spending."
        />
        {!showForm && (
          <button
            onClick={() => {
              setEditingBudget(null);
              setShowForm(true);
            }}
            className="self-start px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all flex-shrink-0"
          >
            + Create Budget
          </button>
        )}
      </div>

      {/* Form (collapsible) */}
      {showForm && (
        <BudgetForm
          onSubmit={handleSubmit}
          editingBudget={editingBudget}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Summary cards */}
      {budgets.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Total Budgeted
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {CURRENCY}{formatINR(summary.totalBudgeted)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Total Spent
            </p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
              {CURRENCY}{formatINR(summary.totalSpent)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Remaining
            </p>
            <p
              className={`text-lg font-bold mt-1 ${
                summary.totalRemaining >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {summary.totalRemaining < 0 ? '-' : ''}
              {CURRENCY}{formatINR(summary.totalRemaining)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Over Budget
            </p>
            <p
              className={`text-lg font-bold mt-1 ${
                summary.overCount > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {summary.overCount}
            </p>
          </div>
        </motion.div>
      )}

      {/* Period filter */}
      {budgets.length > 0 && (
        <div className="flex gap-2" role="radiogroup" aria-label="Budget period filter">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriodFilter(opt.value)}
              role="radio"
              aria-checked={periodFilter === opt.value}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                periodFilter === opt.value
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {budgets.length === 0 && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center shadow-sm"
        >
          <p className="text-6xl mb-4">🎯</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No budgets yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Create a budget to start controlling your spending.
          </p>
          <button
            onClick={() => {
              setEditingBudget(null);
              setShowForm(true);
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all"
          >
            + Create Budget
          </button>
        </motion.div>
      )}

      {/* Budget cards grid */}
      {filteredBudgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* No results from filter */}
      {budgets.length > 0 && filteredBudgets.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No {periodFilter} budgets found.
          </p>
        </div>
      )}

      {/* Delete modal */}
      <BudgetDeleteModal
        budget={deleteTarget}
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
