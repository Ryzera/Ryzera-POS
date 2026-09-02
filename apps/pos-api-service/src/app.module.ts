import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';    //ADD
import { DatabaseModule } from '@ryzera/pos-database';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CompanyModule } from './company/company.module';
import { BranchModule } from './branch/branch.module';
import { InventoryModule } from './inventory/inventory.module';
import { BillingModule } from './billing/billing.module';
import { ReturnsModule } from './returns/returns.module';
import { DiscountRuleModule } from './discount-rule/discount-rule.module';
import { CashierModule } from './cashier/cashier.module';
import { AuditLogModule } from './auditlog/auditlog.module';
import { BatchModule } from './batch/batch.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { SupplierModule } from './supplier/supplier.module';
import { TransferModule } from './transfer/transfer.module';

// ─── Reporting & Analytics Modules ──────────────────────
import { MailModule } from './mail/mail.module';
import { ScheduledReportsModule } from './scheduled-reports/scheduled-reports.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SalesReportModule } from './sales-report/sales-report.module';
import { ProfitLossModule } from './profit-loss/profit-loss.module';
import { CategoryPerformanceModule } from './category-performance/category-performance.module';
import { ProductPerformanceModule } from './product-performance/product-performance.module';
import { InventoryStatusModule } from './inventory-status/inventory-status.module';
import { DailySummaryModule } from './daily-summary/daily-summary.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { KpiTargetsModule } from './kpi-targets/kpi-targets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LookupModule } from './lookup/lookup.module';
import { ReportsAuditLogModule } from './reports-audit-log/reports-audit-log.module';
// ─── Sync & Offline Suite ────────────────────────────────
import { SyncModule } from './modules/sync/sync.module';
import { BackupModule } from './backup/backup.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),      //ADD
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CompanyModule,
    BranchModule,
    InventoryModule,
    BillingModule,
    ReturnsModule,
    DiscountRuleModule,
    CashierModule,
    AuditLogModule,
    BatchModule,
    CategoryModule,
    ProductModule,
    PurchaseOrderModule,
    SupplierModule,
    TransferModule,

    // Reporting & Analytics
    MailModule,
    ScheduledReportsModule,
    ReportsModule,
    SalesReportModule,
    ProfitLossModule,
    CategoryPerformanceModule,
    ProductPerformanceModule,
    InventoryStatusModule,
    DailySummaryModule,
    DashboardModule,
    KpiTargetsModule,
    NotificationsModule,
    LookupModule,
    ReportsAuditLogModule,

    // Sync Full Suite
    SyncModule,
    BackupModule,
    SettingsModule,
  ],
})
export class AppModule {}