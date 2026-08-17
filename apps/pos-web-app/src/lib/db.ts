import Dexie, { Table } from 'dexie';

export interface SyncLogLocal {
  id?: number;
  entity: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  error?: string;
  created_at: Date;
  updated_at: Date;
}

export class RyzeraDatabase extends Dexie {
  syncQueue!: Table<SyncLogLocal, number>;

  constructor() {
    super('RyzeraPOSLocalDB');
    this.version(1).stores({
      syncQueue: '++id, entity, operation, status, created_at'
    });
  }
}

export const db = new RyzeraDatabase();
