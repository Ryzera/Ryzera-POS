
import {
    TrendingUp,
    Package,
    BarChart2,
    DollarSign,
    Tag,
    CalendarDays,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ReportType } from '@/types/reports-hub.types';

export interface ReportTypeMeta {
    type:        ReportType;
    label:       string;
    description: string;
    icon:        LucideIcon;
    route:       string;            // where Generate navigates to
}

export const REPORT_TYPE_META: ReportTypeMeta[] = [
    {
        type:        ReportType.SALES,
        label:       'Sales Report',
        description: 'View all sales transactions and revenue breakdown',
        icon:        TrendingUp,
        route:       '/dashboard/reports/sales',
    },
    {
        type:        ReportType.PRODUCT_PERFORMANCE,
        label:       'Product Performance',
        description: 'Analyze product sales, profit margins, and top sellers',
        icon:        Package,
        route:       '/dashboard/reports/product-performance',
    },
    {
        type:        ReportType.INVENTORY_STATUS,
        label:       'Inventory Status',
        description: 'Monitor stock levels and inventory value',
        icon:        BarChart2,
        route:       '/dashboard/reports/inventory-status',
    },
    {
        type:        ReportType.PROFIT_AND_LOSS,
        label:       'Profit & Loss Summary',
        description: 'Complete financial overview with P&L breakdown',
        icon:        DollarSign,
        route:       '/dashboard/reports/profit-loss',
    },
    {
        type:        ReportType.CATEGORY_PERFORMANCE,
        label:       'Category Performance',
        description: 'Compare performance across product categories',
        icon:        Tag,
        route:       '/dashboard/reports/category-performance',
    },
    {
        type:        ReportType.DAILY_SUMMARY,
        label:       'Daily Summary',
        description: 'Comprehensive daily business summary and breakdown',
        icon:        CalendarDays,
        route:       '/dashboard/reports/daily-summary',
    },
];

// Frequency display labels — single source of truth
export const FREQUENCY_LABELS: Record<string, string> = {
    DAILY:   'Daily',
    WEEKLY:  'Weekly (Monday)',
    MONTHLY: 'Monthly (1st)',
};

// Delivery status display config
export const DELIVERY_STATUS_CONFIG = {
    DELIVERED: { label: 'DELIVERED', className: 'bg-green-100 text-green-700' },
    FAILED:    { label: 'FAILED',    className: 'bg-red-100   text-red-600'   },
    PENDING:   { label: 'PENDING',   className: 'bg-yellow-100 text-yellow-700' },
} as const;