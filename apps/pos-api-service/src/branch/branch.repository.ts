import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';

import { BranchListQueryDto } from './branch-query.schema';

const LIST_SELECT = {
  address: true,
  createdAt: true,
  id: true,
  name: true,
  phone: true,
  status: true,
  updatedAt: true,
} satisfies Prisma.BranchSelect;

const DETAIL_INCLUDE = {
  _count: {
    select: { branchProducts: true, purchaseOrders: true },
  },
  users: {
    select: { email: true, id: true, name: true },
  },
} satisfies Prisma.BranchInclude;

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BranchListQueryDto) {
    const { limit, page, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BranchWhereInput = {
      ...(status && { status }),
      ...(search && {
        name: { contains: search, mode: Prisma.QueryMode.insensitive },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branch.findMany({
        orderBy: { createdAt: 'desc' },
        select: LIST_SELECT,
        skip,
        take: limit,
        where,
      }),
      this.prisma.branch.count({ where }),
    ]);

    return { items, limit, page, total };
  }

  findById(id: string) {
    return this.prisma.branch.findUnique({
      include: DETAIL_INCLUDE,
      where: { id },
    });
  }

  findByName(name: string, excludeId?: string) {
    return this.prisma.branch.findFirst({
      select: { id: true, name: true, status: true },
      where: {
        NOT: { status: 'INACTIVE' },
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: dto,
      select: LIST_SELECT,
    });
  }

  update(id: string, dto: UpdateBranchDto) {
    return this.prisma.branch.update({
      data: dto,
      select: LIST_SELECT,
      where: { id },
    });
  }

  softDelete(id: string) {
    return this.prisma.branch.update({
      data: { status: 'INACTIVE' },
      select: LIST_SELECT,
      where: { id },
    });
  }
}
