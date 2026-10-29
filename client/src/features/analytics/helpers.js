import { CURRENCY } from '../../lib/constants';

/**
 * Format a number in Indian locale with the project currency symbol.
 * Handles negative values cleanly: -₹2,000 (not ₹-2,000).
 */
export function formatCurrency(amount) {
  const isNegative = amount < 0;
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}${CURRENCY}${formatted}`;
}

/**
 * Shared chart color palette.
 */
export const CHART_COLORS = [
  '#6366F1', // indigo
  '#F43F5E', // rose
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#14B8A6', // teal
];
