
import { format, subDays } from 'date-fns';

// ─── Default date range ───────────────────────────────────────────────────────
// Pre-fills the filter bar with the last 7 days on first load.
// P&L typically viewed over a tighter window than sales (shorter periods = clearer margin trends).
export const PL_DEFAULT_DATE_FROM = format(subDays(new Date(), 6), 'yyyy-MM-dd');
export const PL_DEFAULT_DATE_TO   = format(new Date(), 'yyyy-MM-dd');

// ─── Branch filter sentinel ───────────────────────────────────────────────────
// Empty string means "All Branches" — mirrors ALL_BRANCHES_VALUE in sales-report.constants.ts.
// Using a named constant prevents scattered '' comparisons across the view.
export const PL_ALL_BRANCHES_VALUE = '' as const;

// ─── Tab identifiers ──────────────────────────────────────────────────────────
export const PL_TAB_ALL        = 'all'        as const;
export const PL_TAB_PER_BRANCH = 'per-branch' as const;
export type  ProfitLossTab     = typeof PL_TAB_ALL | typeof PL_TAB_PER_BRANCH;

// ─── Chart bar colors ─────────────────────────────────────────────────────────
// Revenue = blue, Cost = red, Profit = green — matches the UI screenshots.
// Using a Record keeps chart configuration declarative and avoids inline hex strings.
export const PL_CHART_COLORS = {
    revenue: '#3b82f6',   // blue-500
    cost:    '#ef4444',   // red-500
    profit:  '#22c55e',   // green-500
} as const;

// ─── KPI card icon/accent config ─────────────────────────────────────────────
// Maps each KPI metric to its icon background and icon color.
// Mirrors the KPI_CARD_CONFIG pattern in sales-report.constants.ts.
export const PL_KPI_CARD_CONFIG = {
    totalSales:      { iconBg: 'bg-blue-50',    iconColor: 'text-blue-600'    },
    cogs:            { iconBg: 'bg-orange-50',  iconColor: 'text-orange-500'  },
    grossProfit:     { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    netProfit:       { iconBg: 'bg-violet-50',  iconColor: 'text-violet-600'  },
    totalTax:        { iconBg: 'bg-gray-50',    iconColor: 'text-gray-500'    },
    totalDiscounts:  { iconBg: 'bg-yellow-50',  iconColor: 'text-yellow-500'  },
    totalReturns:    { iconBg: 'bg-red-50',     iconColor: 'text-red-500'     },
} as const;

// ─── Margin color thresholds ──────────────────────────────────────────────────
// Used in the P&L table and PDF export to colour-code the Margin % column.
// Mirrors the thresholds used in profit-loss.service.ts PDF logic:
//   >= 30% → green, >= 15% → orange, < 15% → red
export const PL_MARGIN_THRESHOLDS = {
    good:    30,   // margin >= 30% → emerald
    warning: 15,   // margin >= 15% → orange
                   // margin <  15% → red
} as const;

// ─── Margin Tailwind classes ──────────────────────────────────────────────────
// Helper used in the table cell renderer to avoid repeating the ternary chain.
export function getMarginColorClass(margin: number): string {
    if (margin >= PL_MARGIN_THRESHOLDS.good)    return 'text-emerald-600';
    if (margin >= PL_MARGIN_THRESHOLDS.warning) return 'text-orange-500';
    return 'text-red-500';
}

// ─── Net profit color ─────────────────────────────────────────────────────────
// Positive net profit → green; negative → red.
export function getNetProfitColorClass(netProfit: number): string {
    return netProfit >= 0 ? 'text-emerald-600' : 'text-red-500';
}

// ─── Per-branch badge colors ──────────────────────────────────────────────────
// Cycles through these when rendering per-branch chart cards.
// Mirrors BADGE_COLORS in the sales report per-branch section.
export const PL_BRANCH_BADGE_COLORS: readonly string[] = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
] as const;

// ─── TanStack Query stale time ────────────────────────────────────────────────
// P&L data does not change in real-time (it's based on historical sales).
// 5 minutes keeps the cache fresh without over-fetching.
export const PL_QUERY_STALE_TIME_MS = 5 * 60 * 1000;   // 5 minutes

// ─── Table column definitions ─────────────────────────────────────────────────
// Centralises column header labels so they stay in sync with the export (CSV/PDF).
export const PL_TABLE_COLUMNS = [
    { key: 'date',        label: 'Date'         },
    { key: 'revenue',     label: 'Revenue'      },
    { key: 'cogs',        label: 'COGS'         },
    { key: 'grossProfit', label: 'Gross Profit' },
    { key: 'tax',         label: 'Tax'          },
    { key: 'returns',     label: 'Returns'      },
    { key: 'netProfit',   label: 'Net Profit'   },
    { key: 'margin',      label: 'Margin'       },
] as const;

export type PLTableColumnKey = typeof PL_TABLE_COLUMNS[number]['key'];