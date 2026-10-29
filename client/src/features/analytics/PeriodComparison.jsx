import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from './helpers';

/**
 * PeriodComparison — compares current vs previous period.
 * Props: current: { income, expenses, savings }, previous: { income, expenses, savings }
 */
export default function PeriodComparison({ current, previous }) {
  const shouldReduceMotion = useReducedMotion();

  if (!previous) return null;

  function changeInfo(curr, prev, label) {
    if (prev === 0 && curr === 0) return { text: 'No change', color: 'text-gray-500' };
    if (prev === 0) return { text: 'No previous-period data', color: 'text-gray-400' };
    const pct = Math.round(((curr - prev) / prev) * 100);
    const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→';
    const color = pct === 0 ? 'text-gray-500' : 'text-primary-600 dark:text-primary-400';
    return { text: `${arrow} ${Math.abs(pct)}% vs previous period`, color };
  }

  const rows = [
    { label: 'Income', curr: current.income, prev: previous.income },
    { label: 'Expenses', curr: current.expenses, prev: previous.expenses },
    { label: 'Net Savings', curr: current.savings, prev: previous.savings },
  ];

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        🔄 Period Comparison
      </h2>
      <div className="space-y-4">
        {rows.map((r) => {
          const info = changeInfo(r.curr, r.prev, r.label);
          return (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {r.label}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(r.curr)}
                </span>
              </div>
              <p className={`text-xs ${info.color}`}>{info.text}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
