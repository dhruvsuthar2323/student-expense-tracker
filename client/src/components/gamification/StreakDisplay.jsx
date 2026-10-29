import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const StreakDisplay = ({ streak = 0, label = 'Day Streak', compact = false }) => {
  const shouldReduceMotion = useReducedMotion();

  if (streak === 0) {
    return (
      <div className={`flex items-center text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'} font-medium`}>
        <span className="mr-1.5 opacity-50">⚪</span>
        Start your streak!
      </div>
    );
  }

  const pulseAnimation = shouldReduceMotion 
    ? {} 
    : {
        scale: [1, 1.15, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };

  return (
    <div className={`inline-flex items-center font-bold ${compact ? 'text-sm gap-1' : 'text-base gap-1.5'} text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-900/50`}>
      <motion.span 
        animate={pulseAnimation}
        className="inline-block origin-bottom"
      >
        🔥
      </motion.span>
      <span>{streak} {compact ? '' : label}</span>
    </div>
  );
};

export default StreakDisplay;
