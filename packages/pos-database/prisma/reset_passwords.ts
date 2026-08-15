import { PrismaClient } from '../src';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:%23bugslayers2yrprojectPOS%23@db.dhdgmhkjstywlklyxrie.supabase.co:5432/postgres?sslmode=no-verify';

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new (PrismaClient as any)({ adapter });

async function resetAllUserPasswords() {
  console.log('🔄 Resetting passwords for all seeded users in Supabase Cloud DB...');

  try {
    const adminPass = await bcrypt.hash('admin123', 12);
    const managerPass = await bcrypt.hash('manager123', 12);
    const cashierPass = await bcrypt.hash('cashier123', 12);

    await prisma.user.updateMany({
      where: { username: 'admin' },
      data: { password: adminPass, status: 'ACTIVE' }
    });

    await prisma.user.updateMany({
      where: { username: 'manager_hq' },
      data: { password: managerPass, status: 'ACTIVE' }
    });

    await prisma.user.updateMany({
      where: { username: 'manager_kandy' },
      data: { password: managerPass, status: 'ACTIVE' }
    });

    await prisma.user.updateMany({
      where: { username: 'cashier_hq' },
      data: { password: cashierPass, status: 'ACTIVE' }
    });

    console.log('✅ Passwords reset successfully!');
    console.log('  admin         -> admin123');
    console.log('  manager_hq    -> manager123');
    console.log('  manager_kandy -> manager123');
    console.log('  cashier_hq    -> cashier123');
  } catch (err) {
    console.error('❌ Failed to reset passwords:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAllUserPasswords();
