// AI Office Assistant — Service Worker v10
// STRATEGY: Network-first for ALL dynamic content. Never serve stale code.
const CACHE = 'office-ai-v10';
const STATIC_ASSETS = ['./icon.jpeg', './icon-192.png', './icon-512.png', './office_logo.png', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    )
    .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if(e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if(e.data?.type === 'FORCE_CLEAR') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
  if(e.data?.type === 'FORCE_UPDATE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(c => c.postMessage({type:'RELOAD_NOW'})));
  }
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  // version.json — ALWAYS bypass cache completely
  if(url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(e.request, {cache: 'no-store'}).catch(() => caches.match(e.request)));
    return;
  }

  // HTML / navigation — ALWAYS network first
  const isNav = e.request.mode === 'navigate'
    || e.request.destination === 'document'
    || url.pathname.endsWith('.html')
    || url.pathname.endsWith('/');

  if(isNav) {
    e.respondWith(
      fetch(e.request, {cache: 'no-cache'})
        .then(res => {
          if(res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => {
          return caches.match(e.request)
            .then(c => c || new Response(
              '<html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0a0e1a;color:#e8eef7">'
              + '<h2>You are offline</h2><p>Connect to internet and refresh.</p>'
              + '<button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#5b8ff9;color:#fff;border:none;border-radius:8px;cursor:pointer">Retry</button>'
              + '</body></html>',
              {status: 503, headers: {'Content-Type': 'text/html'}}
            ));
        })
    );
    return;
  }

  // JS/CSS — network-first
  if(url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    e.respondWith(
      fetch(e.request, {cache: 'no-cache'})
        .then(res => {
          if(res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(c => c || fetch(e.request)))
    );
    return;
  }

  // Static assets — cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
