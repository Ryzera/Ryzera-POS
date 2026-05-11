import { useEffect, useState, useCallback } from 'react';
import { dbService } from '../services/indexedDB';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

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

  // Save data to IndexedDB (offline)
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
        await registration.sync.register('sync-pending-data');
      }
      
      return saved;
    } catch (error) {
      console.error('Failed to save offline:', error);
      toast.error('Failed to save offline data');
      return null;
    }
  }, []);

  // Sync pending data with backend
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
        const shouldOpenCircuit = newFailures >= 3;
        
        setState(prev => ({ 
          ...prev, 
          pendingCount: pending,
          isSyncing: false,
          consecutiveFailures: newFailures,
          isCircuitOpen: shouldOpenCircuit
        }));

        if (shouldOpenCircuit) {
          toast.error('⚠️ Server unreachable. Sync paused for 5 minutes.');
          // Auto-close circuit after 5 minutes
          setTimeout(() => {
            setState(prev => ({ ...prev, isCircuitOpen: false, consecutiveFailures: 0 }));
            toast.info('🔄 Retrying sync connection...');
          }, 5 * 60 * 1000);
        } else {
          toast.error(`❌ Failed to sync. Attempt ${newFailures}/3`);
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
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [state.isOnline, syncPendingData]);

  return {
    isOnline: state.isOnline,
    pendingCount: state.pendingCount,
    isSyncing: state.isSyncing,
    lastSyncTime: state.lastSyncTime,
    saveToIndexedDB,
    syncPendingData: manualSync
  };
}