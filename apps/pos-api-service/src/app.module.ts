
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SyncModule } from './sync/sync.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [SyncModule, PrismaModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}