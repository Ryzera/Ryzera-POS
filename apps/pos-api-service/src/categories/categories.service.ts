import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private validateCategory(data: any) {
    if (!data.name || typeof data.name !== 'string') {
      throw new BadRequestException('name is required and must be a string');
    }
  }

  async createCategory(data: any) {
    this.validateCategory(data);
    return this.prisma.category.create({ data });
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      include: { products: true },
    });
  }

  async getCategoryById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  async updateCategory(id: string, data: any) {
    if (data.name !== undefined && typeof data.name !== 'string') {
      throw new BadRequestException('name must be a string');
    }
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
