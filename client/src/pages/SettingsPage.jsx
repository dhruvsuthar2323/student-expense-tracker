import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineUserCircle, HiOutlineMoon, HiOutlineShieldCheck } from 'react-icons/hi2';

const SettingsPage = () => {
  const { user } = useAuth();
  
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently joined';

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader
        title="Settings"
        emoji="⚙️"
        subtitle="Manage your account."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold shadow-sm">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.fullName || 'User Name'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              {user?.email || 'user@example.com'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium">
              <HiOutlineShieldCheck className="w-4 h-4 text-emerald-500" />
              Member since {memberSince}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <HiOutlineUserCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Info</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Name</label>
                <div className="text-slate-900 dark:text-white font-medium bg-slate-50 dark:bg-slate-700/30 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  {user?.fullName || 'User Name'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</label>
                <div className="text-slate-900 dark:text-white font-medium bg-slate-50 dark:bg-slate-700/30 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <HiOutlineMoon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Preferences</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Theme</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">System preference / Toggle</p>
              </div>
              <div className="bg-slate-200 dark:bg-slate-600 w-12 h-6 rounded-full relative cursor-not-allowed opacity-60">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
              More settings coming soon!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
