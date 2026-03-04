/**
 * Service Worker — cache-first strategy for full offline capability.
 * Caches all app assets on install. Updates on new version deployment.
 */

const CACHE_NAME = 'puranima-v2';

const LOCAL_ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/js/utils.js',
  '/js/storage.js',
  '/js/router.js',
  '/js/questions.js',
  '/js/components/icons.js',
  '/js/screens/welcome.js',
  '/js/screens/examination.js',
  '/js/screens/summary.js',
  '/js/screens/completion.js',
  '/data/questions.json',
  '/manifest.json',
  '/assets/icons/icon.svg',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
];

// Install: pre-cache local assets (required), CDN assets (best-effort)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache =>
        cache.addAll(LOCAL_ASSETS).then(() =>
          Promise.allSettled(CDN_ASSETS.map(url =>
            fetch(url).then(r => r.ok ? cache.put(url, r) : undefined)
          ))
        )
      )
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          // Only cache successful same-origin or CDN responses
          if (!response || response.status !== 200) return response;

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
