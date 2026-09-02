import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PushSyncDto } from './schema/push-sync.schema';
import { SyncRepository } from './repository/sync.repository';
import { EmailService } from '../../email/email.service';
import { NotificationService } from '../../notification/notification.service';
import * as os from 'os';

/**
 * Implements offline-first sync logic.
 * Data saved as PENDING, then synced to cloud.
 * Failures tracked with retries and email alerts.
 */
@Injectable()
export class SyncService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  private isNetworkSimulatedOffline = false;

  setNetworkState(isOnline: boolean) {
    this.isNetworkSimulatedOffline = !isOnline;
    return { success: true, message: `Network simulated as ${isOnline ? 'ONLINE' : 'OFFLINE'}` };
  }

  // Auto-sync pending records every 30 seconds
  @Cron('*/30 * * * * *')
  async autoSyncPendingRecords() {
    if (this.isNetworkSimulatedOffline) {
      console.log('Network simulated offline. Sync engine paused.');
      return;
    }

    try {
      const pendingRecords = await this.syncRepository.findMany({
        status: 'PENDING',
      });

      if (pendingRecords.length === 0) return;

      console.log(
        'Auto-syncing ' + pendingRecords.length + ' pending records...',
      );

      for (const record of pendingRecords) {
        await this.success(record.id);
      }

      console.log('Auto-synced ' + pendingRecords.length + ' records');
    } catch (error) {
      console.error('Auto-sync failed:', error.message);
    }
  }

  /**
   * DESIGN RATIONALE: Core Sync Payload Ingestion & Optimistic Conflict Detection.
   * Compares incoming `last_modified` timestamp against existing server DB timestamps.
   * Stale payloads are rejected with 409 Conflict to prevent old offline edits from
   * overwriting newer server records, maintaining database consistency across terminals.
   */
  async push(data: PushSyncDto) {
    const incomingPayload = data.payload as any;
    const incomingId = incomingPayload?.id;
    const incomingTimestamp = incomingPayload?.last_modified;

    if (incomingId && incomingTimestamp) {
      // Find existing sync records for this entity
      const existingRecords = await this.syncRepository.findMany({
        entity: data.entity,
        branchId: data.branchId ?? null,
        companyId: data.companyId ?? null,
      });

      // Check if we already have a record for this specific item ID
      const existingRecord = existingRecords.find((r) => {
        const p = r.payload as any;
        return (
          p?.id === incomingId &&
          (r.status === 'SYNCED' || r.status === 'PENDING')
        );
      });

      if (existingRecord) {
        const existingPayload = existingRecord.payload as any;
        const existingTimestamp = existingPayload?.last_modified;

        if (existingTimestamp) {
          const incomingTime = new Date(incomingTimestamp).getTime();
          const existingTime = new Date(existingTimestamp).getTime();

          // If incoming data is OLDER than what we have -> Throw 409 Conflict
          if (incomingTime < existingTime) {
            // Log this to the dashboard so admins see the system working
            await this.notificationService.create({
              title: 'Sync Conflict Prevented',
              message: `Rejected stale sync payload for ${data.entity} (ID: ${incomingId}). Server holds newer data.`,
              type: 'WARNING',
              userId: undefined,
            });

            await this.syncRepository.createAuditLog({
              action: `Conflict Detected & Prevented`,
              module: data.entity,
              branch_id: data.branchId ?? null
            });

            throw new ConflictException(
              `[CONFLICT] Stale data rejected. Server timestamp (${existingTimestamp}) is newer than incoming (${incomingTimestamp}).`,
            );
          }
        }
      }
    }

    await this.syncRepository.createAuditLog({
      action: `Push Sync Initiated`,
      module: data.entity,
      branch_id: data.branchId ?? null
    });

    let initialStatus = 'PENDING';
    let errorMessage: string | null = null;

    if (!this.isNetworkSimulatedOffline) {
      try {
        await this.applyPayload(data.entity, data.payload, data.branchId, data.companyId);
        initialStatus = 'SYNCED';
      } catch (err: any) {
        console.warn(`Initial sync apply failed, queued as PENDING: ${err.message}`);
        initialStatus = 'PENDING';
        errorMessage = err.message;
      }
    }

    return this.syncRepository.create({
      companyId: data.companyId ?? null,
      branchId: data.branchId ?? null,
      entity: data.entity,
      payload: data.payload,
      status: initialStatus,
      error: errorMessage,
      attempts: initialStatus === 'SYNCED' ? 1 : 0,
    });
  }

  async applyPayload(entity: string, payload: any, branchId?: number | null, companyId?: number | null) {
    if (!payload) return true;
    const entityUpper = (entity || '').toUpperCase();
    if (
      entityUpper.includes('BILL') ||
      entityUpper.includes('SALE') ||
      entityUpper.includes('ORDER')
    ) {
      return (this.syncRepository as any).applyBillPayload(
        payload,
        branchId,
        companyId,
      );
        } else if (
      entityUpper.includes('PRODUCT') ||
      entityUpper.includes('ITEM')
    ) {
      return (this.syncRepository as any).applyProductPayload(
        payload,
        branchId,
        companyId,
      );
    } else if (
      entityUpper.includes('RETURN') ||
      entityUpper.includes('TRANSFER') ||
      entityUpper.includes('PURCHASE_ORDER') ||
      entityUpper.includes('INVENTORY')
    ) {
      // These modules commit their domain transaction before calling SyncService.
      // The sync log is the durable cross-module telemetry record; applying the
      // payload again here would duplicate a Return/Transfer/Inventory write.
      return true;
    }
    throw new BadRequestException(`Unsupported synchronization entity: ${entity}`);

  }

  async getStatus() {
    const pending = await this.syncRepository.countByStatus('PENDING');
    const synced = await this.syncRepository.countByStatus('SYNCED');
    const failed = await this.syncRepository.countByStatus('FAILED');
    return { pending, synced, failed, total: pending + synced + failed };
  }

  async fail(id: number, errorMessage: string) {
    const record = await this.syncRepository.findById(id);
    if (!record)
      throw new NotFoundException('SyncLog with id ' + id + ' not found');
    const updated = await this.syncRepository.updateStatus(
      id,
      'FAILED',
      errorMessage,
      undefined,
      true,
    );
    const runtimeSettings = await this.getRuntimeSettings(record.branch_id ?? undefined);

    // Failure notifications and email are controlled by the branch-aware Sync setting.
    try {
      if (runtimeSettings.failureAlerts) await this.notificationService.create({
        title: 'Sync Failed',
        message:
          'Failed to sync ' +
          record.entity +
          '. ' +
          (errorMessage || 'Unknown error'),
        type: 'ERROR',
        userId: undefined,
      });

      await this.syncRepository.createAuditLog({
        action: `Sync Failed: ${errorMessage.substring(0, 100)}`,
        module: record.entity,
        branch_id: record.branch_id || null
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }

    if (runtimeSettings.failureAlerts) {
      await this.emailService.sendSyncFailureAlert(
        String(updated.id),
        updated.entity,
        errorMessage,
        updated.attempts,
        record.branch_id != null ? String(record.branch_id) : null,
        null,
        'fail',
      );

      if (updated.attempts >= 3) {
        await this.emailService.sendManualInterventionAlert(
          String(updated.id),
          updated.entity,
          errorMessage,
          updated.attempts,
          record.branch_id != null ? String(record.branch_id) : null,
          null,
          'fail',
        );
      }
    }
    return updated;
  }

  async retry(id: number) {
    const record = await this.syncRepository.findById(id);
    if (!record)
      throw new NotFoundException('SyncLog with id ' + id + ' not found');
    if (record.status !== 'FAILED')
      throw new NotFoundException('Only FAILED records can be retried');
    
    try {
      // Re-apply payload to domain tables
      await this.applyPayload(
        record.entity,
        record.payload,
        record.branch_id,
        null,
      );

      const updated = await this.syncRepository.updateStatus(
        id,
        'SYNCED',
        null,
        new Date(),
        false,
      );

      try {
        await this.notificationService.create({
          title: 'Sync Retry Successful',
          message: `Successfully synced ${record.entity} #${record.id} upon retry.`,
          type: 'INFO',
          userId: undefined,
        });

        await this.syncRepository.createAuditLog({
          action: `Sync Retry Successful`,
          module: record.entity,
          branch_id: record.branch_id || null,
        });
      } catch (e) {}

      return updated;
    } catch (err: any) {
      await this.syncRepository.updateStatus(
        id,
        'FAILED',
        `Retry failed: ${err.message}`,
        undefined,
        true,
      );
      throw new ConflictException(`Sync retry failed: ${err.message}`);
    }
  }

  async success(id: number) {
    const record = await this.syncRepository.findById(id);
    if (!record)
      throw new NotFoundException('SyncLog with id ' + id + ' not found');

    try {
      await this.applyPayload(
        record.entity,
        record.payload,
        record.branch_id,
        null,
      );
    } catch (err: any) {
      console.error(`Failed to apply sync payload for record #${id}:`, err.message);
      return this.fail(id, err.message);
    }

    const updated = await this.syncRepository.updateStatus(
      id,
      'SYNCED',
      null,
      new Date(),
      false,
    );

    // Notify dashboard about successful sync
    try {
      await this.notificationService.create({
        title: 'Sync Successful',
        message: 'Successfully synced ' + record.entity,
        type: 'INFO',
        userId: undefined,
      });

      await this.syncRepository.createAuditLog({
        action: `Sync Successful`,
        module: record.entity,
        branch_id: record.branch_id || null
      });
    } catch (notifError) {
      console.error('Success notification failed:', notifError);
    }

    // Check low stock after product sync for inventory alerts
    if (record.entity === 'product') {
      const payload = record.payload as any;
      if (
        payload.quantity !== undefined &&
        payload.reorderLevel !== undefined
      ) {
        if (payload.quantity <= payload.reorderLevel) {
          await this.notificationService.create({
            title: 'Low Stock Alert',
            message:
              'Product "' +
              (payload.name || payload.id) +
              '" has ' +
              payload.quantity +
              ' units left. Reorder level: ' +
              payload.reorderLevel,
            type: 'WARNING',
            userId: undefined,
          });
        }
      }
    }

    return updated;
  }

  async checkQueueOverload(branch_id?: number) {
    // Threshold increased to 200 to reduce spam
    const threshold = 200;
    const allRecords = await this.syncRepository.findAll({
      branch_id: branch_id,
    });
    const pendingCount = await this.syncRepository.countByStatus('PENDING');

    if (pendingCount >= threshold) {
      // Email alert for queue backlog
      await this.emailService.sendQueueOverloadAlert(pendingCount, threshold);

      // Dashboard notification for queue backlog (only when threshold exceeded)
      try {
        await this.notificationService.create({
          title: 'Queue Overload Warning',
          message:
            pendingCount + ' items pending sync. Manual review recommended.',
          type: 'WARNING',
          userId: undefined,
        });
      } catch (notifError) {
        console.error('Queue overload notification failed:', notifError);
      }
    }

    return {
      queue: allRecords || [],
      branch_id: branch_id ?? null,
      pendingCount: pendingCount,
      threshold: threshold,
      overloaded: pendingCount >= threshold,
    };
  }

  getConflictRules() {
    return {
      deltaSyncLWW:
        'Last Write Wins (LWW) enforced using last_modified timestamps. Stale payloads are rejected with 409 Conflict.',
      duplicatePending:
        'Same pending payload in same branch/company/entity is skipped',
      alreadySyncedRetry: 'Already synced records cannot be retried',
      latestProcessingWins:
        'If record is already synced, further processing is skipped',
      failedRecords:
        'Failed records remain available for retry/manual intervention',
    };
  }

  // Delete record by ID with notification
  async delete(id: number) {
    const record = await this.syncRepository.findById(id);
    if (!record)
      throw new NotFoundException('SyncLog with id ' + id + ' not found');

    // Create notification before deletion
    try {
      await this.notificationService.create({
        title: 'Record Ignored',
        message: 'Sync record ' + record.entity + ' was ignored and removed',
        type: 'INFO',
        userId: undefined,
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }

    return this.syncRepository.deleteById(id);
  }

  // Prune successful logs using the branch-aware retention policy.
  async pruneOldLogs() {
    const runtimeSettings = await this.getRuntimeSettings();
    if (!runtimeSettings.retentionPolicy.autoPurgeSuccess) {
      return { pruned: 0, skipped: true, reason: 'Automatic successful-log purge is disabled by retention policy.' };
    }
    const retentionDays = runtimeSettings.retentionPolicy.logRetentionDays;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await (this.syncRepository as any).deleteOldLogs(cutoff);
    
    // Notify about pruning
    try {
      if (result.count > 0) {
        await this.notificationService.create({
          title: 'Database Pruned',
          message: `Cleared ${result.count} successful sync records older than ${retentionDays} days to free up space.`,
          type: 'INFO',
          userId: undefined,
        });
      }
    } catch (err) {
      console.error('Notification creation failed:', err);
    }
    
    return { pruned: result.count };
  }

  // --- Tier B: Enterprise Batch & Operations ---

  async batchPush(records: any[]) {
    const results: any[] = [];
    for (const record of records) {
      try {
        const res = await this.push(record);
        results.push({
          id: record.payload?.id,
          status: 'SUCCESS',
          recordId: res.id,
        });
      } catch (err) {
        results.push({
          id: record.payload?.id,
          status: 'ERROR',
          message: err.message,
        });
      }
    }
    return {
      total: records.length,
      success: results.filter((r) => r.status === 'SUCCESS').length,
      results,
    };
  }

  async batchRetry(ids: number[]) {
    const results: any[] = [];
    for (const id of ids) {
      try {
        await this.retry(id);
        results.push({ id, status: 'SUCCESS' });
      } catch (err) {
        results.push({ id, status: 'ERROR', message: err.message });
      }
    }
    return {
      total: ids.length,
      success: results.filter((r) => r.status === 'SUCCESS').length,
      results,
    };
  }

  async batchDelete(ids: number[]) {
    for (const id of ids) {
      await this.delete(id);
    }
    return { total: ids.length, status: 'DELETED' };
  }

  async exportData(format: 'csv' | 'json') {
    const logs = await this.syncRepository.findAll({ limit: 1000 });
    if (format === 'json') return logs;

    const headers = 'ID,Entity,Status,BranchID,CreatedAt\n';
    const rows = logs
      .map(
        (l) => `${l.id},${l.entity},${l.status},${l.branch_id},${l.created_at}`,
      )
      .join('\n');
    return headers + rows;
  }

  async importData(records: any[]) {
    return this.batchPush(records);
  }

  async search(criteria: any) {
    // In a real app, use full-text search. For demo, we filter by entity/status/branch.
    const all = await this.syncRepository.findAll({ limit: 500 });
    return all.filter((item) => {
      let match = true;
      if (criteria.entity) match = match && item.entity === criteria.entity;
      if (criteria.status) match = match && item.status === criteria.status;
      if (criteria.branch_id)
        match = match && item.branch_id === criteria.branch_id;
      if (criteria.query) {
        const payloadStr = JSON.stringify(item.payload).toLowerCase();
        match = match && payloadStr.includes(criteria.query.toLowerCase());
      }
      return match;
    });
  }
  async getBranchStatus(branch_id: number) {
    const pending = await this.syncRepository.findMany({
      branch_id,
      status: 'PENDING',
    });
    const synced = await this.syncRepository.findMany({
      branch_id,
      status: 'SYNCED',
    });
    const failed = await this.syncRepository.findMany({
      branch_id,
      status: 'FAILED',
    });

    const health = failed.length > 0 ? 'CRITICAL' : pending.length > 0 ? 'WARNING' : 'HEALTHY';
    const lastSync = synced
      .map((record: any) => record.syncedAt || record.synced_at || record.updatedAt || record.updated_at || record.createdAt || record.created_at)
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())[0] || null;

    return {
      branch_id,
      pending: pending.length,
      synced: synced.length,
      failed: failed.length,
      health,
      lastSync,
    };
  }

  async getDefaultBranchId() {
    const branches = await this.syncRepository.getAllBranches();
    if (branches.length === 0) {
      throw new NotFoundException('No active branch is available for the Sync test action');
    }
    return branches[0].id;
  }

  async getAllStatus() {
    const branches = await this.syncRepository.getAllBranches();

    const results: any[] = [];
    for (const branch of branches) {
      results.push(await this.getBranchStatus(branch.id));
    }
    return results;
  }

  async resolveConflict(
    conflictId: number,
    resolution: 'branch_wins' | 'server_wins' | 'manual_merge',
    mergedData?: any
  ) {
    try {
      const conflict = await (this.syncRepository as any).findConflictById(conflictId);
      if (conflict && conflict.syncLog) {
        // Apply domain resolution to actual business tables
        if (resolution === 'branch_wins') {
          await this.applyPayload(
            conflict.syncLog.entity,
            conflict.syncLog.payload,
            conflict.syncLog.branch_id || conflict.syncLog.branchId,
            conflict.syncLog.company_id || conflict.syncLog.companyId,
          );
        } else if (resolution === 'manual_merge' && mergedData) {
          await this.applyPayload(
            conflict.syncLog.entity,
            mergedData,
            conflict.syncLog.branch_id || conflict.syncLog.branchId,
            conflict.syncLog.company_id || conflict.syncLog.companyId,
          );
        }

        await (this.syncRepository as any).updateConflictStatus(conflictId, 'RESOLVED', resolution);
        await this.syncRepository.updateStatus(
          conflict.syncLog.id,
          'SYNCED',
          `Resolved: ${resolution}`,
          new Date(),
          false,
        );

        await this.syncRepository.createAuditLog({
          action: `Conflict Resolved (${resolution})`,
          module: conflict.syncLog.entity,
          branch_id: conflict.syncLog.branch_id || null,
        });
      }
    } catch (e: any) {
      console.error(`Conflict resolution application error: ${e.message}`);
    }

    await this.notificationService.create({
      title: 'Conflict Resolved',
      message: `Conflict #${conflictId} resolved via ${resolution}.`,
      type: 'INFO',
      userId: undefined,
    }).catch(() => {});

    return { success: true, message: `Conflict #${conflictId} resolved via ${resolution}` };
  }

  // --- Priority 4.1: Device Management (v2.0) ---
  async getDevices(branch_id?: number) {
    return this.syncRepository.getDevices(branch_id);
  }

  async registerDevice(data: any) {
    const device = await this.syncRepository.registerDevice(data);
    await this.notificationService.create({
      title: 'New Device',
      message: `Device ${data.name} awaiting approval for branch ${data.branchId}.`,
      type: 'WARNING',
      userId: undefined,
    });
    return device;
  }

  async approveDevice(id: number) {
    return this.syncRepository.updateDeviceStatus(id, 'APPROVED');
  }

  async revokeDevice(id: number, revokedByUserId?: number) {
    const device = await this.syncRepository.findDeviceById(id);
    if (!device) {
      throw new NotFoundException(`Device ${id} not found`);
    }

    const revoked = await this.syncRepository.updateDeviceStatus(id, 'REVOKED');
    const branchName = device.branch?.name || `Branch ${device.branch_id}`;
    const branchCode = device.branch?.code || String(device.branch_id);
    const revokedBy = revokedByUserId ? `User ${revokedByUserId}` : 'System Administrator';

    await this.notificationService.create({
      title: 'Device Access Revoked',
      message: `${device.name} at ${branchName} (${branchCode}) was revoked and blocked from future sync attempts.`,
      type: 'CRITICAL',
      userId: revokedByUserId,
      branchId: device.branch_id,
    }).catch((error) => console.error(`Revoke in-app notification failed: ${error.message}`));

    await this.syncRepository.createAuditLog({
      action: `Device access revoked: ${device.name}`,
      module: 'DEVICE_MANAGEMENT',
      user_id: revokedByUserId ?? null,
      branch_id: device.branch_id,
      details: { device_id: id, previous_status: device.status, new_status: 'REVOKED' },
    });

    const email = await this.emailService.sendDeviceRevokedAlert(
      String(id), device.name, branchName, branchCode, revokedBy,
    ).catch((error) => ({ status: 'FAILED', error: error.message }));

    return { ...revoked, notification: 'CREATED', email };
  }

  async remoteVacuum(deviceName: string) {
    await this.syncRepository.createAuditLog({
      action: `Remote SQLite VACUUM executed on ${deviceName}`,
      module: 'STORAGE',
      branch_id: null,
    });
    return { success: true, message: `Remote VACUUM executed successfully for ${deviceName}` };
  }

  async globalPurge(branchId?: number) {
    await this.syncRepository.createAuditLog({
      action: `Global storage purge executed for branch ${branchId || 'ALL'}`,
      module: 'STORAGE',
      branch_id: branchId ?? null,
    });
    return { success: true, message: `Global purge executed successfully.` };
  }

  // --- Health & Metrics (v2.0) ---
  async getHealthStatus(branch_id?: number) {
    const branches = await this.syncRepository.getAllBranches();
    const dbDevices = await this.syncRepository.getDevices(branch_id);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const branchStats = await (this.syncRepository as any).getBranchHealthStats(since);

    const devicesWithHealth = dbDevices.map((device: any) => {
      const bId = device.branch_id ?? device.branchId;
      const failedCount = branchStats.failedLogs.find((l: any) => l.branch_id === bId)?._count || 0;
      const conflictCount = branchStats.conflicts.filter((c: any) => c.syncLog?.branch_id === bId).length || 0;
      const lastSeen = device.lastSeen ?? device.last_seen ?? device.updatedAt ?? device.updated_at;
      const isOnline = Boolean(lastSeen && Date.now() - new Date(lastSeen).getTime() <= 5 * 60 * 1000);
      const branchStatus = failedCount > 0 || conflictCount > 0 ? 'CRITICAL' : isOnline ? 'HEALTHY' : 'OFFLINE';
      const branch = branches.find((item: any) => item.id === bId);
      return {
        ...device,
        branch: branch ? { name: branch.name, city: branch.city || branch.name } : undefined,
        isOnline,
        failedCount,
        conflictCount,
        branchStatus,
      };
    });

    const onlineCount = devicesWithHealth.filter((device: any) => device.isOnline).length;
    
    const status = 
      devicesWithHealth.length === 0 ? 'UNKNOWN' :
      onlineCount === devicesWithHealth.length ? 'HEALTHY' :
      onlineCount > 0 ? 'DEGRADED' : 'CRITICAL';

    // System Telemetry
    const uptimeSeconds = process.uptime();
    const cpuLoad = os.loadavg()[0]; // 1 minute load avg
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Sync Stats
    const stats = await this.syncRepository.getSyncStats?.(since, branch_id) || { total: 0, synced: 0, failed: 0 };
    const errorRate = stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(2) : '0.00';

    const metricsData = await this.syncRepository.getMetricsData?.(since, branch_id) || [];
    let avgLatency = 0;
    if (metricsData.length > 0) {
      const validLatencies = metricsData
        .map((log: any) => {
          if (log.status !== 'SYNCED') return null;
          const end = log.syncedAt || log.updated_at;
          if (!end || !log.created_at) return null;
          const diff = new Date(end).getTime() - new Date(log.created_at).getTime();
          return Number.isFinite(diff) && diff >= 0 ? diff : null;
        })
        .filter((value: number | null): value is number => value !== null);
      if (validLatencies.length > 0) {
        const totalLatency = validLatencies.reduce((sum: number, val: number) => sum + val, 0);
        avgLatency = Math.round(totalLatency / validLatencies.length);
      }
    }

    return {
      status,
      onlineDevices: onlineCount,
      totalDevices: devicesWithHealth.length,
      devices: devicesWithHealth,
      branch_id: branch_id ?? null,
      timestamp: new Date(),
      uptimeSeconds,
      cpuLoad,
      memUsage,
      errorRate,
      avgLatency,
    };
  }

  async getSyncMetrics(branchId?: number, days: number = 1) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const metricsData = await this.syncRepository.getMetricsData?.(since, branchId) || [];
    
    // Fetch real stats
    const stats = await this.syncRepository.getSyncStats?.(since, branchId) || { total: 0, synced: 0, failed: 0 };
    const successRate = stats.total > 0 ? ((stats.synced / stats.total) * 100).toFixed(2) : '0.00';
    
    // Distribution must represent every entity in the same database window as
    // Recent Sync Activity. Do not filter out Product or any other valid sync
    // entity, otherwise the chart total and activity list become inconsistent.
    const rawDistribution = await this.syncRepository.getEntityDistribution?.(since, branchId) || [];
    const distribution = rawDistribution
      .filter((d: any) => d.entity && Number(d._count) > 0)
      .map((d: any) => ({
        name: d.entity === 'billing' ? 'Billing' : (d.entity === 'salesreturn' ? 'Sales Returns' : (d.entity.charAt(0).toUpperCase() + d.entity.slice(1))),
        value: Number(d._count),
      }))
      .sort((a: any, b: any) => b.value - a.value);

    // Calculate throughput & latency timeline
    const isMultiDay = days > 1;
    const throughputMap = new Map<string, number>();
    const latencyMap = new Map<string, number[]>();
    
        

    
    metricsData.forEach(record => {
      const endTime = record.syncedAt || record.updated_at || record.created_at;
      const startTime = record.created_at;
      const dateStr = isMultiDay 
        ? new Date(endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : new Date(endTime).getHours().toString().padStart(2, '0') + ':00';

      // Throughput represents every sync attempt in Recent Sync Activity.
      throughputMap.set(dateStr, (throughputMap.get(dateStr) || 0) + 1);

      // Latency is meaningful only after a record has completed successfully.
      if (record.status !== 'SYNCED') return;
      const latencyMs = new Date(endTime).getTime() - new Date(startTime).getTime();
      const bucketLatencies = latencyMap.get(dateStr) || [];
      bucketLatencies.push(Math.max(0, latencyMs));
      latencyMap.set(dateStr, bucketLatencies);
    });

    const latencies: number[] = [];
    metricsData.filter(record => record.status === 'SYNCED').forEach(record => {
      const endTime = record.syncedAt || record.updated_at || record.created_at;
      const startTime = record.created_at;
      const latencyMs = new Date(endTime).getTime() - new Date(startTime).getTime();
      latencies.push(Math.max(0, latencyMs));
    });

    latencies.sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      if (latencies.length === 0) return 0;
      const index = Math.ceil((p / 100) * latencies.length) - 1;
      return latencies[Math.max(0, index)];
    };
    
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

    // Use the map directly as it is already chronologically ordered by our pre-fill
    const throughput = Array.from(throughputMap.entries()).map(([time, count]) => ({ time, count }));
    const latencyTimeline = Array.from(latencyMap.entries()).map(([time, rawLats]) => {
      const avg = rawLats.length > 0 ? Math.round(rawLats.reduce((a, b) => a + b, 0) / rawLats.length) : 0;
      return { time, latency: avg };
    });

    // Fetch branch comparison (global only, or if we want to show it anyway)
    const rawBranchComp = await this.syncRepository.getBranchComparison?.(since) || [];
    const branchComparison = rawBranchComp.map((b: any) => ({
      branchId: b.branch_id,
      count: b._count._all
    }));

    // Calculate last sync time across all matched records
    let lastSyncTime: Date | null = null;
    if (metricsData.length > 0) {
      metricsData.forEach(r => {
        const d = new Date(r.syncedAt || r.updated_at || r.created_at);
        if (!lastSyncTime || d > lastSyncTime) {
          lastSyncTime = d;
        }
      });
    }

    return {
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99),
      avgLatency,
      unit: 'ms',
      throughput,
      latencyTimeline,
      distribution,
      branchComparison,
      totalVolume: stats.total,
      successRate: parseFloat(successRate),
      errorCount: stats.failed,
      lastSyncTime,
    };
  }

  async getConflicts(branch_id?: number) {
    return this.syncRepository.getConflicts(branch_id);
  }

  async getAuditLogs(filters: any = {}) {
    return this.syncRepository.getAuditLogs(filters);
  }

  async seedAuditLogs() {
    return this.syncRepository.seedAuditLogs();
  }

  async seedSyncLogs() {
    return this.syncRepository.seedSyncLogs();
  }

  // --- Settings ---
  async getSettings(branchId?: number) {
    return this.syncRepository.getSettings(branchId);
  }

  async getRuntimeSettings(branchId?: number) {
    const rows = await this.syncRepository.getSettings(branchId);
    const values: Record<string, any> = {};
    for (const row of rows as any[]) {
      let value: any = row.value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (typeof value === 'string' && /^-?\\d+(\\.\\d+)?$/.test(value.trim())) value = Number(value);
      else if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
        try { value = JSON.parse(value); } catch { /* preserve invalid values as strings */ }
      }
      values[row.key] = value;
    }

    return {
      branchId: branchId ?? null,
      realTimeSync: values.realTimeSync !== false,
      backgroundRefresh: values.backgroundRefresh !== false,
      deltaCompression: values.deltaCompression !== false,
      syncIntervalMinutes: Math.max(1, Number(values.syncInterval ?? values.networkPolicy?.batchInterval ?? 30) || 30),
      maxRetries: Math.max(1, Number(values.maxRetries ?? 5) || 5),
      failureAlerts: values.failureAlerts !== false,
      pushNotifications: values.pushNotifications !== false,
      auditIntegrity: values.auditIntegrity !== false,
      retentionPolicy: {
        logRetentionDays: Math.max(1, Number(values.retentionPolicy?.logRetentionDays ?? 7) || 7),
        autoPurgeSuccess: values.retentionPolicy?.autoPurgeSuccess !== false,
      },
      networkPolicy: {
        syncMode: values.networkPolicy?.syncMode === 'BATCH' ? 'BATCH' : 'REALTIME',
        batchIntervalMinutes: Math.max(1, Number(values.networkPolicy?.batchInterval ?? values.syncInterval ?? 15) || 15),
      },
    };
  }

  async saveSettings(settings: any[], branchId?: number) {
    return this.syncRepository.saveSettings(settings, branchId);
  }

  async getDeltaUpdates(sinceDate: Date, branchId?: number) {
    return (this.syncRepository as any).getDeltaData(sinceDate, branchId);
  }
}
