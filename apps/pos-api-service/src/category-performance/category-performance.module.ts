import { Module } from '@nestjs/common';
import { CategoryPerformanceController } from './category-performance.controller';
import { CategoryPerformanceService }    from './category-performance.service';
import { PrismaModule }                  from '../prisma/prisma.module';
import { AuditLogModule }        from '../audit-log/audit-log.module';

@Module({
    imports:     [PrismaModule,AuditLogModule],
    controllers: [CategoryPerformanceController],
    providers:   [CategoryPerformanceService],
    exports:     [CategoryPerformanceService],   // required by ScheduledReportsModule
})
export class CategoryPerformanceModule {}
