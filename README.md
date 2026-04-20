# hatoage-market (Next.js)

このプロジェクトは **Next.js + TypeScript(TSX)** で構成された、はとあげマーケットのWebアプリです。

## 開発

```bash
npm install
npm run dev
```

## 本番ビルド

```bash
npm run build
npm start
```

## 補足

- 旧Express/EJS実装のファイルは互換のためリポジトリに残しています。
- 商品・ニュースは `https://hatoage.wata777.workers.dev` から取得し、失敗時はローカルJSONへフォールバックします。
