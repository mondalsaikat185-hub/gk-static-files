// AI Office Assistant — Service Worker (Phase 1.1)
// Network-first for HTML (so updates always reach user), cache-first for assets.
const CACHE = 'office-ai-v5';
const ASSETS = ['./manifest.json', './icon.jpeg', './office_logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage({type:'SW_UPDATED'}))))
  );
});

self.addEventListener('message', e => {
  if(e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if(e.r