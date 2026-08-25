import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ISyncRepository } from './sync.repository.interface';

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

/**
 * Stores and retrieves sync records using Prisma ORM.
 * All database queries are centralised here so that the service layer
 * never needs to know which database or ORM we use.
 *
 * NOTE: the SyncLog model does not have a `companyId` field. Its branch
 * reference field is named `branch_id` (snake_case) in the Prisma client,
 * and `id` is a `number`, not a `string`.
 */
@Injectable()
export class SyncRepository implements ISyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.syncLog.create({
      data: {
        branch_id: data.branchId ?? data.branch_id ?? null,
        entity: data.entity,
        payload: data.payload,
        status: data.status,
        error: data.error,
        attempts: data.attempts,
      },
    });
  }

  async countByStatus(status: SyncStatus) {
    return this.prisma.syncLog.count({ where: { status } });
  }

  async findById(id: number) {
    return this.prisma.syncLog.findUnique({ where: { id } });
  }

  async updateStatus(id: number, status: SyncStatus, error?: string | null, syncedAt?: Date, incrementAttempts = false) {
    const updateData: any = { status };
    if (error !== undefined) updateData.error = error;
    if (syncedAt !== undefined) updateData.syncedAt = syncedAt;
    if (incrementAttempts) {
      updateData.attempts = { increment: 1 };
    }
    return this.prisma.syncLog.update({ where: { id }, data: updateData });
  }
}
