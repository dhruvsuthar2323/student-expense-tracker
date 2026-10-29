import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from '../analytics/helpers';

/**
 * CategoryReport — expense category breakdown table.
 * Props: categories — array of { name, value, percent }
 */
export default function CategoryReport({ categories }) {
  const shouldReduceMotion = useReducedMotion();

  if (!categories || categories.length === 0) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm print:shadow-none print:border print:rounded-none"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 print:text-black">
        📊 Expense by Category
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Category</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">Amount</th>
              <th className="text-right py-2 pl-4 font-semibold text-gray-600 dark:text-gray-400 print:text-gray-700">%</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.name} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white print:text-black">{cat.name}</td>
                <td className="py-2.5 px-4 text-right text-gray-700 dark:text-gray-300 print:text-black">{formatCurrency(cat.value)}</td>
                <td className="py-2.5 pl-4 text-right text-gray-500 dark:text-gray-400 print:text-gray-700">{cat.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
