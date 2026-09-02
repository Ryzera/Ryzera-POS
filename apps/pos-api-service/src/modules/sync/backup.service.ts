import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createHash } from 'crypto';

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  private readonly dynamicJobName = 'sync-backup-dynamic';

  constructor(
    private prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.ensureBackupDir();
  }

  async onModuleInit() {
    const schedule = await this.getSchedule();
    await this.applyDynamicSchedule(schedule);
  }

  private async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }
  }

  private async buildSnapshotPayload() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `snapshot_${timestamp}.json`;
    const [branches, categories, companies, products, devices, syncLogs, syncConflicts, bills, syncSettings, inventoryLogs] = await Promise.all([
      this.prisma.branch.findMany(),
      this.prisma.category.findMany().catch(() => []),
      this.prisma.company.findMany().catch(() => []),
      this.prisma.product.findMany(),
      this.prisma.syncDevice.findMany(),
      this.prisma.syncLog.findMany(),
      this.prisma.syncConflict.findMany(),
      this.prisma.bill.findMany({ include: { items: true } }).catch(() => []),
      (this.prisma as any).syncSetting.findMany(),
      this.prisma.inventoryLog.findMany().catch(() => []),
    ]);

    const baseSnapshot: any = {
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        type: 'Table-wise Enterprise Backup (JSON)',
      },
      data: {
        branches,
        categories,
        companies,
        products,
        devices,
        syncLogs,
        syncConflicts,
        bills,
        syncSettings,
        inventoryLogs,
      },
    };

    const checksum = createHash('sha256')
      .update(JSON.stringify(baseSnapshot, null, 2), 'utf8')
      .digest('hex');
    const snapshot = {
      ...baseSnapshot,
      metadata: {
        ...baseSnapshot.metadata,
        checksumAlgorithm: 'SHA-256',
        checksum,
      },
    };
    const serialized = JSON.stringify(snapshot, null, 2);

    return {
      filename,
      serialized,
      checksum,
      checksumAlgorithm: 'SHA-256',
      sizeBytes: Buffer.byteLength(serialized, 'utf8'),
    };
  }

  async createSnapshot() {
    this.logger.log('Initiating database snapshot (Table-wise export)...');
    try {
      const snapshot = await this.buildSnapshotPayload();
      const filepath = path.join(this.backupDir, snapshot.filename);
      await fs.writeFile(filepath, snapshot.serialized, 'utf8');
      this.logger.log(`Snapshot created at ${filepath}`);
      return {
        success: true,
        message: 'Snapshot captured successfully (Table-wise)',
        file: snapshot.filename,
        checksumAlgorithm: snapshot.checksumAlgorithm,
        checksum: snapshot.checksum,
      };
    } catch (error: any) {
      this.logger.error(`Backup failed: ${error.message}`);
      return { success: false, message: `Backup failed: ${error.message}` };
    }
  }

  async createSnapshotDownload() {
    this.logger.log('Generating in-memory database snapshot for direct download...');
    try {
      const snapshot = await this.buildSnapshotPayload();
      const filepath = path.join(this.backupDir, snapshot.filename);
      await fs.writeFile(filepath, snapshot.serialized, 'utf8');
      this.logger.log(`Snapshot archived at ${filepath} and prepared for direct download`);
      return {
        success: true,
        message: 'Snapshot captured, archived, and prepared for direct download',
        file: snapshot.filename,
        content: snapshot.serialized,
        sizeBytes: snapshot.sizeBytes,
        checksumAlgorithm: snapshot.checksumAlgorithm,
        checksum: snapshot.checksum,
        stored: true,
      };
    } catch (error: any) {
      this.logger.error(`Direct snapshot generation failed: ${error.message}`);
      return { success: false, message: `Backup failed: ${error.message}` };
    }
  }

  async getSchedule() {
    const setting = await (this.prisma as any).syncSetting.findFirst({
      where: { key: 'backup_schedule' },
    });
    if (setting && setting.value) {
      try {
        return JSON.parse(setting.value);
      } catch (e) {}
    }
    return {
      enabled: true,
      cronExpression: '0 0 * * *',
      timeString: 'Daily at 12:00 AM',
      lastRun: null,
    };
  }

  private async applyDynamicSchedule(scheduleData: any) {
    try {
      this.schedulerRegistry.deleteCronJob(this.dynamicJobName);
    } catch {
      // Job may not exist during initial startup.
    }

    if (!scheduleData?.enabled || !scheduleData?.cronExpression) return;

    const job = new CronJob(scheduleData.cronExpression, () => {
      void this.createSnapshot().catch((error) => {
        this.logger.error(`Dynamic backup failed: ${error.message}`);
      });
    });
    this.schedulerRegistry.addCronJob(this.dynamicJobName, job);
    job.start();
    this.logger.log(`Dynamic backup schedule activated: ${scheduleData.cronExpression}`);
  }

  async saveSchedule(scheduleData: any) {
    const existing = await (this.prisma as any).syncSetting.findFirst({
      where: { key: 'backup_schedule' },
    });
    if (existing) {
      await (this.prisma as any).syncSetting.update({
        where: { id: existing.id },
        data: { value: JSON.stringify(scheduleData) },
      });
    } else {
      await (this.prisma as any).syncSetting.create({
        data: {
          key: 'backup_schedule',
          value: JSON.stringify(scheduleData),
          scope: 'GLOBAL',
        },
      });
    }
    await this.applyDynamicSchedule(scheduleData);
    return { success: true, message: 'Backup schedule persisted and activated successfully', data: scheduleData };
  }

  private calculateChecksum(snapshot: any) {
    const copy = JSON.parse(JSON.stringify(snapshot));
    if (copy.metadata) {
      delete copy.metadata.checksum;
      delete copy.metadata.checksumAlgorithm;
    }
    return createHash('sha256').update(JSON.stringify(copy, null, 2), 'utf8').digest('hex');
  }

  private validateSnapshotFilename(filename: string) {
    const safeFilename = path.basename(filename);
    if (safeFilename !== filename || !safeFilename.endsWith('.json')) {
      throw new Error('Invalid snapshot filename');
    }
    return safeFilename;
  }

  async getSnapshotContent(filename: string) {
    const safeFilename = this.validateSnapshotFilename(filename);
    try {
      const content = await fs.readFile(path.join(this.backupDir, safeFilename), 'utf8');
      return JSON.parse(content);
    } catch {
      throw new Error(`Snapshot ${safeFilename} was not found`);
    }
  }

  async getSnapshotFile(filename: string) {
    const safeFilename = this.validateSnapshotFilename(filename);
    try {
      const filepath = path.join(this.backupDir, safeFilename);
      const stat = await fs.stat(filepath);
      if (!stat.isFile()) throw new Error('Snapshot is not a file');
      return { filename: safeFilename, filepath, sizeBytes: stat.size };
    } catch {
      throw new Error(`Snapshot ${safeFilename} was not found`);
    }
  }

  async listSnapshots() {
    await this.ensureBackupDir();
    try {
      const files = await fs.readdir(this.backupDir);
      const snapshots: any[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const stat = await fs.stat(path.join(this.backupDir, file));
          const content = await fs.readFile(path.join(this.backupDir, file), 'utf8');
          const parsed = JSON.parse(content);
          const calculatedChecksum = this.calculateChecksum(parsed);
          const storedChecksum = parsed.metadata?.checksum || null;
          snapshots.push({
            fileName: file,
            sizeBytes: stat.size,
            createdAt: stat.birthtime,
            created_at: stat.birthtime.toISOString(),
            status: 'AVAILABLE',
            checksumAlgorithm: storedChecksum ? (parsed.metadata?.checksumAlgorithm || 'SHA-256') : null,
            checksum: storedChecksum,
            checksumVerified: Boolean(storedChecksum && storedChecksum === calculatedChecksum),
          });
        }
      }
      return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e: any) {
      this.logger.error(`Failed to list snapshots: ${e.message}`);
      return [];
    }
  }

  async restoreSnapshot(filename: string) {
    const safeFilename = this.validateSnapshotFilename(filename);
    this.logger.log(`Initiating database restore from snapshot: ${safeFilename}...`);
    const filepath = path.join(this.backupDir, safeFilename);

    try {
      const fileContent = await fs.readFile(filepath, 'utf8');
      const backupData = JSON.parse(fileContent);

      if (!backupData.data) {
        throw new Error('Invalid backup file structure: missing data payload');
      }

      await this.prisma.$transaction(async (tx) => {
        if (Array.isArray(backupData.data.branches)) {
          for (const branch of backupData.data.branches) {
            await (tx as any).branch.upsert({
              where: { id: branch.id },
              update: {
                name: branch.name,
                code: branch.code,
                address: branch.address,
                phone: branch.phone,
                email: branch.email,
                city: branch.city,
                manager_name: branch.manager_name,
                is_active: branch.is_active,
              },
              create: {
                id: branch.id,
                company_id: branch.company_id || 1,
                name: branch.name,
                code: branch.code,
                address: branch.address,
                phone: branch.phone,
                email: branch.email,
                city: branch.city,
                manager_name: branch.manager_name,
                is_active: branch.is_active ?? true,
              },
            });
          }
        }

        if (Array.isArray(backupData.data.syncLogs)) {
          for (const log of backupData.data.syncLogs) {
            await (tx as any).syncLog.upsert({
              where: { id: log.id },
              update: {
                status: log.status,
                payload: log.payload,
                error: log.error,
                attempts: log.attempts,
              },
              create: {
                id: log.id,
                branch_id: log.branch_id,
                entity: log.entity,
                payload: log.payload,
                status: log.status,
                error: log.error,
                attempts: log.attempts,
                created_at: log.created_at ? new Date(log.created_at) : new Date(),
              },
            });
          }
        }

        if (Array.isArray(backupData.data.syncConflicts)) {
          for (const conflict of backupData.data.syncConflicts) {
            await (tx as any).syncConflict.upsert({
              where: { id: conflict.id },
              update: {
                status: conflict.status,
                resolution: conflict.resolution,
                resolvedBy: conflict.resolvedBy ?? null,
                resolvedAt: conflict.resolvedAt ? new Date(conflict.resolvedAt) : null,
              },
              create: {
                id: conflict.id,
                syncLog_id: conflict.syncLog_id || conflict.syncLogId,
                clientData: conflict.clientData,
                serverData: conflict.serverData,
                resolution: conflict.resolution,
                resolvedBy: conflict.resolvedBy ?? null,
                status: conflict.status || 'PENDING',
                resolvedAt: conflict.resolvedAt ? new Date(conflict.resolvedAt) : null,
              },
            });
          }
        }

        if (Array.isArray(backupData.data.devices)) {
          for (const device of backupData.data.devices) {
            await (tx as any).syncDevice.upsert({
              where: { id: device.id },
              update: {
                status: device.status,
                name: device.name,
                type: device.type,
              },
              create: {
                id: device.id,
                branch_id: device.branch_id || device.branchId || 1,
                name: device.name,
                type: device.type || 'POS',
                status: device.status || 'PENDING',
              },
            });
          }
        }

        if (Array.isArray(backupData.data.products)) {
          for (const prod of backupData.data.products) {
            await (tx as any).product.upsert({
              where: { id: prod.id },
              update: {
                name: prod.name,
                code: prod.code || prod.sku || `SKU-${prod.id}`,
                price: prod.selling_price ?? prod.price ?? 0,
                quantity: prod.quantity,
              },
              create: {
                id: prod.id,
                name: prod.name,
                code: prod.code || prod.sku || `SKU-${prod.id}`,
                sku: prod.sku || `SKU-${prod.id}`,
                price: prod.selling_price ?? prod.price ?? 0,
                quantity: prod.quantity || 0,
                company_id: prod.company_id || 1,
              },
            });
          }
        }

        if (Array.isArray(backupData.data.syncSettings)) {
          for (const setting of backupData.data.syncSettings) {
            await (tx as any).syncSetting.upsert({
              where: { id: setting.id },
              update: {
                value: setting.value,
              },
              create: {
                id: setting.id,
                key: setting.key,
                value: setting.value,
                branch_id: setting.branch_id ?? null,
                scope: setting.scope || 'GLOBAL',
              },
            });
          }
        }

        if (Array.isArray(backupData.data.bills)) {
          for (const bill of backupData.data.bills) {
            const existingBill = await tx.bill.findUnique({
              where: { id: bill.id },
            });
            if (!existingBill) {
              await tx.bill.create({
                data: {
                  id: bill.id,
                  bill_number: bill.bill_number,
                  branch_id: bill.branch_id || 1,
                  company_id: bill.company_id || 1,
                  cashier_id: bill.cashier_id || 1,
                  status: bill.status || 'COMPLETED',
                  payment_method: bill.payment_method || 'CASH',
                  subtotal: Number(bill.subtotal || 0),
                  discount: Number(bill.discount || 0),
                  tax: Number(bill.tax || 0),
                  total: Number(bill.total || 0),
                  notes: bill.notes || 'Restored from snapshot',
                  created_at: bill.created_at ? new Date(bill.created_at) : new Date(),
                },
              });

            }

            if (Array.isArray(bill.items)) {
              for (const item of bill.items) {
                await tx.billItem.upsert({
                  where: { id: item.id },
                  update: {
                    bill_id: bill.id,
                    product_id: item.product_id,
                    quantity: Number(item.quantity || 1),
                    unit_price: Number(item.unit_price || 0),
                    total: Number(item.total || 0),
                  },
                  create: {
                    id: item.id,
                    bill_id: bill.id,
                    product_id: item.product_id,
                    quantity: Number(item.quantity || 1),
                    unit_price: Number(item.unit_price || 0),
                    total: Number(item.total || 0),
                  },
                });
              }
            }
          }
        }
      }, { maxWait: 10000, timeout: 120000 });

      this.logger.log(`Snapshot ${safeFilename} restored successfully.`);
      return { success: true, message: `Snapshot ${safeFilename} restored successfully.` };
    } catch (error: any) {
      this.logger.error(`Snapshot restore failed: ${error.message}`);
      return { success: false, message: `Restore failed: ${error.message}` };
    }
  }

  async runDrDrill() {
    this.logger.log('Starting non-destructive disaster recovery snapshot integrity drill.');
    try {
      const snapshots = await this.listSnapshots();
      const latest = snapshots[0];
      if (!latest) {
        return { success: false, message: 'DR drill could not run because no snapshot is available.' };
      }

      const snapshot = await this.getSnapshotContent(latest.fileName);
      const requiredTables = ['branches', 'syncLogs', 'syncConflicts', 'devices', 'products', 'bills', 'syncSettings'];
      const missingTables = requiredTables.filter((table) => !Array.isArray(snapshot?.data?.[table]));
      if (missingTables.length > 0) {
        return {
          success: false,
          message: `DR drill failed: snapshot is missing ${missingTables.join(', ')}.`,
          file: latest.fileName,
        };
      }

      const calculatedChecksum = this.calculateChecksum(snapshot);
      const storedChecksum = snapshot?.metadata?.checksum;
      if (!storedChecksum || storedChecksum !== calculatedChecksum) {
        return {
          success: false,
          message: `DR drill failed: SHA-256 checksum is missing or does not match for ${latest.fileName}. Create a new snapshot before retrying.`,
          file: latest.fileName,
          checksumAlgorithm: 'SHA-256',
          checksumVerified: false,
        };
      }

      return {
        success: true,
        message: `Non-destructive DR snapshot integrity check passed for ${latest.fileName}. Restore was not executed against production.`,
        file: latest.fileName,
        sizeBytes: latest.sizeBytes,
        checksumAlgorithm: 'SHA-256',
        checksum: storedChecksum,
        checksumVerified: true,
        tableCounts: Object.fromEntries(requiredTables.map((table) => [table, snapshot.data[table].length])),
      };
    } catch (error: any) {
      this.logger.error(`DR drill failed: ${error.message}`);
      return { success: false, message: `DR drill failed: ${error.message}` };
    }
  }
}
