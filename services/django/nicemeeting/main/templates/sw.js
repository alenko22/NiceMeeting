// static/pwa/sw.js
const CACHE_NAME = 'my-django-app-v2';  // изменена версия
const urlsToCache = [
  '/static/css/main_style.css',
  '/static/js/base.js',
  '/static/css/themes.css',
  '/static/pwa/manifest.json',
  '/static/pwa/icons/icon-192.png',
  '/static/pwa/icons/icon-512.png',
  // '/' удален — главная страница не кэшируется заранее
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Для навигационных запросов (переход по страницам) — network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Клонируем и сохраняем в кэш для офлайн-доступа
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, пытаемся отдать из кэша
          return caches.match(request);
        })
    );
    return;
  }

  // Для статических ресурсов — cache-first
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/)) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }

  // Для всех остальных запросов — network-first с fallback на кэш
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Обработчики push-уведомлений (без изменений)
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch(e) {
      data = { title: 'Уведомление', body: event.data.text() };
    }
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