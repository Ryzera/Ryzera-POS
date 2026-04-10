/**
 * Interface for SyncRepository.
 * Defines the contract for data access methods used by the sync module.
 */
export interface ISyncRepository {
  /**
   * Returns a test message to verify repository is working.
   * @returns An object containing a message string.
   */
  getTestMessage(): { message: string };
}