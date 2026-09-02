// apps/pos-api-service/src/scheduled-reports/scheduled-reports.module.ts
import { Module } from '@nestjs/common';
import { ReportsModule } from '../modules/reports/reports.module';
import { MailModule } from '../mail/mail.module';
import { ProfitLossModule } from '../profit-loss/profit-loss.module';
import { DailySummaryModule } from '../daily-summary/daily-summary.module';
import { SalesReportModule } from '../sales-report/sales-report.module';
import { CategoryPerformanceModule } from '../category-performance/category-performance.module';
import { ProductPerformanceModule } from '../product-performance/product-performance.module';
import { InventoryStatusModule } from '../inventory-status/inventory-status.module';
import { ScheduledReportsService } from './scheduled-reports.service';

@Module({
  imports: [
    ReportsModule,
    MailModule,
    ProfitLossModule,
    DailySummaryModule,
    SalesReportModule,
    CategoryPerformanceModule,
    ProductPerformanceModule,
    InventoryStatusModule,
  ],
  providers: [ScheduledReportsService],
})
export class ScheduledReportsModule {}