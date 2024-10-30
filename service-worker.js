// Service Worker för Ullevi Tennisklubb Aktivitetsmeny
const CACHE_NAME = 'ullevitk-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
  './service-worker.js',
  './translations.json',
  './svenska-flag.png',
  './english-flag.png',
  './ullevitk_logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Öppnar cache och lagrar fördefinierade resurser');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Fel vid cachning av resurser:', error);
          });
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

        // Skapa en klon av förfrågan eftersom den bara kan användas en gång
        const fetchRequest = event.request.clone();

        // Hämta från nätverket och lägg till i cachen
        return fetch(fetchRequest)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Skapa en klon av svaret eftersom det bara kan användas en gång
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Fel vid cachning av nätverksresurs:', error);
              });

            return networkResponse;
          });
      })
      .catch(() => {
        // Förbättrad offline-hantering
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        // Returnera ett tomt svar för andra typer av resurser
        return new Response();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Tar bort gammal cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker är nu aktiv');
        // Ta kontroll över alla öppna flikar
        return self.clients.claim();
      })
  );
});
