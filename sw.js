// =====================================================
// BB XTRM PRO STUDIO - SERVICE WORKER
// Configured for Netlify deployment
// =====================================================

const CACHE_NAME = 'bb-xtrm-v1.0.0';
const RUNTIME_CACHE = 'bb-xtrm-runtime-v1';

// Assets to cache on install (static assets)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                // Cache external resources separately (may fail)
                return caches.open(CACHE_NAME).then((cache) => {
                    return Promise.allSettled(
                        EXTERNAL_ASSETS.map(url => 
                            cache.add(url).catch(err => 
                                console.log('[SW] Failed to cache:', url, err)
                            )
                        )
                    );
                });
            })
            .then(() => {
                console.log('[SW] Install complete');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip Supabase API requests (always network)
    if (url.hostname.includes('supabase.co') || 
        url.hostname.includes('supabase.io')) {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // For navigation requests, use network-first strategy
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            return cachedResponse || caches.match('/index.html');
                        });
                })
        );
        return;
    }
    
    // For static assets, use cache-first strategy
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // Return cache but update in background
                        fetch(event.request).then((response) => {
                            if (response.ok) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, response);
                                });
                            }
                        }).catch(() => {});
                        
                        return cachedResponse;
                    }
                    
                    // Not in cache, fetch from network
                    return fetch(event.request)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Network response not ok');
                            }
                            
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                            
                            return response;
                        });
                })
        );
        return;
    }
    
    // For Google Fonts, use cache-first with long expiry
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    return cachedResponse || fetch(event.request)
                        .then((response) => {
                            const responseClone = response.clone();
                            caches.open(RUNTIME_CACHE).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                            return response;
                        });
                })
        );
        return;
    }
    
    // Default: network-first with cache fallback
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((names) => {
            return Promise.all(names.map((name) => caches.delete(name)));
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Background sync for offline session saves (future feature)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-sessions') {
        console.log('[SW] Background sync: sync-sessions');
        // Implementation for syncing offline sessions
    }
});

console.log('[SW] Service worker loaded');
