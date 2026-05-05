const CACHE = 'prompt-master-v2';
const SHELL = [
  '/gk-static-files/PromptMasterV2/index.html',
  '/gk-static-files/PromptMasterV2/manifest.json',
  '/gk-static-files/PromptMasterV2/icon-192.png',
  '/gk-static-files/PromptMasterV2/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Only handle our app files — let Firebase/Google calls go direct
  if (!url.includes('PromptMasterV2') && !url.includes('gk-static-files')) return;

  e.respondWith(
    // Network-first for HTML (get fresh updates), cache-first for assets
    url.endsWith('.html')
      ? fetch(e.request)
          .then(res => {
            if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
            return res;
          })
          .catch(() => caches.match(e.request))
      : caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
