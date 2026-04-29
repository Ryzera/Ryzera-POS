import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@ryzera/pos-database';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

// Global instance — type assertion fix
const prismaInstance = new (PrismaClient as any)({ adapter });

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {

    // Proxy all prisma calls
    user = prismaInstance.user;
    userInfo = prismaInstance.userInfo;
    company = prismaInstance.company;
    branch = prismaInstance.branch;
    role = prismaInstance.role;
    authority = prismaInstance.authority;
    userRole = prismaInstance.userRole;
    roleAuthority = prismaInstance.roleAuthority;
    userLog = prismaInstance.userLog;
    product = prismaInstance.product;
    bill = prismaInstance.bill;
    billItem = prismaInstance.billItem;

    $connect = () => prismaInstance.$connect();
    $disconnect = () => prismaInstance.$disconnect();
    $executeRaw = prismaInstance.$executeRaw.bind(prismaInstance);
    $executeRawUnsafe = prismaInstance.$executeRawUnsafe.bind(prismaInstance);
    $queryRaw = prismaInstance.$queryRaw.bind(prismaInstance);

    async onModuleInit() {
        await prismaInstance.$connect();
    }

    async onModuleDestroy() {
        await prismaInstance.$disconnect();
    }
}