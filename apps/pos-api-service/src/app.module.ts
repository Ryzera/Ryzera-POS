import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SyncModule } from './modules/sync/sync.module';
import { EmailModule } from './email/email.module';
import { SettingsModule } from './settings/settings.module';
import { BackupModule } from './backup/backup.module';
import { NotificationModule } from './notification/notification.module';

/**
 * Root module that imports all feature modules.
 * ScheduleModule enables cron jobs for background sync tasks.
 * Each feature module is responsible for its own controllers and services.
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    SyncModule,
    EmailModule,
    SettingsModule,
    BackupModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}