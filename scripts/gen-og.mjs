#!/usr/bin/env node
// Renders public/og/*.png (1200×630) from scripts/og/template.html with agent-browser.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { OG_CATEGORY_SLUGS } from '../src/lib/seo.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const template = pathToFileURL(join(root, 'scripts/og/template.html')).href;
const outDir = join(root, 'public/og');
const SESSION = 'bf-og';

const LABELS = {
  ai: 'AI tools', 'dev-tools': 'Dev tools', saas: 'SaaS', productivity: 'Productivity',
  design: 'Design', marketing: 'Marketing', hosting: 'Hosting', vpn: 'VPN',
  courses: 'Courses', electronics: 'Electronics', travel: 'Travel', home: 'Home',
};

const cards = [
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

const ab = (...args) => execFileSync('agent-browser', ['--session', SESSION, ...args], { stdio: 'pipe' });

mkdirSync(outDir, { recursive: true });
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
