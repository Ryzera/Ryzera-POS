import { Module } from '@nestjs/common';
import { ProductPerformanceController } from './product-performance.controller';
import { ProductPerformanceService } from './product-performance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProductPerformanceController],
    providers: [ProductPerformanceService],
    exports: [ProductPerformanceService],
})
export class ProductPerformanceModule {}
