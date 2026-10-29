import { motion, useReducedMotion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { formatCurrency, CHART_COLORS } from './helpers';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
      <p className="font-semibold text-gray-900 dark:text-white">{d.name}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {formatCurrency(d.value)} ({d.percent}%)
      </p>
    </div>
  );
};

/**
 * CategorySpending — donut chart + sorted category list.
 * Props: categories — array of { name, value, percent }
 */
export default function CategorySpending({ categories }) {
  const shouldReduceMotion = useReducedMotion();

  if (!categories || categories.length === 0) {
    return (
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🍩 Spending by Category
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          No expense data for this period.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        🍩 Spending by Category
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={!shouldReduceMotion}
              >
                {categories.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 w-full space-y-2">
          {categories.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                {cat.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{cat.percent}%</span>
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
