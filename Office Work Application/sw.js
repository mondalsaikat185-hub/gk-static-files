// AI Office Assistant — Service Worker v7
// STRATEGY: Network-first ALWAYS for HTML. Never serve stale HTML.
// Cache only static assets (images, manifest) as fallback for offline.
const CACHE = 'office-ai-v7';
const STATIC_ASSETS = ['./icon.jpeg', './icon-192.png', './icon-512.png', './office_logo.png', './manifest.json'];

self.addEventListener('install', e => {
  // IMMEDIATELY activate — don't wait for old tabs to close
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  // Delete ALL old caches — nuclear cleanup
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))