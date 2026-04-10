import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string) {
    return this.prisma.category.create({ data: { name } });
  }

  async update(id: string, name: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({ where: { id }, data: { name } });
  }

  async remove(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.delete({ where: { id } });
  }
}
