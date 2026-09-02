export interface KpiBranchOption {
    id:   number;
    name: string;
    code: string;
}

export type PeriodType = 'Daily' | 'Weekly' | 'Monthly';

export interface KpiSalesTarget {
    id?:            number;
    period_type:    PeriodType;
    target_amount:  number;
    branch_id:      number; // 0 = All Branches
}

export interface KpiMarginTarget {
    id?:                  number;
    target_gross_margin:  number;
    target_net_margin:    number;
    branch_id:            number;
}

export interface KpiInventoryThreshold {
    id?:                     number;
    default_reorder_level:  number;
    critical_stock_level:   number;
    zero_sales_hours:       number;
    branch_id:               number;
}

export type CheckFrequencyMinutes = 1 | 5 | 10 | 30 | 60;

export interface KpiNotificationRules {
    id?:                          number;
    daily_target_midday:          boolean;
    unusual_hourly_drop:          boolean;
    zero_sales_product:           boolean;
    low_stock_alert:              boolean;
    out_of_stock_alert:           boolean;
    daily_summary_notification:   boolean;
    weekly_performance_summary:   boolean;
    margin_below_target:          boolean;
    check_frequency_minutes:      CheckFrequencyMinutes;
    branch_id:                    number;
}

export type DefaultDateRange =
    | 'LAST_7_DAYS'
    | 'LAST_30_DAYS'
    | 'LAST_90_DAYS'
    | 'THIS_MONTH'
    | 'CUSTOM';

export interface KpiReportDefaults {
    id?:                    number;
    default_date_range:     DefaultDateRange;
    default_branch_view:    string; // 'ALL' or a branch_id as string
    show_target_progress:   boolean;
    branch_id:               number;
}

// ─── GET /kpi-settings ────────────────────────────────────────────────────────
export interface KpiSettingsResponse {
    branch_id:            number;
    sales_targets:        KpiSalesTarget[];
    margin_target:        KpiMarginTarget | null;
    inventory_threshold:  KpiInventoryThreshold | null;
    notification_rules:   KpiNotificationRules | null;
    report_defaults:      KpiReportDefaults | null;
    branches:             KpiBranchOption[];
}

// ─── POST /kpi-settings/save-all ─────────────────────────────────────────────
export interface SaveAllKpiSettingsPayload {
    sales_targets:        KpiSalesTarget[];
    margin_target:        Omit<KpiMarginTarget, 'id'>;
    inventory_threshold:  Omit<KpiInventoryThreshold, 'id'>;
    notification_rules:   Omit<KpiNotificationRules, 'id'>;
    report_defaults:      Omit<KpiReportDefaults, 'id'>;
}

export interface SaveAllKpiSettingsResponse {
    message:             string;
    branch_sum_warning:  string | null;
    sales_targets:       KpiSalesTarget[];
    margin_target:       KpiMarginTarget;
    inventory_threshold: KpiInventoryThreshold;
    notification_rules:  KpiNotificationRules;
    report_defaults:     KpiReportDefaults;
}

// ─── Structured 400 response shape thrown by ZodValidationPipe ───────────────
export interface KpiValidationErrorResponse {
    statusCode: number;
    message:    string;
    errors?:    Record<string, string[]>;
}