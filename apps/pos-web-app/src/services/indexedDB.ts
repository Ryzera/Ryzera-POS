// IndexedDB Service for Offline Storage
// Purpose: Store data offline when internet is not available

const DB_NAME = 'RyzeraPOSDB';
const DB_VERSION = 2;

interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; options?: IDBIndexParameters }[];
}

const stores: StoreConfig[] = [
  {
    name: 'pendingSales',
    keyPath: 'id',
    indexes: [
      { name: 'byStatus', keyPath: 'status' },
      { name: 'byDate', keyPath: 'createdAt' },
      { name: 'byPriority', keyPath: 'priority' }
    ]
  },
  {
    name: 'offlineProducts',
    keyPath: 'id',
    indexes: [
      { name: 'byName', keyPath: 'name' },
      { name: 'byCategory', keyPath: 'category' }
    ]
  },
  {
    name: 'syncQueue',
    keyPath: 'id',
    indexes: [
      { name: 'byStatus', keyPath: 'status' },
      { name: 'byAttempts', keyPath: 'attempts' }
    ]
  },
  {
    name: 'settings',
    keyPath: 'key'
  },
  {
    name: 'failedSync',
    keyPath: 'id',
    indexes: [
      { name: 'byError', keyPath: 'error' },
      { name: 'byDate', keyPath: 'createdAt' }
    ]
  }
];

/**
 * DESIGN RATIONALE: Browser-side IndexedDB Storage Wrapper.
 * Provides asynchronous, high-capacity client storage (hundreds of MBs) for offline POS operations.
 * Chosen over LocalStorage because LocalStorage is synchronous (blocks the UI thread) and limited to 5MB,
 * whereas IndexedDB supports structured JSON stores, indexing, and multi-level priority queues.
 */
export class IndexedDBService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB connected successfully');

        // Handle database close
        this.db.onclose = () => {
          console.log('IndexedDB connection closed');
          this.isInitialized = false;
          this.db = null;
        };

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('Creating/upgrading IndexedDB stores...');

        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });

            if (store.indexes) {
              store.indexes.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath, index.options);
              });
            }
            console.log(`Created store: ${store.name}`);
          }
        });
      };
    });
  }

  async add<T extends Record<string, any>>(storeName: string, data: T): Promise<T> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Add timestamp if not present
      const dataWithTimestamp = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = store.add(dataWithTimestamp);

      request.onsuccess = () => resolve(dataWithTimestamp);
      request.onerror = () => reject(request.error);
    });
  }

  async addMany<T extends Record<string, any>>(storeName: string, items: T[]): Promise<T[]> {
    await this.ensureInitialized();

    const results: T[] = [];
    for (const item of items) {
      const result = await this.add(storeName, item);
      results.push(result);
    }
    return results;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, key: string, data: Partial<T>): Promise<T> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // First get existing data
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        const existingData = getRequest.result;
        if (!existingData) {
          reject(new Error(`Item with key ${key} not found`));
          return;
        }

        const updatedData = {
          ...existingData,
          ...data,
          updatedAt: new Date().toISOString()
        };

        const putRequest = store.put(updatedData);
        putRequest.onsuccess = () => resolve(updatedData);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async upsert<T extends Record<string, any>>(storeName: string, key: string, data: T): Promise<T> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const dataWithTimestamp = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      const request = store.put(dataWithTimestamp);

      request.onsuccess = () => resolve(dataWithTimestamp);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMany(storeName: string, keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(storeName, key);
    }
  }

  async clearStore(storeName: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName: string): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async countByStatus(storeName: string, status: string): Promise<number> {
    const items = await this.getByIndex(storeName, 'byStatus', status);
    return items.length;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      await this.init();
    }
  }

  async getPendingCount(): Promise<number> {
    return this.countByStatus('pendingSales', 'PENDING');
  }

  async getAllPending(): Promise<any[]> {
    return this.getByIndex('pendingSales', 'byStatus', 'PENDING');
  }

  /**
   * Retrieves all pending items from IndexedDB, sorted by Priority (HIGH -> NORMAL -> LOW).
   * This ensures critical business data (like Sales) is synced to the server first.
   * 
   * @returns Array of pending items sorted by priority.
   */
  async getAllPendingSortedByPriority(): Promise<any[]> {
    const allPending = await this.getAllPending();

    // Sort logic: HIGH before NORMAL before LOW
    const priorityWeight: Record<string, number> = { 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 };

    return allPending.sort((a, b) => {
      const weightA = priorityWeight[a.priority || 'NORMAL'] || 2;
      const weightB = priorityWeight[b.priority || 'NORMAL'] || 2;
      return weightB - weightA; // Descending order
    });
  }

  /**
   * Saves a sale to the offline storage (IndexedDB).
   * Automatically sets the status to PENDING and assigns a priority.
   * 
   * @param saleData The sale payload to store.
   * @param priority Priority level (HIGH, NORMAL, LOW). Defaults to HIGH for sales.
   * @returns The saved record.
   */
  async saveSaleOffline(saleData: any, priority: 'HIGH' | 'NORMAL' | 'LOW' = 'HIGH'): Promise<any> {
    const saleWithStatus = {
      ...saleData,
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      priority,
      attempts: 0,
      maxAttempts: 5
    };
    return this.add('pendingSales', saleWithStatus);
  }

  async addToSyncQueue(data: any): Promise<any> {
    const queueItem = {
      ...data,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      attempts: 0,
      createdAt: new Date().toISOString()
    };
    return this.add('syncQueue', queueItem);
  }

  async getSettings(key: string): Promise<any> {
    return this.get('settings', key);
  }

  async saveSettings(key: string, value: any): Promise<any> {
    return this.upsert('settings', key, { key, value });
  }
}

export const dbService = new IndexedDBService();