import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateBackupDto } from './schema/backup.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Creates system backup - saves settings to JSON file and metadata to database
   */
  async createBackup(data: CreateBackupDto) {
    const branchId = data.branchId ? Number(data.branchId) : 1;
    const timestamp = Date.now();
    const fileName = `backup_${branchId}_${timestamp}.json`;
    
    // Fetch full system database tables from Supabase Cloud DB
    const [settings, pendingLogs, syncedLogs, devices, conflicts, healthMetrics, auditLogs, branches] = await Promise.all([
      this.prisma.syncSetting.findMany().catch(() => []),
      this.prisma.syncLog.findMany({ where: { status: 'PENDING' } }).catch(() => []),
      this.prisma.syncLog.findMany({ where: { status: 'SYNCED' } }).catch(() => []),
      this.prisma.syncDevice.findMany().catch(() => []),
      this.prisma.syncConflict.findMany().catch(() => []),
      this.prisma.$queryRaw`SELECT * FROM sync_health_metric`.catch(() => []),
      this.prisma.$queryRaw`SELECT * FROM sync_audit_log`.catch(() => []),
      this.prisma.branch.findMany().catch(() => []),
    ]);

    // Prepare complete structured backup snapshot
    const backupData = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        branchId,
        totalTablesDumped: 8,
        source: 'Supabase Cloud Database (PostgreSQL)'
      },
      tables: {
        branches,
        devices,
        syncLogs: [...pendingLogs, ...syncedLogs],
        conflicts,
        healthMetrics,
        auditLogs,
        settings,
      }
    };

    // Ensure backup directory exists
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Write JSON file to disk
    const filePath = path.join(backupDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    // Save backup metadata to database
    const result = await this.prisma.syncBackup.create({
      data: {
        branch_id: branchId,
        status: 'COMPLETED',
        file_url: `/backups/${fileName}`,
      },
    });

    // Notify admin about successful backup
    try {
      await this.notificationService.create({
        title: 'Backup Created',
        message: `Backup ${fileName} completed successfully`,
        type: 'INFO',
      });
    } catch (notifError) {
      console.error('Backup notification failed:', notifError);
    }

    return result;
  }

  /** Returns backup history list - ordered newest first */
  async getBackupHistory(companyId?: string, branchId?: string) {
    try {
      const where: any = {};
      if (branchId) where.branch_id = Number(branchId);
      
      return await this.prisma.syncBackup.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });
    } catch (err) {
      throw err;
    }
  }

  /** Returns system summary for dashboard widgets */
  async getSummary(companyId?: string, branchId?: string) {
    try {
      const where: any = {};
      if (branchId) where.branch_id = Number(branchId);
      
      const [settingsCount, pendingCount, syncedCount, failedCount, backupsCount] = await Promise.all([
        this.prisma.syncSetting.count({ where }),
        this.prisma.syncLog.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.syncLog.count({ where: { ...where, status: 'SYNCED' } }),
        this.prisma.syncLog.count({ where: { ...where, status: 'FAILED' } }),
        this.prisma.syncBackup.count({ where }),
      ]);

      return {
        companyId: companyId || null,
        branchId: branchId || null,
        settingsCount,
        pendingSyncCount: pendingCount,
        syncedSyncCount: syncedCount,
        failedSyncCount: failedCount,
        totalSyncCount: pendingCount + syncedCount + failedCount,
        backupsCount,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Reads backup JSON file from disk for preview
   */
  async getBackupContent(fileName: string) {
    const backupDir = path.join(process.cwd(), 'backups');
    const safeFileName = path.basename(fileName);
    if (safeFileName !== fileName || !safeFileName.endsWith('.json')) {
      throw new NotFoundException('Invalid backup filename');
    }
    const filePath = path.join(backupDir, safeFileName);
    
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      } catch (err) {
        console.error('Error reading backup file from disk:', err);
      }
    }

    throw new NotFoundException(`Backup snapshot ${safeFileName} was not found`);
  }

  /**
   * Automated Nightly Backup - Runs every day at 2:00 AM
   */
  @Cron('0 2 * * *')
  async automatedNightlyBackup() {
    console.log('[CRON] Starting automated nightly backup...');
    try {
      const result = await this.createBackup({ 
        notes: 'Automated nightly backup (System Cron)',
      });
      
      await this.cleanupOldBackups(30);
      return result;
    } catch (err) {
      console.error('[CRON] Automated backup failed:', (err as any).message);
    }
  }

  /**
   * Incremental Backup - Runs every 6 hours
   */
  @Cron('0 */6 * * *')
  async incrementalBackup() {
    console.log('[CRON] Starting incremental 6-hour backup...');
    try {
      return this.createBackup({ 
        notes: 'Incremental system snapshot (6-hour cycle)',
      });
    } catch (err) {
      console.error('[CRON] Incremental backup failed:', (err as any).message);
    }
  }

  /** Deletes backups older than X days to save disk space */
  private async cleanupOldBackups(days: number) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    
    const oldBackups = await this.prisma.syncBackup.findMany({
      where: { created_at: { lt: threshold } }
    });
    
    for (const b of oldBackups) {
      const filePath = path.join(process.cwd(), 'backups', path.basename(b.file_url || ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await this.prisma.syncBackup.delete({ where: { id: b.id } });
    }
  }

  /**
   * Restores system settings from a backup snapshot
   */
  async restoreFromBackup(fileName: string) {
    const backup = await this.getBackupContent(fileName);
    
    // Step 1: Create rollback (current state)
    await this.createBackup({ notes: `Pre-restore rollback for ${fileName}` });
    
    // Step 2: Restore settings
    const settings = backup.settings || [];
    for (const s of settings) {
      await this.prisma.syncSetting.upsert({
        where: { id: s.id },
        update: { value: s.value, updated_at: new Date() },
        create: {
          key: s.key,
          value: s.value,
          branch_id: s.branch_id ?? null,
          scope: s.scope || 'GLOBAL',
        }
      });
    }

    await this.notificationService.create({
      title: 'System Restored',
      message: `System state restored from ${fileName}. Rollback snapshot created.`,
      type: 'WARNING',
    });

    return { message: 'Restore successful', restoredItems: settings.length };
  }
}