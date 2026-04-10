import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { InventoryService } from '../inventory/inventory.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderStatusDto,
} from '@ryzera/pos-schema';

@Injectable()
export class PurchaseService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService,
  ) {}

  findAll(branchId?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        supplier: true,
        items: { include: { product: true } },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: true } },
        invoice: true,
        branch: true,
      },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async create(dto: CreatePurchaseOrderDto, userId: string) {
    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        branchId: dto.branchId,
        notes: dto.notes,
        stockAlertId: dto.stockAlertId,
        createdById: userId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
          })),
        },
      },
      include: { items: true },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdatePurchaseOrderStatusDto,
    userId: string,
  ) {
    const po = await this.findOne(id);

    // When RECEIVED: restock all items
    if (dto.status === 'RECEIVED') {
      for (const item of po.items) {
        await this.inventory.adjustStock(
          {
            branchId: po.branchId,
            productId: item.productId,
            changeQty: item.quantity,
            action: 'RESTOCK',
          },
          userId,
        );
      }
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }
}
