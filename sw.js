const CACHE = 'portfolio-' + new Date().toISOString().slice(0,10);

const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/404.html',
  '/manifest.json',
  '/sitemap.xml',
  '/robots.txt',
  '/vicious-viper/',
  '/vicious-viper/index.html',
  '/vicious-viper/vicious-viper.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(PRECACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s) requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // For HTML navigation — network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/404.html')))
    );
    return;
  }

  // For external resources (GitHub stats, GoatCounter, fonts) — network only
  if (url.origin !== location.origin) {
    return;
  }

  // For same-origin static assets — cache first, network update
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
