// Service Worker för Ullevi Tennisklubb Aktivitetsmeny
const CACHE_NAME = 'ullevitk-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/service-worker.js',
  '/translations.json',
  '/svenska-flag.png',
  '/english-flag.png',
  '/ullevitk_logo.png'
];

// Installera Service Worker och lagra alla resurser i cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Öppnar cache och lagrar fördefinierade resurser');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Fel vid caching av resurser:', error);
      })
  );
});

// Hämta resurser
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Returnera cache om det finns
        }

        // Om ingen cache finns, hämta från nätverket och lägg till i cachen
        return fetch(event.request)
          .then((networkResponse) => {
            // Kontrollera om vi fick ett giltigt svar innan cache
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Klona svaret för att både returnera till användaren och lägga till i cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('Nätverksförfrågan misslyckades:', error);
            // Eventuell fallback-hantering kan läggas till här
            return caches.match('/index.html'); // Fallback till index.html vid fel
          });
      })
  );
});

// Aktivera och rensa gammal cache
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Rensar gammal cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
