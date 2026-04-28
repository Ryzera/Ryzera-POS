import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';

import { TransferQueryDto } from './transfer-query.schema';
import { TransferRepository } from './transfer.repository';

interface CreateTransferItem {
  productId: string;
  quantity: number;
}

interface CreateTransferDto {
  sourceBranchId: string;
  destinationBranchId: string;
  notes?: string;
  items: CreateTransferItem[];
}

interface UpdateTransferStatusDto {
  status: 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  userId: string;
}

@Injectable()
export class TransferService {
  constructor(
      private readonly transferRepo: TransferRepository,
      private readonly prisma: PrismaService,
  ) {}

  private async findOrFail(id: string) {
    const transfer = await this.transferRepo.findById(id);
    if (!transfer) throw new NotFoundException(`Transfer "${id}" not found`);
    return transfer;
  }

  private async ensureBranchActive(branchId: string, role: 'source' | 'destination') {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true, status: true },
    });
    if (!branch) {
      throw new NotFoundException(`Branch "${branchId}" not found`);
    }
    if (branch.status !== 'ACTIVE') {
      throw new BadRequestException(
          `${role === 'source' ? 'Source' : 'Destination'} branch "${branch.name}" is ${branch.status.toLowerCase()} and cannot be used for transfers`,
      );
    }
  }

  findAll(query: TransferQueryDto) {
    return this.transferRepo.findAll(query);
  }

  findOne(id: string) {
    return this.findOrFail(id);
  }

  async create(dto: CreateTransferDto, createdById: string) {
    await this.ensureBranchActive(dto.sourceBranchId, 'source');
    await this.ensureBranchActive(dto.destinationBranchId, 'destination');
    return this.transferRepo.create(dto, createdById);
  }

  async updateStatus(id: string, dto: UpdateTransferStatusDto) {
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