// ─────────────────────────────────────────────────────────────
//  Service Worker — PDF Scanner PWA
//  Enables install prompt on Android, Chrome, and Desktop.
//  Strategy: cache-first for local assets, network-first for CDN/API.
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'pdf-scanner-v2';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

// ── Install: cache everything ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Local assets must succeed
      await cache.addAll(LOCAL_ASSETS);
      // CDN assets: best effort (don't fail install if CDN is unreachable)
      await Promise.allSettled(
        CDN_ASSETS.map(url =>
          fetch(url, { mode: 'cors' })
            .then(res => { if (res.ok) cache.put(url, res); })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: smart routing ──
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // API calls and Worker calls → always network (never cache)
  if (url.includes('workers.dev') || url.includes('googleapis.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // CDN assets → network-first, fall back to cache
  if (url.includes('cloudflare.com') || url.includes('cdnjs')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Local assets → cache-first, fall back to network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
