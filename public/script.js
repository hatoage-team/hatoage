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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("🐦 SW registered"))
      .catch(err => console.error("SW failed", err));
  });
}
});
