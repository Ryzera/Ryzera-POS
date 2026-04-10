import { Injectable } from '@nestjs/common';

@Injectable()
export class SyncRepository {
  getTestMessage() {
    return { message: 'Sync module working' };
  }
}