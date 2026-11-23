import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const outDirs = ['/opt/cursor/artifacts', 'docs/screenshots'];

async function shot(page, name) {
  for (const dir of outDirs) {
    await mkdir(dir, { recursive: true });
    await page.screenshot({
      path: path.join(dir, `${name}.png`),
      fullPage: false,
    });
  }
}

const browser = await chromium.launch();
try {
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await shot(page, 'night-desktop-top');
    await page.evaluate(() => window.scrollTo(0, 720));
    await page.waitForTimeout(400);
    await shot(page, 'night-desktop-scrolled');
    await page.evaluate(() =>
      document.querySelector('#deal-typingmind-premium-60')?.scrollIntoView({ block: 'center' })
    );
    await page.waitForTimeout(300);
    await shot(page, 'night-desktop-deals');
    await ctx.close();
  }

  {
    const iphone = devices['iPhone 12'];
    const ctx = await browser.newContext({ ...iphone });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await shot(page, 'night-mobile-top');
    await page.evaluate(() => window.scrollTo(0, 420));
    await page.waitForTimeout(400);
    await shot(page, 'night-mobile-sticky');
    await page.evaluate(() =>
      document.querySelector('#deal-mindpal-bf-60')?.scrollIntoView({ block: 'center' })
    );
    await page.waitForTimeout(300);
    await shot(page, 'night-mobile-deals');
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log('Screenshots saved to docs/screenshots/ and /opt/cursor/artifacts/');