import { motion, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { CURRENCY } from '../../lib/constants';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

/**
 * Format a number in Indian locale.
 */
function formatINR(val) {
  return Math.abs(val).toLocaleString('en-IN');
}

/**
 * Get budget status based on percentage used.
 */
function getStatus(pct) {
  if (pct >= 100) return { label: '🚨 Over budget', color: 'red' };
  if (pct >= 80) return { label: '⚠️ Approaching limit', color: 'amber' };
  return { label: '✅ On track', color: 'green' };
}

const barColors = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const badgeBg = {
  green: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  red: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};

/**
 * BudgetCard — displays a single budget with progress.
 * Props: budget, onEdit, onDelete
 */
export default function BudgetCard({ budget, onEdit, onDelete }) {
  const shouldReduceMotion = useReducedMotion();
  const { category, amount, period, startDate, endDate, spent, remaining, percentageUsed } = budget;
  const status = getStatus(percentageUsed);
  const isOver = remaining < 0;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            {category}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {period} · {format(new Date(startDate), 'dd MMM')} –{' '}
            {format(new Date(endDate), 'dd MMM yyyy')}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            aria-label={`Edit ${category} budget`}
          >
            <HiOutlinePencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            aria-label={`Delete ${category} budget`}
          >
            <HiOutlineTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Budget amount */}
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {CURRENCY}{formatINR(amount)} budget
      </p>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <motion.div
          className={`h-full rounded-full ${barColors[status.color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.7, ease: 'easeOut' }
          }
          role="progressbar"
          aria-valuenow={percentageUsed}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${category} budget ${percentageUsed}% used`}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {CURRENCY}{formatINR(spent)} spent
        </span>
        <span className="font-bold text-gray-900 dark:text-white">
          {percentageUsed}%
        </span>
      </div>

      {/* Remaining / Over */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium ${
            isOver
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {isOver
            ? `${CURRENCY}${formatINR(Math.abs(remaining))} over budget`
            : `${CURRENCY}${formatINR(remaining)} remaining`}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBg[status.color]}`}
        >
          {status.label}
        </span>
      </div>
    </motion.div>
  );
}
