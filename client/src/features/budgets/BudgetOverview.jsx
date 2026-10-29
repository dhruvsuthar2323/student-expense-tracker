import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import api from '../../lib/api';
import { CURRENCY } from '../../lib/constants';

const barColors = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

function getStatusColor(pct) {
  if (pct >= 100) return 'red';
  if (pct >= 80) return 'amber';
  return 'green';
}

/**
 * BudgetOverview — compact budget widget for the Dashboard.
 * Fetches budgets independently and shows the top 3 + a "View Budgets" link.
 */
export default function BudgetOverview() {
  const shouldReduceMotion = useReducedMotion();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const { data } = await api.get('/budgets');
        if (data.success) {
          setBudgets(data.budgets);
        }
      } catch {
        // Silently fail on dashboard — budget section is supplementary
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  if (loading) return null;
  if (budgets.length === 0) return null;

  // Sort by percentageUsed descending (show most critical first), take top 3
  const top = [...budgets]
    .sort((a, b) => b.percentageUsed - a.percentageUsed)
    .slice(0, 3);

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          🎯 Budget Overview
        </h2>
        <Link
          to="/budgets"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
        >
          View Budgets →
        </Link>
      </div>

      <div className="space-y-4">
        {top.map((b) => {
          const color = getStatusColor(b.percentageUsed);
          return (
            <div key={b._id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {b.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {CURRENCY}{b.spent.toLocaleString('en-IN')} / {CURRENCY}
                  {b.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${barColors[color]}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(b.percentageUsed, 100)}%`,
                    }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.6, ease: 'easeOut' }
                    }
                  />
                </div>
                <span
                  className={`text-xs font-bold w-10 text-right ${
                    color === 'red'
                      ? 'text-red-600 dark:text-red-400'
                      : color === 'amber'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {b.percentageUsed}%
                </span>
              </div>
              {b.percentageUsed >= 80 && (
                <p className="text-xs mt-0.5 text-amber-600 dark:text-amber-400">
                  {b.percentageUsed >= 100 ? '🚨 Over budget' : '⚠️ Approaching limit'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
