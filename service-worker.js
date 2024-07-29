const CACHE_NAME = 'pwa-outlook-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/icon.png',
  '/manifest.json'
];

// インストールイベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache', error);
      })
  );
});

// フェッチイベント
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればキャッシュを返す
        if (response) {
          return response;
        }
        // キャッシュがなければネットワークリクエストを実行
        return fetch(event.request);
      })
      .catch(error => {
        console.error('Failed to fetch', error);
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
