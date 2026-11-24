// Happy-path checks on `dist/`; run `npm run build` first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dirname, '..', 'dist');
const read = (p) => readFileSync(join(dist, p), 'utf8');
const jsonLdBlocks = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));

test('dist exists', () => {
  assert.ok(existsSync(join(dist, 'index.html')), 'run npm run build before npm test');
});

test('home page has deal rows, ending-soon sort and parseable JSON-LD', () => {
  const html = read('index.html');
  assert.match(html, /class="deal-row"/);
  assert.match(html, /<option value="ending-soon"/);
  assert.match(html, /<option value="newest"/);
  const blocks = jsonLdBlocks(html).flat();
  assert.ok(blocks.some((b) => b['@type'] === 'ItemList' && b.itemListElement.length > 0));
  assert.match(html, /property="og:image" content="https:\/\/[^"]+\/og\/site\.png"/);
});

test('category page renders only its category with its own meta', () => {
  const html = read('category/ai/index.html');
  const cats = [...html.matchAll(/data-category="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(cats.length > 0);
  assert.ok(cats.every((c) => c === 'ai'));
  assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+\/category\/ai\/"/);
  assert.match(html, /og\/ai\.png/);
  const types = jsonLdBlocks(html).flat().map((b) => b['@type']);
  assert.deepEqual(types.sort(), ['BreadcrumbList', 'ItemList']);
});

test('robots.txt and sitemap include category pages', () => {
  assert.match(read('robots.txt'), /Sitemap: https:\/\/.+\/sitemap-index\.xml/);
  const sitemap = read('sitemap-0.xml');
  assert.match(sitemap, /\/category\/ai\/<\/loc>/);
  assert.doesNotMatch(sitemap, /404/);
});

test('every OG image referenced by a page exists', () => {
  for (const page of ['index.html', 'about/index.html', 'category/ai/index.html', 'vn/index.html']) {
    const m = read(page).match(/property="og:image" content="https?:\/\/[^/]+(\/[^"]+)"/);
    assert.ok(m, `${page} has og:image`);
    assert.ok(existsSync(join(dist, m[1])), `${m[1]} exists`);
  }
});

test('VN page is Vietnamese and lists only vn rows', () => {
  const html = read('vn/index.html');
  assert.match(html, /<html lang="vi" data-lang="vi"/);
  assert.match(html, /data-region-filter="vn"/);
  const regions = [...html.matchAll(/data-region="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(regions.length > 0);
  assert.ok(regions.every((r) => r === 'vn'));
});
