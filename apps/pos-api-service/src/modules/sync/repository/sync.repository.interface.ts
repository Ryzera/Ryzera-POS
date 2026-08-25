/**
 * Defines the contract for database operations needed by the sync service.
 * Separating the interface allows us to switch database implementations
 * without changing business logic.
 */
export interface ISyncRepository {
  create(data: any): Promise<any>;
  countByStatus(status: string): Promise<number>;
  findById(id: number): Promise<any>;
  updateStatus(id: number, status: string, error?: string | null, syncedAt?: Date, incrementAttempts?: boolean): Promise<any>;
}
