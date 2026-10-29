import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const XPProgress = ({ currentXP = 0, requiredXP = 100, showLabel = true }) => {
  const shouldReduceMotion = useReducedMotion();
  const percentage = Math.min(100, Math.max(0, (currentXP / requiredXP) * 100));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-end mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>XP Progress</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentXP}</span> / {requiredXP} XP
          </span>
        </div>
      )}
      <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-500 dark:to-indigo-400 rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.2)]"
          initial={{ width: shouldReduceMotion ? `${percentage}%` : 0 }}
          animate={{ width: `${percentage}%` }}
          transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 50, damping: 12, mass: 1 }}
        />
      </div>
    </div>
  );
};

export default XPProgress;
