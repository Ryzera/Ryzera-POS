import { format, subDays } from 'date-fns';

// Default date range: last 10 days (consistent with sales report)
export const CAT_DEFAULT_DATE_FROM = format(subDays(new Date(), 10), 'yyyy-MM-dd');
export const CAT_DEFAULT_DATE_TO   = format(new Date(), 'yyyy-MM-dd');

// Chart colors — one per category slot (cycle if > 10 categories)
export const CATEGORY_BAR_COLOR = '#3b82f6'; // blue-500, matches sales report bar chart

export const CATEGORY_PIE_COLORS = [
    '#3b82f6', // blue-500
    '#f97316', // orange-500
    '#a855f7', // purple-500
    '#14b8a6', // teal-500
    '#f43f5e', // rose-500
    '#eab308', // yellow-500
    '#10b981', // emerald-500
    '#6366f1', // indigo-500
    '#ec4899', // pink-500
    '#84cc16', // lime-500
];
