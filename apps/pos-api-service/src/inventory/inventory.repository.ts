import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type {
  AssignProductToBranchDto,
  AdjustStockDto,
} from '@ryzera/pos-schema';
import type {
  BranchProductQueryDto,
  InventoryLogQueryDto,
  StockAlertQueryDto,
} from './inventory-query.schema';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── BranchProduct ──────────────────────────────────────────

  async findAllBranchProducts(query: BranchProductQueryDto) {
    const { page, limit, branchId, productId, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BranchProductWhereInput = {
      ...(branchId && { branch_id: Number(branchId) }),
      ...(productId && { product_id: Number(productId) }),
      ...(search && {
        product: {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branchProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updated_at: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              code: true,
              price: true,
              cost_price: true,
              min_quantity: true,
              unit: true,
              category: { select: { id: true, name: true } },
            },
          },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.branchProduct.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findBranchProduct(branchId: number, productId: number) {
    return this.prisma.branchProduct.findUnique({
      where: {
        branch_id_product_id: { branch_id: branchId, product_id: productId },
      },
      include: {
        product: true,
        branch: { select: { id: true, name: true } },
      },
    });
  }

  async assignProductToBranch(dto: AssignProductToBranchDto) {
    const branchId = Number(dto.branchId);
    const productId = Number(dto.productId);
    const stockQty = dto.stockQty ?? 0;

    const bp = await this.prisma.branchProduct.create({
      data: {
        branch_id: branchId,
        product_id: productId,
        stockQty,
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true, min_quantity: true },
        },
        branch: { select: { id: true, name: true } },
      },
    });

    // Check if initial stock triggers low stock alert
    if (bp.product.min_quantity > 0 && stockQty <= bp.product.min_quantity) {
      await this.prisma.stockAlert.create({
        data: {
          product_id: productId,
          branch_id: branchId,
          stockQty,
          minStock: bp.product.min_quantity,
        },
      });
    }

    return bp;
  }

  // ── Stock Adjustment ───────────────────────────────────────

  async adjustStock(
    branchProductId: number,
    branchId: number,
    productId: number,
    userId: number,
    dto: AdjustStockDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.branchProduct.update({
        where: { id: branchProductId },
        data: { stockQty: { increment: dto.changeQty } },
        include: {
          product: {
            select: { id: true, name: true, sku: true, min_quantity: true },
          },
          branch: { select: { id: true, name: true } },
        },
      });

      await tx.inventoryLog.create({
        data: {
          action: dto.action,
          changeQty: dto.changeQty,
          description: dto.description,
          userId,
          product_id: productId,
          branch_id: branchId,
          branchProductId,
        },
      });

      if (
        updated.product.min_quantity > 0 &&
        updated.stockQty <= updated.product.min_quantity
      ) {
        await tx.stockAlert.create({
          data: {
            product_id: productId,
            branch_id: branchId,
            stockQty: updated.stockQty,
            minStock: updated.product.min_quantity,
          },
        });
      }

      return updated;
    });
  }

  // ── Inventory Logs ─────────────────────────────────────────

  async findAllLogs(query: InventoryLogQueryDto) {
    const { page, limit, branchId, productId, action } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryLogWhereInput = {
      ...(branchId && { branch_id: Number(branchId) }),
      ...(productId && { product_id: Number(productId) }),
      ...(action && { action }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventoryLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          branch: { select: { id: true, name: true } },
          user: { select: { id: true, info: { select: { first_name: true, last_name: true } } } },
        },
      }),
      this.prisma.inventoryLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ── Stock Alerts ───────────────────────────────────────────

  async findAllAlerts(query: StockAlertQueryDto) {
    const { page, limit, branchId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StockAlertWhereInput = {
      ...(branchId && { branch_id: Number(branchId) }),
      ...(status && { status }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.stockAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true, min_quantity: true },
          },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.stockAlert.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  updateAlertStatus(id: number, status: 'PENDING' | 'SEEN' | 'RESOLVED') {
    return this.prisma.stockAlert.update({
      where: { id },
      data: { status },
    });
  }
}
