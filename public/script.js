document.addEventListener("DOMContentLoaded", () => {
  const fadeElements = document.querySelectorAll(".fade-in");

  function checkVisibility() {
    fadeElements.forEach(el => {
      if (el.classList.contains("visible")) return;

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", checkVisibility, { passive: true });
  checkVisibility();

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
});
