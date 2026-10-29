import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../analytics/helpers';
import {
  generateSpendingInsights,
  detectUnusualExpenses,
  generateBudgetAlerts,
  generateSpendingForecast,
  generateSavingsSuggestions,
  detectRecurringExpenses,
  generateHealthSnapshot,
} from './engine';

/**
 * SmartInsights — Smart Dashboard section combining all intelligent features.
 */
export default function SmartInsights() {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [txRes, budgetRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budgets').catch(() => ({ data: { budgets: [] } })),
      ]);
      if (txRes.data.success) setTransactions(txRes.data.transactions);
      setBudgets(budgetRes.data.budgets || []);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired.' : 'Failed to load smart insights.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const insights = useMemo(() => generateSpendingInsights(transactions), [transactions]);
  const unusual = useMemo(() => detectUnusualExpenses(transactions), [transactions]);
  const budgetAlerts = useMemo(() => generateBudgetAlerts(budgets), [budgets]);
  const forecast = useMemo(() => generateSpendingForecast(transactions), [transactions]);
  const savings = useMemo(() => generateSavingsSuggestions(transactions), [transactions]);
  const recurring = useMemo(() => detectRecurringExpenses(transactions), [transactions]);
  const health = useMemo(() => generateHealthSnapshot(transactions, budgets, user), [transactions, budgets, user]);

  const anim = shouldReduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button onClick={fetchData} className="mt-3 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-4xl mb-3">🧠</p>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Smart Insights</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Add transactions to unlock intelligent spending analysis.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Financial Health Snapshot */}
      <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🩺 Financial Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Savings Rate" value={`${health.savingsRate}%`} emoji={health.savingsRate >= 20 ? '🟢' : health.savingsRate >= 10 ? '🟡' : '🔴'} />
          <Metric label="Expense Ratio" value={`${health.expenseToIncomeRatio}%`} emoji={health.expenseToIncomeRatio <= 80 ? '🟢' : '🟡'} />
          <Metric label="Spending Trend" value={health.spendingTrend === 'decreasing' ? '↓ Down' : health.spendingTrend === 'increasing' ? '↑ Up' : '→ Stable'} emoji={health.spendingTrend === 'decreasing' ? '📉' : health.spendingTrend === 'increasing' ? '📈' : '➡️'} />
          <Metric label="Budgets OK" value={`${health.budgetsOnTrack}/${health.totalBudgets}`} emoji={health.budgetsOnTrack === health.totalBudgets ? '✅' : '⚠️'} />
        </div>
      </motion.div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🔔 Budget Alerts</h3>
          <div className="space-y-2">
            {budgetAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3.5 py-2.5">
                <span className="text-base flex-shrink-0">{a.emoji}</span>
                <span className="text-gray-700 dark:text-gray-300">{a.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Spending Insights */}
      <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">💡 Spending Insights</h3>
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-sm bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3.5 py-2.5">
              <span className="text-base flex-shrink-0">{ins.emoji}</span>
              <span className="text-gray-700 dark:text-gray-300">{ins.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Spending Forecast */}
      {forecast.length > 0 && (
        <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">🔮 Spending Forecast</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Estimated end-of-month spending at your current rate</p>
          <div className="space-y-2">
            {forecast.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3.5 py-2.5">
                <span className="font-medium text-gray-900 dark:text-white">{f.category}</span>
                <span className="text-gray-500 dark:text-gray-400">~{formatCurrency(f.estimated)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Unusual Expenses */}
      {unusual.length > 0 && (
        <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">⚡ Unusual Expenses</h3>
          <div className="space-y-2">
            {unusual.map((u, i) => (
              <div key={i} className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-900/10 rounded-xl px-3.5 py-2.5">
                <span className="text-base flex-shrink-0">⚠️</span>
                <span className="text-gray-700 dark:text-gray-300">{u.reason}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recurring Expenses */}
      {recurring.length > 0 && (
        <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🔁 Possible Recurring Expenses</h3>
          <div className="space-y-2">
            {recurring.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3.5 py-2.5">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{r.description}</span>
                  <span className="text-gray-400 ml-2 text-xs">({r.frequency})</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(r.amount)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Savings Suggestions */}
      {savings.length > 0 && (
        <motion.div {...anim} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">💰 Savings Observations</h3>
          <div className="space-y-2">
            {savings.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3.5 py-2.5">
                <span className="text-base flex-shrink-0">{s.emoji}</span>
                <span className="text-gray-700 dark:text-gray-300">{s.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Metric({ label, value, emoji }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{emoji} {label}</p>
      <p className="text-base font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
