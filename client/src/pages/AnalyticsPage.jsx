import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear,
  subMonths, subWeeks, isWithinInterval, format, differenceInDays,
} from 'date-fns';
import api from '../lib/api';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../features/analytics/helpers';

// Analytics sub-components
import AnalyticsPeriodSelector from '../features/analytics/AnalyticsPeriodSelector';
import AnalyticsSummaryCards from '../features/analytics/AnalyticsSummaryCards';
import IncomeExpenseTrend from '../features/analytics/IncomeExpenseTrend';
import CategorySpending from '../features/analytics/CategorySpending';
import CategoryComparison from '../features/analytics/CategoryComparison';
import TopExpenses from '../features/analytics/TopExpenses';
import PeriodComparison from '../features/analytics/PeriodComparison';
import BudgetPerformance from '../features/analytics/BudgetPerformance';
import AnalyticsInsights from '../features/analytics/AnalyticsInsights';

// ── Date range helpers ──
function getDateRange(period) {
  const now = new Date();
  const end = endOfDay(now);
  let start;
  switch (period) {
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(now);
      break;
    case '3months':
      start = startOfDay(subMonths(now, 3));
      break;
    case '6months':
      start = startOfDay(subMonths(now, 6));
      break;
    case 'year':
      start = startOfYear(now);
      break;
    case 'all':
    default:
      return { start: null, end };
  }
  return { start, end };
}

function getPreviousRange(period) {
  const now = new Date();
  switch (period) {
    case 'week': {
      const prevEnd = endOfDay(new Date(startOfWeek(now, { weekStartsOn: 1 }).getTime() - 1));
      const prevStart = startOfWeek(prevEnd, { weekStartsOn: 1 });
      return { start: prevStart, end: prevEnd };
    }
    case 'month': {
      const prevEnd = endOfDay(new Date(startOfMonth(now).getTime() - 1));
      const prevStart = startOfMonth(prevEnd);
      return { start: prevStart, end: prevEnd };
    }
    case '3months': {
      const start = startOfDay(subMonths(now, 6));
      const end = endOfDay(subMonths(now, 3));
      return { start, end };
    }
    case '6months': {
      const start = startOfDay(subMonths(now, 12));
      const end = endOfDay(subMonths(now, 6));
      return { start, end };
    }
    case 'year': {
      const start = startOfYear(subMonths(now, 12));
      const end = endOfDay(new Date(startOfYear(now).getTime() - 1));
      return { start, end };
    }
    default:
      return null;
  }
}

function filterByRange(transactions, range) {
  if (!range || !range.start) return transactions;
  return transactions.filter((tx) => {
    const d = new Date(tx.date);
    return isWithinInterval(d, { start: range.start, end: range.end });
  });
}

// ── Time-series grouping ──
function groupByTime(transactions, period) {
  const groups = {};
  const useDaily = period === 'week' || period === 'month';
  const fmtKey = useDaily ? 'yyyy-MM-dd' : 'yyyy-MM';
  const fmtLabel = useDaily ? 'dd MMM' : 'MMM yyyy';

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const key = format(d, fmtKey);
    if (!groups[key]) groups[key] = { label: format(d, fmtLabel), income: 0, expenses: 0 };
    if (tx.type === 'income') groups[key].income += tx.amount;
    else groups[key].expenses += tx.amount;
  });

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

// ── Category aggregation ──
function getCategories(expenseTxs) {
  const map = {};
  expenseTxs.forEach((tx) => {
    map[tx.category] = (map[tx.category] || 0) + tx.amount;
  });
  const total = expenseTxs.reduce((s, t) => s + t.amount, 0);
  return Object.entries(map)
    .map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

// ── Insights generator ──
function generateInsights(current, previous, categories, period) {
  const insights = [];

  if (categories.length > 0) {
    insights.push({
      emoji: '📌',
      text: `${categories[0].name} is your largest expense category — ${formatCurrency(categories[0].value)} (${categories[0].percent}% of spending).`,
    });
  }

  if (current.income > 0) {
    const rate = Math.round(((current.income - current.expenses) / current.income) * 100);
    insights.push({
      emoji: rate >= 0 ? '💰' : '📉',
      text: `Your savings rate is ${rate}% for this period.`,
    });
  }

  if (previous && previous.expenses > 0) {
    const change = current.expenses - previous.expenses;
    const pct = Math.round((Math.abs(change) / previous.expenses) * 100);
    if (change > 0) {
      insights.push({ emoji: '📈', text: `Your expenses were ${formatCurrency(change)} higher (${pct}%) than the previous period.` });
    } else if (change < 0) {
      insights.push({ emoji: '📉', text: `Your expenses were ${formatCurrency(Math.abs(change))} lower (${pct}%) than the previous period.` });
    }
  }

  if (previous && previous.income > 0) {
    const change = current.income - previous.income;
    if (change > 0) {
      insights.push({ emoji: '🎉', text: `Your income increased by ${formatCurrency(change)} compared to the previous period.` });
    }
  }

  if (insights.length === 0) {
    insights.push({ emoji: '📊', text: 'Not enough data yet to compare spending trends.' });
  }

  return insights;
}

export default function AnalyticsPage() {
  const shouldReduceMotion = useReducedMotion();

  const [allTransactions, setAllTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [period, setPeriod] = useState('month');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get('/transactions');
      if (data.success) setAllTransactions(data.transactions);
    } catch (err) {
      if (err.response?.status === 401) setFetchError('Session expired. Please log in again.');
      else setFetchError(err.response?.data?.message || 'Unable to load analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered data ──
  const range = useMemo(() => getDateRange(period), [period]);
  const prevRange = useMemo(() => getPreviousRange(period), [period]);

  const filtered = useMemo(() => filterByRange(allTransactions, range), [allTransactions, range]);
  const prevFiltered = useMemo(
    () => (prevRange ? filterByRange(allTransactions, prevRange) : []),
    [allTransactions, prevRange]
  );

  // ── Stats ──
  const stats = useMemo(() => {
    const incomeTxs = filtered.filter((t) => t.type === 'income');
    const expenseTxs = filtered.filter((t) => t.type === 'expense');
    const income = incomeTxs.reduce((s, t) => s + t.amount, 0);
    const expenses = expenseTxs.reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    const days = range.start
      ? Math.max(differenceInDays(range.end, range.start), 1)
      : Math.max(differenceInDays(new Date(), new Date(Math.min(...filtered.map(t => new Date(t.date))))), 1);
    const avgDailyExpense = filtered.length > 0 ? Math.round(expenses / days) : 0;

    return { income, expenses, savings, savingsRate, txCount: filtered.length, avgDailyExpense, expenseTxs, incomeTxs };
  }, [filtered, range]);

  const prevStats = useMemo(() => {
    if (!prevRange) return null;
    const income = prevFiltered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = prevFiltered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, savings: income - expenses };
  }, [prevFiltered, prevRange]);

  // ── Derived ──
  const trendData = useMemo(() => groupByTime(filtered, period), [filtered, period]);
  const categories = useMemo(() => getCategories(stats.expenseTxs), [stats.expenseTxs]);
  const topExpenses = useMemo(() =>
    [...stats.expenseTxs].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [stats.expenseTxs]
  );
  const insights = useMemo(
    () => generateInsights({ income: stats.income, expenses: stats.expenses }, prevStats, categories, period),
    [stats, prevStats, categories, period]
  );

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Analytics" emoji="📊" subtitle="Your financial insights." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-16 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──
  if (fetchError) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Analytics" emoji="📊" subtitle="Your financial insights." />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{fetchError}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty ──
  if (allTransactions.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Analytics" emoji="📊" subtitle="Your financial insights." />
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center shadow-sm"
        >
          <p className="text-6xl mb-4">📊</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No analytics yet</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Add your first transaction to start seeing your financial insights.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/transactions" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25 transition-all">
              💰 Add Income
            </Link>
            <Link to="/transactions" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all">
              💸 Add Expense
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header + Period */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageHeader title="Analytics" emoji="📊" subtitle="Your financial insights." />
        <AnalyticsPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Summary cards */}
      <AnalyticsSummaryCards
        income={stats.income}
        expenses={stats.expenses}
        savings={stats.savings}
        savingsRate={stats.savingsRate}
        txCount={stats.txCount}
        avgDailyExpense={stats.avgDailyExpense}
      />

      {/* Trend chart — full width */}
      <IncomeExpenseTrend data={trendData} />

      {/* Category donut + Comparison bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySpending categories={categories} />
        <CategoryComparison categories={categories.slice(0, 8)} />
      </div>

      {/* Top expenses + Period comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopExpenses expenses={topExpenses} />
        <PeriodComparison
          current={{ income: stats.income, expenses: stats.expenses, savings: stats.savings }}
          previous={prevStats}
        />
      </div>

      {/* Budget performance + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetPerformance />
        <AnalyticsInsights insights={insights} />
      </div>
    </div>
  );
}
