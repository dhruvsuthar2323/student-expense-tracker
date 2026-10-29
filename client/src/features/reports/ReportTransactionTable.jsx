import { motion, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { formatCurrency } from '../analytics/helpers';
import { CURRENCY } from '../../lib/constants';

/**
 * ReportTransactionTable — detailed transaction list for the report.
 * Props: transactions — array of transaction objects, already filtered
 */
export default function ReportTransactionTable({ transactions }) {
  const shouldReduceMotion = useReducedMotion();

  if (!transactions || transactions.length === 0) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 print:text-black">
        📝 Transaction Details
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Date</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Type</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Category</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Description</th>
              <th className="text-right py-2 pl-2 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 pr-2 text-gray-700 dark:text-gray-300 print:text-black whitespace-nowrap">
                  {format(new Date(tx.date), 'dd MMM yyyy')}
                </td>
                <td className="py-2 px-2 print:text-black">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
                    tx.type === 'income'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 print:bg-white print:text-green-700 print:border'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 print:bg-white print:text-red-700 print:border'
                  }`}>
                    {tx.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="py-2 px-2 font-medium text-gray-900 dark:text-white print:text-black">
                  {tx.category}
                </td>
                <td className="py-2 px-2 text-gray-500 dark:text-gray-400 print:text-gray-700 truncate max-w-[150px]">
                  {tx.description || '—'}
                </td>
                <td className={`py-2 pl-2 text-right font-semibold whitespace-nowrap ${
                  tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                } print:text-black`}>
                  {tx.type === 'income' ? '+' : '-'}{CURRENCY}{tx.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 print:text-gray-600">
        Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
      </p>
    </motion.div>
  );
}
