import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ryzera/pos-database';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BatchModule } from './batch/batch.module';
import { BranchModule } from './branch/branch.module';
import { CategoryModule } from './category/category.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { SupplierModule } from './supplier/supplier.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    BranchModule,
    CategoryModule,
    ProductModule,
    SupplierModule,
    InventoryModule,
    PurchaseOrderModule,
    TransferModule,
    BatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}