self.addEventListener('install', (event) => {
    self.skipWaiting(); // Immediately activate the new service worker
    event.waitUntil(
        caches.open('static-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/static/js/main.16fb2fc7.js',
                '/logo192.png',
                '/favicon.ico'
            ]);
        }).catch((err) => {
            console.error('Cache open failed during install:', err);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                console.error('Fetch error:', event.request.url);
                return new Response('Offline content not available', {
                    status: 503,
                    statusText: 'Service Unavailable',
                });
            });
        })
    );
});

// Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => cacheName !== 'static-v1')
                    .map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            return self.clients.claim();
        }).catch((err) => {
            console.error('Activation error:', err);
        })
    );
});

// Handle service worker communication
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
