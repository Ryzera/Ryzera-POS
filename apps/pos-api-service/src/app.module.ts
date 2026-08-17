import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CompanyModule } from './company/company.module';
import { BranchModule } from './branch/branch.module';
import { InventoryModule } from './inventory/inventory.module';
import { BillingModule } from './billing/billing.module';
import { BackupModule } from './backup/backup.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CompanyModule,
    BranchModule,
    InventoryModule,
    BillingModule,
    BackupModule,
    ScheduleModule.forRoot(),
    SyncModule,
  ],
})
export class AppModule {}
