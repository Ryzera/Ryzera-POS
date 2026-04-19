import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type {
  AssignProductToBranchDto,
  AdjustStockDto,
} from '@ryzera/pos-schema';

import {
  BranchProductQueryDto,
  InventoryLogQueryDto,
  StockAlertQueryDto,
} from './inventory-query.schema';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── BranchProduct ──────────────────────────────────────────────

  async findAllBranchProducts(query: BranchProductQueryDto) {
    const { page, limit, branchId, productId, search, lowStock } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BranchProductWhereInput = {
      ...(branchId && { branchId }),
      ...(productId && { productId }),
      ...(search && {
        product: {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        },
      }),
      // low stock filter — stock below product's minStock
      ...(lowStock && {
        stockQty: { lt: 0 },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branchProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              minStock: true,
              unit: true,
            },
          },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.branchProduct.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findBranchProduct(branchId: string, productId: string) {
    return this.prisma.branchProduct.findUnique({
      where: { branchId_productId: { branchId, productId } },
      include: {
        product: true,
        branch: { select: { id: true, name: true } },
      },
    });
  }

  assignProductToBranch(dto: AssignProductToBranchDto) {
    return this.prisma.branchProduct.create({
      data: {
        branchId: dto.branchId,
        productId: dto.productId,
        stockQty: dto.stockQty,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        branch: { select: { id: true, name: true } },
      },
    });
  }

  // ── Stock Adjustment ───────────────────────────────────────────

  async adjustStock(
    branchProductId: string,
    branchId: string,
    productId: string,
    userId: string,
    dto: AdjustStockDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.branchProduct.update({
        where: { id: branchProductId },
        data: { stockQty: { increment: dto.changeQty } },
        include: {
          product: {
            select: { id: true, name: true, sku: true, minStock: true },
          },
          branch: { select: { id: true, name: true } },
        },
      });

      // Write audit log
      await tx.inventoryLog.create({
        data: {
          action: dto.action,
          changeQty: dto.changeQty,
          description: dto.description,
          userId,
          productId,
          branchId,
          branchProductId,
        },
      });

      // Trigger low-stock alert if stock falls below minStock
      if (updated.stockQty < updated.product.minStock) {
        await tx.stockAlert.create({
          data: {
            productId,
            branchId,
            stockQty: updated.stockQty,
            minStock: updated.product.minStock,
          },
        });
      }

      return updated;
    });
  }

  // ── Inventory Logs ─────────────────────────────────────────────

  async findAllLogs(query: InventoryLogQueryDto) {
    const { page, limit, branchId, productId, action } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryLogWhereInput = {
      ...(branchId && { branchId }),
      ...(productId && { productId }),
      ...(action && { action }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventoryLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          branch: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      this.prisma.inventoryLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ── Stock Alerts ───────────────────────────────────────────────

  async findAllAlerts(query: StockAlertQueryDto) {
    const { page, limit, branchId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StockAlertWhereInput = {
      ...(branchId && { branchId }),
      ...(status && { status }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.stockAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.stockAlert.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  updateAlertStatus(id: string, status: 'PENDING' | 'SEEN' | 'RESOLVED') {
    return this.prisma.stockAlert.update({
      where: { id },
      data: { status },
    });
  }
}
