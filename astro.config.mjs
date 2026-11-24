// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const buildDate = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
  site: 'https://bf-deals.haleduykhang.workers.dev',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404/') && !page.endsWith('/404'),
      serialize: (item) => ({ ...item, lastmod: buildDate }),
    }),
  ],
  build: {
    format: 'directory',
  },
});
