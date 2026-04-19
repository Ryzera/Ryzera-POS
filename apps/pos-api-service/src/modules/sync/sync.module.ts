import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncRepository } from './repository/sync.repository';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [SyncController],
  providers: [SyncService, SyncRepository],
})
export class SyncModule {}