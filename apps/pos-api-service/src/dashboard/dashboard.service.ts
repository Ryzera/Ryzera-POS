import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(branchId?: string) {
    const [
      totalProducts,
      totalBranches,
      pendingAlerts,
      pendingOrders,
      recentLogs,
    ] = await Promise.all([
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.branch.count({ where: { status: 'ACTIVE' } }),
      this.prisma.stockAlert.count({
        where: { status: 'PENDING', ...(branchId && { branchId }) },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          status: { in: ['DRAFT', 'SENT'] },
          ...(branchId && { branchId }),
        },
      }),
      this.prisma.inventoryLog.findMany({
        where: branchId ? { branchId } : undefined,
        include: { product: true, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalProducts,
      totalBranches,
      pendingAlerts,
      pendingOrders,
      recentLogs,
    };
  }

  async getLowStockProducts(branchId?: string) {
    const bps = await this.prisma.branchProduct.findMany({
      where: branchId ? { branchId } : undefined,
      include: { product: true, branch: true },
    });
    return bps.filter((bp) => bp.stockQty <= bp.product.minStock);
  }

  async getExpiringBatches(days = 30) {
    const cutoff = new Date(Date.now() + days * 86_400_000);
    return this.prisma.batch.findMany({
      where: { expiryDate: { lte: cutoff, gte: new Date() } },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
