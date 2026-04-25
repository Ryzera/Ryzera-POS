/**
 * Defines the contract for database operations needed by the sync service.
 * Separating the interface allows us to switch database implementations
 * without changing business logic.
 */
export interface ISyncRepository {
  create(data: any): Promise<any>;
  countByStatus(status: string): Promise<number>;
  findById(id: string): Promise<any>;
  updateStatus(id: string, status: string, error?: string | null, syncedAt?: Date, incrementAttempts?: boolean): Promise<any>;
}