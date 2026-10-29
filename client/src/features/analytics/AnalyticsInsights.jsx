import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from './helpers';

/**
 * AnalyticsInsights — auto-generated factual insights from transaction data.
 * Props: insights — array of { text, emoji }
 */
export default function AnalyticsInsights({ insights }) {
  const shouldReduceMotion = useReducedMotion();

  if (!insights || insights.length === 0) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        💡 Insights
      </h2>
      <ul className="space-y-2">
        {insights.map((ins, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3.5 py-2.5"
          >
            <span className="text-base flex-shrink-0">{ins.emoji}</span>
            <span>{ins.text}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
