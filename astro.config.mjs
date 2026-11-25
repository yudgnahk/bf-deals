// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

const buildDate = new Date().toISOString();
// Deal pages change when a deal is re-verified, not on every build.
const verifiedById = new Map(
  JSON.parse(readFileSync(new URL('./src/data/deals.json', import.meta.url), 'utf8')).map((d) => [d.id, d.verified_at])
);

/** @param {string} url */
function lastmodFor(url) {
  const id = url.match(/\/deal\/([^/]+)\/$/)?.[1];
  const verified = id ? verifiedById.get(id) : undefined;
  return verified ? `${verified}T00:00:00Z` : buildDate;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://bf-deals.haleduykhang.workers.dev',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404/') && !page.endsWith('/404'),
      serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url) }),
    }),
  ],
  build: {
    format: 'directory',
  },
});
