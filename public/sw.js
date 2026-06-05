self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch for now
  // We can add caching strategies here later if needed
  event.respondWith(fetch(event.request));
});
