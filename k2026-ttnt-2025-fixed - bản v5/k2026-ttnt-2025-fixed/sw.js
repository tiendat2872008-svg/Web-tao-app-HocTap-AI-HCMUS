// Bump CACHE_NAME when publishing a new app shell so installed copies refresh assets.
const CACHE_NAME = 'k2026-app-shell-v2';
const CACHE_PREFIX = 'k2026-app-shell-';
const APP_SHELL = [
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/data.js',
  'js/catalog.js',
  'js/grading.js',
  'js/gpa.js',
  'js/storage.js',
  'js/views.js',
  'js/app.js',
  'js/pwa.js',
  'assets/icon-192.png',
  'assets/icon-512.png'
];

const appUrl = path => new URL(path, self.registration.scope).href;
const indexUrl = appUrl('index.html');

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL.map(appUrl)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(indexUrl)) || Response.error())
    );
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
