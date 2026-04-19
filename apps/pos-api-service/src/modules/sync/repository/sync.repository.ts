import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SyncStatus } from '@prisma/client';
import { ISyncRepository } from './sync.repository.interface';

/**
 * Stores and retrieves sync records using Prisma ORM.
 * All database queries are centralised here so that the service layer
 * never needs to know which database or ORM we use.
 */
@Injectable()
export class SyncRepository implements ISyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.syncLog.create({
      data: {
        companyId: data.companyId ?? null,
        branchId: data.branchId ?? null,
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

  async findById(id: string) {
    return this.prisma.syncLog.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: SyncStatus, error?: string | null, syncedAt?: Date, incrementAttempts = false) {
    const updateData: any = { status };
    if (error !== undefined) updateData.error = error;
    if (syncedAt !== undefined) updateData.syncedAt = syncedAt;
    if (incrementAttempts) {
      updateData.attempts = { increment: 1 };
    }
    return this.prisma.syncLog.update({ where: { id }, data: updateData });
  }
}