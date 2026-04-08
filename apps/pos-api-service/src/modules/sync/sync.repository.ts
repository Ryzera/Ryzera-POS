import { Injectable } from '@nestjs/common';

@Injectable()
export class SyncRepository {
  // Returns a test message (placeholder for future database logic)
  getTestMessage() {
    return { message: 'Sync module working' };
  }
}