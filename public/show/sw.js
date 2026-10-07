// Bump VERSION whenever index.html changes so iPads pick up the new copy next time they're online.
const VERSION = 'tcg-intake-v2';
const ASSETS = ['./index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png', './shield.png',
  './fonts/bricolage.woff2', './fonts/instrument.woff2', './fonts/plexmono.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first, refresh in the background. Lead uploads (POST, other origins) are never touched.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const fresh = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
      return hit || fresh;
    })
  );
});
