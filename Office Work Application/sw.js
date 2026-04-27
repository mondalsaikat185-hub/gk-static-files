// AI Office Assistant — Service Worker v6
// STRATEGY: Network-first ALWAYS for HTML. Never serve stale HTML.
// Cache only static assets (images, manifest) as fallback for offline.
const CACHE = 'office-ai-v6';
const STATIC_ASSETS = ['./icon.jpeg', './office_logo.png', './manifest.json'];

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
    )
    .then(() => self.clients.claim())
    .then(() => {
      // Force reload all open tabs with this app
      return self.clients.matchAll({type: 'window'}).then(clients => {
        clients.forEach(client => {
          client.postMessage({type: 'SW_UPDATED'});
          // Also try to navigate (force refresh)
          if(client.navigate) client.navigate(client.url);
        });
      });
    })
  );
});

self.addEventListener('message', e => {
  if(e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if(e.data?.type === 'FORCE_CLEAR') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Skip external API calls entirely — let browser handle them
  if(url.origin !== self.location.origin) return;

  // HTML / navigation requests — ALWAYS network first, NO cache fallback for online
  const isNav = e.request.mode === 'navigate'
    || e.request.destination === 'document'
    || url.pathname.endsWith('.html')
    || url.pathname.endsWith('/');

  if(isNav) {
    e.respondWith(
      fetch(e.request, {cache: 'no-cache'})
        .then(res => {
          // Got fresh response from network — use it directly
          // Also update cache for offline use
          if(res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => {
          // OFFLINE — try cache as last resort
          return caches.match(e.request)
            .then(c => c || new Response(
              '<html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0a0e1a;color:#e8eef7">'
              + '<h2>You are offline</h2><p>Connect to internet and refresh to use Office AI.</p>'
              + '<button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#5b8ff9;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer">Retry</button>'
              + '</body></html>',
              {status: 503, headers: {'Content-Type': 'text/html'}}
            ));
        })
    );
    return;
  }

  // JS/CSS files — also network-first (they change with updates)
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

  // Static assets (images, fonts) — cache-first (they rarely change)
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
