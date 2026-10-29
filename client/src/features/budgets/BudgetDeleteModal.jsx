import { motion, AnimatePresence } from 'framer-motion';
import { CURRENCY } from '../../lib/constants';

/**
 * BudgetDeleteModal — confirmation before deleting a budget.
 * Props: budget, isOpen, onCancel, onConfirm, isDeleting
 */
export default function BudgetDeleteModal({
  budget,
  isOpen,
  onCancel,
  onConfirm,
  isDeleting = false,
}) {
  if (!isOpen || !budget) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm w-full p-6">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗑️</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete this budget?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                Are you sure you want to delete your{' '}
                <span className="font-semibold">{budget.category}</span> budget?
              </p>

              {/* Budget summary */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {budget.category}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {CURRENCY}{budget.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-5">
                Your spending transactions will NOT be deleted.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-white bg-red-500 hover:bg-red-600 font-semibold transition-all shadow-lg shadow-red-500/25 ${
                    isDeleting ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Budget'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
