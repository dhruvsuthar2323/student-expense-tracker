import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineSortDescending,
} from 'react-icons/hi';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../lib/constants';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'income', label: '💰 Income' },
  { value: 'expense', label: '💸 Expense' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
];

const ALL_CATEGORIES = ['All Categories', ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
// Remove duplicates (e.g. "Other" appears in both)
const UNIQUE_CATEGORIES = [...new Set(ALL_CATEGORIES)];

const INPUT_CLASS =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all';

/**
 * TransactionFilters — search, type, category, date, and sort controls.
 *
 * Props:
 *  - filters — current filter state object
 *  - onChange(partialUpdate) — merge partial update into filter state
 *  - onClear() — reset all filters
 *  - totalCount — total transactions (unfiltered)
 *  - filteredCount — currently filtered count
 */
export default function TransactionFilters({
  filters,
  onChange,
  onClear,
  totalCount,
  filteredCount,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.search ||
    filters.type !== 'all' ||
    filters.category !== 'All Categories' ||
    filters.dateRange !== 'all' ||
    filters.sort !== 'newest';

  const isFiltered = totalCount !== filteredCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-sm"
    >
      {/* Top row: search + toggle */}
      <div className="flex gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search by category or description..."
            aria-label="Search transactions"
            className={`${INPUT_CLASS} pl-9 pr-8`}
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              aria-label="Clear search"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
            showFilters || hasActiveFilters
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
          }`}
          aria-label="Toggle filters"
        >
          <HiOutlineFilter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Expandable filter row */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {/* Type filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => onChange({ type: e.target.value })}
                  aria-label="Filter by type"
                  className={`${INPUT_CLASS} appearance-none`}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => onChange({ category: e.target.value })}
                  aria-label="Filter by category"
                  className={`${INPUT_CLASS} appearance-none`}
                >
                  {UNIQUE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Period
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => onChange({ dateRange: e.target.value })}
                  aria-label="Filter by date period"
                  className={`${INPUT_CLASS} appearance-none`}
                >
                  {DATE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => onChange({ sort: e.target.value })}
                  aria-label="Sort transactions"
                  className={`${INPUT_CLASS} appearance-none`}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom date range (shown only when dateRange === 'custom') */}
            <AnimatePresence>
              {filters.dateRange === 'custom' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          onChange({ startDate: e.target.value })
                        }
                        aria-label="Start date"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => onChange({ endDate: e.target.value })}
                        aria-label="End date"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                  {filters.startDate &&
                    filters.endDate &&
                    filters.startDate > filters.endDate && (
                      <p className="mt-2 text-sm text-red-500">
                        Start date cannot be after end date.
                      </p>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom row: results count + clear */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isFiltered ? (
            <>
              Showing{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {filteredCount}
              </span>{' '}
              of {totalCount} transaction{totalCount !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {totalCount}
              </span>{' '}
              transaction{totalCount !== 1 ? 's' : ''}
            </>
          )}
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </motion.div>
  );
}
