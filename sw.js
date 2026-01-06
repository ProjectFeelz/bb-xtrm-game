const CACHE_VERSION = 'v1.0.7'; // Increment this when you deploy updates
const CACHE_NAME = `bbxtrm-${CACHE_VERSION}`;
const DATA_CACHE = `bbxtrm-data-${CACHE_VERSION}`;

// Files to cache immediately
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Cache duration settings
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000,      // 7 days for static files
  data: 5 * 60 * 1000,                   // 5 minutes for API data
  images: 24 * 60 * 60 * 1000            // 24 hours for images
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_CACHE_FILES);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests - Network First with auto-refresh
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone response before caching
          const responseClone = response.clone();
          
          // Cache the fresh data
          caches.open(DATA_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then(cached => {
            if (cached) {
              console.log('[SW] Serving stale API data from cache');
              return cached;
            }
            // No cache, return offline response
            return new Response(JSON.stringify({ 
              error: 'Offline', 
              message: 'No connection and no cached data' 
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets - Cache First with background update
  event.respondWith(
    caches.match(request).then(cached => {
      // Fetch fresh version in background
      const fetchPromise = fetch(request).then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
        return response;
      }).catch(() => cached); // Fallback to cached if network fails

      // Return cached immediately, or wait for network
      return cached || fetchPromise;
    })
  );
});

// Background sync for data refresh
self.addEventListener('sync', event => {
  if (event.tag === 'refresh-data') {
    console.log('[SW] Background sync: refreshing data');
    event.waitUntil(
      // Clear data cache and force refetch
      caches.delete(DATA_CACHE).then(() => {
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'DATA_REFRESHED' });
          });
        });
      })
    );
  }
});

// Periodic background sync (Chrome only)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'auto-refresh') {
    console.log('[SW] Periodic sync: auto-refreshing cache');
    event.waitUntil(
      caches.delete(DATA_CACHE).then(() => {
        console.log('[SW] Data cache cleared for fresh data');
      })
    );
  }
});

// Message handler for manual cache clear
self.addEventListener('message', event => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(CACHE_NAME),
        caches.delete(DATA_CACHE)
      ]).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
