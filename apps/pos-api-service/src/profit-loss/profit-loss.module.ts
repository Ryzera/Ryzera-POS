import { Module } from '@nestjs/common';
import { ProfitLossController } from './profit-loss.controller';
import { ProfitLossService }    from './profit-loss.service';
import { PrismaModule }         from '../prisma/prisma.module';

/**
 * ProfitLossModule
 *
 * Self-contained module for all Profit & Loss Report functionality.
 * ProfitLossService is exported so ScheduledReportsModule can reuse it.
 */
@Module({
    imports:     [PrismaModule],
    controllers: [ProfitLossController],
    providers:   [ProfitLossService],
    exports:     [ProfitLossService],
})
export class ProfitLossModule {}