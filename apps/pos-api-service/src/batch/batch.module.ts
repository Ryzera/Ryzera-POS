import { Module } from '@nestjs/common';

import { BatchController } from './batch.controller';
import { BatchRepository } from './batch.repository';
import { BatchService } from './batch.service';

@Module({
  controllers: [BatchController],
  exports: [BatchService, BatchRepository],
  providers: [BatchService, BatchRepository],
})
export class BatchModule {}
