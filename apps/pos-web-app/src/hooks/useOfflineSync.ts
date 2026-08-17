import { useEffect, useState, useCallback } from 'react';
import { dbService } from '../services/indexedDB';
import toast from 'react-hot-toast';

// DESIGN RATIONALE: Named Constants to avoid Magic Numbers per clean code standards
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const MAX_RETRY_ATTEMPTS = 3;
const CIRCUIT_BREAKER_PAUSE_MS = 5 * 60 * 1000; // 5 minutes pause
const AUTO_SYNC_INTERVAL_MS = 30000; // 30 seconds interval

interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  isCircuitOpen: boolean;
  consecutiveFailures: number;
}

export function useOfflineSync() {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    isCircuitOpen: false,
    consecutiveFailures: 0
  });

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        await dbService.init();
        const pending = await dbService.getPendingCount();
        setState(prev => ({ ...prev, pendingCount: pending }));
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };
    initDB();
  }, []);

  /**
   * DESIGN RATIONALE: Offline Data Persistence & Priority Queueing.
   * Saves transaction payloads locally in browser IndexedDB when network connection fails,
   * stamping them with metadata (`status: PENDING`, `priority`, `last_modified`) so that
   * critical sales invoices (HIGH priority) are synced before routine logs upon reconnection.
   */
  const saveToIndexedDB = useCallback(async (storeName: string, data: any, priority: 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL') => {
    try {
      await dbService.init();
      // Inject Delta Sync Timestamp and Priority
      const payloadWithMetadata = {
        ...data,
        status: 'PENDING',
        priority,
        last_modified: new Date().toISOString() // Delta sync tracking
      };
      const saved = await dbService.add(storeName, payloadWithMetadata);
      const pending = await dbService.getPendingCount();
      setState(prev => ({ ...prev, pendingCount: pending }));
      toast.success('💾 Data saved offline. Will sync when online.');

      // Register background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-pending-data');
      }

      return saved;
    } catch (error) {
      console.error('Failed to save offline:', error);
      toast.error('Failed to save offline data');
      return null;
    }
  }, []);

  /**
   * DESIGN RATIONALE: Circuit Breaker & Priority-Ordered Sync-Back Engine.
   * Reads pending offline items sorted by priority (HIGH -> NORMAL -> LOW) and pushes them to NestJS.
   * Employs a Circuit Breaker pattern: 3 consecutive network failures trip the breaker,
   * pausing sync attempts for 5 minutes to prevent client CPU/battery drain and server DDOS during outages.
   */
  const syncPendingData = useCallback(async () => {
    if (!state.isOnline) {
      console.log('Offline - skipping sync');
      return;
    }

    if (state.isCircuitOpen) {
      console.warn('Circuit Breaker is OPEN. Pausing sync to prevent server overload.');
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      await dbService.init();
      // Use Priority Queue instead of normal fetch
      const pendingSales = await dbService.getAllPendingSortedByPriority();

      if (pendingSales.length === 0) {
        setState(prev => ({ ...prev, isSyncing: false, consecutiveFailures: 0, isCircuitOpen: false }));
        return;
      }

      toast.loading(`Syncing ${pendingSales.length} items (Priority Ordered)...`, { duration: 2000 });

      let syncedCount = 0;
      let failedCount = 0;

      for (const sale of pendingSales) {
        try {
          const response = await fetch(`${API_BASE}/sync/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity: 'sale',
              payload: sale,
              status: 'PENDING'
            })
          });

          if (response.ok) {
            await dbService.delete('pendingSales', sale.id);
            syncedCount++;
          } else {
            failedCount++;
            // Update attempts
            await dbService.update('pendingSales', sale.id, {
              attempts: (sale.attempts || 0) + 1
            });
          }
        } catch (error) {
          failedCount++;
          console.error(`Sync failed for sale ${sale.id}:`, error);
        }
      }

      const pending = await dbService.getPendingCount();

      // Circuit Breaker Logic
      if (failedCount > 0 && syncedCount === 0) {
        const newFailures = state.consecutiveFailures + 1;
        const shouldOpenCircuit = newFailures >= MAX_RETRY_ATTEMPTS;

        setState(prev => ({
          ...prev,
          pendingCount: pending,
          isSyncing: false,
          consecutiveFailures: newFailures,
          isCircuitOpen: shouldOpenCircuit
        }));

        if (shouldOpenCircuit) {
          toast.error(`⚠️ Server unreachable. Sync paused for ${CIRCUIT_BREAKER_PAUSE_MS / 60000} minutes.`);
          // Auto-close circuit after pause duration
          setTimeout(() => {
            setState(prev => ({ ...prev, isCircuitOpen: false, consecutiveFailures: 0 }));
            toast('🔄 Retrying sync connection...');
          }, CIRCUIT_BREAKER_PAUSE_MS);
        } else {
          toast.error(`❌ Failed to sync. Attempt ${newFailures}/${MAX_RETRY_ATTEMPTS}`);
        }
      } else {
        // Success - reset breaker
        setState(prev => ({
          ...prev,
          pendingCount: pending,
          isSyncing: false,
          lastSyncTime: new Date(),
          consecutiveFailures: 0,
          isCircuitOpen: false
        }));

        if (syncedCount > 0) {
          toast.success(`✅ Synced ${syncedCount} high-priority items!`);
        }
      }

    } catch (error) {
      console.error('Sync error:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      toast.error('Sync failed. Will retry later.');
    }
  }, [state.isOnline, state.isCircuitOpen, state.consecutiveFailures]);

  // Manual sync trigger
  const manualSync = useCallback(async () => {
    if (!state.isOnline) {
      toast.error('Cannot sync while offline');
      return false;
    }
    await syncPendingData();
    return true;
  }, [state.isOnline, syncPendingData]);

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online!');
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('🟢 Back online! Syncing data...');
      await syncPendingData();
    };

    const handleOffline = () => {
      console.log('Going offline');
      setState(prev => ({ ...prev, isOnline: false }));
      toast.error('🔴 You are offline. Sales will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingData]);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'START_SYNC') {
        console.log('Service worker requested sync');
        syncPendingData();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [syncPendingData]);

  // Auto-sync every 30 seconds when online
  useEffect(() => {
    if (!state.isOnline) return;

    const interval = setInterval(() => {
      syncPendingData();
    }, AUTO_SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state.isOnline, syncPendingData]);

  // Delta Sync worker
  const pullDeltaUpdates = useCallback(async () => {
    if (!state.isOnline) return;
    const lastSync = typeof window !== 'undefined' ? localStorage.getItem('last_delta_sync') || new Date(0).toISOString() : new Date(0).toISOString();

    try {
      const res = await fetch(`${API_BASE}/sync/delta?since=${encodeURIComponent(lastSync)}`);
      if (res.ok) {
        const data = await res.json();
        const payload = data.data || data;
        if (payload.products && payload.products.length > 0) {
          await dbService.init();
          for (const item of payload.products) {
            await dbService.add('products', item);
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_delta_sync', payload.syncedAt || new Date().toISOString());
        }
      }
    } catch (err) {
      console.error('Delta sync background check failed:', err);
    }
  }, [state.isOnline]);

  return {
    isOnline: state.isOnline,
    pendingCount: state.pendingCount,
    isSyncing: state.isSyncing,
    lastSyncTime: state.lastSyncTime,
    isCircuitOpen: state.isCircuitOpen,
    consecutiveFailures: state.consecutiveFailures,
    saveToIndexedDB,
    syncPendingData: manualSync,
    pullDeltaUpdates
  };
}