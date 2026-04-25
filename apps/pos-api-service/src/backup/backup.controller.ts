import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BackupService } from './backup.service';
import { CreateBackupSchema, CreateBackupDto } from './schema/backup.schema';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guards';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('backup')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  // @Roles('ADMIN')
  async createBackup(@Body() data: unknown) {
    const validated = CreateBackupSchema.parse(data) as CreateBackupDto;
    return this.backupService.createBackup(validated);
  }

  @Get('history')
  // @Roles('MANAGER', 'ADMIN')
  getBackupHistory(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getBackupHistory(companyId, branchId);
  }

  @Get('summary')
  // @Roles('MANAGER', 'ADMIN')
  getSummary(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.backupService.getSummary(companyId, branchId);
  }
}