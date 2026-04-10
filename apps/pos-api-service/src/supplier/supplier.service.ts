import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { CreateSupplierDto, UpdateSupplierDto } from '@ryzera/pos-schema';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  findAll(activeOnly = false) {
    return this.prisma.supplier.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const s = await this.prisma.supplier.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
