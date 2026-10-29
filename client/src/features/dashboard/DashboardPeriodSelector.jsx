import { motion } from 'framer-motion';

const PERIODS = [
  { value: 'month', label: 'This Month' },
  { value: 'week', label: 'This Week' },
  { value: 'today', label: 'Today' },
  { value: 'all', label: 'All Time' },
];

/**
 * DashboardPeriodSelector — pill-style period picker for the dashboard.
 */
export default function DashboardPeriodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Dashboard period">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          role="radio"
          aria-checked={value === p.value}
          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            value === p.value
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
