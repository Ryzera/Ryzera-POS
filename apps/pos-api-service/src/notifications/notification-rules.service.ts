import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@ryzera/pos-database';

interface EffectiveNotificationRule {
    daily_target_midday: boolean;
    unusual_hourly_drop: boolean;
    zero_sales_product: boolean;
    low_stock_alert: boolean;
    out_of_stock_alert: boolean;
    daily_summary_notification: boolean;
    weekly_performance_summary: boolean;
    margin_below_target: boolean;
    check_frequency_minutes: number;
}

// Matches the @default()s on KpiNotificationRule in schema.prisma — used
// whenever neither a branch-specific nor a global (branch_id 0) row exists.
const DEFAULT_RULE: EffectiveNotificationRule = {
    daily_target_midday: true,
    unusual_hourly_drop: true,
    zero_sales_product: true,
    low_stock_alert: true,
    out_of_stock_alert: true,
    daily_summary_notification: true,
    weekly_performance_summary: false,
    margin_below_target: true,
    check_frequency_minutes: 5,
};

/**
 * Evaluates every KPI Notification Rule toggle from the KPI Settings page
 * against live sales/inventory data and writes rows into the `notification`
 * table when a condition is met — this is what actually makes the bell icon
 * on the frontend show something.
 *
 * Runs once a minute; each branch is only *evaluated* once every
 * `check_frequency_minutes` (per that branch's own setting). Every rule is
 * also deduped against notifications already created in the relevant time
 * window, so re-checking often never produces duplicate alerts.
 */
@Injectable()
export class NotificationRulesService {
    private readonly logger = new Logger(NotificationRulesService.name);

    // In-memory only — on a server restart every branch is simply re-checked
    // on the next tick. That just resets the check_frequency window, it can
    // never cause a duplicate notification because createIfNotExists() always
    // checks the database first.
    private lastRunAt = new Map<number, number>();

    constructor(private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async evaluateAllBranches() {
        const branches = await this.prisma.branch.findMany({
            where: { is_active: true },
            select: { id: true },
        });

        // 0 = "All Branches" / global scope — always evaluated too, so alerts
        // still fire even when only the global row under KPI Settings is set up.
        const branchIds = [0, ...branches.map((b) => b.id)];

        for (const branchId of branchIds) {
            try {
                await this.evaluateBranch(branchId);
            } catch (err) {
                this.logger.error(
                    `Notification rule check failed for branch ${branchId}`,
                    err as Error,
                );
            }
        }
    }

    private async evaluateBranch(branchId: number) {
        const rule = await this.getEffectiveRule(branchId);

        const now = Date.now();
        const last = this.lastRunAt.get(branchId) ?? 0;
        const dueInMs = rule.check_frequency_minutes * 60_000;
        if (now - last < dueInMs) return;
        this.lastRunAt.set(branchId, now);

        await Promise.all([
            rule.daily_target_midday ? this.checkDailyTargetMidday(branchId) : null,
            rule.unusual_hourly_drop ? this.checkUnusualHourlyDrop(branchId) : null,
            rule.zero_sales_product ? this.checkZeroSalesProducts(branchId) : null,
            rule.low_stock_alert ? this.checkLowStock(branchId) : null,
            rule.out_of_stock_alert ? this.checkOutOfStock(branchId) : null,
            rule.daily_summary_notification ? this.checkDailySummary(branchId) : null,
            rule.weekly_performance_summary ? this.checkWeeklySummary(branchId) : null,
            rule.margin_below_target ? this.checkMarginBelowTarget(branchId) : null,
        ]);
    }

    // ─── Settings resolution — branch-specific row wins, else the global (0)
    // row, else hardcoded schema defaults. Mirrors how KpiTargetsService reads
    // these tables, just without requiring an explicit branch_id: [0, id] fetch
    // since here we resolve one branch at a time. ────────────────────────────
    private async getEffectiveRule(branchId: number): Promise<EffectiveNotificationRule> {
        const [own, global] = await Promise.all([
            branchId !== 0
                ? this.prisma.kpiNotificationRule.findFirst({ where: { branch_id: branchId } })
                : null,
            this.prisma.kpiNotificationRule.findFirst({ where: { branch_id: 0 } }),
        ]);
        const source = own ?? global;
        return source ? { ...DEFAULT_RULE, ...source } : DEFAULT_RULE;
    }

    private async getEffectiveInventoryThreshold(branchId: number) {
        const [own, global] = await Promise.all([
            branchId !== 0
                ? this.prisma.kpiInventoryThreshold.findFirst({ where: { branch_id: branchId } })
                : null,
            this.prisma.kpiInventoryThreshold.findFirst({ where: { branch_id: 0 } }),
        ]);
        const source = own ?? global;
        return {
            default_reorder_level: source?.default_reorder_level ?? 20,
            critical_stock_level: source?.critical_stock_level ?? 5,
            zero_sales_hours: source?.zero_sales_hours ?? 24,
        };
    }

    private async getEffectiveMarginTarget(branchId: number) {
        const [own, global] = await Promise.all([
            branchId !== 0
                ? this.prisma.kpiMarginTarget.findFirst({ where: { branch_id: branchId } })
                : null,
            this.prisma.kpiMarginTarget.findFirst({ where: { branch_id: 0 } }),
        ]);
        const source = own ?? global;
        return {
            target_gross_margin: source ? Number(source.target_gross_margin) : 0,
            target_net_margin: source ? Number(source.target_net_margin) : 0,
        };
    }

    private async getEffectiveDailyTarget(branchId: number): Promise<number> {
        const [dailyOwn, dailyGlobal, monthlyOwn, monthlyGlobal] = await Promise.all([
            branchId !== 0
                ? this.prisma.kpiTarget.findFirst({ where: { branch_id: branchId, period_type: 'Daily' } })
                : null,
            this.prisma.kpiTarget.findFirst({ where: { branch_id: 0, period_type: 'Daily' } }),
            branchId !== 0
                ? this.prisma.kpiTarget.findFirst({ where: { branch_id: branchId, period_type: 'Monthly' } })
                : null,
            this.prisma.kpiTarget.findFirst({ where: { branch_id: 0, period_type: 'Monthly' } }),
        ]);

        const daily = dailyOwn ?? dailyGlobal;
        if (daily) return Number(daily.target_amount);

        // No explicit Daily row (e.g. per-branch targets are Monthly-only) —
        // derive it the same way the KPI Settings page does: monthly / days in month.
        const monthly = monthlyOwn ?? monthlyGlobal;
        if (!monthly) return 0;
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return Number(monthly.target_amount) / daysInMonth;
    }

    // ─── Dedup helper — only creates a notification if one of the same `type`
    // hasn't already fired for this branch since `since` ──────────────────────
    private async createIfNotExists(opts: {
        type: string;
        branchId: number;
        title: string;
        message: string;
        since: Date;
    }) {
        const dbBranchId = opts.branchId === 0 ? null : opts.branchId;

        const existing = await this.prisma.notification.findFirst({
            where: {
                type: opts.type,
                branch_id: dbBranchId,
                created_at: { gte: opts.since },
            },
            select: { id: true },
        });
        if (existing) return;

        await this.prisma.notification.create({
            data: {
                type: opts.type,
                branch_id: dbBranchId,
                title: opts.title,
                message: opts.message,
            },
            select: { id: true },
        });
    }

    private startOfToday(): Date {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private startOfWeek(): Date {
        const d = new Date();
        const day = d.getDay(); // 0 = Sunday
        const diffToMonday = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - diffToMonday);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private branchSalesFilter(branchId: number) {
        return branchId === 0 ? {} : { branch_id: branchId };
    }

    // ─── 1. Daily target not met by midday ──────────────────────────────────
    private async checkDailyTargetMidday(branchId: number) {
        const now = new Date();
        if (now.getHours() < 12) return;

        const dailyTarget = await this.getEffectiveDailyTarget(branchId);
        if (dailyTarget <= 0) return;

        const todayStart = this.startOfToday();
        const result = await this.prisma.sale.aggregate({
            where: {
                created_at: { gte: todayStart },
                sale_status: 'Completed',
                ...this.branchSalesFilter(branchId),
            },
            _sum: { total_amount: true },
        });

        const current = Number(result._sum.total_amount ?? 0);
        if (current >= dailyTarget * 0.5) return;

        const pct = Math.round((current / dailyTarget) * 100);
        await this.createIfNotExists({
            type: `daily_target_midday:${branchId}`,
            branchId,
            title: 'Daily target not met by midday',
            message: `Only ${pct}% of today's sales target reached by 12PM (${Math.round(current).toLocaleString()} of ${Math.round(dailyTarget).toLocaleString()}).`,
            since: todayStart,
        });
    }

    // ─── 2. Unusual hourly drop ─────────────────────────────────────────────
    private async checkUnusualHourlyDrop(branchId: number) {
        const now = new Date();
        const hourStart = new Date(now);
        hourStart.setMinutes(0, 0, 0);

        const lookbackStart = new Date(hourStart);
        lookbackStart.setHours(lookbackStart.getHours() - 3);

        const [currentHour, priorHours] = await Promise.all([
            this.prisma.sale.aggregate({
                where: {
                    created_at: { gte: hourStart, lte: now },
                    sale_status: 'Completed',
                    ...this.branchSalesFilter(branchId),
                },
                _sum: { total_amount: true },
            }),
            this.prisma.sale.aggregate({
                where: {
                    created_at: { gte: lookbackStart, lt: hourStart },
                    sale_status: 'Completed',
                    ...this.branchSalesFilter(branchId),
                },
                _sum: { total_amount: true },
            }),
        ]);

        // Average hourly sales over the prior 3 hours — needs real history
        // before we can call anything "unusual".
        const avgPriorHourly = Number(priorHours._sum.total_amount ?? 0) / 3;
        if (avgPriorHourly <= 0) return;

        const currentAmount = Number(currentHour._sum.total_amount ?? 0);
        if (currentAmount > avgPriorHourly * 0.2) return; // not an 80%+ drop

        const dropPct = Math.round((1 - currentAmount / avgPriorHourly) * 100);
        await this.createIfNotExists({
            type: `unusual_hourly_drop:${branchId}:${hourStart.toISOString()}`,
            branchId,
            title: 'Unusual hourly drop',
            message: `This hour's sales are ${dropPct}% below the recent average (${Math.round(currentAmount).toLocaleString()} vs ~${Math.round(avgPriorHourly).toLocaleString()}/hr).`,
            since: hourStart,
        });
    }

    // ─── 3. Zero-sales product alert ────────────────────────────────────────
    private async checkZeroSalesProducts(branchId: number) {
        const threshold = await this.getEffectiveInventoryThreshold(branchId);
        const todayStart = this.startOfToday();
        const hoursElapsed = (Date.now() - todayStart.getTime()) / 3_600_000;
        if (hoursElapsed < threshold.zero_sales_hours) return;

        const branchProducts = await this.prisma.branchProduct.findMany({
            where: branchId === 0 ? {} : { branch_id: branchId },
            select: { product_id: true, product: { select: { status: true } } },
        });
        const activeProductIds = branchProducts
            .filter((bp) => bp.product.status === 'ACTIVE')
            .map((bp) => bp.product_id);
        if (activeProductIds.length === 0) return;

        const soldToday = await this.prisma.saleItem.findMany({
            where: {
                product_id: { in: activeProductIds },
                created_at: { gte: todayStart },
                sale: { sale_status: 'Completed', ...this.branchSalesFilter(branchId) },
            },
            select: { product_id: true },
            distinct: ['product_id'],
        });
        const soldIds = new Set(soldToday.map((s) => s.product_id));
        const zeroSalesCount = activeProductIds.filter((id) => !soldIds.has(id)).length;
        if (zeroSalesCount === 0) return;

        await this.createIfNotExists({
            type: `zero_sales_product:${branchId}`,
            branchId,
            title: 'Zero-sales product alert',
            message: `${zeroSalesCount} product${zeroSalesCount === 1 ? '' : 's'} had no sales today (as of ${new Date().toLocaleTimeString()}).`,
            since: todayStart,
        });
    }

    // ─── 4. Low stock alert ─────────────────────────────────────────────────
    private async checkLowStock(branchId: number) {
        const threshold = await this.getEffectiveInventoryThreshold(branchId);
        const todayStart = this.startOfToday();

        const branchProducts = await this.prisma.branchProduct.findMany({
            where: branchId === 0 ? {} : { branch_id: branchId },
            select: {
                stockQty: true,
                product: { select: { status: true, min_quantity: true } },
            },
        });

        const lowStock = branchProducts.filter(
            (bp) =>
                bp.product.status === 'ACTIVE' &&
                bp.stockQty > 0 &&
                bp.stockQty <= Math.max(bp.product.min_quantity, threshold.default_reorder_level),
        );
        if (lowStock.length === 0) return;

        await this.createIfNotExists({
            type: `low_stock_alert:${branchId}`,
            branchId,
            title: 'Low stock alert',
            message: `${lowStock.length} product${lowStock.length === 1 ? '' : 's'} at or below reorder level.`,
            since: todayStart,
        });
    }

    // ─── 5. Out of stock alert ──────────────────────────────────────────────
    private async checkOutOfStock(branchId: number) {
        const todayStart = this.startOfToday();

        const branchProducts = await this.prisma.branchProduct.findMany({
            where: branchId === 0 ? {} : { branch_id: branchId },
            select: { stockQty: true, product: { select: { status: true } } },
        });

        const outOfStock = branchProducts.filter(
            (bp) => bp.product.status === 'ACTIVE' && bp.stockQty <= 0,
        );
        if (outOfStock.length === 0) return;

        await this.createIfNotExists({
            type: `out_of_stock_alert:${branchId}`,
            branchId,
            title: 'Out of stock alert',
            message: `${outOfStock.length} product${outOfStock.length === 1 ? '' : 's'} reached zero stock.`,
            since: todayStart,
        });
    }

    // ─── 6. Daily summary notification (from 9PM) ───────────────────────────
    private async checkDailySummary(branchId: number) {
        const now = new Date();
        if (now.getHours() < 21) return;

        const todayStart = this.startOfToday();
        const result = await this.prisma.sale.aggregate({
            where: {
                created_at: { gte: todayStart },
                sale_status: 'Completed',
                ...this.branchSalesFilter(branchId),
            },
            _sum: { total_amount: true },
            _count: { id: true },
        });

        const total = Number(result._sum.total_amount ?? 0);
        await this.createIfNotExists({
            type: `daily_summary_notification:${branchId}`,
            branchId,
            title: 'Daily summary',
            message: `Today: ${result._count.id} transactions totalling ${total.toLocaleString()}.`,
            since: todayStart,
        });
    }

    // ─── 7. Weekly performance summary (Monday, from 9AM) ───────────────────
    private async checkWeeklySummary(branchId: number) {
        const now = new Date();
        if (now.getDay() !== 1 || now.getHours() < 9) return;

        const weekStart = this.startOfWeek();
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const result = await this.prisma.sale.aggregate({
            where: {
                created_at: { gte: lastWeekStart, lt: weekStart },
                sale_status: 'Completed',
                ...this.branchSalesFilter(branchId),
            },
            _sum: { total_amount: true },
            _count: { id: true },
        });

        const total = Number(result._sum.total_amount ?? 0);
        await this.createIfNotExists({
            type: `weekly_performance_summary:${branchId}`,
            branchId,
            title: 'Weekly performance summary',
            message: `Last week: ${result._count.id} transactions totalling ${total.toLocaleString()}.`,
            since: weekStart,
        });
    }

    // ─── 8. Margin below target ──────────────────────────────────────────────
    private async checkMarginBelowTarget(branchId: number) {
        const marginTarget = await this.getEffectiveMarginTarget(branchId);
        if (marginTarget.target_gross_margin <= 0) return;

        const todayStart = this.startOfToday();
        const items = await this.prisma.saleItem.findMany({
            where: {
                created_at: { gte: todayStart },
                sale: { sale_status: 'Completed', ...this.branchSalesFilter(branchId) },
            },
            select: { quantity: true, unit_price: true, cost_price: true },
        });
        if (items.length === 0) return;

        let revenue = 0;
        let cost = 0;
        for (const item of items) {
            const qty = Number(item.quantity);
            revenue += qty * Number(item.unit_price);
            cost += qty * Number(item.cost_price);
        }
        if (revenue <= 0) return;

        const grossMarginPct = ((revenue - cost) / revenue) * 100;
        if (grossMarginPct >= marginTarget.target_gross_margin) return;

        await this.createIfNotExists({
            type: `margin_below_target:${branchId}`,
            branchId,
            title: 'Margin below target',
            message: `Today's gross margin is ${grossMarginPct.toFixed(1)}%, below the ${marginTarget.target_gross_margin}% target.`,
            since: todayStart,
        });
    }
}
