import { Module } from '@nestjs/common';
import { AuditLogController } from './auditlog.controller';
import { AuditLogService } from './auditlog.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AuditLogController],
    providers: [AuditLogService],
    exports: [AuditLogService],
})
export class AuditLogModule {}