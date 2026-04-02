// static/pwa/sw.js
const CACHE_NAME = 'my-django-app-v1';
const urlsToCache = [
  '/',
  '/static/css/main_style.css',
  '/static/js/base.js',
  '/static/css/themes.css',
  '/static/pwa/manifest.json',
  '/static/pwa/icons/icon-192.png',
  '/static/pwa/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => cacheName !== CACHE_NAME && caches.delete(cacheName))
    ))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try { data = event.data.json(); } catch(e) { data = { title: 'Уведомление', body: event.data.text() }; }
  }
  const options = {
    body: data.body || 'У вас новое уведомление',
    icon: data.icon || '/static/pwa/icons/icon-192.png',
    badge: '/static/pwa/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.url || null,
    actions: data.actions || []
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Nice Meeting', options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data;
  if (url) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        for (let client of clients) if (client.url === url && 'focus' in client) return client.focus();
        if (clients.openWindow) return clients.openWindow(url);
      })
    );
  }
});
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try { data = event.data.json(); } catch(e) { data = { title: 'Уведомление', body: event.data.text() }; }
  }
  const options = {
    body: data.body || 'У вас новое уведомление',
    icon: data.icon || '/static/pwa/icons/icon-192.png',
    badge: data.badge || '/static/pwa/icons/icon-192.png',
    vibrate: data.vibrate || [200, 100, 200],
    data: { url: data.url || null }
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Nice Meeting', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data.url;
  if (url) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (let client of clientList) {
          if (client.url === url && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
    );
  }
});