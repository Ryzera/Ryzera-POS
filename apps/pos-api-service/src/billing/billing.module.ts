import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingRepository } from './billing.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { DiscountRuleModule } from '../discount-rule/discount-rule.module';
import { ReturnsModule } from '../returns/returns.module';

@Module({
  imports: [PrismaModule, DiscountRuleModule, ReturnsModule],
  controllers: [BillingController],
  providers: [BillingService, BillingRepository],
})
export class BillingModule {}