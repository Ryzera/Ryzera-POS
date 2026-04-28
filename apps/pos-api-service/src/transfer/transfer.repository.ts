import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';

import { TransferQueryDto } from './transfer-query.schema';

const LIST_SELECT = {
  id: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  sourceBranch: { select: { id: true, name: true } },
  destinationBranch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  _count: { select: { items: true } },
} satisfies Prisma.TransferSelect;

const DETAIL_INCLUDE = {
  sourceBranch: { select: { id: true, name: true } },
  destinationBranch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true } },
    },
  },
} satisfies Prisma.TransferInclude;

interface CreateTransferItem {
  productId: string;
  quantity: number;
}

interface CreateTransferData {
  sourceBranchId: string;
  destinationBranchId: string;
  notes?: string;
  items: CreateTransferItem[];
}

@Injectable()
export class TransferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TransferQueryDto) {
    const { page, limit, sourceBranchId, destinationBranchId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TransferWhereInput = {
      ...(sourceBranchId && { sourceBranchId }),
      ...(destinationBranchId && { destinationBranchId }),
      ...(status && { status }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transfer.findMany({
        select: LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.transfer.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
  }

  create(dto: CreateTransferData, createdById: string) {
    return this.prisma.transfer.create({
      data: {
        sourceBranchId: dto.sourceBranchId,
        destinationBranchId: dto.destinationBranchId,
        notes: dto.notes,
        createdById,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: DETAIL_INCLUDE,
    });
  }

  async shipTransfer(
      transfer: NonNullable<Awaited<ReturnType<TransferRepository['findById']>>>,
      userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const bp = await tx.branchProduct.findUnique({
          where: {
            branchId_productId: {
              branchId: transfer.sourceBranchId,
              productId: item.productId,
            },
          },
        });

        if (!bp || bp.stockQty < item.quantity) {
          throw new BadRequestException(
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
            productId: item.productId,
            branchId: transfer.sourceBranchId,
            branchProductId: bp.id,
          },
        });

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { minStock: true },
        });

        if (product && updated.stockQty < product.minStock) {
          await tx.stockAlert.create({
            data: {
              productId: item.productId,
              branchId: transfer.sourceBranchId,
              stockQty: updated.stockQty,
              minStock: product.minStock,
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

  async receiveTransfer(
      transfer: NonNullable<Awaited<ReturnType<TransferRepository['findById']>>>,
      userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const bp = await tx.branchProduct.upsert({
          where: {
            branchId_productId: {
              branchId: transfer.destinationBranchId,
              productId: item.productId,
            },
          },
          create: {
            branchId: transfer.destinationBranchId,
            productId: item.productId,
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
            productId: item.productId,
            branchId: transfer.destinationBranchId,
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

  cancelTransfer(id: string) {
    return this.prisma.transfer.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: DETAIL_INCLUDE,
    });
  }
}