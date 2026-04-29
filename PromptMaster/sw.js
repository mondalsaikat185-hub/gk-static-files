// ─────────────────────────────────────────────────
// PROMPT MASTER — Service Worker
// Network-first strategy with instant update support
// ─────────────────────────────────────────────────

const CACHE_NAME = 'prompt-master-v3';

// Files to pre-cache on install
const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  './icon.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700&display=swap'
];

// ── Install: pre-cache app shell ──────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        // Don't fail install if external resources (fonts) fail
        console.warn('[SW] Pre-cache partial failure (ok):', err);
        // At minimum cache the core app files
        return cache.addAll(['./index.html', './manifest.json', './icon.png']);
      });
    })
  );
  // Activate immediately — don't wait for old SW to finish
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Network-first, fall back to cache ──────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and cross-origin Chrome extension requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // For navigation requests (page loads) — network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Update cache with fresh content
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(() => {
          // Offline: serve from cache
          return caches.match('./index.html');
        })
    );
    return;
  }

  // For app assets (icon, manifest) — cache first, then network
  if (url.pathname.endsWith('.png') || url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // For everything else — network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Only cache successful responses from same origin
        if (networkResponse.ok && url.origin === self.location.origin) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Background Sync: notify clients of new version ─
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
