import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { SaleStatus } from '@ryzera/pos-database';
// ─── New KPI Settings DTOs (all sections) ────────────────────────────────────
import type {
    UpsertSalesTargetDto,
    UpsertMarginTargetDto,
    UpsertInventoryThresholdDto,
    UpsertNotificationRuleDto,
    UpsertReportDefaultDto,
    SaveAllKpiSettingsDto,
    GetKpiSettingsDto,
} from './schemas/kpi-settings.schema';

// ─── Legacy DTO — kept so setTarget() still compiles ─────────────────────────
import type { CreateKpiTargetDto } from './schemas/create-kpi-target.schema';

@Injectable()
export class KpiTargetsService {
    constructor(private readonly prisma: PrismaService) {}

    // ─────────────────────────────────────────────────────────────────────────
    //  LEGACY — POST /kpi-targets (old endpoint — kept for backward compatibility)
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Original single-target upsert used before the KPI Settings page was built.
     * Kept so any existing frontend calls to /kpi-targets do not break.
     * New code should use upsertSalesTarget() via POST /kpi-settings/targets instead.
     */
    async setTarget(dto: CreateKpiTargetDto) {
        return this.prisma.kpiTarget.upsert({
            where: {
                period_type_branch_id: {
                    period_type: dto.period_type,
                    branch_id:   dto.branch_id ?? 0,
                },
            },
            update: { target_amount: dto.target_amount },
            create: {
                period_type:   dto.period_type,
                target_amount: dto.target_amount,
                branch_id:     dto.branch_id ?? 0,
            },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  GET /kpi-settings — Load all settings for page mount
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Returns all KPI setting groups for the Settings page.
     * Called once on page load to populate all form fields.
     * Branch list is also returned so the UI can render per-branch target rows.
     */
    async getAllSettings(query: GetKpiSettingsDto) {
        const branchId = query.branchId ?? 0;

        // All queries run in parallel for performance
        const [
            salesTargets,
            marginTarget,
            inventoryThreshold,
            notificationRules,
            reportDefaults,
            branches,
        ] = await Promise.all([
            // Fetch ALL sales targets regardless of branch — UI needs all rows to render
            this.prisma.kpiTarget.findMany({
                orderBy: [{ period_type: 'asc' }, { branch_id: 'asc' }],
            }),

            // Margin, threshold, notification, report settings filtered by branch
            this.prisma.kpiMarginTarget.findFirst({
                where: { branch_id: branchId },
            }),

            this.prisma.kpiInventoryThreshold.findFirst({
                where: { branch_id: branchId },
            }),

            this.prisma.kpiNotificationRule.findFirst({
                where: { branch_id: branchId },
            }),

            this.prisma.kpiReportDefault.findFirst({
                where: { branch_id: branchId },
            }),

            // Active branch list — used to render per-branch target input rows in the UI
            this.prisma.branch.findMany({
                where:   { is_active: true },
                select:  { branchId: true, name: true, code: true },
                orderBy: { branchId: 'asc' },
            }),
        ]);

        return {
            branch_id:           branchId,
            sales_targets:       salesTargets,
            margin_target:       marginTarget,
            inventory_threshold: inventoryThreshold,
            notification_rules:  notificationRules,
            report_defaults:     reportDefaults,
            branches,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  POST /kpi-settings/save-all — "Save All Changes" button
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Saves all five setting sections atomically in a single DB transaction.
     * Uses upsert throughout — safe to call on first-time save or on updates.
     *
     * Business rule: sum of per-branch Monthly targets should equal the
     * All-Branches Monthly target. A warning (not a hard error) is returned
     * in the response if the sums do not match — save still succeeds.
     */
    async saveAllSettings(dto: SaveAllKpiSettingsDto) {
        // ── Business rule: branch monthly targets should sum to global total ──────
        const globalMonthlyTarget = dto.sales_targets.find(
            (t) => t.period_type === 'Monthly' && t.branch_id === 0,
        );
        const branchMonthlyTargets = dto.sales_targets.filter(
            (t) => t.period_type === 'Monthly' && t.branch_id !== 0,
        );
        const branchMonthlySum = branchMonthlyTargets.reduce(
            (sum, t) => sum + t.target_amount,
            0,
        );

        // Produce a warning string if sums don't match; null if they match exactly
        const branchSumWarning =
            globalMonthlyTarget && branchMonthlySum !== globalMonthlyTarget.target_amount
                ? `Branch monthly targets sum (${branchMonthlySum.toLocaleString()}) does not equal ` +
                `All Branches monthly target (${globalMonthlyTarget.target_amount.toLocaleString()}). ` +
                `Settings were saved but please review your targets.`
                : null;

        // ── Atomic transaction — all five sections saved together or not at all ──
        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Upsert every sales target row (one per period_type × branch_id pair)
            const salesTargets = await Promise.all(
                dto.sales_targets.map((t) =>
                    tx.kpiTarget.upsert({
                        where: {
                            period_type_branch_id: {
                                period_type: t.period_type,
                                branch_id:   t.branch_id,
                            },
                        },
                        update: { target_amount: t.target_amount },
                        create: {
                            period_type:   t.period_type,
                            target_amount: t.target_amount,
                            branch_id:     t.branch_id,
                        },
                    }),
                ),
            );

            // 2. Upsert profit margin targets (gross + net)
            const marginTarget = await tx.kpiMarginTarget.upsert({
                where:  { branch_id: dto.margin_target.branch_id },
                update: {
                    target_gross_margin: dto.margin_target.target_gross_margin,
                    target_net_margin:   dto.margin_target.target_net_margin,
                },
                create: {
                    branch_id:           dto.margin_target.branch_id,
                    target_gross_margin: dto.margin_target.target_gross_margin,
                    target_net_margin:   dto.margin_target.target_net_margin,
                },
            });

            // 3. Upsert inventory stock level thresholds
            const inventoryThreshold = await tx.kpiInventoryThreshold.upsert({
                where:  { branch_id: dto.inventory_threshold.branch_id },
                update: {
                    default_reorder_level: dto.inventory_threshold.default_reorder_level,
                    critical_stock_level:  dto.inventory_threshold.critical_stock_level,
                    zero_sales_hours:      dto.inventory_threshold.zero_sales_hours,
                },
                create: {
                    branch_id:             dto.inventory_threshold.branch_id,
                    default_reorder_level: dto.inventory_threshold.default_reorder_level,
                    critical_stock_level:  dto.inventory_threshold.critical_stock_level,
                    zero_sales_hours:      dto.inventory_threshold.zero_sales_hours,
                },
            });

            // 4. Upsert notification rule toggles and check frequency
            const notificationRules = await tx.kpiNotificationRule.upsert({
                where:  { branch_id: dto.notification_rules.branch_id },
                update: { ...dto.notification_rules },
                create: { ...dto.notification_rules },
            });

            // 5. Upsert report page display defaults
            const reportDefaults = await tx.kpiReportDefault.upsert({
                where:  { branch_id: dto.report_defaults.branch_id },
                update: { ...dto.report_defaults },
                create: { ...dto.report_defaults },
            });

            return {
                sales_targets:       salesTargets,
                margin_target:       marginTarget,
                inventory_threshold: inventoryThreshold,
                notification_rules:  notificationRules,
                report_defaults:     reportDefaults,
            };
        });

        return {
            message:            'KPI settings saved successfully',
            branch_sum_warning: branchSumWarning,  // null if sums match, warning string if not
            ...result,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Individual section upsert methods
    //  Used by the fine-grained single-section POST endpoints.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Upsert a single sales target row.
     * Identified by the unique (period_type × branch_id) combination.
     */
    async upsertSalesTarget(dto: UpsertSalesTargetDto) {
        return this.prisma.kpiTarget.upsert({
            where: {
                period_type_branch_id: {
                    period_type: dto.period_type,
                    branch_id:   dto.branch_id,
                },
            },
            update: { target_amount: dto.target_amount },
            create: {
                period_type:   dto.period_type,
                target_amount: dto.target_amount,
                branch_id:     dto.branch_id,
            },
        });
    }

    /** Upsert profit margin targets (Target Gross Margin % + Target Net Margin %) */
    async upsertMarginTarget(dto: UpsertMarginTargetDto) {
        return this.prisma.kpiMarginTarget.upsert({
            where:  { branch_id: dto.branch_id },
            update: {
                target_gross_margin: dto.target_gross_margin,
                target_net_margin:   dto.target_net_margin,
            },
            create: {
                branch_id:           dto.branch_id,
                target_gross_margin: dto.target_gross_margin,
                target_net_margin:   dto.target_net_margin,
            },
        });
    }

    /** Upsert inventory stock level thresholds (reorder level, critical level, zero-sales hours) */
    async upsertInventoryThreshold(dto: UpsertInventoryThresholdDto) {
        return this.prisma.kpiInventoryThreshold.upsert({
            where:  { branch_id: dto.branch_id },
            update: {
                default_reorder_level: dto.default_reorder_level,
                critical_stock_level:  dto.critical_stock_level,
                zero_sales_hours:      dto.zero_sales_hours,
            },
            create: {
                branch_id:             dto.branch_id,
                default_reorder_level: dto.default_reorder_level,
                critical_stock_level:  dto.critical_stock_level,
                zero_sales_hours:      dto.zero_sales_hours,
            },
        });
    }

    /** Upsert notification rule on/off toggles and check frequency */
    async upsertNotificationRules(dto: UpsertNotificationRuleDto) {
        return this.prisma.kpiNotificationRule.upsert({
            where:  { branch_id: dto.branch_id },
            update: { ...dto },
            create: { ...dto },
        });
    }

    /** Upsert report page display defaults (date range, branch view, progress toggle) */
    async upsertReportDefaults(dto: UpsertReportDefaultDto) {
        return this.prisma.kpiReportDefault.upsert({
            where:  { branch_id: dto.branch_id },
            update: { ...dto },
            create: { ...dto },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  GET /kpi-settings/progress — Dashboard monthly target progress bar
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Returns current month's completed sales vs the Monthly KPI target.
     * Used by the Dashboard progress bar widget shown to all users.
     *
     * Improvements over old version:
     *  - Filters sale_status = 'Completed' (old version counted ALL sales including Pending/Cancelled)
     *  - Returns dailyRequired (old version did not return this)
     *  - Uses Math.min(100, ...) so percentage never exceeds 100%
     */
    async getTargetProgress(branchId?: number) {
        const today         = new Date();
        const startOfMonth  = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysInMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - today.getDate();

        const [target, salesResult] = await Promise.all([
            this.prisma.kpiTarget.findFirst({
                where: {
                    period_type: 'Monthly',
                    branch_id:   branchId ?? 0,
                },
            }),
            this.prisma.ryzera_pos_sale.aggregate({
                _sum: { total_amount: true },
                where: {
                    sale_date:   { gte: startOfMonth },
                    sale_status: SaleStatus.Completed,
                    ...(branchId ? { branchId } : {}),
                },
            }),
        ]);

        const current         = Number(salesResult._sum.total_amount ?? 0);
        const targetAmount    = Number(target?.target_amount ?? 0);
        const percentage      = targetAmount > 0
            ? Math.min(100, Math.round((current / targetAmount) * 100))
            : 0;
        const amountRemaining = Math.max(0, targetAmount - current);
        // How much needs to be sold each remaining day to hit the monthly target
        const dailyRequired   = daysRemaining > 0
            ? Math.ceil(amountRemaining / daysRemaining)
            : 0;

        return {
            current,          // total completed sales this month in LKR
            targetAmount,     // monthly KPI target in LKR
            percentage,       // progress percentage (capped at 100)
            daysRemaining,    // days left in current month
            amountRemaining,  // LKR still needed to hit target
            dailyRequired,    // "needs Rs X/day to hit target" shown in Dashboard UI
        };
    }
}