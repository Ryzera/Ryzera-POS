import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PushSyncDto } from './dto/push-sync.dto';
import { SyncRepository } from './sync.repository';

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syncRepository: SyncRepository,
  ) {}

  getTest() {
    return this.syncRepository.getTestMessage();
  }

  async push(data: PushSyncDto) {
    return this.prisma.syncLog.create({
      data: {
        companyId: data.companyId ?? null,
        branchId: data.branchId ?? null,
        entity: data.entity,
        payload: data.payload,
        status: 'PENDING',
        error: null,
        attempts: 0,
      },
    });
  }

  async getStatus() {
    const pending = await this.prisma.syncLog.count({ where: { status: 'PENDING' } });
    const synced = await this.prisma.syncLog.count({ where: { status: 'SYNCED' } });
    const failed = await this.prisma.syncLog.count({ where: { status: 'FAILED' } });
    return { pending, synced, failed, total: pending + synced + failed };
  }

  async fail(id: string, errorMessage: string) {
    const record = await this.prisma.syncLog.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`SyncLog with id ${id} not found`);
    return this.prisma.syncLog.update({
      where: { id },
      data: {
        status: 'FAILED',
        error: errorMessage,
        attempts: { increment: 1 },
      },
    });
  }

  async retry(id: string) {
    const record = await this.prisma.syncLog.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`SyncLog with id ${id} not found`);
    if (record.status !== 'FAILED')
      throw new NotFoundException(`Only FAILED records can be retried`);
    return this.prisma.syncLog.update({
      where: { id },
      data: {
        status: 'PENDING',
        error: null,
        attempts: { increment: 1 },
      },
    });
  }

  async success(id: string) {
    const record = await this.prisma.syncLog.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`SyncLog with id ${id} not found`);
    return this.prisma.syncLog.update({
      where: { id },
      data: {
        status: 'SYNCED',
        syncedAt: new Date(),
        error: null,
      },
    });
  }
}