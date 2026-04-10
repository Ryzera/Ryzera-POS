import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  providers: [PurchaseService, InvoiceService],
  controllers: [PurchaseController, InvoiceController],
})
export class PurchaseModule {}
