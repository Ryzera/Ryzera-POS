import { Module }                 from '@nestjs/common';
import { SalesReportController }  from './sales-report.controller';
import { SalesReportService }     from './sales-report.service';
import { PrismaModule }           from '../prisma/prisma.module';
import { AuditLogModule }        from '../audit-log/audit-log.module';

@Module({
    imports:     [PrismaModule,AuditLogModule],
    controllers: [SalesReportController],
    providers:   [SalesReportService],
    exports:     [SalesReportService], // Required by ScheduledReportsModule in Branch 7
})
export class SalesReportModule {}