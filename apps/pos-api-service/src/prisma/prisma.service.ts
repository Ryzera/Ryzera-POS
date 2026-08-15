import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@ryzera/pos-database';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const isLocalDb = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalDb ? false : {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
    },
});

const adapter = new PrismaPg(pool);
const prismaInstance = new (PrismaClient as any)({ adapter });

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
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
    syncLog = prismaInstance.syncLog;
    syncMetric = prismaInstance.syncMetric;
    syncDevice = prismaInstance.syncDevice;
    syncConflict = prismaInstance.syncConflict;
    syncSetting = prismaInstance.syncSetting;
    syncCompany = prismaInstance.syncCompany;
    syncBackup = prismaInstance.syncBackup;
    notification = prismaInstance.notification;

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