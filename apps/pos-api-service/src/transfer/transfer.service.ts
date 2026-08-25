import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TransferQueryDto } from './transfer-query.schema';
import { TransferRepository } from './transfer.repository';

interface CreateTransferItem {
  productId: number;
  quantity: number;
}

interface CreateTransferDto {
  sourceBranchId: number;
  destinationBranchId: number;
  notes?: string;
  items: CreateTransferItem[];
}

interface UpdateTransferStatusDto {
  status: 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  userId: number;
}

@Injectable()
export class TransferService {
  constructor(private readonly transferRepo: TransferRepository) {}

  private async findOrFail(id: number) {
    const transfer = await this.transferRepo.findById(id);
    if (!transfer) throw new NotFoundException(`Transfer "${id}" not found`);
    return transfer;
  }

  findAll(query: TransferQueryDto & { ownBranchId?: number }) {
    return this.transferRepo.findAll(query);
  }

  findOne(id: number) {
    return this.findOrFail(id);
  }

  create(dto: CreateTransferDto, createdById: number) {
    return this.transferRepo.create(dto, createdById);
  }

  async updateStatus(id: number, dto: UpdateTransferStatusDto) {
    const transfer = await this.findOrFail(id);

    const transitions: Record<string, string[]> = {
      PENDING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['RECEIVED', 'CANCELLED'],
      RECEIVED: [],
      CANCELLED: [],
    };

    const allowed = transitions[transfer.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
          `Cannot transition from "${transfer.status}" to "${dto.status}"`,
      );
    }

    if (dto.status === 'SHIPPED') {
      return this.transferRepo.shipTransfer(transfer, dto.userId);
    }

    if (dto.status === 'RECEIVED') {
      if (transfer.status !== 'SHIPPED') {
        throw new BadRequestException(
            'Transfer must be shipped before it can be received.',
        );
      }
      return this.transferRepo.receiveTransfer(transfer, dto.userId);
    }

    return this.transferRepo.cancelTransfer(id);
  }
}