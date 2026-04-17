import { Injectable, OnModuleInit } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prismaClient: any = new PrismaClient({ adapter });

let isConnected = false;

async function getClient() {
  if (!isConnected) {
    await prismaClient.$connect();
    isConnected = true;
  }
  return prismaClient;
}

@Injectable()
export class PrismaService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await getClient();
  }

  async getSale() { return (await getClient()).ryzera_pos_sale; }
  async getSaleItem() { return (await getClient()).ryzera_pos_sale_item; }
  async getPayment() { return (await getClient()).ryzera_pos_payment; }
  async getReturn() { return (await getClient()).ryzera_pos_return; }
  async getReturnItem() { return (await getClient()).ryzera_pos_return_item; }
  async tx(operations: any[]) { return (await getClient()).$transaction(operations); }
}
