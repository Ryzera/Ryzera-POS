import { Module } from '@nestjs/common';
import { DiscountRuleController } from './discount-rule.controller';
import { DiscountRuleService } from './discount-rule.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports:     [PrismaModule],
    controllers: [DiscountRuleController],
    providers:   [DiscountRuleService],
    exports:     [DiscountRuleService], // BillingModule needs this to validate discounts
})
export class DiscountRuleModule {}