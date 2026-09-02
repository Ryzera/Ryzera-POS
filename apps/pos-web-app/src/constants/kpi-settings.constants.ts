import type { CheckFrequencyMinutes, DefaultDateRange } from '@/types/kpi-settings.types';

export const ALL_BRANCHES_ID = 0;

// ─── Fallback used before KPI notification rules have loaded — matches the
// `check_frequency_minutes` default on KpiNotificationRule in schema.prisma ──
export const DEFAULT_CHECK_FREQUENCY_MINUTES = 5;

// ─── Matches FrequencyMinutesEnum in kpi-settings.schema.ts ──────────────────
export const CHECK_FREQUENCY_OPTIONS: { value: CheckFrequencyMinutes; label: string }[] = [
    { value: 1,  label: 'Every 1 minute'   },
    { value: 5,  label: 'Every 5 minutes'  },
    { value: 10, label: 'Every 10 minutes' },
    { value: 30, label: 'Every 30 minutes' },
    { value: 60, label: 'Every 60 minutes' },
];

// ─── Matches the enum in UpsertReportDefaultSchema ───────────────────────────
export const DATE_RANGE_OPTIONS: { value: DefaultDateRange; label: string }[] = [
    { value: 'LAST_7_DAYS',  label: 'Last 7 Days'  },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
    { value: 'THIS_MONTH',   label: 'This Month'   },
    { value: 'CUSTOM',       label: 'Custom Range' },
];

// ─── One row per boolean in UpsertNotificationRuleSchema — label/description
// text matches the @ApiBody swagger descriptions in kpi-targets.controller.ts
// so the UI text and the API docs never drift apart.
export const NOTIFICATION_RULE_FIELDS = [
    {
        key:         'daily_target_midday',
        label:       'Daily target not met by midday',
        description: 'Alert when <50% of daily target reached by 12PM',
    },
    {
        key:         'unusual_hourly_drop',
        label:       'Unusual hourly drop',
        description: 'Alert when hourly sales are >80% below average',
    },
    {
        key:         'zero_sales_product',
        label:       'Zero-sales product alert',
        description: 'Alert when a product has zero sales today',
    },
    {
        key:         'low_stock_alert',
        label:       'Low stock alert',
        description: 'Alert when stock falls below reorder level',
    },
    {
        key:         'out_of_stock_alert',
        label:       'Out of stock alert',
        description: 'Immediate alert when stock reaches zero',
    },
    {
        key:         'daily_summary_notification',
        label:       'Daily summary notification',
        description: 'End-of-day sales summary at 9PM',
    },
    {
        key:         'weekly_performance_summary',
        label:       'Weekly performance summary',
        description: 'Monday morning weekly digest',
    },
    {
        key:         'margin_below_target',
        label:       'Margin below target alert',
        description: 'Alert when profit margin drops below target',
    },
] as const;

// ─── Role-Based Access Control reference table ───────────────────────────────
// This is a READ-ONLY reference — there is no backend model for a permission
// matrix. Every row below is taken directly from the @Roles(...) decorators
// actually enforced by RolesGuard on each controller, so it always reflects
// what the API truly allows rather than a guess:
//   Sales Report        -> sales-report.controller.ts        (class-level: ADMIN, MANAGER, CASHIER)
//   Product Performance -> product-performance.controller.ts (class-level: ADMIN, MANAGER)
//   Inventory Status     -> inventory-status.controller.ts    (class-level: ADMIN, MANAGER, INVENTORY_MANAGER)
//   Profit & Loss        -> profit-loss.controller.ts         (class-level: ADMIN, MANAGER)
//   Export Reports       -> sales-report.controller.ts        (export routes: ADMIN, MANAGER)
//   Scheduled Reports    -> modules/reports/reports.controller.ts (ADMIN, MANAGER)
//   View All Branches    -> per-branch routes across report controllers (ADMIN only)
//   KPI Settings         -> kpi-targets.controller.ts          (ADMIN + MANAGER, own branch only; /progress is all roles)
//   Audit Log            -> audit-log.controller.ts            (ADMIN + MANAGER, own branch only)
export interface RoleAccessRow {
    feature:       string;
    superAdmin:    boolean;
    branchManager: boolean;
    staff:         boolean;
}

export const ROLE_ACCESS_MATRIX: RoleAccessRow[] = [
    { feature: 'View All Branches',   superAdmin: true, branchManager: false, staff: false },
    { feature: 'Sales Report',        superAdmin: true, branchManager: true,  staff: true  },
    { feature: 'Product Performance', superAdmin: true, branchManager: true,  staff: false },
    { feature: 'Inventory Status',    superAdmin: true, branchManager: true,  staff: false },
    { feature: 'Profit & Loss',       superAdmin: true, branchManager: true,  staff: false },
    { feature: 'Export Reports',      superAdmin: true, branchManager: true,  staff: false },
    { feature: 'Scheduled Reports',   superAdmin: true, branchManager: true,  staff: true  },
    { feature: 'KPI Settings',        superAdmin: true, branchManager: true,  staff: false },
    { feature: 'Audit Log',           superAdmin: true, branchManager: true,  staff: false },
];