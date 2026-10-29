import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { CURRENCY } from '../../lib/constants';

/**
 * TransactionList — Renders a list of transactions with edit/delete actions.
 *
 * Props:
 *  - transactions — array of transaction objects
 *  - onEdit(transaction) — called when edit is clicked
 *  - onDelete(transaction) — called when delete is clicked
 *  - isLoading — show loading state
 *  - error — show error state
 */
export default function TransactionList({
  transactions = [],
  onEdit,
  onDelete,
  isLoading,
  error,
  onRetry,
  emptyType = 'no-transactions', // 'no-transactions' | 'no-results'
}) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty state — no transactions exist
  if (transactions.length === 0 && emptyType === 'no-transactions') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-4xl mb-3">📝</p>
        <p className="font-semibold text-gray-900 dark:text-white mb-1">
          No transactions yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add your first income or expense to get started.
        </p>
      </div>
    );
  }

  // Empty state — filters returned no results
  if (transactions.length === 0 && emptyType === 'no-results') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-semibold text-gray-900 dark:text-white mb-1">
          No transactions found
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
        <AnimatePresence>
          {transactions.map((tx) => (
            <TransactionItem
              key={tx._id}
              transaction={tx}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function TransactionItem({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'income';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
    >
      {/* Category icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
          isIncome
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-red-100 dark:bg-red-900/30'
        }`}
      >
        {isIncome ? '💰' : '💸'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {transaction.category}
          </p>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              isIncome
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}
          >
            {transaction.type}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {transaction.date
              ? format(new Date(transaction.date), 'dd MMM yyyy')
              : '—'}
          </p>
          {transaction.description && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {transaction.description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <p
        className={`font-bold text-sm whitespace-nowrap ${
          isIncome
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {isIncome ? '+' : '-'} {CURRENCY}
        {transaction.amount.toLocaleString('en-IN')}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
          title="Edit"
        >
          <HiOutlinePencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(transaction)}
          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title="Delete"
        >
          <HiOutlineTrash className="h-4 w-4" />
        </button>
      </div>
    </motion.li>
  );
}

