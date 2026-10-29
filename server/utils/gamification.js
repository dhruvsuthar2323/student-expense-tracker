/**
 * Gamification utility — level calculation, XP thresholds, achievements.
 */

const LEVEL_THRESHOLDS = [
  { level: 1, xpMin: 0,   xpMax: 99,   title: 'Beginner',       icon: '🌱' },
  { level: 2, xpMin: 100, xpMax: 249,  title: 'Money Tracker',  icon: '📊' },
  { level: 3, xpMin: 250, xpMax: 449,  title: 'Budget Builder',  icon: '🏗️' },
  { level: 4, xpMin: 450, xpMax: 699,  title: 'Savings Pro',     icon: '💰' },
  { level: 5, xpMin: 700, xpMax: 999,  title: 'Budget Master',   icon: '👑' },
  { level: 6, xpMin: 1000, xpMax: 1399, title: 'Finance Guru',   icon: '🧠' },
  { level: 7, xpMin: 1400, xpMax: 1899, title: 'Wealth Builder',  icon: '🏆' },
  { level: 8, xpMin: 1900, xpMax: 2499, title: 'Expert Tracker',  icon: '⭐' },
  { level: 9, xpMin: 2500, xpMax: 3199, title: 'Finance Legend',  icon: '🔥' },
  { level: 10, xpMin: 3200, xpMax: Infinity, title: 'Ultimate Saver', icon: '💎' },
];

function getLevelInfo(xp) {
  const entry = LEVEL_THRESHOLDS.find(l => xp >= l.xpMin && xp <= l.xpMax) || LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === entry.level + 1);
  const xpForNext = nextLevel ? nextLevel.xpMin : entry.xpMax;
  const xpInLevel = xp - entry.xpMin;
  const xpRange = (nextLevel ? nextLevel.xpMin : entry.xpMax + 1) - entry.xpMin;
  const progress = Math.min(Math.round((xpInLevel / xpRange) * 100), 100);

  return {
    level: entry.level,
    title: entry.title,
    icon: entry.icon,
    xp,
    xpForCurrentLevel: entry.xpMin,
    xpForNextLevel: xpForNext,
    xpProgress: progress,
    xpRemaining: Math.max(xpForNext - xp, 0),
  };
}

/**
 * Calculate streak from user fields and current date.
 * Returns { currentStreak, longestStreak, lastActivityDate }.
 */
function calculateStreak(user, activityDateStr) {
  const today = activityDateStr || new Date().toISOString().split('T')[0];
  const lastActivity = user.lastActivityDate
    ? new Date(user.lastActivityDate).toISOString().split('T')[0]
    : null;

  let currentStreak = user.currentStreak || 0;
  let longestStreak = user.longestStreak || 0;

  if (!lastActivity) {
    // First ever activity
    currentStreak = 1;
  } else if (lastActivity === today) {
    // Same day — no change
  } else {
    // Check if consecutive
    const last = new Date(lastActivity + 'T00:00:00');
    const curr = new Date(today + 'T00:00:00');
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak, lastActivityDate: today };
}

// XP awards
const XP_TRANSACTION = 10;
const XP_DAILY_BONUS = 5;

module.exports = {
  LEVEL_THRESHOLDS,
  getLevelInfo,
  calculateStreak,
  XP_TRANSACTION,
  XP_DAILY_BONUS,
};
