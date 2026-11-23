#!/usr/bin/env node
/**
 * Requests every source_url in src/data/deals.json and reports dead ones.
 * Non-blocking for build — exit 0 even when some links fail (exit 1 only on script error).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dealsPath = join(__dirname, '..', 'src', 'data', 'deals.json');

const deals = JSON.parse(readFileSync(dealsPath, 'utf8'));
const urls = [...new Set(deals.map((d) => d.source_url).filter(Boolean))];

const TIMEOUT_MS = 15000;
const CONCURRENCY = 5;

async function checkOne(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'bf-deals-check-links/1.0 (+https://bf-deals.haleduykhang.workers.dev)',
      },
    });
    // Some CDNs reject HEAD — retry GET
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'bf-deals-check-links/1.0 (+https://bf-deals.haleduykhang.workers.dev)',
        },
      });
    }
    clearTimeout(timer);
    return { url, ok: res.ok, status: res.status };
  } catch (err) {
    clearTimeout(timer);
    return {
      url,
      ok: false,
      status: 0,
      error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err),
    };
  }
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => next()));
  return results;
}

console.log(`Checking ${urls.length} unique source_url(s)…`);
const results = await runPool(urls, checkOne, CONCURRENCY);
const dead = results.filter((r) => !r.ok);

for (const r of results) {
  const mark = r.ok ? 'OK  ' : 'DEAD';
  const detail = r.error ? `${r.status} ${r.error}` : String(r.status);
  console.log(`${mark}  ${detail.padEnd(16)} ${r.url}`);
}

console.log('');
if (dead.length === 0) {
  console.log(`All ${results.length} links responded OK.`);
} else {
  console.log(`${dead.length} dead / unreachable link(s):`);
  for (const d of dead) {
    console.log(`  - ${d.url} (${d.error || d.status})`);
  }
}

// Always exit 0 so CI/build is not blocked by flaky merchant sites
process.exit(0);
