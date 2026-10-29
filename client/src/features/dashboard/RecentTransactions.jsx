import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { formatCurrency } from './helpers';

/**
 * RecentTransactions — latest 5 transactions + View All link.
 */
export default function RecentTransactions({ transactions }) {
  const shouldReduceMotion = useReducedMotion();
  const recent = transactions.slice(0, 5);

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          🕒 Recent Transactions
        </h2>
        <Link
          to="/transactions"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
        >
          View All →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-4xl mb-2">📝</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No transactions yet.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
          <AnimatePresence>
            {recent.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <motion.li
                  key={tx._id}
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                      isIncome
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {isIncome ? '💰' : '💸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {tx.category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {tx.description
                        ? tx.description
                        : format(new Date(tx.date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <p
                    className={`font-bold text-sm whitespace-nowrap ${
                      isIncome
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
}
