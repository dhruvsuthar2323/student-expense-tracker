import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CURRENCY } from '../../lib/constants';
import { formatCurrency, CHART_COLORS } from './helpers';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
      <p className="font-semibold text-gray-900 dark:text-white">{d.name}</p>
      <p className="text-gray-500 dark:text-gray-400">{formatCurrency(d.value)}</p>
    </div>
  );
};

/**
 * CategoryComparison — horizontal bar chart for direct amount comparison.
 * Props: categories — array of { name, value }
 */
export default function CategoryComparison({ categories }) {
  const shouldReduceMotion = useReducedMotion();

  if (!categories || categories.length === 0) return null;

  const data = categories.map((c, i) => ({
    ...c,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        📊 Category Comparison
      </h2>
      <div style={{ height: Math.max(200, data.length * 40 + 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(v) => `${CURRENCY}${(v / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              isAnimationActive={!shouldReduceMotion}
            >
              {data.map((entry, i) => (
                <motion.rect key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
