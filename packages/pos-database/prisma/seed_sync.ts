import { PrismaClient } from '../src';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:%23bugslayers2yrprojectPOS%23@db.dhdgmhkjstywlklyxrie.supabase.co:5432/postgres?sslmode=no-verify';

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new (PrismaClient as any)({ adapter });

async function seedSyncData() {
  console.log('🌱 Seeding rich enterprise sync data into Supabase Cloud DB...');

  const branchHq = await prisma.branch.findFirst({ where: { code: 'HQ' } });
  const branchKandy = await prisma.branch.findFirst({ where: { code: 'KANDY' } });
  const hqId = branchHq ? branchHq.id : 1;
  const kandyId = branchKandy ? branchKandy.id : 2;

  // 1. Seed SyncDevices
  console.log('📱 Seeding Sync Devices...');
  await prisma.syncDevice.deleteMany({});
  await prisma.syncDevice.createMany({
    data: [
      { name: 'HQ Terminal 01 (Main POS)', type: 'POS', status: 'ACTIVE', branch_id: hqId, lastSeen: new Date() },
      { name: 'HQ Terminal 02 (Express Checkout)', type: 'POS', status: 'ACTIVE', branch_id: hqId, lastSeen: new Date() },
      { name: 'Kandy Terminal 01 (Front Desk)', type: 'POS', status: 'ACTIVE', branch_id: kandyId, lastSeen: new Date() },
      { name: 'Kandy Handheld Scanner 01', type: 'HANDHELD', status: 'SYNCING', branch_id: kandyId, lastSeen: new Date() },
      { name: 'HQ Warehouse Tablet', type: 'TABLET', status: 'OFFLINE', branch_id: hqId, lastSeen: new Date(Date.now() - 3600000) },
    ]
  });

  // 2. Seed SyncSettings
  console.log('⚙️ Seeding Sync Settings...');
  await prisma.syncSetting.deleteMany({});
  await prisma.syncSetting.createMany({
    data: [
      { key: 'AUTO_SYNC_INTERVAL', value: '30', description: 'Automatic background sync interval in seconds', branch_id: hqId, scope: 'GLOBAL' },
      { key: 'MAX_BATCH_SIZE', value: '100', description: 'Maximum sync records per push request', branch_id: hqId, scope: 'GLOBAL' },
      { key: 'CONFLICT_STRATEGY', value: 'SERVER_WINS', description: 'Default conflict resolution strategy', branch_id: hqId, scope: 'GLOBAL' },
      { key: 'OFFLINE_RETENTION_DAYS', value: '7', description: 'Days to retain completed sync queue items locally', branch_id: hqId, scope: 'GLOBAL' },
      { key: 'ENCRYPTION_ENABLED', value: 'true', description: 'AES-256 payload encryption flag', branch_id: hqId, scope: 'GLOBAL' },
    ]
  });

  // 3. Seed SyncLogs & SyncConflicts
  console.log('📋 Seeding Sync Logs & Conflicts...');
  await prisma.syncConflict.deleteMany({});
  await prisma.syncLog.deleteMany({});
  const log1 = await prisma.syncLog.create({
    data: {
      branch_id: hqId,
      entity: 'Billing',
      payload: { bill_no: 'BILL-2026-001', amount: 1550.00, items: 3, payment_type: 'CASH' },
      status: 'SYNCED',
      attempts: 1,
      syncedAt: new Date(Date.now() - 1800000),
      created_at: new Date(Date.now() - 1800000)
    }
  });

  const log2 = await prisma.syncLog.create({
    data: {
      branch_id: hqId,
      entity: 'Billing',
      payload: { bill_no: 'BILL-2026-002', amount: 4200.50, items: 5, payment_type: 'CARD' },
      status: 'SYNCED',
      attempts: 1,
      syncedAt: new Date(Date.now() - 1200000),
      created_at: new Date(Date.now() - 1200000)
    }
  });

  const log3 = await prisma.syncLog.create({
    data: {
      branch_id: kandyId,
      entity: 'Inventory',
      payload: { product_code: 'P1001', stock_change: -2, reason: 'SALE' },
      status: 'PENDING',
      attempts: 0,
      created_at: new Date(Date.now() - 600000)
    }
  });

  const log4 = await prisma.syncLog.create({
    data: {
      branch_id: kandyId,
      entity: 'Billing',
      payload: { bill_no: 'BILL-KND-089', amount: 980.00, items: 2, payment_type: 'CASH' },
      status: 'FAILED',
      error: 'HTTP 504 Gateway Timeout during peak hours',
      attempts: 3,
      created_at: new Date(Date.now() - 300000)
    }
  });

  const log5 = await prisma.syncLog.create({
    data: {
      branch_id: hqId,
      entity: 'Inventory',
      payload: { product_code: 'P1003', stock_change: 50, reason: 'RESTOCK' },
      status: 'CONFLICT',
      error: 'Concurrent update conflict on stock balance',
      attempts: 2,
      created_at: new Date(Date.now() - 150000)
    }
  });

  // 4. Seed SyncConflicts
  console.log('⚔️ Seeding Sync Conflicts...');
  await prisma.syncConflict.deleteMany({});
  await prisma.syncConflict.create({
    data: {
      syncLog_id: log5.id,
      status: 'PENDING',
      clientData: { product_code: 'P1003', stock: 150, updated_at: '2026-08-14T21:30:00Z' },
      serverData: { product_code: 'P1003', stock: 120, updated_at: '2026-08-14T21:31:00Z' }
    }
  });

  // 5. Seed SyncBackups (Optional)
  console.log('💾 Skipping Sync Backups...');

  // 6. Seed SyncHealthMetrics
  console.log('📈 Seeding Sync Health Metrics...');
  await prisma.syncHealthMetric.deleteMany({});
  await prisma.syncHealthMetric.createMany({
    data: [
      { branch_id: hqId, latency: 45.2, successRate: 99.8, uptime: 99.95, timestamp: new Date() },
      { branch_id: kandyId, latency: 82.5, successRate: 97.4, uptime: 98.80, timestamp: new Date() },
    ]
  });

  // 7. Seed SyncAuditLogs
  console.log('📜 Seeding Sync Audit Logs...');
  await prisma.syncAuditLog.deleteMany({});
  await prisma.syncAuditLog.createMany({
    data: [
      { action: 'DEVICE_REGISTER', module: 'SYNC_DEVICE', branch_id: hqId, details: { device: 'HQ Terminal 01', ip: '192.168.1.101' }, created_at: new Date(Date.now() - 7200000) },
      { action: 'MANUAL_PUSH', module: 'SYNC_ENGINE', branch_id: hqId, details: { pushed_records: 12, status: 'SUCCESS' }, created_at: new Date(Date.now() - 3600000) },
      { action: 'CONFLICT_RESOLVE', module: 'SYNC_CONFLICT', branch_id: kandyId, details: { conflict_id: 1, strategy: 'SERVER_WINS' }, created_at: new Date(Date.now() - 1800000) },
      { action: 'BACKUP_CREATE', module: 'SYNC_BACKUP', branch_id: hqId, details: { backup_type: 'FULL_SNAPSHOT', size_mb: 24.5 }, created_at: new Date(Date.now() - 900000) },
    ]
  });

  console.log('🎉 Enterprise Sync Data Seeded Successfully into Supabase Cloud DB!');
  await pool.end();
}

seedSyncData().catch(e => {
  console.error('Seed Sync Data Error:', e.message);
  pool.end();
});
