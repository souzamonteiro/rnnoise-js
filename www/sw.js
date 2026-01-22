const CACHE_NAME = 'camerarecorder-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/favicon.ico',
  './icons/icon-16x16.png',
  './icons/icon-32x32.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-180x180.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png',
  './icons/icon.svg',
  './rnnoise-wasm.js',
  '.rnnoise-wasm.wasm'
];

// Installation - cache all resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Some resources could not be cached:', err);
        });
      })
  );
  // Forces the immediate activation of the new service worker
  self.skipWaiting();
});

// Activation - clears old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME) // Keep only the current cache
          .map(cacheName => {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName); // Remove old caches
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch - estratégia Cache First com fallback para rede
self.addEventListener('fetch', event => {
  // Ignores non-GET requests and Chrome extensions.
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If found in the cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // If you can't find it, search online
        return fetch(event.request)
          .then(response => {
            // Check if the answer is valid.
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }

            // Clone the response for caching and use.
            const responseToCache = response.clone();

            // Adds to cache for future use.
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            // If the network fails and it's an HTML page, it returns the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            // For other resources, you can return a fallback
            console.log('Fetch failed; returning offline page instead.', error);
          });
      })
  );
});