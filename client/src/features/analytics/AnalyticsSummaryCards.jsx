import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from './helpers';

/**
 * AnalyticsSummaryCards — key financial metrics.
 * Props: income, expenses, savings, savingsRate, txCount, avgDailyExpense, largestExpense
 */
export default function AnalyticsSummaryCards({
  income,
  expenses,
  savings,
  savingsRate,
  txCount,
  avgDailyExpense,
}) {
  const shouldReduceMotion = useReducedMotion();

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(income),
      color: 'text-green-600 dark:text-green-400',
      emoji: '💰',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(expenses),
      color: 'text-red-600 dark:text-red-400',
      emoji: '💸',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(savings),
      color: savings >= 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400',
      emoji: savings >= 0 ? '🎉' : '📉',
    },
    {
      label: 'Savings Rate',
      value: income > 0 ? `${savingsRate}%` : 'N/A',
      color: 'text-primary-600 dark:text-primary-400',
      emoji: '📊',
    },
    {
      label: 'Transactions',
      value: txCount.toString(),
      color: 'text-gray-900 dark:text-white',
      emoji: '📝',
    },
    {
      label: 'Avg Daily Expense',
      value: formatCurrency(avgDailyExpense),
      color: 'text-amber-600 dark:text-amber-400',
      emoji: '📅',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5"
        >
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
            <span>{card.emoji}</span> {card.label}
          </p>
          <p className={`text-lg font-bold ${card.color} truncate`}>
            {card.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
