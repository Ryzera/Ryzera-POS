import { Module } from '@nestjs/common';
import { CategoryPerformanceController } from './category-performance.controller';
import { CategoryPerformanceService } from './category-performance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsAuditLogModule } from '../reports-audit-log/reports-audit-log.module';
@Module({
  imports: [PrismaModule, ReportsAuditLogModule],
  controllers: [CategoryPerformanceController],
  providers: [CategoryPerformanceService],
  exports: [CategoryPerformanceService],
})
export class CategoryPerformanceModule {}
