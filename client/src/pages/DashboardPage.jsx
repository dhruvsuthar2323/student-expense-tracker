import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  isWithinInterval,
} from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

// Dashboard components
import DashboardPeriodSelector from '../features/dashboard/DashboardPeriodSelector';
import DashboardSummaryCards from '../features/dashboard/DashboardSummaryCards';
import IncomeExpenseOverview from '../features/dashboard/IncomeExpenseOverview';
import SpendingByCategory from '../features/dashboard/SpendingByCategory';
import RecentTransactions from '../features/dashboard/RecentTransactions';
import DashboardEmptyState from '../features/dashboard/DashboardEmptyState';

// Budget overview for dashboard
import BudgetOverview from '../features/budgets/BudgetOverview';

// Existing gamification components
import StreakDisplay from '../components/gamification/StreakDisplay';
import XPProgress from '../components/gamification/XPProgress';
import LevelBadge from '../components/gamification/LevelBadge';
import AchievementPreview from '../components/gamification/AchievementPreview';
import SmartInsights from '../features/smart/SmartInsights';

// Quick action config
const QUICK_ACTIONS = [
  {
    label: 'Add Expense',
    path: '/transactions',
    gradient: 'from-red-500 to-rose-600',
    emoji: '💸',
  },
  {
    label: 'Add Income',
    path: '/transactions',
    gradient: 'from-green-500 to-emerald-600',
    emoji: '💰',
  },
  {
    label: 'View Transactions',
    path: '/transactions',
    gradient: 'from-primary-500 to-primary-700',
    emoji: '📋',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  // ── Data state ──
  const [allTransactions, setAllTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Period state ──
  const [period, setPeriod] = useState('month');

  // ── Fetch transactions ──
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get('/transactions');
      if (data.success) {
        setAllTransactions(data.transactions);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setFetchError('Session expired. Please log in again.');
      } else {
        setFetchError(
          err.response?.data?.message ||
            'Unable to load your dashboard data. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── Period-filtered transactions ──
  const filteredTransactions = useMemo(() => {
    if (period === 'all') return allTransactions;

    const now = new Date();
    let start;

    switch (period) {
      case 'today':
        start = startOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        break;
      default:
        return allTransactions;
    }

    const end = endOfDay(now);

    return allTransactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return isWithinInterval(txDate, { start, end });
    });
  }, [allTransactions, period]);

  // ── Computed stats ──
  const stats = useMemo(() => {
    const incomeTxs = filteredTransactions.filter((t) => t.type === 'income');
    const expenseTxs = filteredTransactions.filter(
      (t) => t.type === 'expense'
    );
    const income = incomeTxs.reduce((s, t) => s + t.amount, 0);
    const expenses = expenseTxs.reduce((s, t) => s + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      count: filteredTransactions.length,
      expenseTransactions: expenseTxs,
    };
  }, [filteredTransactions]);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Skeleton header */}
        <div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mt-2" />
        </div>
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
            >
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-56 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (fetchError) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">
            {fetchError}
          </p>
          <button
            onClick={fetchTransactions}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header + Period selector ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Here's your financial overview.
          </p>
        </div>
        <DashboardPeriodSelector value={period} onChange={setPeriod} />
      </motion.div>

      {/* ── Empty state (zero transactions overall) ── */}
      {allTransactions.length === 0 ? (
        <>
          <DashboardSummaryCards income={0} expenses={0} balance={0} count={0} />
          <DashboardEmptyState />

          {/* Gamification section still shows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                    🌱
                  </div>
                  <div>
                    <p className="text-primary-200 text-sm font-medium">Level 1</p>
                    <p className="text-xl font-bold">Beginner</p>
                  </div>
                </div>
                <XPProgress currentXP={0} requiredXP={100} showLabel={false} />
                <p className="text-primary-200 text-xs mt-2">
                  Track expenses to earn XP and level up!
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <AchievementPreview />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <DashboardSummaryCards
            income={stats.income}
            expenses={stats.expenses}
            balance={stats.balance}
            count={stats.count}
          />

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeExpenseOverview
              income={stats.income}
              expenses={stats.expenses}
            />
            <SpendingByCategory
              expenseTransactions={stats.expenseTransactions}
            />
          </div>

          {/* ── Budget Overview ── */}
          <BudgetOverview />

          {/* ── Quick Actions ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.label}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                <Link
                  to={action.path}
                  className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {action.emoji}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {action.label}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ── Recent Transactions + Gamification ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions transactions={allTransactions} />

            {/* Gamification / Progress */}
            <div className="space-y-4">
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                        {user?.gamification?.icon || '🌱'}
                      </div>
                      <div>
                        <p className="text-primary-200 text-sm font-medium">
                          Level {user?.gamification?.level || 1}
                        </p>
                        <p className="text-xl font-bold">{user?.gamification?.title || 'Beginner'}</p>
                      </div>
                    </div>
                    <StreakDisplay streak={user?.currentStreak || 0} compact />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-200">XP Progress</span>
                      <span className="font-semibold">{user?.xp || 0} / {user?.gamification?.xpForNextLevel || 100} XP</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${user?.gamification?.xpProgress || 0}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-primary-200 text-xs">
                      {(user?.xp || 0) === 0
                        ? 'Track expenses to earn XP and level up!'
                        : `${user?.gamification?.xpRemaining || 0} XP to next level`}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
              >
                <AchievementPreview />
              </motion.div>
            </div>
          </div>

          {/* ── Smart Insights Section ── */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🧠 Smart Insights</h2>
            <SmartInsights />
          </div>
        </>
      )}
    </div>
  );
}
