/**
 * Smart Features Engine — pure calculation functions for smart insights.
 * All functions operate on real transaction/budget data arrays.
 */
import { CURRENCY } from '../../lib/constants';
import { formatCurrency } from '../analytics/helpers';
import {
  startOfMonth, endOfMonth, subMonths, startOfWeek, endOfDay,
  differenceInDays, isWithinInterval, format,
} from 'date-fns';

// ── CATEGORY SUGGESTION RULES ──

const KEYWORD_MAP = {
  // Food
  food: 'Food', restaurant: 'Food', cafe: 'Food', coffee: 'Food',
  pizza: 'Food', burger: 'Food', grocery: 'Food', groceries: 'Food',
  swiggy: 'Food', zomato: 'Food', dominos: 'Food', "domino's": 'Food',
  "mcdonald's": 'Food', mcdonalds: 'Food', kfc: 'Food', subway: 'Food',
  starbucks: 'Food', lunch: 'Food', dinner: 'Food', breakfast: 'Food',
  snacks: 'Food', bakery: 'Food', canteen: 'Food', mess: 'Food',
  biryani: 'Food', chai: 'Food', tea: 'Food', milk: 'Food',

  // Transportation
  uber: 'Transportation', ola: 'Transportation', cab: 'Transportation',
  taxi: 'Transportation', bus: 'Transportation', metro: 'Transportation',
  train: 'Transportation', fuel: 'Transportation', petrol: 'Transportation',
  diesel: 'Transportation', parking: 'Transportation', toll: 'Transportation',
  rapido: 'Transportation', auto: 'Transportation', rickshaw: 'Transportation',
  flight: 'Transportation', irctc: 'Transportation',

  // Education
  course: 'Education', udemy: 'Education', coursera: 'Education',
  book: 'Education', books: 'Education', tuition: 'Education',
  college: 'Education', university: 'Education', exam: 'Education',
  school: 'Education', class: 'Education', coaching: 'Education',
  library: 'Education', stationery: 'Education', notes: 'Education',

  // Shopping
  amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping',
  clothes: 'Shopping', shoes: 'Shopping', shirt: 'Shopping',
  jeans: 'Shopping', dress: 'Shopping', gadget: 'Shopping',
  electronics: 'Shopping', phone: 'Shopping', headphones: 'Shopping',
  earbuds: 'Shopping', watch: 'Shopping', accessories: 'Shopping',

  // Entertainment
  netflix: 'Entertainment', spotify: 'Entertainment', movie: 'Entertainment',
  movies: 'Entertainment', cinema: 'Entertainment', game: 'Entertainment',
  gaming: 'Entertainment', concert: 'Entertainment', party: 'Entertainment',
  subscription: 'Entertainment', hotstar: 'Entertainment', prime: 'Entertainment',
  youtube: 'Entertainment', theatre: 'Entertainment',

  // Bills
  electricity: 'Bills', water: 'Bills', wifi: 'Bills', internet: 'Bills',
  rent: 'Bills', emi: 'Bills', recharge: 'Bills', mobile: 'Bills',
  broadband: 'Bills', gas: 'Bills', insurance: 'Bills', bill: 'Bills',
  maintenance: 'Bills',

  // Health
  doctor: 'Health', hospital: 'Health', medicine: 'Health', pharmacy: 'Health',
  gym: 'Health', fitness: 'Health', dentist: 'Health', medical: 'Health',
  health: 'Health', yoga: 'Health', workout: 'Health', vitamin: 'Health',
};

export function suggestCategory(description) {
  if (!description || description.trim().length < 2) return null;
  const lower = description.toLowerCase().trim();
  const words = lower.split(/\s+/);

  // Check each word
  for (const word of words) {
    if (KEYWORD_MAP[word]) return KEYWORD_MAP[word];
  }
  // Check if description contains any keyword
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return null;
}

// ── HELPER: date ranges ──
function currentMonthRange() {
  const now = new Date();
  return { start: startOfMonth(now), end: endOfDay(now) };
}
function prevMonthRange() {
  const now = new Date();
  const prev = subMonths(now, 1);
  return { start: startOfMonth(prev), end: endOfMonth(prev) };
}
function filterRange(txs, range) {
  return txs.filter(t => {
    const d = new Date(t.date);
    return isWithinInterval(d, { start: range.start, end: range.end });
  });
}

// ── 1. SPENDING INSIGHTS ──
export function generateSpendingInsights(transactions) {
  const insights = [];
  const current = filterRange(transactions, currentMonthRange());
  const prev = filterRange(transactions, prevMonthRange());

  if (current.length === 0) return [{ emoji: '📊', text: 'Add transactions to see spending insights.' }];

  const curExpenses = current.filter(t => t.type === 'expense');
  const prevExpenses = prev.filter(t => t.type === 'expense');

  // Category totals
  const catMap = {};
  curExpenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const sorted = Object.entries(catMap).sort(([,a],[,b]) => b - a);

  // Previous category totals
  const prevCatMap = {};
  prevExpenses.forEach(t => { prevCatMap[t.category] = (prevCatMap[t.category] || 0) + t.amount; });

  // Top category
  if (sorted.length > 0) {
    const [topCat, topAmt] = sorted[0];
    const prevAmt = prevCatMap[topCat] || 0;
    if (prevAmt > 0) {
      const pctChange = Math.round(((topAmt - prevAmt) / prevAmt) * 100);
      if (pctChange > 0) {
        insights.push({ emoji: '📈', text: `You spent ${formatCurrency(topAmt)} on ${topCat} this month, which is ${pctChange}% higher than last month.` });
      } else if (pctChange < 0) {
        insights.push({ emoji: '📉', text: `You spent ${formatCurrency(topAmt)} on ${topCat} this month, which is ${Math.abs(pctChange)}% lower than last month.` });
      }
    } else {
      insights.push({ emoji: '📌', text: `${topCat} is your top expense category this month at ${formatCurrency(topAmt)}.` });
    }
  }

  // Second largest
  if (sorted.length > 1) {
    insights.push({ emoji: '📊', text: `${sorted[1][0]} is currently your second-largest expense category.` });
  }

  // Total spending comparison
  const totalCur = curExpenses.reduce((s,t) => s + t.amount, 0);
  const totalPrev = prevExpenses.reduce((s,t) => s + t.amount, 0);
  if (totalPrev > 0) {
    if (totalCur > totalPrev) {
      insights.push({ emoji: '⬆️', text: `Your overall spending has increased compared with the previous month.` });
    } else if (totalCur < totalPrev) {
      insights.push({ emoji: '⬇️', text: `Your overall spending has decreased compared with the previous month. Nice!` });
    }
  }

  return insights.length > 0 ? insights : [{ emoji: '📊', text: 'Add more transactions to see detailed spending insights.' }];
}

// ── 2. UNUSUAL EXPENSE DETECTION ──
export function detectUnusualExpenses(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length < 5) return [];

  // Group by category
  const catTxs = {};
  expenses.forEach(t => {
    if (!catTxs[t.category]) catTxs[t.category] = [];
    catTxs[t.category].push(t);
  });

  const unusual = [];
  for (const [cat, txs] of Object.entries(catTxs)) {
    if (txs.length < 3) continue; // Need at least 3 txs to detect pattern
    const amounts = txs.map(t => t.amount);
    const avg = amounts.reduce((s,a) => s+a, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((s,a) => s + Math.pow(a - avg, 2), 0) / amounts.length);
    const threshold = avg + 1.5 * (stdDev || avg * 0.5);

    // Check recent transactions (this month)
    const recentTxs = filterRange(txs, currentMonthRange());
    for (const tx of recentTxs) {
      if (tx.amount > threshold && tx.amount > avg * 1.5) {
        unusual.push({
          ...tx,
          reason: `${formatCurrency(tx.amount)} ${cat} expense is significantly higher than your usual ${cat} expenses (avg: ${formatCurrency(Math.round(avg))}).`,
        });
      }
    }
  }

  return unusual.sort((a,b) => b.amount - a.amount).slice(0, 5);
}

// ── 3. SMART BUDGET ALERTS ──
export function generateBudgetAlerts(budgets) {
  if (!budgets || budgets.length === 0) return [];
  return budgets
    .filter(b => b.percentageUsed >= 70)
    .sort((a,b) => b.percentageUsed - a.percentageUsed)
    .map(b => ({
      category: b.category,
      percentage: b.percentageUsed,
      emoji: b.percentageUsed >= 100 ? '🚨' : b.percentageUsed >= 90 ? '⚠️' : '📢',
      text: b.percentageUsed >= 100
        ? `Your ${b.category} budget has exceeded its limit (${b.percentageUsed}%).`
        : `Your ${b.category} budget is ${b.percentageUsed}% used.`,
    }));
}

// ── 4. SPENDING FORECAST ──
export function generateSpendingForecast(transactions) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const daysElapsed = differenceInDays(now, monthStart) + 1;
  if (daysElapsed < 3) return []; // Too early for meaningful forecast

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const current = filterRange(transactions, currentMonthRange());
  const curExpenses = current.filter(t => t.type === 'expense');

  // Forecast by category
  const catMap = {};
  curExpenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });

  return Object.entries(catMap)
    .map(([cat, spent]) => {
      const dailyRate = spent / daysElapsed;
      const estimated = Math.round(dailyRate * daysInMonth);
      return { category: cat, spent, estimated, dailyRate: Math.round(dailyRate) };
    })
    .sort((a,b) => b.estimated - a.estimated)
    .slice(0, 5);
}

// ── 5. SAVINGS SUGGESTIONS ──
export function generateSavingsSuggestions(transactions) {
  const suggestions = [];
  const current = filterRange(transactions, currentMonthRange());
  const prev = filterRange(transactions, prevMonthRange());

  const curExpenses = current.filter(t => t.type === 'expense');
  const prevExpenses = prev.filter(t => t.type === 'expense');

  if (curExpenses.length === 0) return [];

  const catMap = {};
  curExpenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const sorted = Object.entries(catMap).sort(([,a],[,b]) => b - a);

  // Top category
  if (sorted.length > 0) {
    suggestions.push({ emoji: '💡', text: `${sorted[0][0]} is currently your largest expense category.` });
  }

  // Categories with increase vs previous
  const prevCatMap = {};
  prevExpenses.forEach(t => { prevCatMap[t.category] = (prevCatMap[t.category] || 0) + t.amount; });

  for (const [cat, amt] of sorted) {
    const prevAmt = prevCatMap[cat] || 0;
    if (prevAmt > 0 && amt > prevAmt * 1.2) {
      suggestions.push({ emoji: '📈', text: `Your ${cat} spending is higher than the previous month.` });
      break;
    }
  }

  return suggestions.slice(0, 4);
}

// ── 6. RECURRING EXPENSE DETECTION ──
export function detectRecurringExpenses(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length < 6) return [];

  // Group by amount+category combo
  const groups = {};
  expenses.forEach(t => {
    const key = `${t.category}_${t.amount}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const recurring = [];
  for (const [key, txs] of Object.entries(groups)) {
    if (txs.length < 2) continue;
    // Sort by date
    const sorted = [...txs].sort((a,b) => new Date(a.date) - new Date(b.date));
    // Check intervals
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(differenceInDays(new Date(sorted[i].date), new Date(sorted[i-1].date)));
    }
    const avgInterval = intervals.reduce((s,d) => s+d, 0) / intervals.length;

    // Monthly (25-35 days), Weekly (5-10), Biweekly (12-18)
    let frequency = null;
    if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly';
    else if (avgInterval >= 5 && avgInterval <= 10) frequency = 'weekly';
    else if (avgInterval >= 12 && avgInterval <= 18) frequency = 'biweekly';

    if (frequency) {
      recurring.push({
        category: txs[0].category,
        amount: txs[0].amount,
        frequency,
        count: txs.length,
        description: txs[0].description || txs[0].category,
      });
    }
  }

  return recurring.sort((a,b) => b.amount - a.amount).slice(0, 5);
}

// ── 7. FINANCIAL HEALTH SNAPSHOT ──
export function generateHealthSnapshot(transactions, budgets, gamification) {
  const current = filterRange(transactions, currentMonthRange());
  const income = current.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expenses = current.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);

  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const expenseToIncomeRatio = income > 0 ? Math.round((expenses / income) * 100) : 0;

  const budgetsOnTrack = budgets ? budgets.filter(b => b.percentageUsed < 100).length : 0;
  const totalBudgets = budgets ? budgets.length : 0;

  // Spending trend (compare with last month)
  const prev = filterRange(transactions, prevMonthRange());
  const prevExpenses = prev.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  let trend = 'stable';
  if (prevExpenses > 0) {
    const change = ((expenses - prevExpenses) / prevExpenses) * 100;
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';
  }

  return {
    savingsRate,
    expenseToIncomeRatio,
    budgetsOnTrack,
    totalBudgets,
    spendingTrend: trend,
    currentStreak: gamification?.currentStreak || 0,
    level: gamification?.gamification?.level || 1,
    xp: gamification?.xp || 0,
  };
}
