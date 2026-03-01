import express from "express";
import cors from "cors";
import cron from "node-cron";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";
import basicAuth from "./middleware/basicAuth.js";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.set("trust proxy", 1);
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const APITOKEN = process.env.RENDER_TOKEN;

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  "Accept": "application/json"
});

const authJsonHeaders = () => ({
  ...jsonHeaders(),
  "Authorization": `Bearer ${APITOKEN}`
});

const parseApiBody = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

/* ===== APIトークン認証ミドルウェア ===== */
const verifyApiToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // "Bearer トークン" の形式で来ることを想定
  if (!authHeader || authHeader !== `Bearer ${APITOKEN}`) {
    console.error("Unauthorized access attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.get("/", (_, res) => res.render("index"));
app.get("/manifest.json", (req, res) => {
  res.type("application/manifest+json");
  res.sendFile(process.cwd() + "/public/manifest.json");
});
const API = "https://hatoage.wata777.workers.dev";

const normalizeNewsItem = (item) => ({
  ...item,
  body: item?.body || item?.content || item?.description || item?.text || "本文は準備中です。"
});

const fetchNewsList = async () => {
  const response = await fetch(`${API}/news`);
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.status}`);
  }
  const news = await response.json();
  return Array.isArray(news) ? news.map(normalizeNewsItem) : [];
};

const fetchNewsByUuid = async (uuid) => {
  const response = await fetch(`${API}/news/${uuid}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch news detail: ${response.status}`);
  }
  const article = await response.json();
  return article ? normalizeNewsItem(article) : null;
};

app.get("/products", async (_, res) => {
  const product = await fetch(`${API}/products`).then(r => r.json());
  res.render("products", { product });
});

app.get("/products/:slug", async (req, res) => {
  const product = await fetch(
    `${API}/products/${req.params.slug}`
  ).then(r => r.json());

  if (!product) return res.status(404).render("404");
  res.render("product", { product });
});

app.get("/order/:slug", async (req, res) => {
  const product = await fetch(
    `${API}/products/${req.params.slug}`
  ).then(r => r.json());

  if (!product) return res.status(404).render("404");
  res.render("order", { product });
});

app.get("/api/products", cors(), (_, res) => {
  res.redirect(301, `${API}/products`);
  });

app.get("/news", async (_, res) => {
  try {
    const news = await fetchNewsList();
    res.render("news", { news, error: "" });
  } catch (error) {
    console.error("News load error:", error);
    res.status(502).render("news", {
      news: [],
      error: "ニュースの取得に失敗しました。時間をおいて再度お試しください。"
    });
  }
});

app.get("/news/:uuid", async (req, res) => {
  try {
    const article = await fetchNewsByUuid(req.params.uuid);
    if (!article) {
      return res.status(404).render("404");
    }
    res.render("news-detail", { article, error: "" });
  } catch (error) {
    console.error("News detail load error:", error);
    res.status(502).render("news-detail", {
      article: null,
      error: "記事の取得に失敗しました。時間をおいて再度お試しください。"
    });
  }
});

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

function encodeHeader(str) {
  return `=?UTF-8?B?${Buffer.from(str).toString("base64")}?=`;
}

async function sendMail({ to, subject, html }) {
  const from = encodeHeader("はとあげマーケット") + ` <${process.env.GMAIL_FROM}>`;
  const encodedSubject = encodeHeader(subject);

  const message =
    `From: ${from}\r\n` +
    `To: ${to}\r\n` +
    `Subject: ${encodedSubject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset="UTF-8"\r\n` +
    `\r\n` +
    html;

  const raw = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

/* ===== ページ表示 ===== */
app.get("/mail", (_, res) => {
  res.render("mail");
});

/* ===== OTP送信 ===== */
app.post("/mail/send", async (req, res) => {
  const { email } = req.body;

  const r = await fetch(`${API}/mail/otp`, {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify({ email })
  });

  const { otp } = await r.json();

  await sendMail({
    to: email,
    subject: "【はとあげメール】認証コード",
    html: `
      <div style="font-family:sans-serif">
        <h2>認証コード</h2>
        <p style="font-size:28px;font-weight:bold">${otp}</p>
        <p>5分以内に入力してください。</p>
      </div>
    `
  });

  res.json({ ok: true });
});

/* ===== OTP確認 ===== */
app.post("/mail/verify", async (req, res) => {
  const { email, otp } = req.body;

  const r = await fetch(`${API}/mail/verify`, {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify({ email, otp })
  });

  const j = await r.json();
  res.json(j);
});
app.get("/admin", basicAuth, async (req, res) => {
  const statusMessage = typeof req.query.status === "string" ? req.query.status : "";

  try {
    const product = await fetch(`${API}/products`).then(r => r.json());
    res.render("admin", { product, error: "", statusMessage });
  } catch (error) {
    console.error("Admin products load error:", error);
    res.status(502).render("admin", {
      product: [],
      error: "商品一覧の取得に失敗しました。時間をおいて再度お試しください。",
      statusMessage
    });
  }
});
app.use(express.urlencoded({ extended: true }));

/* ===== 登録完了・通知メール送信 ===== */
app.post("/mail/done", verifyApiToken, async (req, res) => {
  const { email, status } = req.body;

  let subject = "";
  let messageBody = "";

  if (status === "done") {
    subject = "【はとあげメール】登録完了のお知らせ";
    messageBody = `
      <p>はとあげメールへのご登録ありがとうございます！</p>
      <p><strong>登録が完了しました。</strong></p>
      <p>明日から毎日10時に「今日のはとあげ」をお届けします。お楽しみに！🕊</p>
    `;
  } 
  else if (status === "dup") {
    subject = "【はとあげメール】登録状況のご案内";
    messageBody = `
      <p>いつもご利用ありがとうございます。</p>
      <p>このメールアドレスは<strong>既に登録されているため、設定に変更はありません。</strong></p>
      <p>引き続き「はとあげメール」をお楽しみください。</p>
    `;
  } 
  else if (status === "error") {
    subject = "【はとあげメール】登録エラーのお知らせ";
    messageBody = `
      <div style="color: #d32f2f; border: 1px solid #d32f2f; padding: 10px;">
        <p>申し訳ございません。登録処理中にエラーが発生しました。</p>
        <p><strong>もう一度最初からお試しください。</strong></p>
        <p style="font-size: 0.9em; margin-top: 15px; color: #666;">
          ※もしこのエラーが何度も続く場合は、お手数ですが Discord で <strong>@わたあめえ</strong> に報告してください。
        </p>
      </div>
    `;
  } else {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await sendMail({
      to: email,
      subject: subject,
      html: `
        <div style="font-family:sans-serif; line-height: 1.6;">
          <h2>はとあげマーケット</h2>
          ${messageBody}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">※このメールに心当たりがない場合は破棄してください。</p>
        </div>
      `
    });
    res.json({ ok: true });
  } catch (error) {
    console.error("Mail send error:", error);
    res.status(500).json({ ok: false, error: "Failed to send email" });
  }
});

app.post("/admin/products", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify(req.body)
  });

  const body = await parseApiBody(r);
  if (!r.ok) {
    const message = body.message || body.error || "商品の追加に失敗しました。";
    return res.redirect(`/admin?status=${encodeURIComponent(`商品追加に失敗: ${message}`)}`);
  }

  res.redirect(`/admin?status=${encodeURIComponent("商品を追加しました")}`);
});

app.post("/admin/news", basicAuth, async (req, res) => {
  const r = await fetch(API + "/news", {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify(req.body)
  });

  const body = await parseApiBody(r);
  if (!r.ok) {
    const message = body.message || body.error || "ニュースの追加に失敗しました。";
    return res.redirect(`/admin?status=${encodeURIComponent(`ニュース追加に失敗: ${message}`)}`);
  }

  res.redirect(`/admin?status=${encodeURIComponent("ニュースを追加しました")}`);
});
  
app.put("/admin/products/:slug", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "PUT",
    headers: authJsonHeaders(),
    body: JSON.stringify({
      slug: req.params.slug,
      ...req.body
    })
  });
  res.status(r.status).json(await parseApiBody(r));
});

app.patch("/admin/products/:slug", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "PATCH",
    headers: authJsonHeaders(),
    body: JSON.stringify({
      slug: req.params.slug,
      ...req.body
    })
  });
  res.status(r.status).json(await parseApiBody(r));
});

app.delete("/admin/products/:slug", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "DELETE",
    headers: authJsonHeaders(),
    body: JSON.stringify({
      slug: req.params.slug
    })
  });
  res.status(r.status).json(await parseApiBody(r));
});

// ===== HTMLメール生成 =====
function buildMail(products){
  const picks = products.sort(()=>0.5-Math.random()).slice(0,3);
  return `
  <html>
  <body style="font-family:sans-serif">
    <img src="https://hatoage.wata777.f5.si/assets/logo.png" width="300">
    <h2>今日のはとあげ 🕊</h2>
    ${picks.map(p=>`
      <div style="border:1px solid #ddd;padding:10px;margin:10px 0">
        <h3>${p.name}</h3>
        <img src="https://hatoage.wata777.f5.si/assets/${p.image}" width="200">
        <p>${p.amount}</p>
        <strong>¥${p.price}</strong><br>
        <a href="https://hatoage.wata777.f5.si/order/${p.slug}">
          購入する
        </a>
      </div>
    `).join("")}
  </body>
  </html>`;
}

// ===== CRON =====
cron.schedule("0 10 * * *", async () => {
  console.log("📮 はとあげメール送信開始");
  try {
    const headers = { Authorization: `Bearer ${APITOKEN}` };
    const products = await fetch(`${API}/products`).then(r => r.json());
    const subs = await fetch(`${API}/mail`, { headers }).then(r => r.json());
    const html = buildMail(products);
    for (const s of subs) {
      await sendMail({ to: s.email, subject: "今日のはとあげ 🕊", html });
    }
    console.log("✅ 送信完了");
  } catch (e) {
    console.error("Cron Error:", e);
  }
}, {
  timezone: "Asia/Tokyo"
});

app.get("/admin/mail/test", basicAuth, async (req, res) => {
  const headers = { Authorization:`Bearer ${APITOKEN}` };

  const products = await fetch(`${API}/products`)
    .then(r=>r.json());

  const subs = await fetch(`${API}/mail`,{headers})
    .then(r=>r.json());

  const html = buildMail(products);

  for (const s of subs) {
    await sendMail({
      to: 'wataamee777@gmail.com',
      subject: "今日のはとあげ 🕊",
      html
    });
  }

  console.log("✅ 送信完了");
  res.status(204).send("send now");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("server started on", PORT);
});
