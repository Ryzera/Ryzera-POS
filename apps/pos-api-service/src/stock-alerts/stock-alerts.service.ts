import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StockAlertsService {
  constructor(private prisma: PrismaService) {}

  // Auto-called when stock drops below minStock
  async createAlert(productId: string, branchId: string) {
    const branchProduct = await this.prisma.branchProduct.findUnique({
      where: { branchId_productId: { branchId, productId } },
      include: { product: true },
    });

    if (!branchProduct) {
      throw new BadRequestException('Product not found in this branch');
    }

    // Avoid duplicate PENDING alerts for same product+branch
    const existing = await this.prisma.stockAlert.findFirst({
      where: { productId, branchId, status: 'PENDING' },
    });

    if (existing) return existing;

    return this.prisma.stockAlert.create({
      data: {
        productId,
        branchId,
        stockQty: branchProduct.stockQty,
        minStock: branchProduct.product.minStock,
      },
      include: { product: true, branch: true },
    });
  }

  async getAllAlerts() {
    return this.prisma.stockAlert.findMany({
      include: { product: true, branch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAlertsByBranch(branchId: string) {
    return this.prisma.stockAlert.findMany({
      where: { branchId },
      include: { product: true, branch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingAlerts(branchId: string) {
    return this.prisma.stockAlert.findMany({
      where: { branchId, status: 'PENDING' },
      include: { product: true, branch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsSeen(id: string) {
    return this.prisma.stockAlert.update({
      where: { id },
      data: { status: 'SEEN' },
      include: { product: true, branch: true },
    });
  }

  async resolveAlert(id: string) {
    return this.prisma.stockAlert.update({
      where: { id },
      data: { status: 'RESOLVED' },
      include: { product: true, branch: true },
    });
  }
}
