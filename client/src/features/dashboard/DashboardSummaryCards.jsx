import { motion, useReducedMotion } from 'framer-motion';
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineListBullet,
} from 'react-icons/hi2';
import { formatCurrency } from './helpers';

const cardConfig = [
  {
    key: 'balance',
    label: 'Total Balance',
    icon: HiOutlineBanknotes,
    gradient: 'from-primary-500 to-indigo-600',
    bgLight: 'bg-primary-50 dark:bg-primary-900/20',
    textColor: (v) =>
      v >= 0
        ? 'text-primary-700 dark:text-primary-300'
        : 'text-red-600 dark:text-red-400',
  },
  {
    key: 'income',
    label: 'Total Income',
    icon: HiOutlineArrowTrendingUp,
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    textColor: () => 'text-green-700 dark:text-green-300',
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    icon: HiOutlineArrowTrendingDown,
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    textColor: () => 'text-red-700 dark:text-red-300',
  },
  {
    key: 'count',
    label: 'Transactions',
    icon: HiOutlineListBullet,
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: () => 'text-amber-700 dark:text-amber-300',
  },
];

/**
 * DashboardSummaryCards — four stat cards.
 * Props: income, expenses, balance, count
 */
export default function DashboardSummaryCards({ income, expenses, balance, count }) {
  const shouldReduceMotion = useReducedMotion();
  const values = { balance, income, expenses, count };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map((card, i) => {
        const Icon = card.icon;
        const val = values[card.key];
        const displayValue =
          card.key === 'count' ? val : formatCurrency(val);

        return (
          <motion.div
            key={card.key}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.textColor(val)}`}>
              {displayValue}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
