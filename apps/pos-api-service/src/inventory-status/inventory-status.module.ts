import { Module } from '@nestjs/common';
import { InventoryStatusController } from './inventory-status.controller';
import { InventoryStatusService } from './inventory-status.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsAuditLogModule } from '../reports-audit-log/reports-audit-log.module';
@Module({
  imports: [PrismaModule, ReportsAuditLogModule],
  controllers: [InventoryStatusController],
  providers: [InventoryStatusService],
  exports: [InventoryStatusService], // required by ScheduledReportsModule in Branch 7
})
export class InventoryStatusModule {}
