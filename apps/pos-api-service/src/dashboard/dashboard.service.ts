import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    // ryzera_pos_sale.branchId is Int
    private getInvBranchId(branchId?: number): string | undefined {
        if (!branchId) return undefined;
        // Map billing integer branchId → inventory UUID
        const map: Record<number, string> = {
            1: 'invb-0001-0000-0000-000000000001',
            2: 'invb-0002-0000-0000-000000000002',
            3: 'invb-0003-0000-0000-000000000003',
        };
        return map[branchId];
    }

    private buildBranchFilter(branchId?: number) {
        return branchId ? { branchId } : {};
    }

    // ─── KPI Cards ────────────────────────────────────────────────────
    async getKpiCards(branchId?: number) {
        const now = new Date();
        const offset = 5.5 * 60 * 60 * 1000;
        const localNow = new Date(now.getTime() + offset);
        const dateStr = localNow.toISOString().slice(0, 10);

        const todayStart = new Date(`${dateStr}T00:00:00.000Z`);
        const todayEnd   = new Date(`${dateStr}T23:59:59.999Z`);

        const todaySales = await this.prisma.ryzera_pos_sale.aggregate({
            where: {
                sale_date:   { gte: todayStart, lte: todayEnd },
                sale_status: 'Completed',
                ...this.buildBranchFilter(branchId),
            },
            _sum:   { total_amount: true },
            _count: { sale_id: true },
        });

        let inventoryValue = 0;
        let lowStockCount  = 0;

        if (branchId) {
            // Branch-specific: BranchProduct.branchId is String (InvBranch UUID)
            const branchProducts = await this.prisma.branchProduct.findMany({
                where: { branchId: this.getInvBranchId(branchId) },                include: {
                    product: {
                        select: { costPrice: true, status: true, minStock: true },
                    },
                },
            });

            // FIXED: status === 'ACTIVE' (ProductStatus enum, not Boolean)
            const active = branchProducts.filter(bp => bp.product.status === 'ACTIVE');

            // FIXED: costPrice is Decimal → Number()
            inventoryValue = active.reduce(
                (sum, bp) => sum + Number(bp.product.costPrice ?? 0) * bp.stockQty, 0
            );

            lowStockCount = active.filter(
                bp => bp.stockQty > 0 && bp.stockQty <= bp.product.minStock
            ).length;

        } else {
            // FIXED: InvProduct has NO stockQty field directly.
            // stockQty lives on BranchProduct. Query all BranchProducts for global totals.
            const branchProducts = await this.prisma.branchProduct.findMany({
                include: {
                    product: {
                        select: { costPrice: true, status: true, minStock: true },
                    },
                },
            });

            const active = branchProducts.filter(bp => bp.product.status === 'ACTIVE');

            // FIXED: costPrice is Decimal → Number()
            inventoryValue = active.reduce(
                (sum, bp) => sum + Number(bp.product.costPrice ?? 0) * bp.stockQty, 0
            );

            lowStockCount = active.filter(
                bp => bp.stockQty > 0 && bp.stockQty <= bp.product.minStock
            ).length;
        }

        return {
            todaySales:        parseFloat((todaySales._sum.total_amount ?? 0).toFixed(2)),
            totalTransactions: todaySales._count.sale_id,
            inventoryValue:    parseFloat(inventoryValue.toFixed(2)),
            lowStockCount,
        };
    }

    // ─── Live Sales Counter (total this month) ────────────────────────
    async getLiveSales(branchId?: number) {
        const now        = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        const result = await this.prisma.ryzera_pos_sale.aggregate({
            where: {
                sale_date:   { gte: monthStart },
                sale_status: 'Completed',
                ...this.buildBranchFilter(branchId),
            },
            _sum: { total_amount: true },
        });

        return {
            totalSalesThisMonth: parseFloat(
                (result._sum.total_amount ?? 0).toFixed(2)
            ),
            asOf: new Date().toISOString(),
        };
    }

    // ─── Low Stock Alerts ─────────────────────────────────────────────
    async getLowStockAlerts(branchId?: number) {
        if (branchId) {
            const branchProducts = await this.prisma.branchProduct.findMany({
                where: { branchId: this.getInvBranchId(branchId) },                include: {
                    product: {
                        include: {
                            category: { select: { name: true } },
                        },
                    },
                },
                orderBy: { stockQty: 'asc' },
            });

            // FIXED: status === 'ACTIVE'
            const lowStock = branchProducts.filter(
                bp => bp.product.status === 'ACTIVE'
                    && bp.stockQty > 0
                    && bp.stockQty <= bp.product.minStock
            );

            const data = lowStock.map(bp => ({
                productName: bp.product.name,
                category:    bp.product.category?.name,
                stockAmount: `${bp.stockQty}`,
            }));

            return { count: data.length, data };

        } else {
            // FIXED: Global — query all BranchProducts, not InvProduct directly
            const branchProducts = await this.prisma.branchProduct.findMany({
                include: {
                    product: {
                        include: {
                            category: { select: { name: true } },
                        },
                    },
                },
                orderBy: { stockQty: 'asc' },
            });

            // FIXED: status === 'ACTIVE'
            const lowStock = branchProducts.filter(
                bp => bp.product.status === 'ACTIVE'
                    && bp.stockQty > 0
                    && bp.stockQty <= bp.product.minStock
            );

            const data = lowStock.map(bp => ({
                productName: bp.product.name,
                category:    bp.product.category?.name,
                stockAmount: `${bp.stockQty}`,
            }));

            return { count: data.length, data };
        }
    }

    // ─── Sales Trend (last 7 days) ────────────────────────────────────
    async getSalesTrend(branchId?: number) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const sales = await this.prisma.ryzera_pos_sale.findMany({
            where: {
                sale_date:   { gte: sevenDaysAgo, lte: today },
                sale_status: 'Completed',
                ...this.buildBranchFilter(branchId),
            },
            select: {
                sale_date:    true,
                total_amount: true,
            },
            orderBy: { sale_date: 'asc' },
        });

        const grouped: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            grouped[d.toISOString().slice(0, 10)] = 0;
        }

        sales.forEach(sale => {
            const day = sale.sale_date.toISOString().slice(0, 10);
            if (grouped[day] !== undefined) grouped[day] += sale.total_amount;
        });

        const data = Object.entries(grouped).map(([date, revenue]) => ({
            date,
            revenue: parseFloat(revenue.toFixed(2)),
        }));

        return { data };
    }
}