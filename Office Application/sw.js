// AI Office Assistant — Service Worker (Phase 1.1)
// Network-first for HTML (so updates always reach user), cache-first for assets.
const CACHE = 'office-ai-v4';
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
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Skip API calls — always live
  if(url.hostname.includes('googleapis.com') ||
     url.hostname.includes('mistral.ai') ||
     url.hostname.includes('anthropic.com') ||
     url.hostname.includes('firebaseio.com') ||
     url.hostname.includes('firestore.googleapis.com') ||
     url.hostname.includes('gstatic.com')) return;
  if(url.origin !== self.location.origin) return;

  // Network-first for HTML — so latest version always loads when online
  const isHtml = e.request.mode === 'navigate' || e.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '';
  if(isHtml) {
    e.respondWith(
      fetch(e.request).then(res => {
        if(res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request).then(c => c || new Response('Offline', {status: 503})))
    );
    return;
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if(res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => cached))
  );
});
