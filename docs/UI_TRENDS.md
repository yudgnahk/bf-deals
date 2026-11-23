# UI trends: Black Friday / Cyber Monday 2026 deal roundups

Research for the `bf-deals` site (intl, AI tools / dev tools / SaaS, ~70 deals, static Astro on Cloudflare Pages). Captured on 23 November 2026 (Asia/Saigon) with headless Chrome at 1280×800 and 390×844.

The current v1 looks generic-AI: one dark theme, identical 3-column cards, large orange pill buttons, and repeated metadata. Anh liked [Pimjo’s BF page](https://pimjo.com/black-friday-cyber-monday-deal). This note studies that page, compares it with live niche roundups, and proposes three directions.

Screenshots live in this folder. The overview image is `contact-sheet.png`.

---

## 1. Pimjo, close read

URL: https://pimjo.com/black-friday-cyber-monday-deal

This is a **brand campaign page for Pimjo’s own catalog** (about 16 products), not a 70-item third-party aggregator. That is the key constraint when borrowing from it: the large screenshot cards scale to a dozen SKUs, not to seventy affiliate deals.

### Layout and hero

- Full-bleed dark hero on `#060813`, with a fine halftone/dot texture and a purple glow that fades into white.
- Vertical ticker type on the left and right edges: “BLACK FRIDAY SALE ✶ UP TO 80% OFF ✶ CYBER MONDAY SALE”.
- Floating product logos in rounded-square tiles (Nivon, Formbold, etc.) instead of generic icons.
- Lime eyebrow chip: “EXCLUSIVE LIMITED-TIME OFFERS FOR” (`#CAFB43`).
- Stacked display type: “Black” / “Friday” in heavy beveled white, “Sale” in a lighter cut. Not a single centered Inter heading.
- “UP TO 80% Off” treated as a typographic specimen, not a badge on a card.
- One purple pill CTA (`#725CFF`): “EXPLORE ALL PRODUCTS ↓”. It is the only primary button in the hero.
- On desktop 800px-tall viewports the countdown sits just below the fold. On 390px mobile, hero, “80% off”, CTA, countdown, and the “Trusted by…” line all fit in the first screen.

### After the hero

- A large `08 : 14 : 38 : 46` countdown (Geist Mono, wide tracking, “SALE ENDS IN” in small caps) over a purple-to-white gradient.
- Trust row: “Trusted by top brands and 100,000+ creatives worldwide” plus a grayscale logo strip (Alibaba, Sony, Dolby, NVIDIA, Netflix, etc.).
- Then the page flips to a **white catalog**. A sticky black capsule nav (logo, links, social icons) appears as you leave the hero.

### Deal card / row structure

Pimjo does not use a uniform 3-column card grid for the main offers.

- A **featured stage**: tab chips `#1 Nivon`, `#2 Aymo AI`, `#3 Meku`, `#4 Formbold`. One large rounded card with a light purple outline.
- Left: rank (`#1`), lime “FEATURED DEAL” chip, product logo + wordmark, 2–3 lines of product copy.
- Offer row: a slightly rotated lime “40% OFF” badge, a lavender “RECURRING” pill (Monaspace Neon, `#725CFF` on `#F1EEFF`), and a short qualifier (“Flat Discount on All Paid Plans!”).
- Coupon is a first-class control: “Use this coupon code at checkout”, the code `BLFCM2026` in a rounded field with a copy icon, beside a dark navy “GRAB THE DEAL ↗” button — not an orange pill.
- Right (desktop): a real product screenshot in a browser chrome, not a stock illustration. On mobile the screenshot stacks above the copy; chips become a horizontally scrolling row.

Further down, category chips (`ALL`, `AI TOOLS`, `DEVELOPER TOOLS`, `DESIGN ASSETS`, `NEXTJS`, `TAILWIND`, `UI KITS`, `SAAS`) sit under the sticky nav, and the same oversized screenshot + copy cards continue, stacked one per row, tagged “#1 FEATURED”, “#2 FEATURED”.

Prices are not shown as “was / now” on the cards I captured. The end date is written once in the section intro (“Every deal ends December 1 at 11:59 PM UTC”), not stamped on every card. Testimonials and a long FAQ (how to use the shared code, what is recurring, refund policy) sit at the bottom.

### Typography and color

- Families in use: **Outfit** (UI and body), **Geist Mono** (countdown labels), **Monaspace Neon** (small uppercase badges).
- Body on light: slate `rgb(101, 118, 148)`. Near-black headings `#13161F`.
- Palette is tight: near-black, white, lime `#CAFB43`, violet `#725CFF`. No orange.

### Density and mobile

Editorial, not dense. Desktop hero is theatrical; the catalog is one generous card at a time. Mobile keeps the same hierarchy (hero → countdown → one featured product) and uses a capsule hamburger instead of shrinking the desktop nav. Horizontal chip rows replace multi-column chrome.

### Why it feels polished, not “AI-generated”

- **Contrast of rooms**: a designed black hero, then a quiet white stage. Generic AI pages stay in one dark theme from header to footer.
- **One object at a time.** A featured deal with a real screenshot beats nine identical cards with the same orange button.
- **Product identity.** Real logos, real UI shots, a house coupon. Not repeated “Verified / Unknown” chips.
- **Typography has a point of view** (stacked beveled display, mono countdown, one accent type for badges).
- **The CTA is quiet and scarce.** Purple or navy, used once per deal, letter-spaced, not a fat orange pill on every tile.
- **Texture and motion of layout** (halftone, side tickers, rotated badge, capsule sticky nav) are specific, not a default gradient.
- **Trust is earned in sections** (logo wall, testimonials, FAQ, one shared code) rather than a status label on every card.
- **The end date and disclosure live in copy**, not as noisy metadata repeated 16 times.

What we should *not* copy literally: a 1,300px hero plus huge screenshot cards for all ~70 third-party deals. Pimjo can afford that because it is selling its own 16 products with one coupon.

---

## 2. Sites reviewed (loaded in Chrome)

All of the following returned HTTP 200 and rendered a real page in headless Chrome on 23 November 2026. I did not invent details for pages that failed.

### Niche deal boards (closest comps)

| Site | URL | What it is | UI pattern |
| --- | --- | --- | --- |
| blackfriday.tools | https://blackfriday.tools/deals | 367 verified SaaS / AI / indie listings, 316 live | Light typographic board, category chips with counts, compact 4-col logo cards, “LIVE UNTIL {date}” |
| blackfriday.dev | https://www.blackfriday.dev/ | Developer directory, category counts, search, “Submit your offer” | Dark 5-col logo cards, offer strip at the bottom of each card, affiliate disclosure in the header |
| blackfridaydeals.dev | https://blackfridaydeals.dev/ | Large curated directory for devs & designers | Light warm hero, sponsored logo rail, orange CTAs, later mixed in hardware product tiles |
| SaaS BFCM Deals | https://saasbfcmdeals.com/ | Large hand-checked SaaS board (1,521 live deals on the day of capture) | Light Geist typography, countdown boxes, email capture, category chips, price + strikethrough + “Get deal” / “No code needed” |
| Shashankt 2026 list | https://shashankt255.github.io/black-friday-deals-2026/ | 621 curated deals, “no affiliate links”, GitHub Pages | Off-white, stat tiles, search + filter chips, **dense list rows** with orange % and “CONFIRMED” |
| Awesome BF site | https://twf-nikhila.github.io/Awesome-Black-Friday-Cyber-Monday-deals/ | Rendered site for the 520-deal GitHub awesome list | Black + yellow, search and category chips, 3-col cards, code called out in a gold inset, date range |
| SaaS Black Friday (online) | https://saasblackfriday.online/?status=live | 249 tools tracked, 91 live | Dark gold/black marketing hero, stats, email capture, featured-slot table, affiliate disclosure in the featured intro |
| Black Friday Deals Directory | https://www.blackfridaydeals.directory/ | 200 software/app deals | Dark bento of small logo cards, email capture, “premium” side rail, coupon codes on tiles |
| AppSumo BF 2026 | https://appsumo.com/collections/black-friday-2026-all-drops/ | Official marketplace collection, 40 products | Left filters, 3-col product cards with screenshot, ratings, **strikethrough lifetime price**, urgency banner |

### Verified / editorial lists

| Site | URL | UI pattern |
| --- | --- | --- |
| SaaS Dealer | https://www.saasdealer.com/black-friday-software-deals | Warm paper background, 3-col cards that **quote the vendor’s page**, % chip, “Ends {date}”, “Read on {vendor} on {date}”, quiet “Visit {domain}” |
| Cut the SaaS | https://cut-the-saas.com/ai/black-friday-2026-saas-deals | Dark editorial article, TOC sidebar, **table**: Tool / What it is / The deal / Dates / Code |
| BuildStackTools | https://buildstacktools.com/guides/black-friday-ai-dev-tool-deals-2026.html | Light guide article, “checked on the vendor’s page” methodology, table of tool / deal / ends / vendor link (the table sits below a long intro) |
| Evendeals | https://www.evendeals.com/blog/saas-founder-black-friday-deals | Blog layout, TOC, “no affiliate links”, glance table in the article body (the table is below the opening essay; the ATF is editorial) |
| Verified Black Friday | https://thoughtcook.github.io/verified-black-friday/ | Dark GitHub-Pages board, 4-col cards packed with verification notes, “no affiliate links”, countdown to Nov 27 |

### Also loaded, but weaker as a UI reference

- **saas.blackfriday** (https://saas.blackfriday/) — a polished dark campaign landing (“deals … are coming soon”) with a countdown pill. No catalog was on the page when captured.
- **GitHub awesome repo** (https://github.com/twf-nikhila/Awesome-Black-Friday-Cyber-Monday-deals) and **Pimjo’s community list** (https://github.com/Pimjo/black-friday-deals) — markdown tables, not product UI. The useful one is the GitHub Pages site above.
- **SaaS BFCM developer collection** (https://saasbfcmdeals.com/collections/developer-deals) — same design system as the homepage, scoped to developer tools.

### Could not review (did not actually load a deals UI)

- https://www.producthunt.com/products/black-friday-tech — HTTP 403 in this environment.
- https://justcreative.com/black-friday-cyber-monday-deals-for-designers/ — bot interstitial (“One moment, please…”), not the article.
- Official **Setapp** or **Envato Elements** 2026 campaign pages were not found as live first-party URLs; I only saw third-party writeups, so they are omitted.
- I did not find a verified 2026 Hacker News thread from this week that I could treat as a live roundup UI.

---

## 3. Recurring patterns

### List vs grid

Two families dominate.

1. **Compact grid** (blackfriday.tools 4-col; blackfriday.dev 5-col; Awesome BF and BF Directory 3-col). Logo + name + one-line offer + a date or % chip. Best when you have hundreds of deals and want scan speed.
2. **List / table** (Shashankt rows; Cut the SaaS and BuildStack tables; Evendeals glance table). Higher information density, easier to show a code, a date, and a one-line term without repeating a fat CTA.

Marketplace-style 3-col cards with big screenshots (AppSumo, SaaS BFCM Deals) work when the card can show a real price. They start to look “AI” when every card is the same height, same button, and no price.

Pimjo is a third family: **editorial featured cards**. Beautiful, and wrong as the only layout for 70 third-party deals.

### Logos

Almost every serious board uses a small squircle logo next to the product name. It does more than decoration — it is how the eye finds a known tool. Pimjo and AppSumo go further with product screenshots; that is worth doing for **one or two featured deals**, not for the whole catalog.

### Coupon codes and CTAs

- Codes are either a **copy field** (Pimjo), a **copyable inset** (Awesome BF highlights `BLACKFRIDAY2026`), a **“No code needed”** button (SaaS BFCM Deals), or inline in the offer line (Shashankt: `60% OFF — code BLACKFRIDAY2026`).
- The better CTAs are specific and quiet: “Grab the deal”, “Get deal”, “Visit kit.com”. Repeated “Get the deal” orange pills on every card are the generic look we should drop.
- Affiliate honesty is moving into the chrome: blackfriday.dev puts “We earn commissions if you shop through the links below” in the header; saasblackfriday.online says featured slots may be affiliate in the section intro.

### Countdowns and dates

- Page-level countdown (Pimjo, SaaS BFCM Deals, saas.blackfriday, Verified BF) creates sale energy.
- Per-deal end dates (blackfriday.tools “LIVE UNTIL DEC 1”, Shashankt date ranges, SaaS Dealer “Ends 1 December”) are more useful once the list is long.
- A slim “T–4 days / Black Friday 27 Nov” bar (blackfriday.tools) is enough for a 70-deal site; a giant timer on every card would be noise.

### Filters and nav

Horizontal **category chips with counts** are the 2026 default (blackfriday.tools, SaaS BFCM, Shashankt, Awesome BF). AppSumo is the outlier with a left sidebar, because it is a shop, not a roundup. Search appears on the larger boards. For ~70 deals, chips + a simple search box are enough; a sidebar is not required.

### Light vs dark

Both exist. Light/off-white typographic boards (blackfriday.tools, SaaS BFCM, Shashankt, SaaS Dealer) currently feel more editorial and less “AI SaaS landing.” Dark still works when it has a point of view (Pimjo’s hero, Cut the SaaS’s article, Awesome BF’s black/yellow). All-over dark plus neon orange is the trap the current v1 fell into — blackfriday.dev and BF Directory sit closest to that, and they already feel more templated.

### Typography

- Distinct display headings (heavy grotesk, sometimes with a single accent word in yellow or orange) beat Inter-on-a-gradient.
- Useful pairing: a grotesque for UI (Outfit, Geist, Inter, Instrument Sans, Manrope) + a **mono for codes, countdowns, and “LIVE UNTIL”**.
- Pimjo’s three-font system (Outfit / Geist Mono / Monaspace Neon) is a good model, used sparingly.

### Trust and disclosure

The trusted lists are the ones that show **how** they know: “checked against the vendor”, a check date, a quote from the vendor page, or “no affiliate links.” Paid/featured slots are labelled (SaaS BFCM “open slot / book this spot”, blackfridaydeals.dev “Spotlight Partners · Sponsored”, BuildStack’s $79 pin). The weak pattern is a “Verified” badge on every card with no method behind it — that is exactly the v1 smell.

---

## 4. Three design directions

### A. Campaign Stage (Pimjo-inspired)

A short cinematic hero (dark navy, lime + violet, typographic “Black Friday” treatment, one CTA), then a white stage with **one to three featured deals** in the Pimjo card format: logo, short copy, % badge, copyable code, quiet “Grab the deal” button, and a product or vendor screenshot if we have one. The remaining ~70 deals sit below in a tighter catalog. Reference: Pimjo (hero, featured card, coupon field, sticky capsule nav, countdown); a little of saas.blackfriday for the slim countdown pill. Key components: dark-to-light transition, featured deal module, coupon copy control, logo wall or “last checked” trust line, category chips under the featured block.

This will look the most “expensive,” and it matches what anh already liked. Risk: if we featured-card the whole list, we ship a long, same-y page and lose scan speed.

### B. Typographic Board (recommended)

A light, almost journal-like page in the spirit of blackfriday.tools, SaaS BFCM Deals, and Shashankt, with a **Pimjo accent language** rather than a Pimjo-length hero. Slim top bar: “Black Friday 27 Nov · T–4 days” plus a one-line affiliate disclosure. A real headline, one sentence of scope (“AI, dev tools, and SaaS — intl deals, checked on vendor pages”), category chips with counts, then a **dense but human catalog**: desktop rows (logo, name, one-line offer, strikethrough price when we have it, % badge, copyable code, “ends {date}”). The whole row is clickable; no fat orange button. Optional: one Pimjo-style featured strip for 2–3 hook deals at the top. On mobile, rows stack like blackfriday.tools / Shashankt — logo and offer first, code + date on a second line. Key components: top status bar, typographic hero (short), chip filters, deal row, code-copy chip, strikethrough price, footer disclosure and last-updated stamp.

This scales to ~70 deals, feels made by a person, and still lets us steal Pimjo’s color, type, and coupon treatment so the site does not look like every other directory.

### C. Verified Tracker

Lead with method, not atmosphere. A Cut the SaaS / SaaS Dealer / Evendeals approach: intro that says when and how deals were checked, then a table or quoted-card list — tool, what it is, the offer in the vendor’s words, code, end date, “read on {vendor}, {date}.” Dark editorial (Cut the SaaS) or warm paper (SaaS Dealer) both work. Key components: methodology blurb, table and/or quote card, copyable code column, last-checked stamp, labelled affiliate vs hook (non-aff) deals, TOC or sidebar of categories.

Highest trust, lowest “sale” energy. Excellent as a secondary view or for the “all deals” page; a bit dry as the only homepage four days before Black Friday.

---

## 5. Recommendation

**Ship direction B, with a small amount of A.**

Use a short Pimjo-flavored opening (navy/lime/violet, Outfit + a mono, one featured deal with a copyable code and a quiet CTA) and then switch to a light typographic board of rows, not a 3-column card grid. Put the affiliate disclosure once in the top bar and once in the footer; do not print “verified / unknown” on every row. Show a strikethrough price and a % when the vendor states them; otherwise a single offer line beats a fake price. Category chips, not a sidebar. EN default, VI toggle can live in the capsule nav.

Direction C’s last-checked stamp and “hook deal” labelling should appear in the row’s quiet metadata and on `/about/`, not as a badge farm.

That combination is the opposite of the current v1: light after a designed dark opening, irregular featured + scannable list, scarce CTAs, and trust in the copy rather than on every card.

---

## 6. Screenshot index

Contact sheet (best desktop frames, labelled):

- `/workspace/bf-deals/ui-research/contact-sheet.png`

Most useful individual shots:

- `/workspace/bf-deals/ui-research/pimjo-desktop-atf.png`
- `/workspace/bf-deals/ui-research/pimjo-desktop-deals.png`
- `/workspace/bf-deals/ui-research/pimjo-mobile-atf.png`
- `/workspace/bf-deals/ui-research/pimjo-mobile-deals.png`

Also worth opening: `pimjo-desktop-countdown.png`, `blackfriday-tools-desktop-deals.png`, `shashankt-desktop-deals.png`, `saasbfcmdeals-desktop-deals-b.png`, `appsumo-desktop-atf.png`.

Every site that loaded has `*-desktop-atf.png`, `*-desktop-deals.png`, `*-mobile-atf.png`, and `*-mobile-deals.png` in this folder. `capture-log.json` has titles, HTTP status, and extracted layout notes.
