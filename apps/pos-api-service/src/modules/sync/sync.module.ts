import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncRepository } from './repository/sync.repository';

@Module({
  controllers: [SyncController],
  providers: [SyncService, SyncRepository],
})
export class SyncModule {}