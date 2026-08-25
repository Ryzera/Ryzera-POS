import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BatchQueryDto } from './batch-query.schema';
import { BatchRepository } from './batch.repository';

interface CreateBatchDto {
  product_id: number;
  batchNumber: string;
  quantity: number;
  manufactureDate?: string;
  expiryDate?: string;
}

interface UpdateBatchDto {
  batchNumber?: string;
  quantity?: number;
  manufactureDate?: string;
  expiryDate?: string;
}

@Injectable()
export class BatchService {
  constructor(private readonly batchRepo: BatchRepository) {}

  private async findOrFail(id: number) {
    const batch = await this.batchRepo.findById(id);
    if (!batch) throw new NotFoundException(`Batch "${id}" not found`);
    return batch;
  }

  private async assertBatchNumberAvailable(
    batchNumber: string,
    excludeId?: number,
  ) {
    const conflict = await this.batchRepo.findByBatchNumber(
      batchNumber,
      excludeId,
    );
    if (conflict)
      throw new ConflictException(
        `Batch number "${batchNumber}" already exists`,
      );
  }

  findAll(query: BatchQueryDto) {
    return this.batchRepo.findAll(query);
  }

  findOne(id: number) {
    return this.findOrFail(id);
  }

  async create(dto: CreateBatchDto) {
    await this.assertBatchNumberAvailable(dto.batchNumber);
    return this.batchRepo.create(dto);
  }

  async update(id: number, dto: UpdateBatchDto) {
    await this.findOrFail(id);
    if (dto.batchNumber) {
      await this.assertBatchNumberAvailable(dto.batchNumber, id);
    }
    return this.batchRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.findOrFail(id);
    return this.batchRepo.delete(id);
  }
}
