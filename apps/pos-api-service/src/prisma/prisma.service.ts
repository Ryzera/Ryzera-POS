import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // SyncLog methods
  get syncLog() {
    return (this as any).syncLog;
  }

  // Add other models here when needed
  get user() {
    return (this as any).user;
  }

  get product() {
    return (this as any).product;
  }

  get inventoryLog() {
    return (this as any).inventoryLog;
  }
}