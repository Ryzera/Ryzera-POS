import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CategoriesModule } from './categories/categories.module';
import { InventoryLogsModule } from './inventory-logs/inventory-logs.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { StockAlertsModule } from './stock-alerts/stock-alerts.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ProductsModule,
    SuppliersModule,
    CategoriesModule,
    InventoryLogsModule,
    UsersModule,
    AuthModule,
    BranchesModule,
    StockAlertsModule,
    PurchaseOrdersModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
