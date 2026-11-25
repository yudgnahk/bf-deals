#!/usr/bin/env node
// Renders public/og/*.png (1200×630) from scripts/og/template.html with agent-browser.
// `--deals` renders one card per deal into public/og/deal/ instead.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { OG_CATEGORY_SLUGS } from '../src/lib/seo.ts';
import { dealOgCard } from '../src/lib/share.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const template = pathToFileURL(join(root, 'scripts/og/template.html')).href;
const outDir = join(root, 'public/og');
const SESSION = 'bf-og';

const LABELS = {
  ai: 'AI tools', 'dev-tools': 'Dev tools', saas: 'SaaS', productivity: 'Productivity',
  design: 'Design', marketing: 'Marketing', hosting: 'Hosting', vpn: 'VPN',
  courses: 'Courses', electronics: 'Electronics', streaming: 'Streaming', travel: 'Travel', home: 'Home',
};

const siteCards = [
  { slug: 'site', kicker: 'AI · Dev tools · SaaS · VPN · Hosting', line1: 'Black', line2: 'Friday' },
  { slug: 'about', kicker: 'About & disclosure', line1: 'How we', line2: 'check deals' },
  { slug: 'vn', kicker: 'Black Friday 27/11 · Cyber Monday 30/11', line1: 'Vietnam', line2: 'deals' },
  ...OG_CATEGORY_SLUGS.map((slug) => ({
    slug,
    kicker: 'Black Friday & Cyber Monday 2026',
    line1: LABELS[slug] ?? slug,
    line2: 'deals',
  })),
];

// Same set as src/pages/deal/[id].astro: active visible deals plus VN rows.
function dealCards() {
  const deals = JSON.parse(readFileSync(join(root, 'src/data/deals.json'), 'utf8'));
  const now = new Date();
  const expired = (d) => d.end_date && now > new Date(`${d.end_date}T23:59:59.999`);
  return deals
    .filter((d) => !expired(d) && (!d.hidden || d.region === 'vn'))
    .map((d) => ({ slug: `deal/${d.id}`, ...dealOgCard(d, d.region === 'vn' ? 'vi' : 'en') }));
}

const allCards = process.argv.includes('--deals') ? dealCards() : siteCards;
// `--missing` renders only cards with no PNG yet (new deals) instead of all of them.
const cards = process.argv.includes('--missing')
  ? allCards.filter((card) => !existsSync(join(outDir, `${card.slug}.png`)))
  : allCards;

const RETRIES = 4;

// The agent-browser daemon is shared and can briefly refuse calls; retry before giving up.
function ab(...args) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return execFileSync('agent-browser', ['--session', SESSION, ...args], { stdio: 'pipe' });
    } catch (err) {
      if (attempt >= RETRIES) throw new Error(`agent-browser ${args[0]} failed: ${err.stderr?.toString() ?? err}`);
      execFileSync('sleep', [String(attempt)]);
    }
  }
}

mkdirSync(join(outDir, 'deal'), { recursive: true });
try {
  ab('set', 'viewport', '1200', '630');
  for (const card of cards) {
    const qs = new URLSearchParams({ kicker: card.kicker, line1: card.line1, line2: card.line2 });
    ab('open', `${template}?${qs}`);
    ab('wait', 'body[data-ready="1"]');
    ab('screenshot', join(outDir, `${card.slug}.png`));
    process.stdout.write(`og/${card.slug}.png\n`);
  }
} finally {
  ab('close');
}
