import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
  ],
})
export class AppModule {}