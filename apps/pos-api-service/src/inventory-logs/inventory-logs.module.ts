import { Module } from '@nestjs/common';
import { InventoryLogsController } from './inventory-logs.controller';
import { InventoryLogsService } from './inventory-logs.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [InventoryLogsController],
  providers: [InventoryLogsService, PrismaService],
  exports: [InventoryLogsService],
})
export class InventoryLogsModule {}
