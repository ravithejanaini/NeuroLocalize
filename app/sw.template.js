// Offline copy of NeuroLocalize (D50). Written out by scripts/build.ts, which fills in the
// file list and a version that changes whenever any built file changes.
const VERSION = '__VERSION__';
const CACHE = `neurolocalize-${VERSION}`;
const APP = __FILES__;
// Loaded from elsewhere at run time; kept once fetched so the page works with no network.
const REMOTE = [
  'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(APP.map((f) => new Request(f, { cache: 'reload' })));
      // The pinned Three.js build; fonts are cached as the page first asks for them.
      await Promise.all(
        REMOTE.map(async (url) => {
          try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) await cache.put(url, res);
          } catch {
            // Offline at install: the first online visit will fill it in.
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith('neurolocalize-') && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

const cacheable = (url) =>
  url.origin === self.location.origin ||
  REMOTE.includes(url.href) ||
  url.host === 'fonts.googleapis.com' ||
  url.host === 'fonts.gstatic.com';

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!cacheable(url)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const path = url.origin === self.location.origin && url.pathname === '/' ? 'index.html' : req;
      const hit = await cache.match(path, { ignoreSearch: url.origin === self.location.origin });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') await cache.put(req, res.clone());
        return res;
      } catch (err) {
        if (req.mode === 'navigate') {
          const shell = await cache.match('index.html');
          if (shell) return shell;
        }
        throw err;
      }
    })(),
  );
});
