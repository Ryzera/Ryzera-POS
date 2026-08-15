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

async function masterSeedRealSyncData() {
  console.log('🚀 Seeding FULL REAL ENTERPRISE SYNC DATA for ALL 23 BRANCHES into Supabase Cloud DB...');

  const allBranches = await prisma.branch.findMany({ orderBy: { id: 'asc' } });
  console.log(`Found ${allBranches.length} real branches in Supabase Cloud DB.`);

  // 1. Clear previous sync data in correct FK order
  console.log('🧹 Cleaning old sync records...');
  await prisma.syncConflict.deleteMany({});
  await prisma.syncLog.deleteMany({});
  await prisma.syncDevice.deleteMany({});
  await prisma.syncSetting.deleteMany({});
  await prisma.syncHealthMetric.deleteMany({});
  await prisma.syncAuditLog.deleteMany({});

  // 2. Seed Devices for ALL 23 Branches
  console.log('📱 1. Seeding Devices across ALL 23 Branches...');
  const deviceData: any[] = [];
  allBranches.forEach((b: any, index: number) => {
    const isPrimary = index === 0 || index === 1;
    deviceData.push({
      name: `${b.name} Main POS Terminal 01`,
      type: 'POS',
      status: index === 3 ? 'OFFLINE' : (index === 4 ? 'SYNCING' : 'ACTIVE'),
      branch_id: b.id,
      lastSeen: new Date(Date.now() - (index * 120000))
    });

    if (isPrimary || index % 3 === 0) {
      deviceData.push({
        name: `${b.name} Handheld Scanner 02`,
        type: 'HANDHELD',
        status: index % 5 === 0 ? 'SYNCING' : 'ACTIVE',
        branch_id: b.id,
        lastSeen: new Date(Date.now() - (index * 180000))
      });
    }
  });
  await prisma.syncDevice.createMany({ data: deviceData });
  console.log(`✅ ${deviceData.length} Devices Seeded across All Branches.`);

  // 3. Seed Health Metrics for ALL 23 Branches
  console.log('📈 2. Seeding Health Metrics across ALL 23 Branches...');
  const metricData: any[] = [];
  allBranches.forEach((b: any, index: number) => {
    const isIssueBranch = b.code === 'KDY' || index === 1;
    metricData.push({
      branch_id: b.id,
      latency: isIssueBranch ? 142.8 : Math.max(12.5, 35.0 + (index * 2.5)),
      successRate: isIssueBranch ? 92.4 : Math.min(100.0, 98.5 + (index * 0.1)),
      uptime: isIssueBranch ? 97.20 : Math.min(100.0, 99.50 + (index * 0.02)),
      timestamp: new Date(Date.now() - (index * 300000))
    });
  });
  await prisma.syncHealthMetric.createMany({ data: metricData });
  console.log(`✅ ${metricData.length} Health Metrics Seeded across All Branches.`);

  // 4. Seed Settings
  console.log('⚙️ 3. Seeding Enterprise Sync Settings...');
  await prisma.syncSetting.createMany({
    data: [
      { key: 'AUTO_SYNC_INTERVAL', value: '30', description: 'Automatic background sync interval in seconds', scope: 'GLOBAL' },
      { key: 'MAX_BATCH_SIZE', value: '100', description: 'Maximum sync records per push request', scope: 'GLOBAL' },
      { key: 'CONFLICT_STRATEGY', value: 'SERVER_WINS', description: 'Default conflict resolution strategy', scope: 'GLOBAL' },
      { key: 'OFFLINE_RETENTION_DAYS', value: '7', description: 'Days to retain completed sync queue items locally', scope: 'GLOBAL' },
      { key: 'ENCRYPTION_ENABLED', value: 'true', description: 'AES-256 payload encryption flag', scope: 'GLOBAL' },
    ]
  });
  console.log('✅ 5 Global Settings Seeded.');

  // 5. Seed Real Sync Logs for ALL 23 Branches
  console.log('📋 4. Seeding Real Sync Logs across ALL 23 Branches...');
  const logsToCreate: any[] = [];
  allBranches.forEach((b: any, index: number) => {
    const isKandy = b.code === 'KDY' || b.id === 2;

    // Synced Bill
    logsToCreate.push({
      branch_id: b.id,
      entity: 'Billing',
      payload: { bill_no: `BILL-${b.code}-001`, amount: 1250.00 + (index * 150), items: 3 + (index % 4), payment_type: 'CASH' },
      status: 'SYNCED',
      attempts: 1,
      syncedAt: new Date(Date.now() - (index * 600000 + 100000)),
      created_at: new Date(Date.now() - (index * 600000 + 120000))
    });

    // Synced Inventory
    logsToCreate.push({
      branch_id: b.id,
      entity: 'Inventory',
      payload: { product_code: `P100${1 + (index % 5)}`, stock_change: -2, reason: 'SALE' },
      status: 'SYNCED',
      attempts: 1,
      syncedAt: new Date(Date.now() - (index * 600000 + 80000)),
      created_at: new Date(Date.now() - (index * 600000 + 90000))
    });

    // Add Failed Logs for multiple branches (Head Office, Kandy, Colombo, Galle, Jaffna)
    if (isKandy || index === 0 || index % 4 === 0) {
      logsToCreate.push({
        branch_id: b.id,
        entity: 'Billing',
        payload: { bill_no: `BILL-${b.code}-099`, amount: 3450.00 + (index * 200), items: 6, payment_type: 'CARD' },
        status: 'FAILED',
        error: index === 0 
          ? 'Network socket disconnect during payment gateway sync' 
          : (index === 1 ? 'HTTP 504 Gateway Timeout during peak hours' : 'Database connection pool exhausted'),
        attempts: 3,
        created_at: new Date(Date.now() - (index * 180000 + 300000))
      });
    }

    if (isKandy) {
      logsToCreate.push({
        branch_id: b.id,
        entity: 'Inventory',
        payload: { product_code: 'P1003', stock_change: 50, reason: 'RESTOCK' },
        status: 'CONFLICT',
        error: 'Concurrent stock balance update conflict',
        attempts: 2,
        created_at: new Date(Date.now() - 150000)
      });
    }
  });

  const createdLogs: any[] = [];
  for (const logData of logsToCreate) {
    const l = await prisma.syncLog.create({ data: logData });
    createdLogs.push(l);
  }
  console.log(`✅ ${createdLogs.length} Sync Logs Seeded across All 23 Branches.`);

  // 6. Seed Sync Conflict
  console.log('⚔️ 5. Seeding Real Conflict Record...');
  const conflictLog = createdLogs.find((l: any) => l.status === 'CONFLICT');
  if (conflictLog) {
    await prisma.syncConflict.create({
      data: {
        syncLog_id: conflictLog.id,
        status: 'PENDING',
        clientData: { product_code: 'P1003', stock: 150, updated_at: new Date(Date.now() - 150000).toISOString() },
        serverData: { product_code: 'P1003', stock: 120, updated_at: new Date(Date.now() - 120000).toISOString() }
      }
    });
    console.log('✅ 1 Active Real Conflict Seeded linked to Log #' + conflictLog.id);
  }

  // 7. Seed Audit Logs
  console.log('📜 6. Seeding Audit Logs...');
  await prisma.syncAuditLog.createMany({
    data: [
      { action: 'DEVICE_REGISTER', module: 'SYNC_DEVICE', branch_id: 1, details: { device: 'Head Office Main POS Terminal 01', ip: '192.168.1.101' }, created_at: new Date(Date.now() - 7200000) },
      { action: 'MANUAL_PUSH', module: 'SYNC_ENGINE', branch_id: 1, details: { pushed_records: 24, status: 'SUCCESS' }, created_at: new Date(Date.now() - 3600000) },
      { action: 'CONFLICT_DETECTED', module: 'SYNC_CONFLICT', branch_id: 2, details: { entity: 'P1003', conflict_type: 'STOCK_BALANCE' }, created_at: new Date(Date.now() - 1800000) },
      { action: 'BACKUP_CREATE', module: 'SYNC_BACKUP', branch_id: 1, details: { backup_type: 'FULL_SNAPSHOT', size_mb: 24.5 }, created_at: new Date(Date.now() - 900000) },
    ]
  });
  console.log('✅ 4 Enterprise Audit Logs Seeded.');

  console.log('\n🎉 MASTER SEEDING COMPLETED 100% SUCCESSFULLY FOR ALL 23 BRANCHES IN SUPABASE CLOUD DB!');
  await pool.end();
}

masterSeedRealSyncData().catch(e => {
  console.error('Master Seed Error:', e.message);
  pool.end();
});
