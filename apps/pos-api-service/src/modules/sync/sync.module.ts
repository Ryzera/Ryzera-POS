import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncRepository } from './repository/sync.repository';
import { EmailModule } from '../../email/email.module';
import { NotificationModule } from '../../notification/notification.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { BackupService } from './backup.service';

import { SyncGateway } from './sync.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EmailModule,
    NotificationModule,
    PrismaModule,
  ],
  controllers: [SyncController],
  providers: [SyncService, SyncRepository, BackupService, SyncGateway],
  exports: [SyncService],
})
export class SyncModule {}
