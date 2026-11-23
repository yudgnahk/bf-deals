# Deploy notes — BF Deals (Workers + D1 likes)

Static Astro site served as Cloudflare Worker assets, plus a small Worker for `/api/likes` backed by D1.

## One-time: create D1 + secrets

```bash
# 1) Create the database
npx wrangler d1 create bf-deals-likes
```

Copy the printed `database_id` into [`wrangler.jsonc`](../wrangler.jsonc) (`d1_databases[0].database_id`).

```bash
# 2) Apply migrations (remote)
npx wrangler d1 migrations apply bf-deals-likes --remote

# 3) Set the IP-hash salt (required for production)
npx wrangler secret put LIKE_SALT
# paste a long random string when prompted
```

Local / preview without a secret falls back to a fixed dev salt (see `worker/index.ts`) — fine for `wrangler dev`, not for production.

## Build & deploy

```bash
npm install
npm run build          # also syncs worker/deal-ids.json from deals.json
npx wrangler deploy
```

GitHub Actions (`.github/workflows/deploy.yml`) will:

1. `npm ci` + `npm run build`
2. Apply D1 migrations remotely (if Cloudflare secrets are set)
3. `wrangler deploy`

Required repo secrets:

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Deploy + D1 |
| `CLOUDFLARE_ACCOUNT_ID` | Account scope |

`LIKE_SALT` is a **Worker secret** (set via Wrangler), not a GitHub Actions secret, unless you also wire `wrangler secret put` in CI.

## Local API testing

```bash
npm run build
npx wrangler d1 migrations apply bf-deals-likes --local
npx wrangler dev
```

Then:

```bash
curl -s http://127.0.0.1:8787/api/likes
curl -s -X POST -H 'Origin: http://127.0.0.1:8787' \
  http://127.0.0.1:8787/api/likes/typingmind-premium-60
curl -s -X DELETE -H 'Origin: http://127.0.0.1:8787' \
  http://127.0.0.1:8787/api/likes/typingmind-premium-60
```

## Schema

See [`migrations/0001_likes.sql`](../migrations/0001_likes.sql):

- `likes(deal_id, ip_hash, created_at)` — PK `(deal_id, ip_hash)`
- `like_rate` — per-IP-hash per-minute counters (max 30 mutations/min)

Deal IDs are validated against [`worker/deal-ids.json`](../worker/deal-ids.json) (generated from `src/data/deals.json` on every build).
