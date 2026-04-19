import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Create Roles
    const roles = ['ADMIN', 'CASHIER', 'INVENTORY_MANAGER', 'BUSINESS_OWNER'];
    for (const name of roles) {
        await prisma.ryzeraRole.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log('✅ Roles created');

    // 2. Create Authorities
    const authorities = [
        'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE',
        'SALE_CREATE', 'SALE_READ',
        'INVENTORY_CREATE', 'INVENTORY_READ', 'INVENTORY_UPDATE',
        'REPORT_READ',
    ];
    for (const name of authorities) {
        await prisma.ryzeraAuthority.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log('✅ Authorities created');

    // 3. Assign all authorities to ADMIN
    const adminRole = await prisma.ryzeraRole.findUnique({ where: { name: 'ADMIN' } });
    const allAuthorities = await prisma.ryzeraAuthority.findMany();
    for (const auth of allAuthorities) {
        await prisma.ryzeraRoleAuthority.upsert({
            where: {
                roleId_authorityId: { roleId: adminRole!.id, authorityId: auth.id },
            },
            update: {},
            create: { roleId: adminRole!.id, authorityId: auth.id },
        });
    }
    console.log('✅ Admin authorities assigned');

    // 4. Create default Admin user
    const hashedPassword = await bcrypt.hash('Admin@1234', 12);
    await prisma.ryzeraUser.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            info: {
                create: {
                    firstName: 'System',
                    lastName: 'Admin',
                    email: 'admin@ryzera.com',
                },
            },
            userRoles: {
                create: { roleId: adminRole!.id },
            },
        },
    });
    console.log('✅ Admin user created (username: admin, password: Admin@1234)');
}

main()
    .catch(console.error)
    .finally(async () => {
        await pool.end();
    });