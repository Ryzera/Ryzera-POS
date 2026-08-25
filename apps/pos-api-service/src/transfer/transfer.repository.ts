import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';

import { TransferQueryDto } from './transfer-query.schema';

const LIST_SELECT = {
  id: true,
  status: true,
  notes: true,
  created_at: true,
  updated_at: true,
  sourceBranch: { select: { id: true, name: true } },
  destinationBranch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, info: { select: { first_name: true, last_name: true } } } },
  _count: { select: { items: true } },
} satisfies Prisma.TransferSelect;

const DETAIL_INCLUDE = {
  sourceBranch: { select: { id: true, name: true } },
  destinationBranch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, info: { select: { first_name: true, last_name: true } } } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true } },
    },
  },
} satisfies Prisma.TransferInclude;

interface CreateTransferItem {
  productId: number;
  quantity: number;
}

interface CreateTransferData {
  sourceBranchId: number;
  destinationBranchId: number;
  notes?: string;
  items: CreateTransferItem[];
}

@Injectable()
export class TransferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TransferQueryDto & { ownBranchId?: number }) {
    const { page, limit, sourceBranchId, destinationBranchId, status, ownBranchId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TransferWhereInput = {
      ...(sourceBranchId && { sourceBranch_id: sourceBranchId }),
      ...(destinationBranchId && { destinationBranch_id: destinationBranchId }),
      ...(status && { status }),
      // Non-admin: transfer must touch their own branch as either source or destination.
      ...(ownBranchId && {
        OR: [
          { sourceBranch_id: ownBranchId },
          { destinationBranch_id: ownBranchId },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transfer.findMany({
        select: LIST_SELECT,
        orderBy: { created_at: 'desc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: number) {
    return this.prisma.transfer.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
  }

  create(dto: CreateTransferData, createdById: number) {
    return this.prisma.transfer.create({
      data: {
        sourceBranch_id: dto.sourceBranchId,
        destinationBranch_id: dto.destinationBranchId,
        notes: dto.notes,
        created_by: createdById,
        items: {
          create: dto.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: DETAIL_INCLUDE,
    });
  }

  // SHIPPED — deduct stock from source branch
  async shipTransfer(
      transfer: NonNullable<Awaited<ReturnType<TransferRepository['findById']>>>,
      userId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const bp = await tx.branchProduct.findUnique({
          where: {
            branch_id_product_id: {
              branch_id: transfer.sourceBranch_id,
              product_id: item.product_id,
            },
          },
        });

        if (!bp || bp.stockQty < item.quantity) {
          throw new Error(
              `Insufficient stock for product "${item.product.name}" in source branch`,
          );
        }

        const updated = await tx.branchProduct.update({
          where: { id: bp.id },
          data: { stockQty: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            action: 'TRANSFER',
            changeQty: -item.quantity,
            description: `Transferred out via Transfer #${transfer.id}`,
            userId,
            product_id: item.product_id,
            branch_id: transfer.sourceBranch_id,
            branchProductId: bp.id,
          },
        });

        const product = await tx.product.findUnique({
          where: { id: item.product_id },
          select: { min_quantity: true },
        });

        if (product && updated.stockQty < product.min_quantity) {
          await tx.stockAlert.create({
            data: {
              product_id: item.product_id,
              branch_id: transfer.sourceBranch_id,
              stockQty: updated.stockQty,
              minStock: product.min_quantity,
            },
          });
        }
      }

      return tx.transfer.update({
        where: { id: transfer.id },
        data: { status: 'SHIPPED' },
        include: DETAIL_INCLUDE,
      });
    });
  }

  // RECEIVED — increment stock in destination branch
  async receiveTransfer(
      transfer: NonNullable<Awaited<ReturnType<TransferRepository['findById']>>>,
      userId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const bp = await tx.branchProduct.upsert({
          where: {
            branch_id_product_id: {
              branch_id: transfer.destinationBranch_id,
              product_id: item.product_id,
            },
          },
          create: {
            branch_id: transfer.destinationBranch_id,
            product_id: item.product_id,
            stockQty: item.quantity,
          },
          update: {
            stockQty: { increment: item.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            action: 'TRANSFER',
            changeQty: item.quantity,
            description: `Transferred in via Transfer #${transfer.id}`,
            userId,
            product_id: item.product_id,
            branch_id: transfer.destinationBranch_id,
            branchProductId: bp.id,
          },
        });
      }

      return tx.transfer.update({
        where: { id: transfer.id },
        data: { status: 'RECEIVED' },
        include: DETAIL_INCLUDE,
      });
    });
  }

  cancelTransfer(id: number) {
    return this.prisma.transfer.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: DETAIL_INCLUDE,
    });
  }
}