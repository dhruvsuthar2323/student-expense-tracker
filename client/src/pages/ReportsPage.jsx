import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '../lib/api';
import { CURRENCY, APP_NAME } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../features/analytics/helpers';
import {
  getReportDateRange, getPreviousReportRange,
  filterByRange, getPeriodLabel,
  csvEscape, downloadCSV,
} from '../features/reports/helpers';

// Report sub-components
import AnalyticsPeriodSelector from '../features/analytics/AnalyticsPeriodSelector';
import ReportSummary from '../features/reports/ReportSummary';
import CategoryReport from '../features/reports/CategoryReport';
import ReportTransactionTable from '../features/reports/ReportTransactionTable';

// ── Period label map ──
const PERIOD_LABELS = {
  week: 'This Week', month: 'This Month', '3months': 'Last 3 Months',
  '6months': 'Last 6 Months', year: 'This Year', all: 'All Time',
};

export default function ReportsPage() {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  // State
  const [allTransactions, setAllTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [txRes, budgetRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budgets').catch(() => ({ data: { budgets: [] } })),
      ]);
      if (txRes.data.success) setAllTransactions(txRes.data.transactions);
      setBudgets(budgetRes.data.budgets || []);
    } catch (err) {
      if (err.response?.status === 401) setFetchError('Session expired. Please log in again.');
      else setFetchError(err.response?.data?.message || 'Unable to generate your report.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered data ──
  const range = useMemo(() => getReportDateRange(period), [period]);
  const prevRange = useMemo(() => getPreviousReportRange(period), [period]);

  const periodFiltered = useMemo(() => filterByRange(allTransactions, range), [allTransactions, range]);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return periodFiltered;
    return periodFiltered.filter((t) => t.type === typeFilter);
  }, [periodFiltered, typeFilter]);

  // Sorted for table display
  const sortedForTable = useMemo(() =>
    [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filtered]
  );

  // ── Stats (always use periodFiltered for full stats, typeFilter only affects table) ──
  const stats = useMemo(() => {
    const incomeTxs = periodFiltered.filter((t) => t.type === 'income');
    const expenseTxs = periodFiltered.filter((t) => t.type === 'expense');
    const income = incomeTxs.reduce((s, t) => s + t.amount, 0);
    const expenses = expenseTxs.reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    const avgExpense = expenseTxs.length > 0 ? Math.round(expenses / expenseTxs.length) : 0;
    const largestExpense = expenseTxs.length > 0
      ? Math.max(...expenseTxs.map((t) => t.amount))
      : 0;

    return {
      income, expenses, savings, savingsRate,
      txCount: periodFiltered.length,
      incomeTxCount: incomeTxs.length,
      expenseTxCount: expenseTxs.length,
      avgExpense, largestExpense, expenseTxs, incomeTxs,
    };
  }, [periodFiltered]);

  // Categories
  const categories = useMemo(() => {
    const map = {};
    stats.expenseTxs.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const total = stats.expenses;
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, percent: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  // Top 5 expenses
  const topExpenses = useMemo(() =>
    [...stats.expenseTxs].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [stats.expenseTxs]
  );

  // Period comparison
  const prevStats = useMemo(() => {
    if (!prevRange) return null;
    const prev = filterByRange(allTransactions, prevRange);
    const income = prev.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = prev.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, savings: income - expenses };
  }, [allTransactions, prevRange]);

  // Insights
  const insights = useMemo(() => {
    const ins = [];
    if (categories.length > 0) {
      ins.push({ emoji: '📌', text: `${categories[0].name} was the largest expense category — ${formatCurrency(categories[0].value)} (${categories[0].percent}% of spending).` });
    }
    if (stats.income > 0) {
      ins.push({ emoji: '💰', text: `Your savings rate for this period was ${stats.savingsRate}%.` });
    }
    if (prevStats && prevStats.expenses > 0) {
      const change = stats.expenses - prevStats.expenses;
      const pct = Math.round((Math.abs(change) / prevStats.expenses) * 100);
      if (change > 0) ins.push({ emoji: '📈', text: `Expenses were ${formatCurrency(change)} higher (${pct}%) than the previous period.` });
      else if (change < 0) ins.push({ emoji: '📉', text: `Expenses were ${formatCurrency(Math.abs(change))} lower (${pct}%) than the previous period.` });
    }
    // Budget insights
    budgets.forEach((b) => {
      if (b.percentageUsed >= 100) {
        ins.push({ emoji: '🚨', text: `Your ${b.category} budget is over — ${b.percentageUsed}% used.` });
      } else if (b.percentageUsed >= 80) {
        ins.push({ emoji: '⚠️', text: `Your ${b.category} budget reached ${b.percentageUsed}% usage.` });
      }
    });
    if (ins.length === 0) {
      ins.push({ emoji: '📊', text: 'Not enough data yet to generate insights.' });
    }
    return ins;
  }, [categories, stats, prevStats, budgets]);

  // ── CSV Export ──
  const handleExportCSV = () => {
    const lines = [];
    const periodLabel = getPeriodLabel(period);

    // Summary
    lines.push('REPORT SUMMARY');
    lines.push('Metric,Value');
    lines.push(`Period,${csvEscape(periodLabel)}`);
    lines.push(`Generated,${csvEscape(format(new Date(), 'dd MMM yyyy HH:mm'))}`);
    lines.push(`Total Income,${stats.income}`);
    lines.push(`Total Expenses,${stats.expenses}`);
    lines.push(`Net Savings,${stats.savings}`);
    lines.push(`Savings Rate,${stats.income > 0 ? stats.savingsRate + '%' : 'N/A'}`);
    lines.push(`Transaction Count,${stats.txCount}`);
    lines.push(`Income Transactions,${stats.incomeTxCount}`);
    lines.push(`Expense Transactions,${stats.expenseTxCount}`);
    lines.push(`Average Expense,${stats.avgExpense}`);
    lines.push(`Largest Expense,${stats.largestExpense}`);
    lines.push('');

    // Transactions
    lines.push('TRANSACTIONS');
    lines.push('Date,Type,Category,Description,Amount');
    sortedForTable.forEach((tx) => {
      lines.push([
        format(new Date(tx.date), 'yyyy-MM-dd'),
        tx.type,
        csvEscape(tx.category),
        csvEscape(tx.description || ''),
        tx.amount,
      ].join(','));
    });
    lines.push('');

    // Category summary
    lines.push('CATEGORY SUMMARY');
    lines.push('Category,Amount,Percentage');
    categories.forEach((c) => {
      lines.push(`${csvEscape(c.name)},${c.value},${c.percent}%`);
    });
    lines.push('');

    // Budgets
    if (budgets.length > 0) {
      lines.push('BUDGETS');
      lines.push('Category,Budget,Spent,Remaining,Percentage,Status');
      budgets.forEach((b) => {
        const status = b.percentageUsed >= 100 ? 'Over budget' : b.percentageUsed >= 80 ? 'Approaching limit' : 'On track';
        lines.push([
          csvEscape(b.category),
          b.amount,
          b.spent,
          b.remaining,
          `${b.percentageUsed}%`,
          status,
        ].join(','));
      });
    }

    const now = format(new Date(), 'yyyy-MM');
    downloadCSV(lines.join('\n'), `spendwise-report-${now}.csv`);
    toast.success('Report exported as CSV');
  };

  // ── Print ──
  const handlePrint = () => {
    window.print();
  };

  // ── Change info helper for period comparison ──
  function changeText(curr, prev) {
    if (prev === 0 && curr === 0) return 'No change';
    if (prev === 0) return 'No previous-period data';
    const pct = Math.round(((curr - prev) / prev) * 100);
    const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→';
    return `${arrow} ${Math.abs(pct)}% vs previous period`;
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Reports" emoji="📄" subtitle="Generate your financial report." />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-16 animate-pulse" />
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-64 animate-pulse" />
      </div>
    );
  }

  // ── Error ──
  if (fetchError) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Reports" emoji="📄" subtitle="Generate your financial report." />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{fetchError}</p>
          <button onClick={fetchData} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
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
        <PageHeader title="Reports" emoji="📄" subtitle="Generate your financial report." />
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center shadow-sm"
        >
          <p className="text-6xl mb-4">📄</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No data for this period</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Add a transaction to generate a financial report.
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
      {/* Controls — hidden when printing */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <PageHeader title="Reports" emoji="📄" subtitle="Generate your financial report." />
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25 transition-all"
              aria-label="Export report as CSV"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all"
              aria-label="Print or save as PDF"
            >
              🖨️ Print / PDF
            </button>
          </div>
        </div>

        {/* Period + Type filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <AnalyticsPeriodSelector value={period} onChange={setPeriod} />
          <div className="flex gap-2" role="radiogroup" aria-label="Transaction type filter">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                role="radio"
                aria-checked={typeFilter === t}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PRINTABLE REPORT ═══ */}

      {/* Report header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white print:text-black">
              📄 Financial Report
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600 mt-1">
              {getPeriodLabel(period)}
            </p>
            {user?.fullName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
                {user.fullName}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500 print:text-gray-500">
              Generated: {format(new Date(), 'dd MMM yyyy, HH:mm')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 print:text-gray-500">
              {APP_NAME}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <ReportSummary
        income={stats.income}
        expenses={stats.expenses}
        savings={stats.savings}
        savingsRate={stats.savingsRate}
        txCount={stats.txCount}
        incomeTxCount={stats.incomeTxCount}
        expenseTxCount={stats.expenseTxCount}
        avgExpense={stats.avgExpense}
        largestExpense={stats.largestExpense}
      />

      {/* Category breakdown + Period comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
        <CategoryReport categories={categories} />

        {/* Period comparison */}
        {prevStats && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 print:text-black">
              🔄 Period Comparison
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Income', curr: stats.income, prev: prevStats.income },
                { label: 'Expenses', curr: stats.expenses, prev: prevStats.expenses },
                { label: 'Net Savings', curr: stats.savings, prev: prevStats.savings },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 print:text-black">{r.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white print:text-black">{formatCurrency(r.curr)}</span>
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 print:text-gray-600">
                    {changeText(r.curr, r.prev)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Top expenses */}
      {topExpenses.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 print:text-black">
            🔥 Top Expenses
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Category</th>
                  <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Description</th>
                  <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Date</th>
                  <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topExpenses.map((tx, i) => (
                  <tr key={tx._id || i} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 font-medium text-gray-900 dark:text-white print:text-black">{tx.category}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400 print:text-gray-700">{tx.description || '—'}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400 print:text-gray-700 whitespace-nowrap">{format(new Date(tx.date), 'dd MMM')}</td>
                    <td className="py-2 text-right font-bold text-red-600 dark:text-red-400 print:text-black">{formatCurrency(tx.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Budget performance */}
      {budgets.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 print:text-black">
            🎯 Budget Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Category</th>
                  <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Budget</th>
                  <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Spent</th>
                  <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Remaining</th>
                  <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Used</th>
                  <th className="text-left py-2 pl-3 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const status = b.percentageUsed >= 100 ? '🚨 Over budget' : b.percentageUsed >= 80 ? '⚠️ Approaching' : '✅ On track';
                  return (
                    <tr key={b._id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 font-medium text-gray-900 dark:text-white print:text-black">{b.category}</td>
                      <td className="py-2 text-right text-gray-700 dark:text-gray-300 print:text-black">{formatCurrency(b.amount)}</td>
                      <td className="py-2 text-right text-gray-700 dark:text-gray-300 print:text-black">{formatCurrency(b.spent)}</td>
                      <td className={`py-2 text-right font-medium ${b.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} print:text-black`}>
                        {b.remaining < 0 ? `${formatCurrency(Math.abs(b.remaining))} over` : formatCurrency(b.remaining)}
                      </td>
                      <td className="py-2 text-right text-gray-700 dark:text-gray-300 print:text-black">{b.percentageUsed}%</td>
                      <td className="py-2 pl-3 text-xs font-medium text-gray-700 dark:text-gray-300 print:text-black">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 print:text-black">
            💡 Insights
          </h2>
          <ul className="space-y-2">
            {insights.map((ins, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 print:text-black bg-gray-50 dark:bg-gray-700/30 print:bg-white rounded-xl px-3.5 py-2.5">
                <span className="text-base flex-shrink-0">{ins.emoji}</span>
                <span>{ins.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Transaction table */}
      <ReportTransactionTable transactions={sortedForTable} />
    </div>
  );
}
