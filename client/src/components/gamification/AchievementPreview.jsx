import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineTrophy, HiOutlineLockClosed } from 'react-icons/hi2';

const defaultAchievements = [
  { id: 'first_transaction', name: 'First Step', description: 'Record your first transaction', icon: '👣', unlocked: false },
  { id: 'ten_transactions', name: 'Getting Started', description: 'Record 10 transactions', icon: '📝', unlocked: false },
  { id: 'fifty_transactions', name: 'Consistent Tracker', description: 'Record 50 transactions', icon: '🎯', unlocked: false },
  { id: 'budget_set', name: 'Plan Maker', description: 'Set your first budget', icon: '📋', unlocked: false },
  { id: 'under_budget', name: 'Budget Boss', description: 'Finish a month under budget', icon: '🏆', unlocked: false },
  { id: 'three_months_under', name: 'Budget Master', description: 'Stay under budget for 3 months', icon: '👑', unlocked: false },
  { id: 'savings_20', name: 'Smart Saver', description: 'Save 20%+ of income in a month', icon: '💰', unlocked: false },
  { id: 'streak_7', name: 'On Fire', description: '7-day tracking streak', icon: '🔥', unlocked: false },
];

const AchievementCard = ({ achievement, isNext }) => {
  const { name, description, icon, unlocked } = achievement;
  
  return (
    <div className={`flex items-center p-4 rounded-xl border ${unlocked ? 'bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/30 shadow-sm' : isNext ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50 border-dashed' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-75 grayscale'}`}>
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-2xl ${unlocked ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-200 dark:bg-gray-700'}`}>
        {unlocked ? icon : isNext ? icon : <HiOutlineLockClosed className="text-gray-400 dark:text-gray-500 text-xl" />}
      </div>
      <div className="ml-4 flex-1">
        <h4 className={`font-semibold ${unlocked || isNext ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {name}
        </h4>
        <p className={`text-sm mt-0.5 ${unlocked || isNext ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {description}
        </p>
      </div>
      {!unlocked && isNext && (
        <div className="ml-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          Next Goal
        </div>
      )}
    </div>
  );
};

const AchievementPreview = ({ achievements = defaultAchievements, showAll = false }) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const nextAchievement = lockedAchievements[0];

  return (
    <div className="w-full">
      <div className="flex items-center mb-4 text-gray-800 dark:text-gray-200 font-bold">
        <HiOutlineTrophy className="mr-2 text-indigo-500 dark:text-indigo-400 text-xl" />
        <h3 className="text-lg">{showAll ? 'Achievements' : 'Next Achievement'}</h3>
      </div>

      {showAll ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unlockedAchievements.map(a => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
          {lockedAchievements.map((a, idx) => (
            <AchievementCard key={a.id} achievement={a} isNext={idx === 0} />
          ))}
        </div>
      ) : (
        nextAchievement ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AchievementCard achievement={nextAchievement} isNext={true} />
          </motion.div>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800/50 flex items-center shadow-sm">
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <p className="font-semibold">All achievements unlocked!</p>
              <p className="text-sm opacity-80 mt-0.5">You are an absolute master.</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AchievementPreview;
