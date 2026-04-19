import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BatchQueryDto } from './batch-query.schema';
import { BatchRepository } from './batch.repository';

interface CreateBatchDto {
  productId: string;
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

  private async findOrFail(id: string) {
    const batch = await this.batchRepo.findById(id);
    if (!batch) throw new NotFoundException(`Batch "${id}" not found`);
    return batch;
  }

  private async assertBatchNumberAvailable(
    batchNumber: string,
    excludeId?: string,
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

  findOne(id: string) {
    return this.findOrFail(id);
  }

  async create(dto: CreateBatchDto) {
    await this.assertBatchNumberAvailable(dto.batchNumber);
    return this.batchRepo.create(dto);
  }

  async update(id: string, dto: UpdateBatchDto) {
    await this.findOrFail(id);
    if (dto.batchNumber) {
      await this.assertBatchNumberAvailable(dto.batchNumber, id);
    }
    return this.batchRepo.update(id, dto);
  }

  async remove(id: string) {
    await this.findOrFail(id);
    return this.batchRepo.delete(id);
  }
}
