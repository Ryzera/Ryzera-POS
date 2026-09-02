import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // REMOVED: getInvBranchId() — no longer needed, unified Int IDs

  private buildBranchFilter(branchId?: number) {
    return branchId ? { branch_id: branchId } : {}; // ← was: { branchId }
  }

  async getKpiCards(branchId?: number) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const todayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const todayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const todaySales = await this.prisma.sale.aggregate({
      // ← was: ryzera_pos_sale
      where: {
        created_at: { gte: todayStart, lte: todayEnd }, // ← was: sale_date
        sale_status: 'Completed',
        ...this.buildBranchFilter(branchId),
      },
      _sum: { total_amount: true },
      _count: { id: true }, // ← was: sale_id
    });

    // Inventory: BranchProduct now uses Int branch_id
    const branchProductWhere = branchId ? { branch_id: branchId } : {};
    const branchProducts = await this.prisma.branchProduct.findMany({
      where: branchProductWhere,
      include: {
        product: {
          select: { cost_price: true, status: true, min_quantity: true },
        },
      },
    });

    const active = branchProducts.filter(
      (bp) => bp.product.status === 'ACTIVE',
    );

    // cost_price was costPrice, min_quantity was minStock
    const inventoryValue = active.reduce(
      (sum, bp) => sum + Number(bp.product.cost_price ?? 0) * bp.stockQty,
      0,
    );
    const lowStockCount = active.filter(
      (bp) => bp.stockQty > 0 && bp.stockQty <= bp.product.min_quantity,
    ).length;

    return {
      todaySales: parseFloat(
        (Number(todaySales._sum.total_amount) ?? 0).toFixed(2),
      ),
      totalTransactions: todaySales._count.id,
      inventoryValue: parseFloat(inventoryValue.toFixed(2)),
      lowStockCount,
    };
  }

  async getLiveSales(branchId?: number) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.prisma.sale.aggregate({
      // ← was: ryzera_pos_sale
      where: {
        created_at: { gte: monthStart }, // ← was: sale_date
        sale_status: 'Completed',
        ...this.buildBranchFilter(branchId),
      },
      _sum: { total_amount: true },
    });

    return {
      totalSalesThisMonth: parseFloat(
        (Number(result._sum.total_amount) ?? 0).toFixed(2),
      ),
      asOf: new Date().toISOString(),
    };
  }

  async getLowStockAlerts(branchId?: number) {
    const branchProductWhere = branchId ? { branch_id: branchId } : {};
    const branchProducts = await this.prisma.branchProduct.findMany({
      where: branchProductWhere,
      include: {
        product: { include: { category: { select: { name: true } } } },
      },
      orderBy: { stockQty: 'asc' },
    });

    const lowStock = branchProducts.filter(
      (bp) =>
        bp.product.status === 'ACTIVE' &&
        bp.stockQty > 0 &&
        bp.stockQty <= bp.product.min_quantity, // ← was: minStock
    );

    const data = lowStock.map((bp) => ({
      productName: bp.product.name,
      category: bp.product.category?.name,
      stockAmount: `${bp.stockQty}`,
    }));

    return { count: data.length, data };
  }

  async getSalesTrend(branchId?: number) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sales = await this.prisma.sale.findMany({
      // ← was: ryzera_pos_sale
      where: {
        created_at: { gte: sevenDaysAgo, lte: today }, // ← was: sale_date
        sale_status: 'Completed',
        ...this.buildBranchFilter(branchId),
      },
      select: { created_at: true, total_amount: true }, // ← was: sale_date
      orderBy: { created_at: 'asc' },
    });

    const grouped: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      grouped[d.toISOString().slice(0, 10)] = 0;
    }
    sales.forEach((sale) => {
      const day = sale.created_at.toISOString().slice(0, 10); // ← was: sale_date
      if (grouped[day] !== undefined) grouped[day] += Number(sale.total_amount);
    });

    return {
      data: Object.entries(grouped).map(([date, revenue]) => ({
        date,
        revenue: parseFloat(revenue.toFixed(2)),
      })),
    };
  }
}
