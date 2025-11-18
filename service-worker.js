// Name of the cache storage
const CACHE_NAME = 'focus-timer-v1';

// List of files to cache during installation
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // We assume the Tailwind CDN and placehold images are served from outside,
    // but the core files are cached here for basic offline functionality.
];

// Install event: Caches all necessary assets
self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and adding shell assets');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache assets during install:', error);
            })
    );
    self.skipWaiting();
});

// Fetch event: Intercepts network requests
self.addEventListener('fetch', event => {
    // We only try to serve content from the cache if the file is one we explicitly cached
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache - fetch from network
                return fetch(event.request);
            })
    );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});