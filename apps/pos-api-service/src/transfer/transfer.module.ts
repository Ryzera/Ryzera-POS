import { Module } from '@nestjs/common';

import { TransferController } from './transfer.controller';
import { TransferRepository } from './transfer.repository';
import { TransferService } from './transfer.service';

@Module({
  controllers: [TransferController],
  exports: [TransferService, TransferRepository],
  providers: [TransferService, TransferRepository],
})
export class TransferModule {}
