import { Module } from '@nestjs/common';
import { ReportsAuditLogController } from './audit-log.controller';
import { ReportsAuditLogService } from './audit-log.service';
@Module({
  controllers: [ReportsAuditLogController],
  providers: [ReportsAuditLogService],
  exports: [ReportsAuditLogService],
})
export class ReportsAuditLogModule {}
