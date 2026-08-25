import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@ryzera/pos-database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) throw new Error('DATABASE_URL missing');

        const pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false,
                checkServerIdentity: () => undefined,
            },
        });

        const adapter = new PrismaPg(pool);
        super({ adapter } as any);
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
/*import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PrismaClient } from '@ryzera/pos-database';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
    },
});

const adapter = new PrismaPg(pool);
const prismaInstance = new (PrismaClient as any)({ adapter });

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    // Auth module
    user = prismaInstance.user;
    userInfo = prismaInstance.userInfo;
    company = prismaInstance.company;
    branch = prismaInstance.branch;
    role = prismaInstance.role;
    authority = prismaInstance.authority;
    userRole = prismaInstance.userRole;
    roleAuthority = prismaInstance.roleAuthority;
    userLog = prismaInstance.userLog;

    // Inventory module
    product = prismaInstance.product;
    supplier = prismaInstance.supplier;
    category = prismaInstance.category;
    branchProduct = prismaInstance.branchProduct;
    inventoryLog = prismaInstance.inventoryLog;
    stockAlert = prismaInstance.stockAlert;
    purchaseOrder = prismaInstance.purchaseOrder;
    purchaseOrderItem = prismaInstance.purchaseOrderItem;
    purchaseInvoice = prismaInstance.purchaseInvoice;
    transfer = prismaInstance.transfer;
    transferItem = prismaInstance.transferItem;
    batch = prismaInstance.batch;

    // Billing module
    bill = prismaInstance.bill;
    billItem = prismaInstance.billItem;
    sale = prismaInstance.sale;
    saleItem = prismaInstance.saleItem;
    payment = prismaInstance.payment;
    return = prismaInstance.return;
    returnItem = prismaInstance.returnItem;

    // Sync module
    syncLog = prismaInstance.syncLog;
    syncDevice = prismaInstance.syncDevice;
    syncSetting = prismaInstance.syncSetting;
    syncConflict = prismaInstance.syncConflict;
    syncBackup = prismaInstance.syncBackup;
    syncBackupSchedule = prismaInstance.syncBackupSchedule;
    syncHealthMetric = prismaInstance.syncHealthMetric;
    syncAuditLog = prismaInstance.syncAuditLog;

    // Notification
    notification = prismaInstance.notification;

    // Reporting module
    dailySummary = prismaInstance.dailySummary;
    savedReportConfig = prismaInstance.savedReportConfig;
    reportSchedule = prismaInstance.reportSchedule;
    reportDelivery = prismaInstance.reportDelivery;
    auditLog = prismaInstance.auditLog;
    kpiTarget = prismaInstance.kpiTarget;
    kpiMarginTarget = prismaInstance.kpiMarginTarget;
    kpiInventoryThreshold = prismaInstance.kpiInventoryThreshold;
    kpiNotificationRule = prismaInstance.kpiNotificationRule;
    kpiReportDefault = prismaInstance.kpiReportDefault;
    scheduledReport = prismaInstance.scheduledReport;

    $connect = () => prismaInstance.$connect();
    $disconnect = () => prismaInstance.$disconnect();
    $executeRaw = prismaInstance.$executeRaw.bind(prismaInstance);
    $executeRawUnsafe = prismaInstance.$executeRawUnsafe.bind(prismaInstance);
    $queryRaw = prismaInstance.$queryRaw.bind(prismaInstance);
    $transaction = prismaInstance.$transaction.bind(prismaInstance);

    async onModuleInit() {
        await prismaInstance.$connect();
    }

    async onModuleDestroy() {
        await prismaInstance.$disconnect();
    }
}*/