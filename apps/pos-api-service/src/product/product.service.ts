import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProductListQueryDto } from './product-query.schema';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  private async findOrFail(id: number) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException(`Product "${id}" not found`);
    return product;
  }

  private async assertSkuAvailable(sku: string, excludeId?: number) {
    const conflict = await this.productRepo.findBySku(sku, excludeId);
    if (conflict) throw new ConflictException(`SKU "${sku}" is already in use`);
  }

  private async assertBarcodeAvailable(barcode: string, excludeId?: number) {
    const conflict = await this.productRepo.findByBarcode(barcode, excludeId);
    if (conflict)
      throw new ConflictException(`Barcode "${barcode}" is already in use`);
  }

  findAll(query: ProductListQueryDto) {
    return this.productRepo.findAll(query);
  }

  findOne(id: number) {
    return this.findOrFail(id);
  }

  async create(dto: any) {
    if (dto.sku) await this.assertSkuAvailable(dto.sku);
    if (dto.barcode) await this.assertBarcodeAvailable(dto.barcode);
    return this.productRepo.create(dto);
  }

  async update(id: number, dto: any) {
    const product = await this.findOrFail(id);

    if (product.status === 'DISCONTINUED') {
      throw new BadRequestException(
        'Cannot update a discontinued product. Reactivate it first.',
      );
    }

    if (dto.sku) await this.assertSkuAvailable(dto.sku, id);
    if (dto.barcode) await this.assertBarcodeAvailable(dto.barcode, id);

    return this.productRepo.update(id, dto);
  }

  async remove(id: number) {
    const product = await this.findOrFail(id);

    if (product.status === 'DISCONTINUED') {
      throw new BadRequestException('Product is already discontinued.');
    }

    return this.productRepo.softDelete(id);
  }
}
