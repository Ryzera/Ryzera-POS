import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ryzera/pos-database';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BranchModule } from './branch/branch.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [
    DatabaseModule,
    BranchModule,
    CategoryModule,
    ProductModule,
    SupplierModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}