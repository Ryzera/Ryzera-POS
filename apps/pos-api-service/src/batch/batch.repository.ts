import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type { BatchQueryDto } from './batch-query.schema';

const BATCH_SELECT = {
  id: true,
  batchNumber: true,
  quantity: true,
  manufactureDate: true,
  expiryDate: true,
  created_at: true,
  updated_at: true,
  product: { select: { id: true, name: true, sku: true, unit: true } },
} satisfies Prisma.BatchSelect;

interface CreateBatchData {
  product_id: number;
  batchNumber: string;
  quantity: number;
  manufactureDate?: string;
  expiryDate?: string;
}

interface UpdateBatchData {
  batchNumber?: string;
  quantity?: number;
  manufactureDate?: string;
  expiryDate?: string;
}

@Injectable()
export class BatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BatchQueryDto) {
    const { page, limit, productId, expiringInDays, expired } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.BatchWhereInput = {
      ...(productId && { product_id: Number(productId) }),
      ...(expired && { expiryDate: { lt: now } }),
      ...(expiringInDays &&
        !expired && {
          expiryDate: {
            gte: now,
            lte: new Date(now.getTime() + expiringInDays * 24 * 60 * 60 * 1000),
          },
        }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.batch.findMany({
        select: BATCH_SELECT,
        orderBy: { expiryDate: 'asc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.batch.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: number) {
    return this.prisma.batch.findUnique({
      where: { id },
      select: BATCH_SELECT,
    });
  }

  findByBatchNumber(batchNumber: string, excludeId?: number) {
    return this.prisma.batch.findFirst({
      select: { id: true, batchNumber: true },
      where: {
        batchNumber: { equals: batchNumber, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  create(dto: CreateBatchData) {
    return this.prisma.batch.create({
      data: {
        product_id: dto.product_id,
        batchNumber: dto.batchNumber,
        quantity: dto.quantity,
        manufactureDate: dto.manufactureDate
          ? new Date(dto.manufactureDate)
          : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
      select: BATCH_SELECT,
    });
  }

  update(id: number, dto: UpdateBatchData) {
    return this.prisma.batch.update({
      where: { id },
      data: {
        ...(dto.batchNumber && { batchNumber: dto.batchNumber }),
        ...(dto.quantity && { quantity: dto.quantity }),
        ...(dto.manufactureDate !== undefined && {
          manufactureDate: dto.manufactureDate
            ? new Date(dto.manufactureDate)
            : null,
        }),
        ...(dto.expiryDate !== undefined && {
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        }),
      },
      select: BATCH_SELECT,
    });
  }

  delete(id: number) {
    return this.prisma.batch.delete({
      where: { id },
      select: { id: true, batchNumber: true },
    });
  }
}
