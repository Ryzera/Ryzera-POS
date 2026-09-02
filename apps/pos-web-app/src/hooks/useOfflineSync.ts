'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

export type OfflineSyncRecord = {
  entity: string;
  payload: any;
  branchId?: number | null;
  companyId?: number | null;
  endpoint?: string;
  method?: 'POST' | 'PATCH' | 'PUT';
  requestBody?: any;
  requestParams?: Record<string, any>;
};

type QueueRecord = OfflineSyncRecord & {
  id: string;
  createdAt: string;
};

type RuntimeSettings = {
  realTimeSync: boolean;
  backgroundRefresh: boolean;
  syncMode: 'REALTIME' | 'BATCH';
  syncIntervalMinutes: number;
  maxRetries: number;
};

const DB_NAME = 'RyzeraPOSDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineQueue';
const LEGACY_STORAGE_KEY = 'ryzera-sync-offline-queue';

let databasePromise: Promise<IDBDatabase> | null = null;
let migrationPromise: Promise<void> | null = null;

function canUseIndexedDB() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openQueueDatabase(): Promise<IDBDatabase> {
  if (!canUseIndexedDB()) {
    return Promise.reject(new Error('IndexedDB is not available in this browser'));
  }

  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'));
  });

  databasePromise.catch(() => {
    databasePromise = null;
  });

  return databasePromise;
}

async function migrateLegacyLocalStorage(database: IDBDatabase) {
  if (typeof window === 'undefined') return;

  let legacyRecords: QueueRecord[] = [];
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    legacyRecords = Array.isArray(parsed) ? parsed : [];
  } catch {
    return;
  }

  if (legacyRecords.length > 0) {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      legacyRecords.forEach((record) => store.put(record));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Legacy queue migration failed'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Legacy queue migration aborted'));
    });
  }

  // Remove the old queue only after it has been copied successfully.
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

async function getQueueDatabase() {
  const database = await openQueueDatabase();
  if (!migrationPromise) {
    migrationPromise = migrateLegacyLocalStorage(database);
  }
  await migrationPromise;
  return database;
}

async function readQueue(): Promise<QueueRecord[]> {
  if (!canUseIndexedDB()) return [];

  try {
    const database = await getQueueDatabase();
    return await new Promise<QueueRecord[]>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      request.onsuccess = () => {
        const records = Array.isArray(request.result) ? (request.result as QueueRecord[]) : [];
        resolve(records.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      };
      request.onerror = () => reject(request.error ?? new Error('Unable to read offline queue'));
    });
  } catch (error) {
    console.error('IndexedDB queue read failed:', error);
    return [];
  }
}

async function writeQueueRecord(record: QueueRecord) {
  const database = await getQueueDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Unable to write offline queue record'));
  });
}

async function deleteQueueRecord(id: string) {
  const database = await getQueueDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Unable to delete offline queue record'));
  });
}

export async function enqueueOfflineSync(record: OfflineSyncRecord) {
  const next: QueueRecord = {
    ...record,
    id: `${record.entity}-${record.payload?.id ?? Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  await writeQueueRecord(next);
  return next;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [runtimeSettings, setRuntimeSettings] = useState<RuntimeSettings>({
    realTimeSync: true,
    backgroundRefresh: true,
    syncMode: 'REALTIME',
    syncIntervalMinutes: 30,
    maxRetries: 5,
  });

  const refreshCount = useCallback(async () => {
    const queue = await readQueue();
    setPendingCount(queue.length);
  }, []);

  const enqueue = useCallback(
    async (record: OfflineSyncRecord) => {
      const next = await enqueueOfflineSync(record);
      await refreshCount();
      return next;
    },
    [refreshCount],
  );

  const loadRuntimeSettings = useCallback(async () => {
    try {
      const response = await api.get('/sync/settings/runtime');
      const data = response?.data?.data || response?.data || {};
      setRuntimeSettings((previous) => ({
        ...previous,
        realTimeSync: data.realTimeSync !== false,
        backgroundRefresh: data.backgroundRefresh !== false,
        syncMode: data.networkPolicy?.syncMode === 'BATCH' ? 'BATCH' : 'REALTIME',
        syncIntervalMinutes: Math.max(1, Number(data.syncIntervalMinutes) || previous.syncIntervalMinutes),
        maxRetries: Math.max(1, Number(data.maxRetries) || previous.maxRetries),
      }));
    } catch (error) {
      console.warn('Sync runtime settings unavailable; using safe defaults.', error);
    }
  }, []);

  const syncPendingData = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine || isSyncing) return;

    const queue = await readQueue();
    if (queue.length === 0) {
      setPendingCount(0);
      return;
    }

    setIsSyncing(true);
    let failures = 0;
    try {
      for (const record of queue) {
        let delivered = false;
        for (let attempt = 1; attempt <= runtimeSettings.maxRetries; attempt += 1) {
          try {
            if (record.endpoint) {
              await api.request({
                url: record.endpoint,
                method: record.method ?? 'POST',
                data: record.requestBody ?? record.payload,
                params: record.requestParams,
              });
            } else {
              await api.post('/sync/push', {
                entity: record.entity,
                payload: record.payload,
                branchId: record.branchId ?? null,
                companyId: record.companyId ?? null,
              });
            }
            delivered = true;
            break;
          } catch {
            if (attempt < runtimeSettings.maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 250, 1000)));
            }
          }
        }
        if (delivered) await deleteQueueRecord(record.id);
        else failures += 1;
      }

      await refreshCount();
      setConsecutiveFailures(failures);
      if (failures === 0) setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshCount, runtimeSettings.maxRetries]);

  useEffect(() => {
    void loadRuntimeSettings();
  }, [loadRuntimeSettings]);

  useEffect(() => {
    if (!runtimeSettings.backgroundRefresh) return;
    const intervalMs = Math.max(1, runtimeSettings.syncIntervalMinutes) * 60 * 1000;
    const timer = window.setInterval(() => {
      void syncPendingData();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [runtimeSettings.backgroundRefresh, runtimeSettings.syncIntervalMinutes, syncPendingData]);

  useEffect(() => {
    const online = () => {
      setIsOnline(true);
      if (runtimeSettings.realTimeSync && runtimeSettings.syncMode === 'REALTIME') void syncPendingData();
    };
    const offline = () => setIsOnline(false);

    setIsOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    void refreshCount();
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, [refreshCount, runtimeSettings.realTimeSync, runtimeSettings.syncMode, syncPendingData]);

  return useMemo(
    () => ({
      isOnline,
      pendingCount,
      isSyncing,
      lastSyncTime,
      isCircuitOpen: consecutiveFailures >= 3,
      consecutiveFailures,
      syncPendingData,
      enqueue,
      refreshCount,
    }),
    [isOnline, pendingCount, isSyncing, lastSyncTime, consecutiveFailures, syncPendingData, enqueue, refreshCount],
  );
}

export default useOfflineSync;
