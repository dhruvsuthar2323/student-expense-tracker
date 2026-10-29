import {
  startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear,
  subMonths, isWithinInterval, format,
} from 'date-fns';

/**
 * Get the date range for a report period.
 */
export function getReportDateRange(period) {
  const now = new Date();
  const end = endOfDay(now);
  let start;
  switch (period) {
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(now);
      break;
    case '3months':
      start = startOfDay(subMonths(now, 3));
      break;
    case '6months':
      start = startOfDay(subMonths(now, 6));
      break;
    case 'year':
      start = startOfYear(now);
      break;
    case 'all':
    default:
      return { start: null, end };
  }
  return { start, end };
}

/**
 * Get the previous equivalent date range for comparison.
 */
export function getPreviousReportRange(period) {
  const now = new Date();
  switch (period) {
    case 'week': {
      const prevEnd = endOfDay(new Date(startOfWeek(now, { weekStartsOn: 1 }).getTime() - 1));
      const prevStart = startOfWeek(prevEnd, { weekStartsOn: 1 });
      return { start: prevStart, end: prevEnd };
    }
    case 'month': {
      const prevEnd = endOfDay(new Date(startOfMonth(now).getTime() - 1));
      const prevStart = startOfMonth(prevEnd);
      return { start: prevStart, end: prevEnd };
    }
    case '3months': {
      return { start: startOfDay(subMonths(now, 6)), end: endOfDay(subMonths(now, 3)) };
    }
    case '6months': {
      return { start: startOfDay(subMonths(now, 12)), end: endOfDay(subMonths(now, 6)) };
    }
    case 'year': {
      const start = startOfYear(subMonths(now, 12));
      const end = endOfDay(new Date(startOfYear(now).getTime() - 1));
      return { start, end };
    }
    default:
      return null;
  }
}

/**
 * Filter transactions by a date range.
 */
export function filterByRange(transactions, range) {
  if (!range || !range.start) return transactions;
  return transactions.filter((tx) => {
    const d = new Date(tx.date);
    return isWithinInterval(d, { start: range.start, end: range.end });
  });
}

/**
 * Get a human-readable label for the period.
 */
export function getPeriodLabel(period) {
  const range = getReportDateRange(period);
  if (period === 'all') return 'All Time';
  if (!range.start) return 'All Time';
  return `${format(range.start, 'dd MMM yyyy')} – ${format(range.end, 'dd MMM yyyy')}`;
}

/**
 * Escape a value for CSV. Wraps in quotes if it contains comma, quote, or newline.
 */
export function csvEscape(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Trigger browser download of a CSV string.
 */
export function downloadCSV(csvContent, filename) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
