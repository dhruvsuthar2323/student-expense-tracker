import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/common/PageHeader';
import TransactionForm from '../features/transactions/TransactionForm';
import TransactionList from '../features/transactions/TransactionList';
import TransactionFilters from '../features/transactions/TransactionFilters';
import DeleteConfirmModal from '../features/transactions/DeleteConfirmModal';

// ── Default filter state ──
const DEFAULT_FILTERS = {
  search: '',
  type: 'all',
  category: 'All Categories',
  dateRange: 'all',
  startDate: '',
  endDate: '',
  sort: 'newest',
};

export default function TransactionsPage() {
  const { refreshUser } = useAuth();
  // ── Transaction data ──
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Form state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // ── Delete modal state ──
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Filter state ──
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ── Fetch transactions ──
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get('/transactions');
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Unable to load transactions. Please try again.';
      setFetchError(msg);
      if (err.response?.status === 401) {
        setFetchError('Session expired. Please log in again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── Filtering + sorting pipeline (client-side) ──
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // 1. Search (case-insensitive, matches category or description)
    if (filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      result = result.filter(
        (tx) =>
          tx.category.toLowerCase().includes(term) ||
          (tx.description && tx.description.toLowerCase().includes(term))
      );
    }

    // 2. Type filter
    if (filters.type !== 'all') {
      result = result.filter((tx) => tx.type === filters.type);
    }

    // 3. Category filter
    if (filters.category !== 'All Categories') {
      result = result.filter((tx) => tx.category === filters.category);
    }

    // 4. Date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let start, end;

      switch (filters.dateRange) {
        case 'today':
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case 'week':
          start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
          end = endOfDay(now);
          break;
        case 'month':
          start = startOfMonth(now);
          end = endOfDay(now);
          break;
        case 'custom':
          if (filters.startDate && filters.endDate && filters.startDate <= filters.endDate) {
            start = startOfDay(parseISO(filters.startDate));
            end = endOfDay(parseISO(filters.endDate));
          }
          break;
      }

      if (start && end) {
        result = result.filter((tx) => {
          const txDate = new Date(tx.date);
          return isWithinInterval(txDate, { start, end });
        });
      }
    }

    // 5. Sort
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'highest':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        result.sort((a, b) => a.amount - b.amount);
        break;
    }

    return result;
  }, [transactions, filters]);

  // ── Create / Update transaction ──
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        const { data } = await api.put(
          `/transactions/${editingTransaction._id}`,
          formData
        );
        if (data.success) {
          toast.success('Transaction updated successfully');
          setEditingTransaction(null);
          await fetchTransactions();
        }
      } else {
        const { data } = await api.post('/transactions', formData);
        if (data.success) {
          let msg = 'Transaction added successfully! 🎉';
          if (data.gamification?.xpGained) {
            msg += ` +${data.gamification.xpGained} XP`;
          }
          toast.success(msg);
          if (data.gamification?.leveledUp) {
            setTimeout(() => {
              toast('🎉 Level Up!', {
                description: `You reached Level ${data.gamification.level} — ${data.gamification.title}!`,
              });
            }, 500);
          }
          await fetchTransactions();
          refreshUser();
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (editingTransaction
          ? 'Failed to update transaction.'
          : 'Failed to add transaction.');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete transaction ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { data } = await api.delete(`/transactions/${deleteTarget._id}`);
      if (data.success) {
        toast.success('Transaction deleted');
        setDeleteTarget(null);
        await fetchTransactions();
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to delete transaction.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Helpers ──
  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleFilterChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // ── Overall summary (always based on ALL transactions, not filtered) ──
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Determine empty type for the list
  const emptyType =
    transactions.length === 0 ? 'no-transactions' : 'no-results';

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Transactions"
        emoji="💸"
        subtitle="Track your income and expenses."
      />

      {/* Summary cards — always reflect overall totals */}
      {!isLoading && !fetchError && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Income
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
              + ₹{totalIncome.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Expenses
            </p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
              - ₹{totalExpenses.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Balance
            </p>
            <p
              className={`text-xl font-bold mt-1 ${
                balance >= 0
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              ₹{balance.toLocaleString('en-IN')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main layout: form + history */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form — left */}
        <div className="lg:col-span-2">
          <TransactionForm
            onSubmit={handleSubmit}
            editingTransaction={editingTransaction}
            onCancelEdit={handleCancelEdit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* History — right */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters — only show when there are transactions */}
          {!isLoading && !fetchError && transactions.length > 0 && (
            <TransactionFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
              totalCount={transactions.length}
              filteredCount={filteredTransactions.length}
            />
          )}

          {/* Transaction list */}
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            isLoading={isLoading}
            error={fetchError}
            onRetry={fetchTransactions}
            emptyType={emptyType}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        transaction={deleteTarget}
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
