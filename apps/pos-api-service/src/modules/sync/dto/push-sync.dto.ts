export class PushSyncDto {
  companyId?: string;
  branchId?: string;
  entity: string;
  payload: Record<string, any>;
}