import { Injectable } from '@nestjs/common';

@Injectable()
export class SyncService {
  getTest() {
    return { message: 'Sync module working' };
  }
}