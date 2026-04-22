import { Module }                 from '@nestjs/common';
import { SalesReportController }  from './sales-report.controller';
import { SalesReportService }     from './sales-report.service';
import { PrismaModule }           from '../prisma/prisma.module';

@Module({
    imports:     [PrismaModule],
    controllers: [SalesReportController],
    providers:   [SalesReportService],
    exports:     [SalesReportService], // Required by ScheduledReportsModule in Branch 7
})
export class SalesReportModule {}