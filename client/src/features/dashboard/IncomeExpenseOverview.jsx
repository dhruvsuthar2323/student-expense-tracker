import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from './helpers';

/**
 * IncomeExpenseOverview — visual bar comparison of income vs expenses.
 */
export default function IncomeExpenseOverview({ income, expenses }) {
  const shouldReduceMotion = useReducedMotion();
  const max = Math.max(income, expenses, 1); // avoid division by 0

  const incomePercent = (income / max) * 100;
  const expensePercent = (expenses / max) * 100;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
        💰 Income vs Expenses
      </h2>

      <div className="space-y-5">
        {/* Income bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Income
            </span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatCurrency(income)}
            </span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${incomePercent}%` }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.8, ease: 'easeOut' }
              }
            />
          </div>
        </div>

        {/* Expense bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Expenses
            </span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              {formatCurrency(expenses)}
            </span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${expensePercent}%` }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.8, ease: 'easeOut', delay: 0.15 }
              }
            />
          </div>
        </div>
      </div>

      {/* Savings ratio */}
      {income > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Savings Rate
            </span>
            <span
              className={`font-bold ${
                income - expenses >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {Math.round(((income - expenses) / income) * 100)}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
