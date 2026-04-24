import { Module }                   from '@nestjs/common';
import { DailySummaryController }   from './daily-summary.controller';
import { DailySummaryService }      from './daily-summary.service';
import { PrismaModule }             from '../prisma/prisma.module';
import { AuditLogModule }        from '../audit-log/audit-log.module';

@Module({
    imports:     [PrismaModule,AuditLogModule],
    controllers: [DailySummaryController],
    providers:   [DailySummaryService],
    exports:     [DailySummaryService], // required by ScheduledReportsModule in Branch 7
})
export class DailySummaryModule {}
