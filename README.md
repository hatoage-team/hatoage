 [![Node.js CI](https://github.com/hatoage-team/hatoage/actions/workflows/node.js.yml/badge.svg)](https://github.com/hatoage-team/hatoage/actions/workflows/node.js.yml)

## Cloudflare Workers API example

- `workers/worker.js` に、このWebアプリが利用するAPI（`/products`, `/news`, `/mail/*`）の実装例を追加しています。
- D1 バインディング名は `DB`、認証用シークレットは `RENDER_TOKEN`、メイン通知先は `MAIN_SERVER_URL`（任意）を利用します。
