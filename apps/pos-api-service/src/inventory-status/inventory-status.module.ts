import { Module } from '@nestjs/common';
import { InventoryStatusController } from './inventory-status.controller';
import { InventoryStatusService }    from './inventory-status.service';
import { PrismaModule }              from '../prisma/prisma.module';
import { AuditLogModule }        from '../audit-log/audit-log.module';

@Module({
    imports:     [PrismaModule,AuditLogModule],
    controllers: [InventoryStatusController],
    providers:   [InventoryStatusService],
    exports:     [InventoryStatusService],  // required by ScheduledReportsModule in Branch 7
})
export class InventoryStatusModule {}