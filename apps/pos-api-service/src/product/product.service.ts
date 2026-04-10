import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { CreateProductDto, UpdateProductDto } from '@ryzera/pos-schema';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.product.findMany({
      where: status ? { status: status as any } : undefined,
      include: { category: true, supplier: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        branchProducts: { include: { branch: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const exists = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (exists) throw new ConflictException('SKU already exists');
    return this.prisma.product.create({
      data: { ...dto, price: dto.price, costPrice: dto.costPrice },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'DISCONTINUED' },
    });
  }
}
