import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type { PurchaseOrderQueryDto } from './purchase-order-query.schema';

const LIST_SELECT = {
  id: true,
  status: true,
  notes: true,
  created_at: true,
  updated_at: true,
  supplier: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, info: { select: { first_name: true, last_name: true } } } },
  _count: { select: { items: true } },
} satisfies Prisma.PurchaseOrderSelect;

const DETAIL_INCLUDE = {
  supplier: { select: { id: true, name: true, email: true, phone: true } },
  branch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, info: { select: { first_name: true, last_name: true } } } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true } },
    },
  },
  invoice: true,
  stockAlert: { select: { id: true, status: true } },
} satisfies Prisma.PurchaseOrderInclude;

interface CreatePOItem {
  productId: number;
  quantity: number;
  unitCost: number;
}

interface CreatePOData {
  supplierId: number;
  branchId: number;
  notes?: string;
  stockAlertId?: number;
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
      ...(supplierId && { supplier_id: supplierId }),
      ...(branchId && { branch_id: branchId }),
      ...(status && { status }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        select: LIST_SELECT,
        orderBy: { created_at: 'desc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: number) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
  }

  create(dto: CreatePOData, createdById: number) {
    return this.prisma.purchaseOrder.create({
      data: {
        supplier_id: dto.supplierId,
        branch_id: dto.branchId,
        notes: dto.notes,
        stockAlertId: dto.stockAlertId,
        created_by: createdById,
        items: {
          create: dto.items.map((item) => ({
            product_id: item.productId,
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
    id: number,
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
    userId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of po.items) {
        const bp = await tx.branchProduct.upsert({
          where: {
            branch_id_product_id: {
              branch_id: po.branch_id,
              product_id: item.product_id,
            },
          },
          create: {
            branch_id: po.branch_id,
            product_id: item.product_id,
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
            product_id: item.product_id,
            branch_id: po.branch_id,
            branchProductId: bp.id,
          },
        });

        const product = await tx.product.findUnique({
          where: { id: item.product_id },
          select: { min_quantity: true },
        });

        if (product && bp.stockQty >= product.min_quantity) {
          await tx.stockAlert.updateMany({
            where: {
              product_id: item.product_id,
              branch_id: po.branch_id,
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

  createInvoice(purchaseOrderId: number, dto: CreateInvoiceData) {
    return this.prisma.purchaseInvoice.create({
      data: {
        purchaseOrder_id: purchaseOrderId,
        invoiceNo: dto.invoiceNo,
        totalAmount: dto.totalAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  findInvoiceByPurchaseOrderId(purchaseOrderId: number) {
    return this.prisma.purchaseInvoice.findUnique({
      where: { purchaseOrder_id: purchaseOrderId },
    });
  }

  markInvoicePaid(purchaseOrderId: number) {
    return this.prisma.purchaseInvoice.update({
      where: { purchaseOrder_id: purchaseOrderId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }
}
