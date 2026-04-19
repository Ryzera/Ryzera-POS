import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateSupplierDto, UpdateSupplierDto } from '@ryzera/pos-schema';

import { SupplierListQueryDto } from './supplier-query.schema';
import { SupplierRepository } from './supplier.repository';

@Injectable()
export class SupplierService {
  constructor(private readonly supplierRepo: SupplierRepository) {}

  private async findOrFail(id: string) {
    const supplier = await this.supplierRepo.findById(id);
    if (!supplier) throw new NotFoundException(`Supplier "${id}" not found`);
    return supplier;
  }

  private async assertNameAvailable(name: string, excludeId?: string) {
    const conflict = await this.supplierRepo.findByName(name, excludeId);
    if (conflict)
      throw new ConflictException(`Supplier "${name}" already exists`);
  }

  findAll(query: SupplierListQueryDto) {
    return this.supplierRepo.findAll(query);
  }

  findOne(id: string) {
    return this.findOrFail(id);
  }

  async create(dto: CreateSupplierDto) {
    await this.assertNameAvailable(dto.name);
    return this.supplierRepo.create(dto);
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const supplier = await this.findOrFail(id);

    if (!supplier.isActive) {
      throw new BadRequestException(
        'Cannot update an inactive supplier. Reactivate it first.',
      );
    }

    if (dto.name) await this.assertNameAvailable(dto.name, id);
    return this.supplierRepo.update(id, dto);
  }

  async remove(id: string) {
    const supplier = await this.findOrFail(id);

    if (!supplier.isActive) {
      throw new BadRequestException('Supplier is already inactive.');
    }

    // Guard — prevent deactivating if supplier has active products linked
    if (supplier._count.products > 0) {
      throw new BadRequestException(
        'Cannot deactivate a supplier with linked products. Reassign them first.',
      );
    }

    return this.supplierRepo.softDelete(id);
  }
}
