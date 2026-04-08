import { Injectable } from '@nestjs/common';
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
    return {
      pending,
      synced,
      failed,
      total: pending + synced + failed,
    };
  }
}