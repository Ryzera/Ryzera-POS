
/**
 * Root application module.
 * Imports PrismaModule (global database access) and SyncModule.
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SyncModule } from './modules/sync/sync.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, SyncModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}