// Ryzera POS - Service Worker
// Version: 1.0.0
// Purpose: Offline caching, background sync, push notifications

const CACHE_NAME = 'ryzera-pos-v1';
const DYNAMIC_CACHE = 'ryzera-pos-dynamic-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/sync/dashboard',
  '/sync/settings',
  '/sync/errors',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network first with cache fallback & Stale-While-Revalidate for API
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Stale-While-Revalidate strategy for API GET requests (e.g., product catalog)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Fetch fresh data in the background
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[SW] Offline API fetch failed. Returning cached data if available.', err);
        });
        
        // Return cached instantly if it exists, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return; // Exit fetch handler early for API requests
  }

  // Standard Network-first for static assets and HTML pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline - try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline - No internet connection', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Background Sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync triggered:', event.tag);
  
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

// Function to sync pending data with backend
async function syncPendingData() {
  console.log('[SW] Starting background sync...');
  
  try {
    // Get all clients (open tabs)
    const clients = await self.clients.matchAll();
    
    // Notify all clients to sync
    clients.forEach(client => {
      client.postMessage({
        type: 'START_SYNC',
        message: 'Background sync started'
      });
    });
    
    // Open IndexedDB and get pending data
    // This will be handled by the main thread
    // Service worker just triggers the sync
    
    return true;
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    return false;
  }
}

// Push Notification Handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'Ryzera POS',
    body: 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'ryzera-notification',
    renotify: true,
    requireInteraction: true,
    data: {
      url: '/sync/dashboard',
      dateOfArrival: Date.now()
    }
  };

  if (event.data) {
    try {
      data = Object.assign({}, data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate,
    tag: data.tag,
    renotify: data.renotify,
    requireInteraction: data.requireInteraction,
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      const url = event.notification.data.url || '/sync/dashboard';
      
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message from main thread:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});