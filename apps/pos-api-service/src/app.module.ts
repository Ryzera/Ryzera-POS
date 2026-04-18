import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MockAuthModule } from './mock-auth/mock-auth.module';
import { BranchModule } from './branch/branch.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule }   from './notifications/notifications.module';
import { KpiTargetsModule }      from './kpi-targets/kpi-targets.module';
import { InventoryStatusModule } from './inventory-status/inventory-status.module';
import { DailySummaryModule }    from './daily-summary/daily-summary.module';
import { SalesReportModule }      from './sales-report/sales-report.module';

@Module({
  imports: [
    PrismaModule,
    MockAuthModule,
    BranchModule,
    DashboardModule,
    NotificationsModule,
    KpiTargetsModule,
    InventoryStatusModule,
    DailySummaryModule,
    SalesReportModule,
  ],
})
export class AppModule {}