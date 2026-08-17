import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('🌱 Seeding database...');

    // ─── 1. Company ───────────────────────────────────────
    const company = await prisma.company.upsert({
        where: { code: 'RYZERA' },
        update: {},
        create: {
            name: 'Ryzera Holdings',
            code: 'RYZERA',
            email: 'info@ryzera.com',
            phone: '+94771234567',
            address: 'Colombo 03, Sri Lanka',
            is_active: true,
        },
    });
    console.log('✅ Company:', company.name);

    // ─── 2. Branches ──────────────────────────────────────
    const branchMain = await prisma.branch.upsert({
        where: { company_id_code: { company_id: company.id, code: 'HQ' } },
        update: {},
        create: {
            company_id: company.id,
            name: 'Head Office',
            code: 'HQ',
            address: 'Colombo 03',
            phone: '+94771234567',
            email: 'hq@ryzera.com',
            is_active: true,
        },
    });

    const branchKandy = await prisma.branch.upsert({
        where: { company_id_code: { company_id: company.id, code: 'KDY' } },
        update: {},
        create: {
            company_id: company.id,
            name: 'Kandy Branch',
            code: 'KDY',
            address: 'Kandy City Center',
            phone: '+94812345678',
            email: 'kandy@ryzera.com',
            is_active: true,
        },
    });
    console.log('✅ Branches: HQ, Kandy');

    // ─── 3. Authorities ───────────────────────────────────
    const authorityList = [
        { name: 'USER_CREATE', description: 'Create users' },
        { name: 'USER_READ', description: 'View users' },
        { name: 'USER_UPDATE', description: 'Update users' },
        { name: 'USER_DELETE', description: 'Delete users' },
        { name: 'ROLE_CREATE', description: 'Create roles' },
        { name: 'ROLE_READ', description: 'View roles' },
        { name: 'ROLE_ASSIGN', description: 'Assign roles' },
        { name: 'COMPANY_MANAGE', description: 'Manage companies' },
        { name: 'BRANCH_MANAGE', description: 'Manage branches' },
        { name: 'POS_ACCESS', description: 'Access POS' },
        { name: 'POS_BILLING', description: 'Create bills' },
        { name: 'INVENTORY_READ', description: 'View inventory' },
        { name: 'INVENTORY_MANAGE', description: 'Manage inventory' },
        { name: 'REPORT_VIEW', description: 'View reports' },
        { name: 'REPORT_EXPORT', description: 'Export reports' },
    ];

    const authorityMap: Record<string, number> = {};
    for (const auth of authorityList) {
        const created = await prisma.authority.upsert({
            where: { name: auth.name },
            update: {},
            create: auth,
        });
        authorityMap[auth.name] = created.id;
    }
    console.log('✅ Authorities:', Object.keys(authorityMap).length);

    // ─── 4. Roles ─────────────────────────────────────────
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'Full system access' },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: { name: 'MANAGER', description: 'Branch manager access' },
    });

    const cashierRole = await prisma.role.upsert({
        where: { name: 'CASHIER' },
        update: {},
        create: { name: 'CASHIER', description: 'POS cashier access' },
    });

    const inventoryRole = await prisma.role.upsert({
        where: { name: 'INVENTORY_MANAGER' },
        update: {},
        create: { name: 'INVENTORY_MANAGER', description: 'Inventory access' },
    });
    console.log('✅ Roles: ADMIN, MANAGER, CASHIER, INVENTORY_MANAGER');

    // ─── 5. Role Authorities ──────────────────────────────
    // ADMIN → ALL
    for (const authId of Object.values(authorityMap)) {
        try {
            await prisma.roleAuthority.create({
                data: { roleId: adminRole.id, authorityId: authId },
            });
        } catch { /* skip duplicates */ }
    }

    // MANAGER
    const managerAuths = [
        'USER_READ', 'ROLE_READ', 'POS_ACCESS', 'POS_BILLING',
        'INVENTORY_READ', 'REPORT_VIEW', 'REPORT_EXPORT', 'BRANCH_MANAGE',
    ];
    for (const authName of managerAuths) {
        const authId = authorityMap[authName];
        if (!authId) continue;
        try {
            await prisma.roleAuthority.create({
                data: { roleId: managerRole.id, authorityId: authId },
            });
        } catch { /* skip duplicates */ }
    }

    // CASHIER
    const cashierAuths = ['POS_ACCESS', 'POS_BILLING', 'INVENTORY_READ'];
    for (const authName of cashierAuths) {
        const authId = authorityMap[authName];
        if (!authId) continue;
        try {
            await prisma.roleAuthority.create({
                data: { roleId: cashierRole.id, authorityId: authId },
            });
        } catch { /* skip duplicates */ }
    }

    // INVENTORY_MANAGER
    const inventoryAuths = ['INVENTORY_READ', 'INVENTORY_MANAGE', 'REPORT_VIEW'];
    for (const authName of inventoryAuths) {
        const authId = authorityMap[authName];
        if (!authId) continue;
        try {
            await prisma.roleAuthority.create({
                data: { roleId: inventoryRole.id, authorityId: authId },
            });
        } catch { /* skip duplicates */ }
    }
    console.log('✅ Role authorities assigned');

    // ─── 6. Users ─────────────────────────────────────────
    const adminPass   = await bcrypt.hash('admin123', 12);
    const managerPass = await bcrypt.hash('manager123', 12);
    const cashierPass = await bcrypt.hash('cashier123', 12);

    // Helper function
    async function createUser(data: {
        username: string;
        password: string;
        company_id: number;
        branch_id: number;
        user_type: 'ADMIN' | 'STAFF';
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
    }) {
        const existing = await prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existing) return existing;

        const user = await prisma.user.create({
            data: {
                username: data.username,
                password: data.password,
                company_id: data.company_id,
                branch_id: data.branch_id,
                user_type: data.user_type,
                status: 'ACTIVE',
            },
        });

        // Raw SQL use කරමු — table name exact match
        await prisma.$executeRaw`
      INSERT INTO "user_info" 
        ("user_id", "first_name", "last_name", "email", "phone_number")
      VALUES 
        (${user.id}, ${data.first_name}, ${data.last_name}, ${data.email}, ${data.phone_number})
    `;

        return user;
    }

    const adminUser = await createUser({
        username: 'admin',
        password: adminPass,
        company_id: company.id,
        branch_id: branchMain.id,
        user_type: 'ADMIN',
        first_name: 'Super',
        last_name: 'Admin',
        email: 'admin@ryzera.com',
        phone_number: '+94771234567',
    });

    const managerUser = await createUser({
        username: 'manager_hq',
        password: managerPass,
        company_id: company.id,
        branch_id: branchMain.id,
        user_type: 'STAFF',
        first_name: 'John',
        last_name: 'Silva',
        email: 'manager@ryzera.com',
        phone_number: '+94771234568',
    });

    const cashierUser = await createUser({
        username: 'cashier_hq',
        password: cashierPass,
        company_id: company.id,
        branch_id: branchMain.id,
        user_type: 'STAFF',
        first_name: 'Nimal',
        last_name: 'Perera',
        email: 'cashier@ryzera.com',
        phone_number: '+94771234569',
    });

    const kandyManager = await createUser({
        username: 'manager_kandy',
        password: managerPass,
        company_id: company.id,
        branch_id: branchKandy.id,
        user_type: 'STAFF',
        first_name: 'Kamal',
        last_name: 'Perera',
        email: 'kandy.manager@ryzera.com',
        phone_number: '+94771234570',
    });

    console.log('✅ Users: admin, manager_hq, cashier_hq, manager_kandy');

    // ─── 7. User Roles ────────────────────────────────────
    async function assignUserRole(userId: number, roleId: number) {
        try {
            await prisma.userRole.create({ data: { userId, roleId } });
        } catch { /* skip duplicates */ }
    }

    await assignUserRole(adminUser.id, adminRole.id);
    await assignUserRole(managerUser.id, managerRole.id);
    await assignUserRole(cashierUser.id, cashierRole.id);
    await assignUserRole(kandyManager.id, managerRole.id);

    console.log('✅ User roles assigned');

    // ─── 8. Sample Products ───────────────────────────────
    const products = [
        { name: 'Coca Cola 330ml', code: 'BEV001', price: 120, cost_price: 80, quantity: 150, min_quantity: 20 },
        { name: 'Pepsi 330ml', code: 'BEV002', price: 110, cost_price: 75, quantity: 100, min_quantity: 20 },
        { name: 'Water Bottle 500ml', code: 'BEV003', price: 60, cost_price: 35, quantity: 200, min_quantity: 50 },
        { name: 'Chocolate Bar', code: 'SNK001', price: 85, cost_price: 55, quantity: 80, min_quantity: 15 },
        { name: 'Chips Pack', code: 'SNK002', price: 95, cost_price: 60, quantity: 120, min_quantity: 20 },
        { name: 'A4 Paper Pack', code: 'STN001', price: 950, cost_price: 750, quantity: 45, min_quantity: 10 },
        { name: 'Ballpoint Pen', code: 'STN002', price: 25, cost_price: 15, quantity: 300, min_quantity: 50 },
        { name: 'Notebook A5', code: 'STN003', price: 180, cost_price: 120, quantity: 60, min_quantity: 15 },
    ];

    for (const p of products) {
        try {
            await prisma.$executeRawUnsafe(
                `INSERT INTO "product" 
          (name, code, price, cost_price, quantity, min_quantity, company_id, branch_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())`,
                p.name, p.code, p.price, p.cost_price,
                p.quantity, p.min_quantity, company.id, branchMain.id,
            );
        } catch { /* skip */ }
    }
    console.log('✅ Products seeded: 8 items');

    console.log('');
    console.log('🎉 Seed completed!');
    console.log('─────────────────────────────');
    console.log('📋 Login Credentials:');
    console.log('   admin         / admin123');
    console.log('   manager_hq    / manager123');
    console.log('   cashier_hq    / cashier123');
    console.log('   manager_kandy / manager123');
    console.log('─────────────────────────────');

}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });