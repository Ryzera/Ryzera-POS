import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { CreateProductDto, UpdateProductDto } from '@ryzera/pos-schema';

@Injectable()
export class InventoryService {
    constructor(private readonly repo: InventoryRepository) {}

    async findAll(companyId?: number, branchId?: number) {
        return this.repo.findAll(companyId, branchId);
    }

    async findOne(id: number) {
        const product = await this.repo.findById(id);
        if (!product) throw new NotFoundException(`Product #${id} not found`);
        return product;
    }

    async create(dto: CreateProductDto) {
        return this.repo.create(dto);
    }

    async update(id: number, dto: UpdateProductDto) {
        await this.findOne(id);
        return this.repo.update(id, dto);
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.repo.delete(id);
    }
}