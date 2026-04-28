import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';

import { PurchaseOrderQueryDto } from './purchase-order-query.schema';

const LIST_SELECT = {
  id: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  supplier: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  _count: { select: { items: true } },
} satisfies Prisma.PurchaseOrderSelect;

const DETAIL_INCLUDE = {
  supplier: { select: { id: true, name: true, email: true, phone: true } },
  branch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true } },
    },
  },
  invoice: true,
  stockAlert: { select: { id: true, status: true } },
} satisfies Prisma.PurchaseOrderInclude;

// Local types — avoids unsafe access on zod inferred types
interface CreatePOItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

interface CreatePOData {
  supplierId: string;
  branchId: string;
  notes?: string;
  stockAlertId?: string;
  items: CreatePOItem[];
}

interface CreateInvoiceData {
  invoiceNo: string;
  totalAmount: number;
  dueDate?: string;
  notes?: string;
}

@Injectable()
export class PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PurchaseOrderQueryDto) {
    const { page, limit, supplierId, branchId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseOrderWhereInput = {
      ...(supplierId && { supplierId }),
      ...(branchId && { branchId }),
      ...(status && { status }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        select: LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
  }

  create(dto: CreatePOData, createdById: string) {
    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        branchId: dto.branchId,
        notes: dto.notes,
        stockAlertId: dto.stockAlertId,
        createdById,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
          })),
        },
      },
      include: DETAIL_INCLUDE,
    });
  }

  updateStatus(
    id: string,
    status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED',
  ) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: DETAIL_INCLUDE,
    });
  }

  async receiveOrder(
    po: NonNullable<Awaited<ReturnType<PurchaseOrderRepository['findById']>>>,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of po.items) {
        const bp = await tx.branchProduct.upsert({
          where: {
            branchId_productId: {
              branchId: po.branchId,
              productId: item.productId,
            },
          },
          create: {
            branchId: po.branchId,
            productId: item.productId,
            stockQty: item.quantity,
          },
          update: {
            stockQty: { increment: item.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            action: 'RESTOCK',
            changeQty: item.quantity,
            description: `Restocked via PO #${po.id}`,
            userId,
            productId: item.productId,
            branchId: po.branchId,
            branchProductId: bp.id,
          },
        });

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { minStock: true },
        });

        if (product && bp.stockQty >= product.minStock) {
          await tx.stockAlert.updateMany({
            where: {
              productId: item.productId,
              branchId: po.branchId,
              status: 'PENDING',
            },
            data: { status: 'RESOLVED' },
          });
        }
      }

      return tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'RECEIVED' },
        include: DETAIL_INCLUDE,
      });
    });
  }

  createInvoice(purchaseOrderId: string, dto: CreateInvoiceData) {
    return this.prisma.invoice.create({
      data: {
        purchaseOrderId,
        invoiceNo: dto.invoiceNo,
        totalAmount: dto.totalAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  findInvoiceByPurchaseOrderId(purchaseOrderId: string) {
    return this.prisma.invoice.findUnique({
      where: { purchaseOrderId },
    });
  }

  markInvoicePaid(purchaseOrderId: string) {
    return this.prisma.invoice.update({
      where: { purchaseOrderId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }
}
