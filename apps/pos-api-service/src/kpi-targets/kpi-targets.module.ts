import { Module } from '@nestjs/common';
import { KpiTargetsController } from './kpi-targets.controller';
import { KpiTargetsService }    from './kpi-targets.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [KpiTargetsController],
    providers: [KpiTargetsService],
    exports: [KpiTargetsService],
})
export class KpiTargetsModule {}