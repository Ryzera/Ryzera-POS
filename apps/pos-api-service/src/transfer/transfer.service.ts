import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { InventoryService } from '../inventory/inventory.service';
import { CreateTransferDto, UpdateTransferStatusDto } from '@ryzera/pos-schema';

@Injectable()
export class TransferService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService,
  ) {}

  findAll(branchId?: string) {
    return this.prisma.transfer.findMany({
      where: branchId
        ? {
            OR: [
              { sourceBranchId: branchId },
              { destinationBranchId: branchId },
            ],
          }
        : undefined,
      include: {
        sourceBranch: true,
        destinationBranch: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const t = await this.prisma.transfer.findUnique({
      where: { id },
      include: {
        sourceBranch: true,
        destinationBranch: true,
        items: { include: { product: true } },
      },
    });
    if (!t) throw new NotFoundException('Transfer not found');
    return t;
  }

  async create(dto: CreateTransferDto, userId: string) {
    if (dto.sourceBranchId === dto.destinationBranchId) {
      throw new BadRequestException(
        'Source and destination branches must differ',
      );
    }
    return this.prisma.transfer.create({
      data: {
        sourceBranchId: dto.sourceBranchId,
        destinationBranchId: dto.destinationBranchId,
        notes: dto.notes,
        createdById: userId,
        items: { create: dto.items },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, dto: UpdateTransferStatusDto, userId: string) {
    const transfer = await this.findOne(id);

    if (dto.status === 'RECEIVED') {
      for (const item of transfer.items) {
        // Deduct from source
        await this.inventory.adjustStock(
          {
            branchId: transfer.sourceBranchId,
            productId: item.productId,
            changeQty: -item.quantity,
            action: 'TRANSFER',
          },
          userId,
        );
        // Add to destination
        await this.inventory.adjustStock(
          {
            branchId: transfer.destinationBranchId,
            productId: item.productId,
            changeQty: item.quantity,
            action: 'TRANSFER',
          },
          userId,
        );
      }
    }

    return this.prisma.transfer.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }
}
