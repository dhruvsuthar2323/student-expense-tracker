import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * DashboardEmptyState — shown when the user has zero transactions.
 */
export default function DashboardEmptyState() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center shadow-sm"
    >
      <div className="text-6xl mb-4">🚀</div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Your dashboard is waiting for its first transaction!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
        Add your first income or expense to start tracking your finances and
        unlock your financial overview.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/transactions"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25 transition-all"
        >
          💰 Add Income
        </Link>
        <Link
          to="/transactions"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all"
        >
          💸 Add Expense
        </Link>
      </div>
    </motion.div>
  );
}
