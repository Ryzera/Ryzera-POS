import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { Prisma } from '@ryzera/pos-database';
import type { CreateProductDto, UpdateProductDto } from '@ryzera/pos-schema';

import { ProductListQueryDto } from './product-query.schema';

const LIST_SELECT = {
  id: true,
  name: true,
  sku: true,
  barcode: true,
  price: true,
  costPrice: true,
  minStock: true,
  unit: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
} satisfies Prisma.ProductSelect;

const DETAIL_INCLUDE = {
  category: true,
  supplier: { select: { id: true, name: true, phone: true, email: true } },
  _count: { select: { branchProducts: true, batches: true } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductListQueryDto) {
    const { page, limit, search, status, unit, categoryId, supplierId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
      ...(unit && { unit }),
      ...(categoryId && { categoryId }),
      ...(supplierId && { supplierId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { barcode: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        select: LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
  }

  findBySku(sku: string, excludeId?: string) {
    return this.prisma.product.findFirst({
      select: { id: true, sku: true },
      where: {
        sku: { equals: sku, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  findByBarcode(barcode: string, excludeId?: string) {
    return this.prisma.product.findFirst({
      select: { id: true, barcode: true },
      where: {
        barcode: { equals: barcode, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      select: LIST_SELECT,
    });
  }

  update(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
      select: LIST_SELECT,
    });
  }

  softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'DISCONTINUED' },
      select: LIST_SELECT,
    });
  }
}
