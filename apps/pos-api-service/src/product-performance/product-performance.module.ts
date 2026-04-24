import { Module } from '@nestjs/common';
import { ProductPerformanceController } from './product-performance.controller';
import { ProductPerformanceService } from './product-performance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule }        from '../audit-log/audit-log.module';

@Module({
    imports: [PrismaModule,AuditLogModule],
    controllers: [ProductPerformanceController],
    providers: [ProductPerformanceService],
    exports: [ProductPerformanceService],
})
export class ProductPerformanceModule {}
