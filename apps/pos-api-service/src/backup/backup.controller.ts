import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { BackupService } from './backup.service';
import { CreateBackupSchema, CreateBackupDto } from './schema/backup.schema';

/**
 * Backup Controller - Handles system backup operations
 * Provides disaster recovery capabilities for POS settings
 */
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /** Creates manual backup - saves settings snapshot to JSON file */
  @Post()
  @Post('create')
  @Post('snapshot')
  async createBackup(@Body() data: unknown) {
    return this.backupService.createBackup((data || {}) as any);
  }

  /** Returns list of all backups with metadata for history table */
  @Get('history')
  getBackupHistory(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getBackupHistory(companyId, branchId);
  }

  /** Returns system summary counts for dashboard stats */
  @Get('summary')
  getSummary(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getSummary(companyId, branchId);
  }

  /** Reads and returns full backup JSON file content for preview modal */
  @Get('view/:fileName')
  async viewBackupContent(@Param('fileName') fileName: string) {
    return this.backupService.getBackupContent(fileName);
  }

  /** Stream backup file download directly to client browser */
  @Get('download/:fileName')
  async downloadBackup(@Param('fileName') fileName: string) {
    return this.backupService.getBackupContent(fileName);
  }

  /** Restores system settings from a backup snapshot */
  @Post('restore/:fileName')
  async restoreFromBackup(@Param('fileName') fileName: string) {
    return this.backupService.restoreFromBackup(fileName);
  }
}