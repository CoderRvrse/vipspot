// ==== Version every deploy (use date or git sha) ====
const CACHE_VER = '__BUILD_VER__';
const HTML_CACHE = `html-${CACHE_VER}`;
const ASSET_CACHE = `assets-${CACHE_VER}`;

// Take control ASAP
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(ASSET_CACHE)); // warm cache later
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // purge old caches
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![HTML_CACHE, ASSET_CACHE].includes(k))
                         .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Strategy: network-first for HTML (never ship stale pages)
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  // HTML: network first, fallback to cache if offline
  const isHTML = req.headers.get('accept')?.includes('text/html');
  if (isHTML) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(HTML_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(HTML_CACHE);
        const match = await cache.match(req);
        return match || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Assets (CSS/JS/fonts/images): cache-first, update in background
  const isAsset = /\.(?:css|js|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp)$/.test(url.pathname);
  if (isAsset) {
    e.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(req);
      const fetchAndStore = fetch(req).then(r => {
        if (r.ok) cache.put(req, r.clone());
        return r;
      }).catch(() => cached);
      return cached || fetchAndStore;
    })());
  }
});