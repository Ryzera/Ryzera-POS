import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from '@ryzera/pos-database';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchaseModule } from './purchase/purchase.module';
import { TransferModule } from './transfer/transfer.module';
import { BatchModule } from './batch/batch.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule,
    BranchModule,
    UserModule,
    ProductModule,
    SupplierModule,
    InventoryModule,
    PurchaseModule,
    TransferModule,
    BatchModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
