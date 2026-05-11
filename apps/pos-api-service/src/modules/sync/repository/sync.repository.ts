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
 */
@Injectable()
export class SyncRepository implements ISyncRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: any) {
    return this.prismaService.syncLog.create({
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

  async countByStatus(status: string) {
    return this.prismaService.syncLog.count({ where: { status } });
  }

  async findById(id: string) {
    return this.prismaService.syncLog.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string, error?: string | null, syncedAt?: Date, incrementAttempts = false) {
    const updateData: any = { status };
    if (error !== undefined) updateData.error = error;
    if (syncedAt !== undefined) updateData.syncedAt = syncedAt;
    if (incrementAttempts) {
      updateData.attempts = { increment: 1 };
    }
    return this.prismaService.syncLog.update({ where: { id }, data: updateData });
  }

  async findAll(filters?: { companyId?: string; branchId?: string; limit?: number }) {
    const where: any = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.branchId) where.branchId = filters.branchId;
    
    return this.prismaService.syncLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }

  //  findMany method - handles both object and string input
  async findMany(condition: any) {
    let whereClause = condition;
    
    // If condition is a simple string like 'PENDING'
    if (typeof condition === 'string') {
      whereClause = { status: condition };
    }
    // If condition has a 'where' property from old code
    else if (condition && condition.where) {
      whereClause = condition.where;
    }
    
    return this.prismaService.syncLog.findMany({
      where: whereClause
    });
  }

  // Delete record by ID
  async deleteById(id: string) {
    return this.prismaService.syncLog.delete({ where: { id } });
  }

  // --- Priority 2.2: Conflict Management ---
  async getConflicts() {
    return (this.prismaService as any).syncConflict.findMany({
      include: { syncLog: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // --- Priority 4.1: Device Management ---
  async registerDevice(data: any) {
    return (this.prismaService as any).syncDevice.create({ data });
  }

  async getDevices(branchId?: string) {
    return (this.prismaService as any).syncDevice.findMany({
      where: branchId ? { branchId } : {},
      orderBy: { lastSeen: 'desc' }
    });
  }

  async updateDeviceStatus(id: string, status: string) {
    return (this.prismaService as any).syncDevice.update({
      where: { id },
      data: { status }
    });
  }

  async heartbeat(id: string) {
    return (this.prismaService as any).syncDevice.update({
      where: { id },
      data: { lastSeen: new Date() }
    });
  }

  // --- Audit Logging ---
  async createAuditLog(data: any) {
    return (this.prismaService as any).syncAuditLog.create({ data });
  }

  async getAuditLogs(filters: any) {
    return (this.prismaService as any).syncAuditLog.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' }
    });
  }
}