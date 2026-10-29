import { motion } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import LevelBadge from '../components/gamification/LevelBadge';
import XPProgress from '../components/gamification/XPProgress';
import AchievementPreview from '../components/gamification/AchievementPreview';
import StreakDisplay from '../components/gamification/StreakDisplay';
import { useAuth } from '../contexts/AuthContext';

const ProgressPage = () => {
  const { user } = useAuth();

  const gam = user?.gamification || {};
  const level = gam.level || 1;
  const title = gam.title || 'Beginner';
  const icon = gam.icon || '🌱';
  const xp = user?.xp || 0;
  const xpForCurrentLevel = gam.xpForCurrentLevel || 0;
  const xpForNextLevel = gam.xpForNextLevel || 100;
  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;

  // Compute real achievements
  const achievements = [
    { id: 'first_transaction', name: 'First Step', description: 'Record your first transaction', icon: '👣', unlocked: xp > 0 },
    { id: 'ten_transactions', name: 'Getting Started', description: 'Record 10 transactions', icon: '📝', unlocked: xp >= 100 },
    { id: 'fifty_transactions', name: 'Consistent Tracker', description: 'Record 50 transactions', icon: '🎯', unlocked: xp >= 500 },
    { id: 'streak_3', name: 'Warming Up', description: '3-day tracking streak', icon: '🔥', unlocked: longestStreak >= 3 },
    { id: 'streak_7', name: 'On Fire', description: '7-day tracking streak', icon: '🔥', unlocked: longestStreak >= 7 },
    { id: 'xp_100', name: 'Century', description: 'Earn 100 XP', icon: '💯', unlocked: xp >= 100 },
    { id: 'xp_500', name: 'XP Collector', description: 'Earn 500 XP', icon: '⭐', unlocked: xp >= 500 },
    { id: 'xp_1000', name: 'XP Master', description: 'Earn 1000 XP', icon: '💎', unlocked: xp >= 1000 },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full">
      <PageHeader
        title="Your Progress"
        emoji="🏆"
        subtitle="Track your financial journey."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Main progress card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/10 dark:to-transparent opacity-50 pointer-events-none" />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">
            {xp === 0
              ? 'Start tracking expenses to earn XP and unlock achievements!'
              : `Keep going! You're doing great.`}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 relative z-10 max-w-2xl mx-auto">
            Turn your financial tracking into a rewarding journey. Build streaks, level up, and become a master of your finances.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center">
              <LevelBadge level={level} title={title} icon={icon} size="lg" />
              <p className="mt-4 font-medium text-gray-900 dark:text-white">Current Level</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center col-span-1 md:col-span-2">
              <div className="w-full max-w-md">
                <XPProgress currentXP={xp - xpForCurrentLevel} requiredXP={xpForNextLevel - xpForCurrentLevel} showLabel />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-right">
                  Total: {xp} XP · Next level: {xpForNextLevel} XP
                </p>
              </div>
              <div className="mt-6 flex gap-4 w-full justify-center items-center">
                <StreakDisplay streak={currentStreak} />
                {longestStreak > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Longest: {longestStreak} days
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Achievements</h3>
          <AchievementPreview achievements={achievements} showAll />
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressPage;
