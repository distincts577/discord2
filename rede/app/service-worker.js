const CACHE = 'rede-shell-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './firebase-config.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// App shell: cache-first. Firebase (chat/chamadas em tempo real) sempre vai direto pra rede.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin.includes('firebase') || url.origin.includes('googleapis')) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
