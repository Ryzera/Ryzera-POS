import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService }    from './reports.service';

/**
 * Reports Hub module.
 *
 * Provides the full Reports & Analytics backend:
 *  - On-demand report generation
 *  - Saved report configurations
 *  - Automated report schedules
 *  - Email delivery history & re-send
 *
 * PrismaService is globally provided via PrismaModule — no import needed here.
 * ReportsService is exported so ScheduledReportsModule can trigger runs.
 */
@Module({
    controllers: [ReportsController],
    providers:   [ReportsService],
    exports:     [ReportsService],
})
export class ReportsModule {}