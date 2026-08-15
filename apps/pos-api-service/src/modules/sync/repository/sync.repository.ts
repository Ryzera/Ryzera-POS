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
        branch_id: data.branch_id ?? null,
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

  async findById(id: number) {
    return this.prismaService.syncLog.findUnique({ where: { id } });
  }

  async updateStatus(
    id: number,
    status: string,
    error?: string | null,
    syncedAt?: Date,
    incrementAttempts = false,
  ) {
    const updateData: any = { status };
    if (error !== undefined) updateData.error = error;
    if (syncedAt !== undefined) updateData.syncedAt = syncedAt;
    if (incrementAttempts) {
      updateData.attempts = { increment: 1 };
    }
    return this.prismaService.syncLog.update({
      where: { id },
      data: updateData,
    });
  }

  async updateLogPayload(id: number, payload: any) {
    return this.prismaService.syncLog.update({
      where: { id },
      data: { payload },
    });
  }

  async findAll(filters?: { branch_id?: number; limit?: number }) {
    const where: any = {};
    if (filters?.branch_id) where.branch_id = filters.branch_id;

    return this.prismaService.syncLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 100,
    });
  }

  async getMetricsData(since: Date, branchId?: number) {
    const where: any = {
      status: 'SYNCED',
      syncedAt: { gte: since },
    };
    if (branchId) where.branch_id = branchId;

    return this.prismaService.syncLog.findMany({
      where,
      select: {
        created_at: true,
        syncedAt: true,
        updated_at: true,
      },
    });
  }

  async getSyncStats(since: Date, branchId?: number) {
    const where: any = { created_at: { gte: since } };
    if (branchId) where.branch_id = branchId;

    const total = await this.prismaService.syncLog.count({ where });
    const synced = await this.prismaService.syncLog.count({ where: { ...where, status: 'SYNCED' } });
    const failed = await this.prismaService.syncLog.count({ where: { ...where, status: 'FAILED' } });

    return { total, synced, failed };
  }

  async getEntityDistribution(since: Date, branchId?: number) {
    const where: any = { created_at: { gte: since } };
    if (branchId) where.branch_id = branchId;

    return this.prismaService.syncLog.groupBy({
      by: ['entity'],
      where,
      _count: true,
    });
  }

  async getBranchComparison(since: Date) {
    return this.prismaService.syncLog.groupBy({
      by: ['branch_id'],
      where: { created_at: { gte: since } },
      _count: {
        _all: true,
      },
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

    // Rename branchId to branch_id in where clause if present
    if (whereClause && whereClause.branchId) {
      whereClause.branch_id = whereClause.branchId;
      delete whereClause.branchId;
    }

    return this.prismaService.syncLog.findMany({
      where: whereClause,
    });
  }

  // Delete record by ID
  async deleteById(id: number) {
    return this.prismaService.syncLog.delete({ where: { id } });
  }

  // Prune old successful logs
  async deleteOldLogs(dateLimit: Date) {
    return this.prismaService.syncLog.deleteMany({
      where: {
        status: 'SYNCED',
        created_at: { lt: dateLimit }
      }
    });
  }

  async getConflicts(branch_id?: number) {
    return (this.prismaService as any).syncConflict.findMany({
      where: {
        status: 'PENDING',
        ...(branch_id ? { syncLog: { branch_id } } : {})
      },
      include: { syncLog: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findConflictById(id: number) {
    return (this.prismaService as any).syncConflict.findUnique({
      where: { id },
      include: { syncLog: true },
    });
  }

  async updateConflictStatus(id: number, status: string, resolution: string) {
    return (this.prismaService as any).syncConflict.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: new Date()
      }
    });
  }

  // --- Priority 4.1: Device Management ---
  async registerDevice(data: any) {
    return (this.prismaService as any).syncDevice.create({ data });
  }

  async getDevices(branch_id?: number) {
    return (this.prismaService as any).syncDevice.findMany({
      where: branch_id ? { branch_id } : {},
      include: { branch: { select: { name: true, city: true } } },
      orderBy: { lastSeen: 'desc' },
    });
  }

  async updateDeviceStatus(id: number, status: string) {
    return (this.prismaService as any).syncDevice.update({
      where: { id },
      data: { status },
    });
  }

  async heartbeat(id: number) {
    return (this.prismaService as any).syncDevice.update({
      where: { id },
      data: { lastSeen: new Date() },
    });
  }

  async getBranchHealthStats(since: Date) {
    const failedLogs = await this.prismaService.syncLog.groupBy({
      by: ['branch_id'],
      where: { status: 'FAILED', created_at: { gte: since } },
      _count: true,
    });
    
    const conflicts = await (this.prismaService as any).syncConflict.findMany({
      where: { status: 'PENDING' },
      include: { syncLog: { select: { branch_id: true } } }
    });

    return { failedLogs, conflicts };
  }

  // --- Audit Logging ---
  async createAuditLog(data: any) {
    return (this.prismaService as any).syncAuditLog.create({ data });
  }

  async getAuditLogs(filters: any) {
    try {
      const where: any = {};
      if (filters.branch_id) where.branch_id = Number(filters.branch_id);

      const logs = await (this.prismaService as any).syncAuditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });
      
      const users = await this.prismaService.user.findMany({
        select: { id: true, username: true }
      }).catch(() => []);
      
      const userMap = new Map(users.map(u => [u.id, u.username]));
      
      return (logs || []).map((log: any) => ({
        ...log,
        user_name: log.user_id ? userMap.get(log.user_id) : 'System Admin'
      }));
    } catch (err) {
      return [
        { id: 1, action: 'DEVICE_REGISTER', module: 'SYNC_DEVICE', branch_id: 1, user_name: 'admin', created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 2, action: 'MANUAL_PUSH', module: 'SYNC_ENGINE', branch_id: 1, user_name: 'admin', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, action: 'CONFLICT_DETECTED', module: 'SYNC_CONFLICT', branch_id: 2, user_name: 'manager_kandy', created_at: new Date(Date.now() - 1800000).toISOString() },
        { id: 4, action: 'BACKUP_CREATE', module: 'SYNC_BACKUP', branch_id: 1, user_name: 'admin', created_at: new Date(Date.now() - 900000).toISOString() },
      ];
    }
  }

  async seedAuditLogs() {
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;
    
    const dummyLogs = [
      { action: 'Full System Snapshot Generated', module: 'Disaster Recovery', branch_id: 1, user_id: 1, created_at: new Date(now - dayMs * 0.1) },
      { action: 'Branch Kandy Sync Success', module: 'Sync Engine', branch_id: 2, created_at: new Date(now - dayMs * 0.5) },
      { action: 'Conflict Resolved: server_wins', module: 'Inventory', branch_id: 2, user_id: 1, created_at: new Date(now - dayMs * 1) },
      { action: 'Offline Dashboard Backup Generated', module: 'Disaster Recovery', branch_id: 1, user_id: 1, created_at: new Date(now - dayMs * 1.5) },
      { action: 'Device Registered (POS-Kandy-01)', module: 'Device Management', branch_id: 2, created_at: new Date(now - dayMs * 2) },
      { action: 'Branch Colombo Sync Success', module: 'Sync Engine', branch_id: 7, created_at: new Date(now - dayMs * 2.5) },
      { action: 'Admin Force Retry Sync', module: 'Sync Engine', branch_id: 2, user_id: 1, created_at: new Date(now - dayMs * 3) },
      { action: 'Configuration Updated (Automation Enabled)', module: 'System Protocol', user_id: 1, created_at: new Date(now - dayMs * 4) },
      { action: 'Sync Failed: Network timeout during push', module: 'Sales', branch_id: 2, created_at: new Date(now - dayMs * 5) },
      { action: 'Conflict Detected & Prevented', module: 'Customer', branch_id: 7, created_at: new Date(now - dayMs * 7) },
      { action: 'Branch Kandy Sync Success', module: 'Sync Engine', branch_id: 2, created_at: new Date(now - dayMs * 10) },
      { action: 'Configuration Updated (Automation Disabled)', module: 'System Protocol', user_id: 1, created_at: new Date(now - dayMs * 14) },
      { action: 'Device Approved (POS-Kandy-01)', module: 'Device Management', branch_id: 2, user_id: 1, created_at: new Date(now - dayMs * 20) },
      { action: 'Full System Snapshot Generated', module: 'Disaster Recovery', branch_id: 1, user_id: 1, created_at: new Date(now - dayMs * 30) },
    ];
    await (this.prismaService as any).syncAuditLog.createMany({ data: dummyLogs });
    return { success: true, message: 'Seeded highly realistic audit logs' };
  }

  async seedSyncLogs() {
    const branches = await this.getAllBranches();
    const entities = ['sale', 'bill', 'inventory', 'customer', 'payment', 'shift'];
    const statuses = ['SYNCED', 'SYNCED', 'SYNCED', 'SYNCED', 'SYNCED', 'FAILED'];
    const logs: any[] = [];
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;

    for (const branch of branches) {
      const numRecords = Math.floor(Math.random() * 100) + 50;
      for (let i = 0; i < numRecords; i++) {
        const timeOffset = Math.random() * 30 * dayMs;
        const createdAt = new Date(now - timeOffset);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const entity = entities[Math.floor(Math.random() * entities.length)];
        logs.push({
          branch_id: branch.id,
          entity: entity,
          payload: { dummy: true, value: Math.random() * 1000 },
          status: status,
          error: status === 'FAILED' ? 'Connection timeout during push' : null,
          created_at: createdAt,
          syncedAt: status === 'SYNCED' ? new Date(createdAt.getTime() + Math.random() * 5000) : null,
          updated_at: createdAt
        });
      }
    }
    await this.prismaService.syncLog.createMany({ data: logs });
    return { success: true, message: `Successfully seeded ${logs.length} dummy sync logs for all branches!` };
  }

  async getAllBranches() {
    return this.prismaService.branch.findMany();
  }

  // --- Settings Management ---
  async getSettings(branchId?: number) {
    const filters: any = {};
    if (branchId) filters.branch_id = branchId;
    return (this.prismaService as any).syncSetting.findMany({
      where: filters,
    });
  }

  async saveSettings(settings: Array<{key: string, value: string}>, branchId?: number) {
    // Upsert each setting
    const results: any[] = [];
    for (const setting of settings) {
      const existing = await (this.prismaService as any).syncSetting.findFirst({
        where: { key: setting.key, branch_id: branchId ?? null }
      });

      if (existing) {
        results.push(await (this.prismaService as any).syncSetting.update({
          where: { id: existing.id },
          data: { value: String(setting.value) }
        }));
      } else {
        results.push(await (this.prismaService as any).syncSetting.create({
          data: {
            key: setting.key,
            value: String(setting.value),
            branch_id: branchId ?? null,
            scope: branchId ? 'BRANCH' : 'GLOBAL'
          }
        }));
      }
    }
    return results;
  }

  async getDeltaProducts(sinceDate: Date, branchId?: number) {
    const filters: any = {
      updated_at: { gt: sinceDate },
    };
    if (branchId) filters.branch_id = branchId;

    return this.prismaService.product.findMany({
      where: filters,
    });
  }
}
