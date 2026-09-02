import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Backup Controller - Handles system backup operations.
 * All backup data is sensitive and requires an authenticated administrator.
 */
@Controller('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  @Post('create')
  @Post('snapshot')
  async createBackup(@Body() data: unknown) {
    return this.backupService.createBackup((data || {}) as any);
  }

  @Get('history')
  getBackupHistory(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getBackupHistory(companyId, branchId);
  }

  @Get('summary')
  getSummary(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getSummary(companyId, branchId);
  }

  @Get('view/:fileName')
  async viewBackupContent(@Param('fileName') fileName: string) {
    return this.backupService.getBackupContent(fileName);
  }

  @Get('download/:fileName')
  async downloadBackup(@Param('fileName') fileName: string) {
    return this.backupService.getBackupContent(fileName);
  }

  @Post('restore/:fileName')
  async restoreFromBackup(@Param('fileName') fileName: string) {
    return this.backupService.restoreFromBackup(fileName);
  }
}
