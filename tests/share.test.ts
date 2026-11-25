import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOfferJsonLd,
  dealOgCard,
  dealOgPath,
  dealPageDescription,
  dealPageTitle,
  dealPath,
  dealShareText,
  shareTargets,
} from '../src/lib/share.ts';

const deal = {
  id: 'acme-bf-50',
  title: 'Acme Pro Black Friday: 50% off yearly',
  merchant: 'Acme',
  category: 'ai',
  discount_text: '50% off',
  price: '$20 → $10/mo',
  end_date: '2026-11-30',
  source_url: 'https://acme.example/pricing',
  verified_at: '2026-11-25',
};

const bare = { ...deal, discount_text: null, price: null, end_date: null };

test('deal path is a trailing-slash page under /deal/', () => {
  assert.equal(dealPath('acme-bf-50'), '/deal/acme-bf-50/');
});

test('share text carries merchant, discount, price and end date', () => {
  assert.equal(dealShareText(deal), 'Acme: 50% off · $20 → $10/mo · ends 30 Nov');
  assert.equal(dealShareText(bare), 'Acme Pro Black Friday: 50% off yearly');
});

test('Vietnamese share text uses Vietnamese end-date wording', () => {
  assert.equal(dealShareText(deal, 'vi'), 'Acme: 50% off · $20 → $10/mo · hết hạn 30/11');
});

test('page title and description never invent missing fields', () => {
  assert.match(dealPageTitle(deal), /^Acme: 50% off — Black Friday 2026 \| BF Deals 2026$/);
  assert.match(dealPageTitle(bare), /^Acme Pro Black Friday: 50% off yearly \| BF Deals 2026$/);
  assert.match(dealPageDescription(deal), /checked 2026-11-25/);
  assert.match(dealPageDescription(deal), /Ends 2026-11-30/);
  assert.doesNotMatch(dealPageDescription(bare), /Ends|undefined|null/);
});

test('share targets URL-encode the deal link and text', () => {
  const url = 'https://site.example/deal/acme-bf-50/';
  const targets = shareTargets(url, 'Acme: 50% off');
  const names = targets.map((t) => t.name);
  assert.deepEqual(names, ['X', 'Facebook', 'Telegram', 'Reddit']);
  for (const t of targets) {
    assert.ok(t.href.startsWith('https://'));
    assert.ok(t.href.includes(encodeURIComponent(url)), `${t.name} carries the link`);
  }
});

test('Offer JSON-LD points at the merchant and keeps validThrough optional', () => {
  const ld = buildOfferJsonLd(deal, 'https://site.example/deal/acme-bf-50/');
  assert.equal(ld['@type'], 'Offer');
  assert.equal(ld.url, 'https://acme.example/pricing');
  assert.equal(ld.validThrough, '2026-11-30T23:59:59+07:00');
  assert.equal(ld.seller.name, 'Acme');
  assert.equal(ld.price, '10');
  assert.equal(ld.priceCurrency, 'USD');
  assert.equal('validThrough' in buildOfferJsonLd(bare, 'https://x/'), false);
});

test('OG card shows merchant, badge and end date; never invents a badge', () => {
  assert.deepEqual(dealOgCard(deal), {
    kicker: 'Black Friday 2026 · ends 30 Nov',
    line1: 'Acme',
    line2: '-50%',
  });
  assert.deepEqual(dealOgCard(bare), {
    kicker: 'Black Friday & Cyber Monday 2026',
    line1: 'Acme',
    line2: 'deal',
  });
  assert.equal(dealOgCard({ ...deal, discount_text: 'Giảm đến 50%' }, 'vi').kicker, 'Black Friday 2026 · hết hạn 30/11');
  assert.equal(dealOgCard({ ...deal, discount_text: 'Up to 78% off' }).line2, 'up to 78%');
});

test('OG image path is per deal under /og/deal/', () => {
  assert.equal(dealOgPath('acme-bf-50'), '/og/deal/acme-bf-50.png');
});
