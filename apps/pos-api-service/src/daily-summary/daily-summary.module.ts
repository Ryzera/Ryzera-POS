import { Module }                   from '@nestjs/common';
import { DailySummaryController }   from './daily-summary.controller';
import { DailySummaryService }      from './daily-summary.service';
import { PrismaModule }             from '../prisma/prisma.module';

@Module({
    imports:     [PrismaModule],
    controllers: [DailySummaryController],
    providers:   [DailySummaryService],
    exports:     [DailySummaryService], // required by ScheduledReportsModule in Branch 7
})
export class DailySummaryModule {}
