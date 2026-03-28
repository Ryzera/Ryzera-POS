import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StockAlertsService } from '../stock-alerts/stock-alerts.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private stockAlertsService: StockAlertsService,
  ) {}

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
      data.minStock !== undefined &&
      (typeof data.minStock !== 'number' || data.minStock < 0)
    ) {
      throw new BadRequestException('minStock must be a positive number');
    }
  }

  // ─── Product CRUD ─────────────────────────────────────────

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

  // ─── Branch Stock ─────────────────────────────────────────

  async getProductsByBranch(branchId: string) {
    return this.prisma.branchProduct.findMany({
      where: {
        branchId,
        product: { isActive: true },
      },
      include: {
        product: {
          include: { category: true, supplier: true },
        },
      },
    });
  }

  async getProductByBranch(productId: string, branchId: string) {
    return this.prisma.branchProduct.findUnique({
      where: {
        branchId_productId: { branchId, productId },
      },
      include: {
        product: {
          include: { category: true, supplier: true },
        },
      },
    });
  }

  async addProductToBranch(
    productId: string,
    branchId: string,
    stockQty: number = 0,
  ) {
    if (typeof stockQty !== 'number' || stockQty < 0) {
      throw new BadRequestException('stockQty must be a positive number');
    }
    return this.prisma.branchProduct.create({
      data: { productId, branchId, stockQty },
      include: { product: true },
    });
  }

  async updateBranchStock(
    productId: string,
    branchId: string,
    stockQty: number,
  ) {
    if (typeof stockQty !== 'number' || stockQty < 0) {
      throw new BadRequestException('stockQty must be a positive number');
    }

    const updated = await this.prisma.branchProduct.update({
      where: {
        branchId_productId: { branchId, productId },
      },
      data: { stockQty },
      include: { product: true },
    });

    // ✅ Auto-trigger stock alert if stock dropped below minStock
    if (updated.stockQty <= updated.product.minStock) {
      await this.stockAlertsService.createAlert(productId, branchId);
    }

    return updated;
  }

  // ─── Low Stock ────────────────────────────────────────────

  async getLowStockProducts(branchId: string) {
    const branchProducts = await this.prisma.branchProduct.findMany({
      where: {
        branchId,
        product: { isActive: true },
      },
      include: {
        product: {
          include: { category: true, supplier: true },
        },
      },
    });

    return branchProducts.filter((bp) => bp.stockQty <= bp.product.minStock);
  }
}
