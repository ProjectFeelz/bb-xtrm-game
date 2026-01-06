const CACHE_VERSION = 'v1.0.7';
const CACHE_NAME = `bbxtrm-${CACHE_VERSION}`;
const DATA_CACHE = `bbxtrm-data-${CACHE_VERSION}`;

const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000,
  data: 30 * 1000,
  images: 24 * 60 * 60 * 1000
};

self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DATA_CACHE).then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request).then(cached => {
          if (cached) return cached;
          return new Response(JSON.stringify({ 
            error: 'Offline' 
          }), { headers: { 'Content-Type': 'application/json' } });
        }))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'refresh-data') {
    event.waitUntil(
      caches.delete(DATA_CACHE).then(() => {
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'DATA_REFRESHED' }));
        });
      })
    );
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'auto-refresh') {
    event.waitUntil(
      caches.delete(DATA_CACHE).then(() => console.log('[SW] Data cache cleared'))
    );
  }
});

self.addEventListener('message', event => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(CACHE_NAME),
        caches.delete(DATA_CACHE)
      ]).then(() => event.ports[0].postMessage({ success: true }))
    );
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

3. Save the file

#### **STEP 3: Verify file structure**
Your project should look like this:
```
bb-xtrm-game/
├── index.html
├── app.js (with duplicate line removed)
├── style.css
├── service-worker.js (NEW FILE YOU JUST CREATED)
├── manifest.json
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
