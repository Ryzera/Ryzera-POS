import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BackupService } from './backup.service';
import { CreateBackupSchema, CreateBackupDto } from './schema/backup.schema';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guards';
// import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Backup operations for disaster recovery.
 * Auth guards temporarily disabled - waiting for auth module fix.
 */
@Controller('backup')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /** Create system backup. @example POST /api/backup Body: {} */
  @Post()
  // @Roles('ADMIN')
  async createBackup(@Body() data: unknown) {
    const validated = CreateBackupSchema.parse(data) as CreateBackupDto;
    return this.backupService.createBackup(validated);
  }

  /** Get backup history. @example GET /api/backup/history */
  @Get('history')
  // @Roles('MANAGER', 'ADMIN')
  getBackupHistory(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getBackupHistory(companyId, branchId);
  }

  /** Get system summary (settings count, sync counts, backup counts). @example GET /api/backup/summary */
  @Get('summary')
  // @Roles('MANAGER', 'ADMIN')
  getSummary(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getSummary(companyId, branchId);
  }
}