import { Module } from '@nestjs/common';
import { CategoryPerformanceController } from './category-performance.controller';
import { CategoryPerformanceService }    from './category-performance.service';
import { PrismaModule }                  from '../prisma/prisma.module';

@Module({
    imports:     [PrismaModule],
    controllers: [CategoryPerformanceController],
    providers:   [CategoryPerformanceService],
    exports:     [CategoryPerformanceService],   // required by ScheduledReportsModule
})
export class CategoryPerformanceModule {}
