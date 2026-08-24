# hatoage-market

はとあげマートの Next.js App Router 版。

## 構成

- Next.js App Router + TypeScript
- 商品・ニュース: Cloudflare Worker API + ローカル JSON フォールバック
- 管理画面: Next.js Route Handlers + Basic 認証
- `/products` と `/news`: ISR（60秒）
- `/search`: URL の `?q=` を使ったサーバーサイド検索
- `next/image` による画像最適化

## 開発

```bash
npm install
npm run dev
```

## 本番

```bash
npm run build
npm start
```

## 必須の管理画面環境変数

```env
BASIC_AUTH_USER=...
BASIC_AUTH_PASSWORD=...
RENDER_TOKEN=...
NEXT_PUBLIC_API_BASE=https://hatoage.wata777.workers.dev
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_TOKEN=...
GMAIL_FROM=...
CRON_SECRET=...
```

`GMAIL_*` は Gmail API の OAuth 2.0 Refresh Token 用。`RENDER_TOKEN` は Worker の管理 API 用。`CRON_SECRET` は `/api/cron/mail` を外部スケジューラから呼ぶための秘密値。

本番環境では Basic 認証のユーザー名・パスワードが未設定の場合、管理画面を開けないようにしている。

## 注意

旧 Express/EJS 実装は Next.js の実行経路から切り離している。`express/` と `mailer.js` は旧実装・移行資料として残しているため、Next.js のビルドには不要。

メール送信と OTP 認証は Next.js Route Handler に移行済み。毎日10時の配信は `/api/cron/mail` に `Authorization: Bearer $CRON_SECRET` を付けて外部スケジューラから呼ぶ。Render の常駐プロセスに依存する `node-cron` は使わない。
