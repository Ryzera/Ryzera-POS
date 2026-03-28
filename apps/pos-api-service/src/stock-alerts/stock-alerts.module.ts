import { Module } from '@nestjs/common';
import { StockAlertsController } from './stock-alerts.controller';
import { StockAlertsService } from './stock-alerts.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [StockAlertsController],
  providers: [StockAlertsService, PrismaService],
  exports: [StockAlertsService],
})
export class StockAlertsModule {}
