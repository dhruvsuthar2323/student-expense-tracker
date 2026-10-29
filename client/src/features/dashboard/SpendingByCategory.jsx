import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from './helpers';

const COLORS = [
  '#6366F1', // indigo
  '#F43F5E', // rose
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#14B8A6', // teal
];

/**
 * SpendingByCategory — donut chart + category list for expense breakdown.
 */
export default function SpendingByCategory({ expenseTransactions }) {
  const shouldReduceMotion = useReducedMotion();

  const categoryData = useMemo(() => {
    const map = {};
    expenseTransactions.forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    });
    const totalExpenses = expenseTransactions.reduce(
      (s, t) => s + t.amount,
      0
    );
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        percent:
          totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseTransactions]);

  if (categoryData.length === 0) {
    return (
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📊 Spending by Category
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          No expense data for this period.
        </p>
      </motion.div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
          <p className="font-semibold text-gray-900 dark:text-white">
            {d.name}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {formatCurrency(d.value)} ({d.percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        📊 Spending by Category
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut chart */}
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={!shouldReduceMotion}
              >
                {categoryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category list */}
        <div className="flex-1 w-full space-y-2.5">
          {categoryData.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                {cat.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {cat.percent}%
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(cat.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
