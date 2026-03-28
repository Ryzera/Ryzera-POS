import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  private validateOrder(data: any) {
    if (!data.supplierId || typeof data.supplierId !== 'string') {
      throw new BadRequestException('supplierId is required');
    }
    if (!data.branchId || typeof data.branchId !== 'string') {
      throw new BadRequestException('branchId is required');
    }
    if (!data.createdById || typeof data.createdById !== 'string') {
      throw new BadRequestException('createdById is required');
    }
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException('at least one item is required');
    }
    for (const item of data.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        throw new BadRequestException('each item must have a productId');
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new BadRequestException('each item must have a valid quantity');
      }
      if (typeof item.unitCost !== 'number' || item.unitCost < 0) {
        throw new BadRequestException('each item must have a valid unitCost');
      }
    }
  }

  async createOrder(data: any) {
    this.validateOrder(data);

    const { items, supplierId, branchId, createdById, stockAlertId, notes } =
      data;

    // Calculate totals
    const orderItems = items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.quantity * item.unitCost,
    }));

    const totalAmount = orderItems.reduce(
      (sum: number, item: any) => sum + item.totalCost,
      0,
    );

    // Generate invoice number e.g. INV-2025-0001
    const count = await this.prisma.invoice.count();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Create order + items + invoice in one transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          supplierId,
          branchId,
          createdById,
          stockAlertId: stockAlertId ?? null,
          notes: notes ?? null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: { include: { product: true } },
          supplier: true,
          branch: true,
        },
      });

      // Auto-generate invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo,
          totalAmount,
          purchaseOrderId: order.id,
        },
      });

      // Mark stock alert as resolved if linked
      if (stockAlertId) {
        await tx.stockAlert.update({
          where: { id: stockAlertId },
          data: { status: 'RESOLVED' },
        });
      }

      return { order, invoice };
    });
  }

  async getAllOrders() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        items: { include: { product: true } },
        supplier: true,
        branch: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrdersByBranch(branchId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { branchId },
      include: {
        items: { include: { product: true } },
        supplier: true,
        branch: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        supplier: true,
        branch: true,
        invoice: true,
      },
    });
  }

  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('invalid status');
    }

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: { include: { product: true } },
        branch: true,
        invoice: true,
      },
    });

    // When order is RECEIVED update stock for each item
    if (status === 'RECEIVED') {
      for (const item of order.items) {
        await this.prisma.branchProduct.upsert({
          where: {
            branchId_productId: {
              branchId: order.branchId,
              productId: item.productId,
            },
          },
          update: {
            stockQty: { increment: item.quantity },
          },
          create: {
            branchId: order.branchId,
            productId: item.productId,
            stockQty: item.quantity,
          },
        });
      }
    }

    return order;
  }
}
