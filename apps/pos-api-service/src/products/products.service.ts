import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  private validateProduct(data: any) {
    if (!data.name || typeof data.name !== 'string') {
      throw new BadRequestException('name is required and must be a string');
    }
    if (!data.sku || typeof data.sku !== 'string') {
      throw new BadRequestException('sku is required and must be a string');
    }
    if (
      data.price === undefined ||
      typeof data.price !== 'number' ||
      data.price < 0
    ) {
      throw new BadRequestException(
        'price is required and must be a positive number',
      );
    }
    if (
      data.costPrice !== undefined &&
      (typeof data.costPrice !== 'number' || data.costPrice < 0)
    ) {
      throw new BadRequestException('costPrice must be a positive number');
    }
    if (
      data.stockQty !== undefined &&
      (typeof data.stockQty !== 'number' || data.stockQty < 0)
    ) {
      throw new BadRequestException('stockQty must be a positive number');
    }
    if (
      data.minStock !== undefined &&
      (typeof data.minStock !== 'number' || data.minStock < 0)
    ) {
      throw new BadRequestException('minStock must be a positive number');
    }
  }

  async createProduct(data: any) {
    this.validateProduct(data);
    return this.prisma.product.create({ data });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, supplier: true },
    });
  }

  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
  }

  async updateProduct(id: string, data: any) {
    if (
      data.price !== undefined &&
      (typeof data.price !== 'number' || data.price < 0)
    ) {
      throw new BadRequestException('price must be a positive number');
    }
    if (
      data.costPrice !== undefined &&
      (typeof data.costPrice !== 'number' || data.costPrice < 0)
    ) {
      throw new BadRequestException('costPrice must be a positive number');
    }
    if (
      data.stockQty !== undefined &&
      (typeof data.stockQty !== 'number' || data.stockQty < 0)
    ) {
      throw new BadRequestException('stockQty must be a positive number');
    }
    if (
      data.minStock !== undefined &&
      (typeof data.minStock !== 'number' || data.minStock < 0)
    ) {
      throw new BadRequestException('minStock must be a positive number');
    }
    return this.prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getLowStockProducts() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, supplier: true },
    });
    return products.filter((p) => p.stockQty <= p.minStock);
  }
}
