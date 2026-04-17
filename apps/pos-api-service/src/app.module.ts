import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { BillingModule } from './billing/billing.module.js';

@Module({
  imports: [PrismaModule, BillingModule],
})
export class AppModule {}