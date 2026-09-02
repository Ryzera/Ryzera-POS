import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import type {
    UpsertSalesTargetDto,
    UpsertMarginTargetDto,
    UpsertInventoryThresholdDto,
    UpsertNotificationRuleDto,
    UpsertReportDefaultDto,
    SaveAllKpiSettingsDto,
    GetKpiSettingsDto,
} from './schemas/kpi-settings.schema';

@Injectable()
export class KpiTargetsService {
    constructor(private readonly prisma: PrismaService) {}

    // ─── GET /kpi-settings ───────────────────────────────────────────────────
    // branchId here is already resolved+locked by the controller:
    // ADMIN -> whatever they asked for (0 = All Branches, meaning "show every row").
    // MANAGER -> always their own branch_id.
    async getAllSettings(query: GetKpiSettingsDto & { branchId: number }) {
        const branchId = query.branchId;
        const isAllBranchesView = branchId === 0;

        const [
            salesTargets,
            marginTarget,
            inventoryThreshold,
            notificationRules,
            reportDefaults,
            branches,
        ] = await Promise.all([
            this.prisma.kpiTarget.findMany({
                // ADMIN viewing "All Branches" (0) sees every row for the full table.
                // MANAGER (branchId > 0) only sees the global reference row (0) plus
                // their own branch's rows — never another branch's targets.
                where: isAllBranchesView
                    ? undefined
                    : { branch_id: { in: [0, branchId] } },
                orderBy: [{ period_type: 'asc' }, { branch_id: 'asc' }],
            }),

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

            this.prisma.branch.findMany({
                where:   { is_active: true },
                select:  { id: true, name: true, code: true },
                orderBy: { id: 'asc' },
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

    // ─── POST /kpi-settings/save-all ─────────────────────────────────────────
    // dto arrives already branch-pinned by the controller (see resolveWriteBranchId).

    async saveAllSettings(dto: SaveAllKpiSettingsDto) {
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

        const branchSumWarning =
            globalMonthlyTarget && branchMonthlySum !== globalMonthlyTarget.target_amount
                ? `Branch monthly targets sum (${branchMonthlySum.toLocaleString()}) does not equal ` +
                `All Branches monthly target (${globalMonthlyTarget.target_amount.toLocaleString()}). ` +
                `Settings were saved but please review your targets.`
                : null;

        const result = await this.prisma.$transaction(async (tx) => {
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

            const notificationRules = await tx.kpiNotificationRule.upsert({
                where:  { branch_id: dto.notification_rules.branch_id },
                update: { ...dto.notification_rules },
                create: { ...dto.notification_rules },
            });

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
            branch_sum_warning: branchSumWarning,
            ...result,
        };
    }

    // ─── Individual section upserts ───────────────────────────────────────────
    // Every dto.branch_id below has already been pinned by the controller.

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

    async upsertInventoryThreshold(dto: UpsertInventoryThresholdDto) {
        return this.prisma.kpiInventoryThreshold.upsert({
            where:  { branch_id: dto.branch_id },
            update: {
                default_reorder_level: dto.default_reorder_level,
                // FIX: this used to write default_reorder_level into
                // critical_stock_level too (copy-paste bug) — now correct.
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

    async upsertNotificationRules(dto: UpsertNotificationRuleDto) {
        return this.prisma.kpiNotificationRule.upsert({
            where:  { branch_id: dto.branch_id },
            update: { ...dto },
            create: { ...dto },
        });
    }

    async upsertReportDefaults(dto: UpsertReportDefaultDto) {
        return this.prisma.kpiReportDefault.upsert({
            where:  { branch_id: dto.branch_id },
            update: { ...dto },
            create: { ...dto },
        });
    }

    // ─── GET /kpi-settings/progress ──────────────────────────────────────────

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
            this.prisma.sale.aggregate({
                _sum: { total_amount: true },
                where: {
                    created_at:  { gte: startOfMonth },
                    sale_status: 'Completed',
                    ...(branchId ? { branch_id: branchId } : {}),
                },
            }),
        ]);

        const current         = Number(salesResult._sum.total_amount ?? 0);
        const targetAmount    = Number(target?.target_amount ?? 0);
        const percentage      = targetAmount > 0
            ? Math.min(100, Math.round((current / targetAmount) * 100))
            : 0;
        const amountRemaining = Math.max(0, targetAmount - current);
        const dailyRequired   = daysRemaining > 0
            ? Math.ceil(amountRemaining / daysRemaining)
            : 0;

        return {
            current,
            targetAmount,
            percentage,
            daysRemaining,
            amountRemaining,
            dailyRequired,
        };
    }
}
