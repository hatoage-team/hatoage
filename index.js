import express from "express";
import products from "./products.json" assert { type: "json" };

const invite = 'https://discord.gg/sakuraza-tan-wang-guo-sakura-talk-kingdom-1208962938388484107';
const app = express();
app.use(express.static("public"));

app.get("/", (_, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url));
});

app.get("/products/", (_, res) => {
  res.sendFile(new URL("./public/products/index.html", import.meta.url));
});

// ★ 商品詳細（OGP対応）
app.get("/products/:name/", (req, res) => {
  const p = products.find(v => v.name === req.params.name);
  if (!p) return res.status(404).send("Not found");

  res.send(`
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${p.title} - はとあげマート</title>

<meta name="description" content="${p.description}">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.description}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://hatoagemarket.wataamee777.f5.si${p.image}">
<meta property="og:url" content="https://hatoagemarket.wataamee777.f5.si/products/${p.name}/">

<link rel="stylesheet" href="/style.css">
<link rel="icon" href="/assets/favicon.ico">
<script defer src="/script.js"></script>
</head>

<body>
<header>
  <div class="logo">
    <img src="/assets/logo.png">
  </div>
  <nav>
    <a href="/" class="btn">ホーム</a>
    <a href="/mail/" class="btn">メールマガジン</a>
    <a href="${invite}" class="btn">お問い合わせ</a>
  </nav>
</header>

<main>
  <h1>${p.title}</h1>
  <p>希望小売価格 : ${p.price}</p>

  <div class="product-images">
    <img src="${p.image}">
  </div>

  <a href="${invite}" class="btn">購入</a>
  <a href="/products/" class="btn">商品一覧に戻る</a>
</main>

<footer>© 2025 はとあげマート</footer>
</body>
</html>
  `);
});

app.listen(3000);
