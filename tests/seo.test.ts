import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildItemListJsonLd, categoryPath, ogImageFor, serializeJsonLd } from '../src/lib/seo.ts';

const deal = {
  id: 'acme-bf-50',
  title: 'Acme Pro: 50% off',
  merchant: 'Acme',
  category: 'ai',
  discount_text: '50% off',
  end_date: '2026-11-30',
  source_url: 'https://acme.example/pricing',
};

test('ItemList JSON-LD lists offers with merchant, link and validThrough', () => {
  const ld = buildItemListJsonLd([deal], { name: 'AI deals', pageUrl: 'https://site/category/ai/' });
  assert.equal(ld['@type'], 'ItemList');
  assert.equal(ld.numberOfItems, 1);
  const item = ld.itemListElement[0];
  assert.equal(item.position, 1);
  assert.equal(item.url, 'https://site/category/ai/#deal-acme-bf-50');
  assert.equal(item.item['@type'], 'Offer');
  assert.equal(item.item.url, 'https://acme.example/pricing');
  assert.equal(item.item.validThrough, '2026-11-30T23:59:59+07:00');
  assert.equal(item.item.seller.name, 'Acme');
});

test('serializeJsonLd cannot break out of a script tag', () => {
  assert.ok(!serializeJsonLd({ x: '</script><b>' }).includes('</script>'));
});

test('category paths and OG images', () => {
  assert.equal(categoryPath('dev-tools'), '/category/dev-tools/');
  assert.equal(ogImageFor('vpn'), '/og/vpn.png');
  assert.equal(ogImageFor('unknown-cat'), '/og/site.png');
});
