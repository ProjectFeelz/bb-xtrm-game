// =====================================================
// BB XTRM PRO STUDIO - SERVICE WORKER (FIXED)
// =====================================================

const CACHE_NAME = 'bb-xtrm-v1.0.1'; // Updated version
const RUNTIME_CACHE = 'bb-xtrm-runtime-v1';

// Assets that MUST exist for the game to work
const ESSENTIAL_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Assets that might be missing (like icons) - we handle these safely
const OPTIONAL_ASSETS = [
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // 1. Load essentials (if one fails, the whole thing fails)
            return cache.addAll(ESSENTIAL_ASSETS).then(() => {
                // 2. Load optional assets individually (if one fails, it's okay!)
                return Promise.allSettled(
                    [...OPTIONAL_ASSETS, ...EXTERNAL_ASSETS].map(url => 
                        cache.add(url).catch(err => console.log('[SW] Optional skip:', url))
                    )
                );
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event (Standard network-first strategy)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    const url = new URL(event.request.url);
    if (url.hostname.includes('supabase.co')) return;

    event.respondWith(
        fetch(event.request)
            .then(res => {
                const clone = res.clone();
                caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
                return res;
            })
            .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
});
