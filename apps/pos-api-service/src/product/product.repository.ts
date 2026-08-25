import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type { ProductListQueryDto } from './product-query.schema';

const LIST_SELECT = {
  id: true,
  name: true,
  code: true,
  sku: true,
  barcode: true,
  price: true,
  cost_price: true,
  min_quantity: true,
  unit: true,
  status: true,
  is_active: true,
  created_at: true,
  updated_at: true,
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
      ...(categoryId && { category_id: Number(categoryId) }),
      ...(supplierId && { supplier_id: Number(supplierId) }),
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
        orderBy: { created_at: 'desc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
  }

  findBySku(sku: string, excludeId?: number) {
    return this.prisma.product.findFirst({
      select: { id: true, sku: true },
      where: {
        sku: { equals: sku, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  findByBarcode(barcode: string, excludeId?: number) {
    return this.prisma.product.findFirst({
      select: { id: true, barcode: true },
      where: {
        barcode: { equals: barcode, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  create(dto: {
    name: string;
    code: string;
    company_id: number;
    sku?: string;
    barcode?: string;
    description?: string;
    price: number;
    cost_price?: number;
    quantity?: number;
    min_quantity?: number;
    unit?: string;
    status?: string;
    branch_id?: number;
    category_id?: number;
    supplier_id?: number;
  }) {
    return this.prisma.product.create({
      data: dto as any,
      select: LIST_SELECT,
    });
  }

  update(
    id: number,
    dto: Partial<{
      name: string;
      code: string;
      sku: string;
      barcode: string;
      description: string;
      price: number;
      cost_price: number;
      min_quantity: number;
      unit: string;
      status: string;
      is_active: boolean;
      category_id: number;
      supplier_id: number;
    }>,
  ) {
    return this.prisma.product.update({
      where: { id },
      data: dto as any,
      select: LIST_SELECT,
    });
  }

  softDelete(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'DISCONTINUED' },
      select: LIST_SELECT,
    });
  }
}
