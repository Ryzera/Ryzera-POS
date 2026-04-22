import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MockAuthModule } from './mock-auth/mock-auth.module';
import { BranchModule } from './branch/branch.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ScheduledReportsModule } from './scheduled-reports/scheduled-reports.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { KpiTargetsModule } from './kpi-targets/kpi-targets.module';
import { InventoryStatusModule } from './inventory-status/inventory-status.module';
import { DailySummaryModule } from './daily-summary/daily-summary.module';
import { SalesReportModule } from './sales-report/sales-report.module';
import { ProfitLossModule } from './profit-loss/profit-loss.module';
import { CategoryPerformanceModule } from './category-performance/category-performance.module';
import { ProductPerformanceModule } from './product-performance/product-performance.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MockAuthModule,
    BranchModule,
    DashboardModule,
    ScheduledReportsModule,
    ReportsModule,
    NotificationsModule,
    KpiTargetsModule,
    InventoryStatusModule,
    DailySummaryModule,
    SalesReportModule,
    ProfitLossModule,
    CategoryPerformanceModule,
    ProductPerformanceModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {}