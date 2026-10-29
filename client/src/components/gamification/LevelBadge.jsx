import React from 'react';
import { motion } from 'framer-motion';

const defaultLevels = {
  1: { title: 'Beginner', icon: '🌱' },
  2: { title: 'Money Tracker', icon: '📊' },
  3: { title: 'Budget Builder', icon: '🏗️' },
  4: { title: 'Savings Pro', icon: '💰' },
  5: { title: 'Budget Master', icon: '👑' },
};

const LevelBadge = ({ level = 1, title, icon, size = 'md' }) => {
  const displayTitle = title || defaultLevels[level]?.title || 'Unknown Level';
  const displayIcon = icon || defaultLevels[level]?.icon || '✨';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const iconStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border border-indigo-200 dark:border-indigo-800 shadow-sm text-indigo-700 dark:text-indigo-300 font-semibold ${sizeStyles[size]}`}
    >
      <div className="flex items-center justify-center bg-white dark:bg-indigo-800/50 rounded-full shadow-inner p-0.5">
        <span className={iconStyles[size]}>{displayIcon}</span>
      </div>
      <span>
        Lvl {level} <span className="opacity-60 font-normal mx-0.5">|</span> {displayTitle}
      </span>
    </motion.div>
  );
};

export default LevelBadge;
