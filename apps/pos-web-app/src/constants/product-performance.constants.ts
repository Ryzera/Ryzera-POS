
import { format, subDays } from 'date-fns';

export const PP_DEFAULT_DATE_FROM = format(subDays(new Date(), 10), 'yyyy-MM-dd');
export const PP_DEFAULT_DATE_TO   = format(new Date(), 'yyyy-MM-dd');

export const PP_ALL_CATEGORIES_VALUE = 'ALL';

export const PP_TABLE_PAGE_LIMIT = 10;

/** Colors for the payment method pie chart — matches sales report palette */
export const PP_PAYMENT_METHOD_COLORS: Record<string, string> = {
    Cash:            '#3b82f6',  // blue-500
    Card:            '#a855f7',  // purple-500
    Split:           '#f97316',  // orange-500
    'Bank Pay':      '#14b8a6',  // teal-500
    'Bank Transfer': '#f97316',
};

/** Profit margin color thresholds — used in the table */
export const PP_MARGIN_COLORS = {
    high:   { min: 30,  className: 'text-emerald-600' },
    medium: { min: 15,  className: 'text-amber-500'   },
    low:    { min: 0,   className: 'text-red-500'      },
};

/** KPI card icon/color config */
export const PP_KPI_CONFIG = {
    totalProductsSold:  { iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'    },
    topSellingCategory: { iconBg: 'bg-violet-50',  iconColor: 'text-violet-500'  },
    totalRevenue:       { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    totalProfit:        { iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'   },
} as const;