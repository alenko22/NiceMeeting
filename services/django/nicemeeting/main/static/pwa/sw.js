// Имя кэша — при изменении файлов меняй версию, чтобы обновить кэш
const CACHE_NAME = 'my-django-app-v1';

// Список файлов, которые нужно закэшировать при установке
const urlsToCache = [
  '/',
  '/static/css/main_style.css',
    '/static/js/base.js',
    '/static/css/themes.css',
    '/static/pwa/manifest.json',
    '/static/pwa/icons/icon-192.png',
    '/static/pwa/icons/icon-512.png',
];

// Установка — кэшируем указанные файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация — удаляем старые кэши (при смене версии)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов — стратегия "сначала кэш, потом сеть"
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если файл есть в кэше — возвращаем его
        if (response) {
          return response;
        }
        // Иначе идём в сеть
        return fetch(event.request);
      })
  );
});