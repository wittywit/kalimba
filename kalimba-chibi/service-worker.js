const CACHE_NAME = 'kalimba-chibi-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/chibi.css',
  '/script.js',
  '/chibi.js',
  '/manifest.json',
  '/icon.png',
  '/lib/midiplayer.js',
  '/lib/soundfont-player.min.js',
  '/lib/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        urlsToCache.forEach(url => {
          cache.add(url).catch(error => {
            console.error(`Failed to cache ${url}:`, error);
          });
        });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
