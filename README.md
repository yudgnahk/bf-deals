# BF Deals 2026

Static Black Friday / Cyber Monday 2026 deals site (Astro → Cloudflare Worker static assets).

- **Live:** https://bf-deals.haleduykhang.workers.dev  
- **Focus (v1):** International deals — especially AI tools, developer tools, and SaaS  
- **Calendar:** Black Friday Fri 27 Nov 2026 · Cyber Monday Mon 30 Nov 2026  

## Quick start

```bash
npm install
npm run dev      # local preview
npm run build    # output → dist/
npm run preview  # preview production build
npm run check-links  # HEAD/GET every source_url (non-blocking)
npm test         # node:test — lib helpers + happy-path checks on dist/ (build first)
npm run gen-og   # re-render public/og/*.png share cards (uses agent-browser, closes it after)
```

Node: Astro 7.4 needs Node **>= 22.23.4** (Homebrew `node` 26 works; nvm 22.22.x does not).

### Cloudflare Worker deploy

Build locally, then deploy with Wrangler (`wrangler.jsonc`): static assets from `dist/` plus a small Worker for `/api/likes` (D1).

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Assets directory | `./dist` |
| Worker entry | `worker/index.ts` |
| Worker name | `bf-deals` |
| D1 database | `bf-deals-likes` |
| Live URL | https://bf-deals.haleduykhang.workers.dev |
| `not_found_handling` | `404-page` |
| `html_handling` | `auto-trailing-slash` |

```bash
npm run build
npx wrangler deploy
```

Local Worker + D1 (likes API):

```bash
npm run dev:worker   # build, apply local migrations, wrangler dev on :8787
```

Full D1 / secret / migration steps: [`docs/DEPLOY_NOTES.md`](docs/DEPLOY_NOTES.md).

Or use GitHub Actions (`.github/workflows/deploy.yml`) with secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

If those secrets are missing, the workflow **skips deploy gracefully** after a successful build. When present, it applies D1 migrations then `wrangler deploy`.

## Data: add / expire a deal

Edit **one file**: [`src/data/deals.json`](src/data/deals.json).

1. **Add** — append an object with the existing schema (`id`, `title`, `merchant`, `region`, `category`, `discount_text`, `price`, `end_date`, `source_url`, `aff_program`, `aff_status`, `verified_at`, …). Copy `discount_text` and `price` **exactly** from the merchant page; never invent numbers.
2. **Expire** — set `end_date` to a past `YYYY-MM-DD`, **or** set `"hidden": true` to remove it from the site while keeping the row.
3. Rebuild / redeploy. Expired deals are also filtered out client-side by today’s date.

Optional `added_at` (`YYYY-MM-DD` or ISO instant) shows a **New** badge for 48 h; the badge removes itself client-side after that, no rebuild needed.

### Pages & SEO

- `/category/<slug>/` — one page per category with deals (title, description, canonical, OG card, `ItemList` + `BreadcrumbList` JSON-LD).
- `/deal/<id>/` — one page per active deal (own title/description, `Offer` JSON-LD, notes, copy-code, share links). Rows link to it via **Details** and a share button (native share sheet, else copy link).
- `/vn/` — Vietnamese view with a day-by-day sale schedule 25–30/11 from `src/data/vn-schedule.json` (rows whose deal is gone are dropped at build).
- `/robots.txt` and `/sitemap-index.xml` are generated at build time.
- Share cards live in `public/og/` (`site.png`, `about.png`, one per category). Add a new category to `OG_CATEGORY_SLUGS` in `src/lib/seo.ts` and rerun `npm run gen-og`.
- Per-deal cards live in `public/og/deal/<id>.png` (`npm run gen-og:deals`, ~1.5 min). A deal without a card falls back to its category card, so rerun after adding deals.
- Sorts: **Top picks** (default, builder categories first), **Ending soon** (pure end date), **Newest**, **Biggest discount**, **Most liked**. `?sort=ending-soon` preselects a sort.

### Region & visibility

| Field | Notes |
| --- | --- |
| `region` | `intl` · `vn` · `both` (`both` appears in both region filters) |
| `hidden` | `true` → skipped on the site (v1 marks VN-only rows this way) |

Default filter is **International**. VN filter UI remains for a later re-enable.

### Categories

Filter chips are **derived from the data**. Priority order puts AI / developer / SaaS first:

| Slug | Label |
| --- | --- |
| `ai` | AI tools |
| `dev-tools` | Developer tools |
| `saas` | SaaS |
| `productivity` | Productivity |
| `design` | Design |
| `marketing` | Marketing |
| `hosting` / `vpn` / `courses` / … | Hosting, VPN, Courses, Electronics, Travel, Home, … |

Default sort is **Ending soon** (unknown end dates last). Also available: **Biggest discount**, **Most liked**. Clearly labeled promo codes in notes (`code XYZ`) show as copyable chips on the card.

### Likes & ranking

Heart buttons on each deal call `POST /api/likes/:dealId` (optional `DELETE` to unlike). One like per anonymized IP hash per deal (SHA-256 + `LIKE_SALT`). Counts power the **Most liked** sort and a **Top 10 this week** section (hidden until the first like). See `/about` for the privacy note.

## Affiliate IDs

1. Read [`AFFILIATE_SETUP.md`](AFFILIATE_SETUP.md) (owner signup guide — you apply yourself).
2. Fill [`src/config/affiliates.json`](src/config/affiliates.json): set `id_or_tag` and/or `link_template` per `aff_program`.
3. `link_template` may use `{url}` (encoded destination) and `{id}`.
4. Empty config → site uses plain `source_url` and treats the link as TODO aff internally. Hook deals (`aff_status: "hook"`) never get affiliate wrapping.
5. Affiliate anchors use `rel="sponsored nofollow noopener"` and go to the real merchant (no cloaking).

**No secrets belong in this repo.**

## Docs

- [`docs/DEALS_TODO.md`](docs/DEALS_TODO.md) — merchants to recheck 26–27 Nov 2026  
- [`AFFILIATE_SETUP.md`](AFFILIATE_SETUP.md) — affiliate program signup guide  

## Disclosure

English (FTC-style) and Vietnamese disclosure appear near the top of the home page and in the footer. Details: [/about](https://bf-deals.haleduykhang.workers.dev/about/).
