import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SyncModule } from './modules/sync/sync.module'; // ✅ ADD THIS

@Module({
  imports: [SyncModule], // ✅ ADD HERE
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}