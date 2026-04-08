import { Injectable } from '@nestjs/common';
import { ISyncRepository } from './sync.repository.interface';

@Injectable()
export class SyncRepository implements ISyncRepository {
  getTestMessage() {
    return { message: 'Sync module working' };
  }
}