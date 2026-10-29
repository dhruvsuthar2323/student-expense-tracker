import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import api from '../../lib/api';
import { CURRENCY } from '../../lib/constants';

/**
 * BudgetPerformance — analytics view of budget status.
 * Fetches budgets independently.
 */
export default function BudgetPerformance() {
  const shouldReduceMotion = useReducedMotion();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/budgets');
        if (data.success) setBudgets(data.budgets);
      } catch {
        // supplementary section — fail silently
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return null;

  const barColor = (pct) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          🎯 Budget Performance
        </h2>
        <Link
          to="/budgets"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors"
        >
          View Budgets →
        </Link>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No budgets created yet.{' '}
          <Link to="/budgets" className="text-primary-600 dark:text-primary-400 font-medium">
            Create one
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => (
            <div key={b._id}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {b.category}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {CURRENCY}{b.spent?.toLocaleString('en-IN')} / {CURRENCY}{b.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(b.percentageUsed)} transition-all`}
                    style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-10 text-right">
                  {b.percentageUsed}%
                </span>
              </div>
              {b.percentageUsed >= 100 && (
                <p className="text-xs text-red-500 mt-0.5">
                  🚨 {CURRENCY}{Math.abs(b.remaining).toLocaleString('en-IN')} over budget
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
