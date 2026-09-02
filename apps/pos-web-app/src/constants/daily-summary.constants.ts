import { format } from 'date-fns';

export const DEFAULT_SUMMARY_DATE = format(new Date(), 'yyyy-MM-dd');

export const ALL_BRANCHES_VALUE = '';

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
    Cash:            '#14b8a6',
    Card:            '#f97316',
    Split:           '#a855f7',
    'Bank Transfer': '#3b82f6',
    'Mobile Pay':    '#ec4899',
};

export const PIE_FALLBACK_COLORS = [
    '#f97316', '#3b82f6', '#a855f7', '#14b8a6', '#f43f5e', '#eab308',
];

export const PL_ROWS = [
    { label: 'Total Sales',        key: 'totalSales',      color: 'text-gray-900' },
    { label: 'Cost of Goods Sold', key: 'costOfGoodsSold', color: 'text-red-500'  },
    { label: 'Gross Profit',       key: 'grossProfit',     color: 'text-gray-900' },
    { label: 'Discounts',          key: 'discounts',       color: 'text-red-500'  },
    { label: 'Returns',            key: 'returns',         color: 'text-red-500'  },
    { label: 'Tax Collected',      key: 'taxCollected',    color: 'text-green-600'},
    { label: 'Profit Margin',      key: 'profitMargin',    color: 'text-blue-600'  },
    { label: 'Net Profit',         key: 'netProfit',       color: 'text-gray-900', bold: true },
] as const;