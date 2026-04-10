import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { StockAlertService } from './stock-alert.service';
import { StockAlertController } from './stock-alert.controller';

@Module({
  providers: [InventoryService, StockAlertService],
  controllers: [InventoryController, StockAlertController],
  exports: [InventoryService],
})
export class InventoryModule {}
