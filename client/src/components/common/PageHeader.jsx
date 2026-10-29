import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, emoji, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-8 flex items-start gap-4"
    >
      <div className="text-5xl bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0">
        {emoji}
      </div>
      <div className="flex flex-col justify-center h-full pt-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};

export default PageHeader;
