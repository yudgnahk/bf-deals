# Affiliate quick list — programs you can join in under a day

Checked **25 Nov 2026** (Asia/Saigon) on each program's own page or help centre. Approval speed is quoted as the program states it; "unknown" means nothing official was found. Commission is listed only where the official page prints it. Full background: [`AFFILIATE_SETUP.md`](../AFFILIATE_SETUP.md). Machine-readable speed: `aff_speed` in [`src/config/affiliates.json`](../src/config/affiliates.json).

**Order:** deals currently on the site that use the program × expected traffic of that merchant. The site is a coupon/deals site — programs whose terms ban that are listed separately at the bottom and their deals are plain hook links.

## 1. Under a day (instant / same-day)

| # | Program | Deals on site | Approval (official) | VN resident | Payout rail · minimum | Commission (official) | Join |
|---|---|---|---|---|---|---|---|
| 1 | **Cloudways** | 1 hosting (80% off 2 months) | same-day — affiliate profile reviewed in about 24 h (next working day on weekends) | likely — "Anyone can join" | PayPal $250 · hosting credit $100 · wire $1,000+ | Slab up to $125/sale, or Hybrid $30 + 7% lifetime | Create a Cloudways account → side menu **Affiliate**: https://www.cloudways.com/en/web-hosting-affiliate-program.php |
| 2 | **SiteGround** | 1 hosting (88% off) | same-day — "Usually, the application will be approved immediately, but sometimes the review process may take up to 2 business days" | unknown — confirm on the form | weekly payouts, no minimum; rails not listed | unknown | https://www.siteground.com/affiliates |
| 3 | **beehiiv** | 1 newsletter (20% off, code BFCM2026) | instant — link shown after accepting terms (needs a beehiiv plan; free trial counts) | unknown | paid via Dub (bank account + tax form) | up to 60% for 12 months | https://www.beehiiv.com/partners |
| 4 | **systeme.io** | 1 funnel builder (−40%) | instant — "No application needed — you get your unique affiliate ID instantly after creating a free account" | likely | PayPal or wire · $30 | 60% lifetime recurring | https://systeme.io/register |
| 5 | **Seobility** | 1 SEO (60 days Premium free) | instant — "As soon as you sign up, you will gain access to your affiliate dashboard" | likely | PayPal or wire · €100 / $110 | 30% lifetime recurring | https://affiliate.seobility.net/affiliates/signup.php |
| 6 | **quso.ai** | 1 AI video (50% off yearly) | instant — "no approval wait" | likely | PayPal on the 15th · $50 | 30% recurring for life | https://quso.ai/affiliate-program |
| 7 | **Nuelink** | 1 social scheduler (6 months free) | instant tracking link once you have a Nuelink account (7-day trial counts) | likely | PayPal · $50 | 30% recurring | https://nuelink.com/affiliate |
| 8 | **Dubsado** | 1 CRM (50% off first year) | instant — "Open to every Dubsado user, including anyone on a free trial" | unknown | not stated (referral credit / payout in-app) | $35 per paid referral | https://www.dubsado.com/affiliate-program |
| 9 | **Pirsch** | 1 analytics (20% off) | instant — copy a personal link from your Pirsch account | likely | reward is Pirsch account credit, not cash | — | https://docs.pirsch.io/affiliate |

### Networks you can open today (unlock more programs later)

| Program | Why | Approval (official) | VN resident | Payout |
|---|---|---|---|---|
| **Awin** | Gateway to Sync.com (1 deal) and many retail/travel brands; each brand approves separately | same-day — "typically processed within 24 hours" | yes — Vietnam is in Awin's tax-residency list | Payoneer for international; older page mentions a £5 card deposit refunded at first payout — read the live form |
| **AccessTrade VN** | CellphoneS, Samsung VN, FPT Shop, Điện máy XANH campaigns (4 deals on `/vn/`) | account: email activation; each campaign approved separately | yes | VN bank · 200,000 VND approved, paid 18th & 25th |
| **Lazada Affiliates** | Instant links (no Lazada BF deal on the site yet) | instant — share links before payment KYC is approved | yes | VN bank · 500,000 VND |

## 2. Slow, but start the clock today (most traffic)

| Program | Deals on site | Approval (official) | Notes |
|---|---|---|---|
| **Impact** (partner account) | unlocks Best Buy (4), Coursera, Udemy, DataCamp, Bluehost, WordPress.com, InMotion, Razer, Setapp | "We review applications within 72 hours"; each brand approves again | VN listed by Impact; $10 threshold; PayPal / EFT / wire. Udemy says brand review "may take over a week". Razer caps coupon sites at 1%. |
| **Hostinger** | 5 (Premium, VPS, .com, Reach, AI Builder) | manual review, up to 5 business days | PayPal $100 / bank $500, payout by email request |
| **NordVPN** (also NordPass) | 2 | terms: notification "generally provided within two (2) business days" | PayPal or wire · $100 |
| **Shopee Affiliate (VN)** | 1 on `/vn/` | review starts 5 days after registering | VN bank · 10,000 VND |
| **Grammarly** | 1 | terms: decision generally within 2 business days | only portal-provided coupons may be used |
| **PartnerStack** (ElevenLabs, Brevo, Keeper, Tidio, Later) | 1 each | network review within 5 business days, then each brand | PayPal / Stripe / direct deposit · $5 |

## 3. Do not use on this site

Their terms ban coupon/deal sites, or the program is closed. Deals stay listed as plain **hook** links.

- **Proton** — excludes "coupon, deal, or discount sites"
- **ExpressVPN** — "We don't partner with coupon websites"; also has a minimum-traffic bar
- **MailerLite** — prohibits promotion "on coupon, deal, or discount websites"
- **Mangools** — "Coupon sites" listed as a restricted activity
- **Rank Math**, **Thrive Themes**, **Kinsta**, **WP Rocket** — coupon/deal sites banned
- **Tower** — affiliate page returns 404 (inactive)
- **Notion** — not accepting new affiliates
- **MindPal** — runs on Lemon Squeezy, which stopped taking new users on 16 Nov 2026
- **Synthesia** — allowed for now, but its terms list offering "rebates, coupons, or another form of promised kick-backs" as a violation: link the deal, never invent a code

## After approval

1. Put the ID or link template into `src/config/affiliates.json` (`id_or_tag` or `link_template` with `{url}`).
2. `npm run build && npm test`, then deploy. Affiliate links get `rel="sponsored nofollow noopener"` automatically; hooks stay plain.
