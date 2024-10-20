// Service Worker för Ullevi Tennisklubb Aktivitetsmeny
const CACHE_NAME = 'ullevitk-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/service-worker.js',
  '/translations.json',
  '/svenska-flag.png',
  '/english-flag.png',
  '/ullevitk_logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Öppnar cache och lagrar fördefinierade resurser');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Returnera cache om det finns
        if (response) {
          return response;
        }

        // Hämta från nätverket och lägg till i cachen
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          });
      }).catch(() => {
        return caches.match('/index.html'); // Fall-back om nätverk inte finns
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
