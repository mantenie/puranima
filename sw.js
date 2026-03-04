/**
 * Service Worker — cache-first strategy for full offline capability.
 * Caches all app assets on install. Updates on new version deployment.
 */

const CACHE_NAME = 'puranima-v3';

const ASSETS_TO_CACHE = [
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
  '/js/screens/impressum.js',
  '/js/screens/datenschutz.js',
  '/js/screens/faq.js',
  '/js/screens/preparation.js',
  '/js/vendor/tailwind-browser.js',
  '/data/questions.json',
  '/manifest.json',
  '/assets/icons/icon.svg',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

// Install: pre-cache all local assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
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
  // Don't cache external requests (Simon widget etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) return response;

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
