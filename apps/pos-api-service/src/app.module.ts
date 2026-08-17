import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { BillingModule } from './billing/billing.module.js';
import { ReturnsModule } from './returns/returns.module.js';

@Module({
  imports: [PrismaModule, BillingModule,ReturnsModule],
})
export class AppModule {}