/**
 * AnalyticsPeriodSelector — period picker for analytics page.
 */
const OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export default function AnalyticsPeriodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Analytics period">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          role="radio"
          aria-checked={value === opt.value}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            value === opt.value
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
