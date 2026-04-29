import { z } from 'zod';

// ─── Shared enum: accepted period types ──────────────────────────────────────
const PeriodTypeEnum = z.enum(['Daily', 'Weekly', 'Monthly']);

// ─── Shared enum: accepted notification check frequencies (minutes) ───────────
// Stored as a number in DB; sent as a number from the frontend dropdown.
const FrequencyMinutesEnum = z.union([
    z.literal(1),
    z.literal(5),
    z.literal(10),
    z.literal(30),
    z.literal(60),
]);

// ─────────────────────────────────────────────────────────────────────────────
//  1. SALES TARGET SCHEMA
//     Used by: POST /kpi-settings/targets (single upsert)
//     Also used inside SaveAllKpiSettingsSchema as an array.
// ─────────────────────────────────────────────────────────────────────────────
export const UpsertSalesTargetSchema = z.object({
    /** Which period this target applies to: Daily | Weekly | Monthly */
    period_type: PeriodTypeEnum,

    /** Revenue goal in LKR — must be a positive number */
    target_amount: z
        .number({ error: 'target_amount must be a number' })
        .positive('target_amount must be greater than 0'),

    /**
     * Branch this target applies to.
     * 0 = "All Branches" (global).
     * Matches branchId from ryzera_pos_branch table.
     */
    branch_id: z.number().int().min(0).default(0),
});

export type UpsertSalesTargetDto = z.infer<typeof UpsertSalesTargetSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  2. PROFIT MARGIN TARGET SCHEMA
//     Used by: POST /kpi-settings/margin-targets
//     Field names match the UI labels exactly.
// ─────────────────────────────────────────────────────────────────────────────
export const UpsertMarginTargetSchema = z.object({
    /**
     * Target Gross Margin (%) — e.g. 38 means 38%.
     * Gross margin = (Revenue - COGS) / Revenue × 100
     */
    target_gross_margin: z
        .number({ error: 'target_gross_margin must be a number' })
        .min(0,   'target_gross_margin cannot be negative')
        .max(100, 'target_gross_margin cannot exceed 100%'),

    /**
     * Target Net Margin (%) — e.g. 32 means 32%.
     * Net margin is always lower than gross margin (operating costs are deducted).
     */
    target_net_margin: z
        .number({ error: 'target_net_margin must be a number' })
        .min(0,   'target_net_margin cannot be negative')
        .max(100, 'target_net_margin cannot exceed 100%'),

    branch_id: z.number().int().min(0).default(0),
}).refine(
    // Net margin must be less than or equal to gross margin — financial rule
    (data) => data.target_net_margin <= data.target_gross_margin,
    {
        message: 'target_net_margin must be less than or equal to target_gross_margin',
        path: ['target_net_margin'],
    },
);

export type UpsertMarginTargetDto = z.infer<typeof UpsertMarginTargetSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  3. INVENTORY THRESHOLD SCHEMA
//     Used by: POST /kpi-settings/inventory-thresholds
//     Field names match the UI labels exactly.
// ─────────────────────────────────────────────────────────────────────────────
export const UpsertInventoryThresholdSchema = z.object({
    /**
     * Default Reorder Level — stock quantity below which a reorder alert fires.
     * UI label: "Default Reorder Level"
     */
    default_reorder_level: z
        .number({ error: 'default_reorder_level must be a number' })
        .int('default_reorder_level must be an integer')
        .min(1, 'default_reorder_level must be at least 1'),

    /**
     * Critical Stock Level — triggers an urgent alert.
     * UI label: "Critical Stock Level" / sub-text: "Triggers urgent alert"
     */
    critical_stock_level: z
        .number({ error: 'critical_stock_level must be a number' })
        .int('critical_stock_level must be an integer')
        .min(0, 'critical_stock_level cannot be negative'),

    /**
     * Zero-Sales Alert (hours) — alert fires if a product has had no sales
     * within this many hours.
     * UI label: "Zero-Sales Alert (hours)" / sub-text: "Alert if product has no sales"
     */
    zero_sales_hours: z
        .number({ error: 'zero_sales_hours must be a number' })
        .int('zero_sales_hours must be an integer')
        .min(1, 'zero_sales_hours must be at least 1'),

    branch_id: z.number().int().min(0).default(0),
}).refine(
    // Critical level must be strictly below reorder level
    (data) => data.critical_stock_level < data.default_reorder_level,
    {
        message: 'critical_stock_level must be strictly less than default_reorder_level',
        path: ['critical_stock_level'],
    },
);

export type UpsertInventoryThresholdDto = z.infer<typeof UpsertInventoryThresholdSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  4. NOTIFICATION RULES SCHEMA
//     Used by: POST /kpi-settings/notification-rules
//     Defaults match the actual UI screenshot toggle states.
// ─────────────────────────────────────────────────────────────────────────────
export const UpsertNotificationRuleSchema = z.object({
    /** Alert when <50% of daily target reached by 12PM */
    daily_target_midday:        z.boolean().default(true),

    /** Alert when hourly sales are >80% below average */
    unusual_hourly_drop:        z.boolean().default(true),

    /** Alert when a product has zero sales today */
    zero_sales_product:         z.boolean().default(true),

    /** Alert when product stock falls below reorder level */
    low_stock_alert:            z.boolean().default(true),

    /** Immediate alert when stock reaches zero */
    out_of_stock_alert:         z.boolean().default(true),

    /** End-of-day sales summary at 9PM */
    daily_summary_notification: z.boolean().default(true),

    /**
     * Monday morning weekly digest.
     * ✅ DEFAULT IS FALSE — toggle is OFF in the UI screenshot.
     */
    weekly_performance_summary: z.boolean().default(false),

    /**
     * Alert when profit margin drops below target.
     * ✅ DEFAULT IS TRUE — toggle is ON in the UI screenshot.
     */
    margin_below_target:        z.boolean().default(true),

    /**
     * How often (in minutes) the system checks for alert conditions.
     * Accepted: 1 | 5 | 10 | 30 | 60
     */
    check_frequency_minutes: FrequencyMinutesEnum.default(5),

    branch_id: z.number().int().min(0).default(0),
});

export type UpsertNotificationRuleDto = z.infer<typeof UpsertNotificationRuleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  5. REPORT DEFAULT SETTINGS SCHEMA
//     Used by: POST /kpi-settings/report-defaults
// ─────────────────────────────────────────────────────────────────────────────
export const UpsertReportDefaultSchema = z.object({
    /**
     * Default date range pre-selected when a user opens any report page.
     * Maps to the "Default Date Range" dropdown in the UI.
     */
    default_date_range: z
        .enum(['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'THIS_MONTH', 'CUSTOM'])
        .default('LAST_30_DAYS'),

    /**
     * Default branch filter pre-selected on report pages.
     * "ALL" = All Branches (matches UI dropdown "All Branches").
     */
    default_branch_view: z
        .string()
        .min(1, 'default_branch_view cannot be empty')
        .default('ALL'),

    /** Whether the monthly sales target progress bar is shown on the Dashboard */
    show_target_progress: z.boolean().default(true),

    branch_id: z.number().int().min(0).default(0),
});

export type UpsertReportDefaultDto = z.infer<typeof UpsertReportDefaultSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  6. BULK SAVE SCHEMA
//     Used by: POST /kpi-settings/save-all
//     This is the PRIMARY endpoint — the "Save All Changes" button sends
//     all five sections in a single atomic request.
// ─────────────────────────────────────────────────────────────────────────────
export const SaveAllKpiSettingsSchema = z.object({
    /**
     * All sales target rows.
     * The UI sends one row per (period_type × branch_id) combination.
     * Minimum 1 row required.
     */
    sales_targets: z.array(UpsertSalesTargetSchema).min(1, 'At least one sales target is required'),

    /** Profit margin targets (gross + net) */
    margin_target: UpsertMarginTargetSchema,

    /** Inventory stock threshold settings */
    inventory_threshold: UpsertInventoryThresholdSchema,

    /** Notification rule on/off toggles */
    notification_rules: UpsertNotificationRuleSchema,

    /** Report page display defaults */
    report_defaults: UpsertReportDefaultSchema,
});

export type SaveAllKpiSettingsDto = z.infer<typeof SaveAllKpiSettingsSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  7. QUERY SCHEMA
//     Used by: GET /kpi-settings?branchId=1
// ─────────────────────────────────────────────────────────────────────────────
export const GetKpiSettingsSchema = z.object({
    /**
     * Optional branch filter.
     * If omitted, returns global settings (branch_id = 0).
     * Sent as a query string, so coerced from string to number.
     */
    branchId: z
        .string()
        .regex(/^\d+$/, 'branchId must be a non-negative integer')
        .transform(Number)
        .optional(),
});

export type GetKpiSettingsDto = z.infer<typeof GetKpiSettingsSchema>;