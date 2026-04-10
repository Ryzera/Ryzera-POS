/**
 * Data Transfer Object for POST /api/sync/push.
 */
export class PushSyncDto {
  /** Optional company ID (for multi-branch support) */
  companyId?: string;
  /** Optional branch ID (for multi-branch support) */
  branchId?: string;
  /** Entity type being synced (e.g., 'product', 'sale') */
  entity: string;
  /** Actual data payload (flexible JSON object) */
  payload: Record<string, any>;
}