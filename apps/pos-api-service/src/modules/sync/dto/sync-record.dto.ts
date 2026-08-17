export interface SyncRecordDto {
  id: number;
  branchId: number | null;
  entity: string;
  data: any; // payload renamed to data
  status: string;
  error?: string | null;
  attempts: number;
  createdAt: string;
  syncedAt?: string | null;
}
