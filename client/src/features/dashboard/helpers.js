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
