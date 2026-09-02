import { Module } from '@nestjs/common';
import { ProductPerformanceController } from './product-performance.controller';
import { ProductPerformanceService } from './product-performance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsAuditLogModule } from '../reports-audit-log/reports-audit-log.module';
@Module({
  imports: [PrismaModule, ReportsAuditLogModule],
  controllers: [ProductPerformanceController],
  providers: [ProductPerformanceService],
  exports: [ProductPerformanceService],
})
export class ProductPerformanceModule {}
