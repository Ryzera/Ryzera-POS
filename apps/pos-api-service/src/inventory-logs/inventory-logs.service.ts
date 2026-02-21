import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const VALID_ACTIONS = ['CREATE', 'UPDATE', 'SALE', 'RESTOCK', 'DELETE'];

@Injectable()
export class InventoryLogsService {
  constructor(private prisma: PrismaService) {}

  private validateLog(data: any) {
    if (!data.action || !VALID_ACTIONS.includes(data.action)) {
      throw new BadRequestException(
        `action must be one of: ${VALID_ACTIONS.join(', ')}`,
      );
    }
    if (data.changeQty === undefined || typeof data.changeQty !== 'number') {
      throw new BadRequestException(
        'changeQty is required and must be a number',
      );
    }
    if (!data.userId || typeof data.userId !== 'string') {
      throw new BadRequestException('userId is required');
    }
    if (!data.productId || typeof data.productId !== 'string') {
      throw new BadRequestException('productId is required');
    }
  }

  async createLog(data: any) {
    this.validateLog(data);
    return this.prisma.inventoryLog.create({
      data,
      include: { user: true, product: true },
    });
  }

  async getAllLogs() {
    return this.prisma.inventoryLog.findMany({
      include: { user: true, product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLogById(id: string) {
    return this.prisma.inventoryLog.findUnique({
      where: { id },
      include: { user: true, product: true },
    });
  }

  async getLogsByProduct(productId: string) {
    return this.prisma.inventoryLog.findMany({
      where: { productId },
      include: { user: true, product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLogsByUser(userId: string) {
    return this.prisma.inventoryLog.findMany({
      where: { userId },
      include: { user: true, product: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
