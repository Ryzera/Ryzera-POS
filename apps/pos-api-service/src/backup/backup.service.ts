import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBackupDto } from './schema/backup.schema';

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create backup. Auto-creates default company. Generates JSON filename with timestamp. */
  async createBackup(data: CreateBackupDto) {
    // Get or create default company (ensures backup has company context)
    let companyId = data.companyId;
    
    if (!companyId) {
      const defaultCompany = await this.prisma.syncCompany.findFirst({
        where: { code: 'DEFAULT' }
      });
      
      if (defaultCompany) {
        companyId = defaultCompany.id;
      } else {
        const newCompany = await this.prisma.syncCompany.create({
          data: {
            name: 'Default Company',
            code: 'DEFAULT',
            isActive: true,
          }
        });
        companyId = newCompany.id;
      }
    }

    const fileName = `backup_${companyId}_${Date.now()}.json`;
    
    // Fetch all data to be backed up in parallel
    const [settings, pendingLogs, syncedLogs] = await Promise.all([
      this.prisma.syncSetting.findMany({ where: { companyId } }),
      this.prisma.syncLog.findMany({ where: { companyId, status: 'PENDING' } }),
      this.prisma.syncLog.findMany({ where: { companyId, status: 'SYNCED' } }),
    ]);

    return this.prisma.syncBackup.create({
      data: {
        companyId: companyId,
        branchId: data.branchId || null,
        status: 'SUCCESS',
        fileName,
        notes: data.notes || null,
      },
    });
  }

  /** Get backup history. Most recent first. */
  async getBackupHistory(companyId?: string, branchId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    
    return this.prisma.syncBackup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get system summary counts for dashboard display. */
  async getSummary(companyId?: string, branchId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    
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
  }
}