import { Module } from '@nestjs/common';
import { ProfitLossController } from './profit-loss.controller';
import { ProfitLossService } from './profit-loss.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsAuditLogModule } from '../reports-audit-log/reports-audit-log.module';
/**
 * ProfitLossModule
 *
 * Self-contained module for all Profit & Loss Report functionality.
 * ProfitLossService is exported so ScheduledReportsModule can reuse it.
 */
@Module({
  imports: [PrismaModule, ReportsAuditLogModule],
  controllers: [ProfitLossController],
  providers: [ProfitLossService],
  exports: [ProfitLossService],
})
export class ProfitLossModule {}
