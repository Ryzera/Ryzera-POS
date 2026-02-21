import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('Database connected!');
  } catch (err) {
    console.error('Prisma connection error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
