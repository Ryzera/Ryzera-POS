import { Module } from '@nestjs/common';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [SyncModule],
})
export class AppModule {}