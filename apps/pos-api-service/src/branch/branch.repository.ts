import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.branch.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { branchProducts: true, purchaseOrders: true },
        },
      },
    });
  }

  findByName(name: string) {
    return this.prisma.branch.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({ data: dto });
  }

  update(id: string, dto: UpdateBranchDto) {
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  softDelete(id: string) {
    return this.prisma.branch.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
