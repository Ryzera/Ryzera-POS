import { Injectable } from '@nestjs/common';
import { ISyncRepository } from './sync.repository.interface';

/**
 * Implementation of SyncRepository.
 * Acts as a data access layer (placeholder for future database operations).
 */
@Injectable()
export class SyncRepository implements ISyncRepository {
  /**
   * Returns a test message.
   * @returns An object with a message property.
   */
  getTestMessage() {
    return { message: 'Sync module working' };
  }
}