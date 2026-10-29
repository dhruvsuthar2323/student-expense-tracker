import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineSwitchHorizontal,
  HiOutlineCalculator,
  HiOutlineTrendingUp,
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineX,
  HiOutlineChevronLeft,
} from 'react-icons/hi';
import { APP_NAME } from '../../lib/constants';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/transactions', label: 'Transactions', icon: HiOutlineSwitchHorizontal },
  { path: '/budgets', label: 'Budgets', icon: HiOutlineCalculator },
  { path: '/progress', label: 'Progress', icon: HiOutlineTrendingUp },
  { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { path: '/reports', label: 'Reports', icon: HiOutlineDocumentReport },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow flex-shrink-0">
              <span className="text-white text-lg font-bold">₹</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {APP_NAME}
              </span>
            )}
          </Link>

          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${collapsed ? 'justify-center' : ''}
                  ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <HiOutlineChevronLeft
              className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
