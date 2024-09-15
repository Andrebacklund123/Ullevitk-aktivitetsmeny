self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('ullevi-tk-cache').then(function(cache) {
      return cache.addAll([
        '/index.html',
        '/manifest.json',
        '/ullevitk_logo.png',
        '/android-chrome-192x192.png',
        '/apple-touch-icon.png'
      ]);
    })
  );
});
