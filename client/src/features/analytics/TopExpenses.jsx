import { motion, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { formatCurrency } from './helpers';

/**
 * TopExpenses — top 5 individual expenses.
 * Props: expenses — array of transaction objects, already sorted by amount desc
 */
export default function TopExpenses({ expenses }) {
  const shouldReduceMotion = useReducedMotion();

  if (!expenses || expenses.length === 0) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          🔥 Largest Expenses
        </h2>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {expenses.map((tx, i) => (
          <li
            key={tx._id || i}
            className="flex items-center gap-3 px-5 py-3"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-sm font-bold text-red-600 dark:text-red-400">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {tx.category}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {tx.description || format(new Date(tx.date), 'dd MMM yyyy')}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {formatCurrency(tx.amount)}
              </p>
              <p className="text-xs text-gray-400">
                {format(new Date(tx.date), 'dd MMM')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
