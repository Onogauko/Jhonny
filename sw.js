// sw.js - Service Worker untuk Expired Control D&D
const CACHE_NAME = 'expired-control-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/foto1.jpeg',
  '/foto2.jpeg'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache failed:', err))
  );
});

// Fetch - Serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Clone request karena request bisa dipakai dua kali
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Cek response valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone response karena response hanya bisa dipakai sekali
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// Activate - Clean up old caches
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

// Push Notification (opsional - untuk notifikasi expired)
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification('Expired Control', options)
  );
});
