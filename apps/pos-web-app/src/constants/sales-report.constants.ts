
import { format, subDays } from 'date-fns';

export const DEFAULT_DATE_FROM = format(subDays(new Date(), 10), 'yyyy-MM-dd');
export const DEFAULT_DATE_TO   = format(new Date(), 'yyyy-MM-dd');

export const ALL_BRANCHES_VALUE   = '';     // empty string = all branches
export const ALL_CATEGORIES_VALUE = 'ALL';
export const ALL_PRODUCTS_VALUE   = 'ALL';

export const TRANSACTIONS_PAGE_LIMIT = 10;

// ─── Status badge styles ─────────────────────────────────────────────────────
// Matches DB SaleStatus: Completed | Pending | Cancelled
// and PaymentStatus:     Paid | Pending | Failed | Refunded
export const TRANSACTION_STATUS_STYLES: Record<string, { label: string; className: string }> = {
    Completed: { label: 'Completed', className: 'bg-emerald-500 text-white' },
    Pending:   { label: 'Pending',   className: 'bg-slate-200 text-slate-600' },
    Cancelled: { label: 'Cancelled', className: 'bg-red-500 text-white'     },
    Paid:      { label: 'Paid',      className: 'bg-emerald-500 text-white' },
    Failed:    { label: 'Failed',    className: 'bg-red-500 text-white'     },
    Refunded:  { label: 'Refunded',  className: 'bg-amber-400 text-white'   },
};

// ─── Pie chart colors ────────────────────────────────────────────────────────
// Matching expected UI: orange, teal/blue, purple, blue
export const PAYMENT_METHOD_COLORS: Record<string, string> = {
    Cash:          '#3b82f6',  // blue-500
    Card:          '#a855f7',  // purple-500
    Split:         '#f97316',  // orange-500
    'Bank Pay':    '#14b8a6',  // teal-500
    'Bank Transfer': '#f97316', // orange-500 — matches expected UI
};

// ─── KPI card icon config ────────────────────────────────────────────────────
// Centralised so KpiCard can be used without hardcoding colors each time
export const KPI_CARD_CONFIG = {
    revenue:      { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    transactions: { iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'    },
    items:        { iconBg: 'bg-violet-50',  iconColor: 'text-violet-500'  },
    average:      { iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'   },
} as const;