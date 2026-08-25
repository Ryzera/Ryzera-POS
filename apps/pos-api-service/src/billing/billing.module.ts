import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillingRepository } from './billing.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { DiscountRuleModule } from '../discount-rule/discount-rule.module';

@Module({
  imports:     [PrismaModule, DiscountRuleModule],
  controllers: [BillingController],
  providers:   [BillingService, BillingRepository],
})
export class BillingModule {}