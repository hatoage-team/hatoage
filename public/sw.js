const CACHE_NAME = "hatoage-v1";

const STATIC_ASSETS = [
  "/",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/products",
  "/assets/logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});
