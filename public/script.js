document.addEventListener("DOMContentLoaded", () => {
  /* ===== フェードイン処理 ===== */
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

  /* ===== 商品検索 ===== */
  const searchInput = document.getElementById("searchInput");
  const results = document.getElementById("results");

  if (searchInput && results) {
    fetch("/products.json")
      .then(res => res.json())
      .then(products => {
        const normalize = str =>
          String(str).toLowerCase().replace(/\s+/g, "");

        searchInput.addEventListener("input", () => {
          const q = normalize(searchInput.value);
          results.innerHTML = "";

          if (!q) return;

          const matched = products.filter(p =>
            normalize(p.name).includes(q) ||
            normalize(p.amount).includes(q) ||
            normalize(p.price).includes(q) ||
            normalize(p.slug).includes(q)
          );

          if (matched.length === 0) {
            results.innerHTML = "<p>該当商品なし</p>";
            return;
          }

          matched.forEach(p => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
              <img src="/assets/${p.image}" alt="${p.name}">
              <h3>${p.name}</h3>
              <div>${p.amount}</div>
              <div class="price">${p.price}円</div>
            `;
            results.appendChild(div);
          });
        });
      })
      .catch(err => console.error("products.json 読み込み失敗", err));
  }
});

/* ===== Service Worker ===== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("🐦 SW registered"))
      .catch(err => console.error("SW failed", err));
  });
}
