const CACHE_NAME = "jooli-agenda-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/main.js",
  "/js/auth.js",
  "/js/events.js",
  "/js/calendar.js",
  "/js/ui.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => response || fetch(event.request))
  );
});