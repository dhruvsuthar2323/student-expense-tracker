import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from '../analytics/helpers';

/**
 * ReportSummary — key financial metrics for the report.
 */
export default function ReportSummary({
  income, expenses, savings, savingsRate,
  txCount, incomeTxCount, expenseTxCount,
  avgExpense, largestExpense,
}) {
  const shouldReduceMotion = useReducedMotion();

  const rows = [
    { label: 'Total Income', value: formatCurrency(income), emoji: '💰' },
    { label: 'Total Expenses', value: formatCurrency(expenses), emoji: '💸' },
    { label: 'Net Savings', value: formatCurrency(savings), emoji: savings >= 0 ? '🎉' : '📉' },
    { label: 'Savings Rate', value: income > 0 ? `${savingsRate}%` : 'N/A', emoji: '📊' },
    { label: 'Transactions', value: txCount, emoji: '📝' },
    { label: 'Income Transactions', value: incomeTxCount, emoji: '📥' },
    { label: 'Expense Transactions', value: expenseTxCount, emoji: '📤' },
    { label: 'Avg Expense', value: formatCurrency(avgExpense), emoji: '📅' },
    { label: 'Largest Expense', value: formatCurrency(largestExpense), emoji: '🔥' },
  ];

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 print:text-black">
        📋 Summary
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl print:bg-white print:border">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 print:text-gray-600 mb-0.5">
              {r.emoji} {r.label}
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white print:text-black">
              {r.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
