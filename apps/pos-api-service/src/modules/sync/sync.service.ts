
import { Injectable } from '@nestjs/common';
import { SyncRepository } from './repository/sync.repository';

@Injectable()
export class SyncService {
  constructor(private readonly syncRepository: SyncRepository) {}

  getTest() {
    return this.syncRepository.getTestMessage();
  }
}