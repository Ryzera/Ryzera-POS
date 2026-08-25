import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type { CategoryListQueryDto } from './category-query.schema';

const LIST_SELECT = {
  id: true,
  name: true,
  _count: { select: { products: true } },
} satisfies Prisma.CategorySelect;

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CategoryListQueryDto) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(search && {
        name: { contains: search, mode: Prisma.QueryMode.insensitive },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        select: LIST_SELECT,
        orderBy: { name: 'asc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, name: true, sku: true, status: true },
          where: { status: 'ACTIVE' },
        },
      },
    });
  }

  findByName(name: string, excludeId?: number) {
    return this.prisma.category.findFirst({
      select: { id: true, name: true },
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  create(dto: { name: string }) {
    return this.prisma.category.create({
      data: dto,
      select: LIST_SELECT,
    });
  }

  update(id: number, dto: { name?: string }) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
      select: LIST_SELECT,
    });
  }

  delete(id: number) {
    return this.prisma.category.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}
