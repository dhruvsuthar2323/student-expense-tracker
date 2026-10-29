import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { CURRENCY } from '../../lib/constants';

function formatINR(val) {
  return `${CURRENCY}${Math.abs(val).toLocaleString('en-IN')}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

/**
 * IncomeExpenseTrend — bar chart showing income vs expenses over time.
 * Props: data — array of { label, income, expenses }
 */
export default function IncomeExpenseTrend({ data }) {
  const shouldReduceMotion = useReducedMotion();

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          📈 Income vs Expense Trend
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Not enough data to display a trend.
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
        📈 Income vs Expense Trend
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(v) => `${CURRENCY}${(v / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              isAnimationActive={!shouldReduceMotion}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#F43F5E"
              radius={[4, 4, 0, 0]}
              isAnimationActive={!shouldReduceMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
