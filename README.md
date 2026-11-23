# BF Deals 2026

Static Black Friday / Cyber Monday 2026 deals site (Astro → Cloudflare Pages).

- **Live (planned):** https://bf-deals.pages.dev  
- **Focus (v1):** International deals — especially AI tools, developer tools, and SaaS  
- **Calendar:** Black Friday Fri 27 Nov 2026 · Cyber Monday Mon 30 Nov 2026  

## Quick start

```bash
npm install
npm run dev      # local preview
npm run build    # output → dist/
npm run preview  # preview production build
npm run check-links  # HEAD/GET every source_url (non-blocking)
```

### Cloudflare Pages (Git integration)

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` (or current LTS) |
| Project name | `bf-deals` |

Or deploy via GitHub Actions (`.github/workflows/deploy.yml`) with secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

If those secrets are missing, the workflow **skips deploy gracefully** after a successful build.

## Data: add / expire a deal

Edit **one file**: [`src/data/deals.json`](src/data/deals.json).

1. **Add** — append an object with the existing schema (`id`, `title`, `merchant`, `region`, `category`, `discount_text`, `price`, `end_date`, `source_url`, `aff_program`, `aff_status`, `verified_at`, …). Copy `discount_text` and `price` **exactly** from the merchant page; never invent numbers.
2. **Expire** — set `end_date` to a past `YYYY-MM-DD`, **or** set `"hidden": true` to remove it from the site while keeping the row.
3. Rebuild / redeploy. Expired deals are also filtered out client-side by today’s date.

### Region & visibility

| Field | Notes |
| --- | --- |
| `region` | `intl` · `vn` · `both` (`both` appears in both region filters) |
| `hidden` | `true` → skipped on the site (v1 marks VN-only rows this way) |

Default filter is **International**. VN filter UI remains for a later re-enable.

### Categories

The filter chips are **derived from the data**. Suggested slugs for upcoming AI/SaaS expansions:

| Slug | Label |
| --- | --- |
| `ai` | AI tools |
| `dev-tools` | Developer tools |
| `saas` | SaaS |
| `productivity` | Productivity |
| `design` | Design |
| `marketing` | Marketing |

Existing data also uses `hosting`, `vpn`, `courses`, `electronics`, `travel`, `home`, etc.

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

English (FTC-style) and Vietnamese disclosure appear near the top of the home page and in the footer. Details: [/about](https://bf-deals.pages.dev/about/).
