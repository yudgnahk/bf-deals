import { test } from 'node:test';
import assert from 'node:assert/strict';
import { offerPrice, parsePriceParts } from '../src/lib/price.ts';

const pair = (price: string) => {
  const p = parsePriceParts(price);
  return p.original && p.current ? [p.original, p.current] : null;
};

test('bare numbers like "2-year" or "3 months" never become a strike price', () => {
  for (const price of [
    'From $2.99/month for a 2-year plan',
    '$8.99/mo for 3 months (Premium)',
    '$2.99/mo for 2 months',
    'Photo RAW 2027 $59.99 one-time',
  ]) {
    assert.equal(pair(price), null, price);
  }
});

test('half a parenthesis never ends up on either side of the pair', () => {
  assert.equal(pair('$490/year (shown vs $1,584 value)'), null);
  assert.equal(pair('Essential $126.00 for 13 months ($14.95 → $9.69/month)'), null);
});

test('only the first clause is paired when the price lists alternatives', () => {
  assert.deepEqual(
    pair('$29.50/month instead of $59 billed monthly, or $294 instead of $588 billed yearly'),
    ['$59 billed monthly', '$29.50/month']
  );
});

test('real list → sale pairs still split', () => {
  assert.deepEqual(pair('$12.99 $1.99/mo'), ['$12.99', '$1.99/mo']);
  assert.deepEqual(pair('Pro $89 → $59 /month ($708 billed yearly)'), ['Pro $89', '$59 /month ($708 billed yearly)']);
  assert.deepEqual(pair('$79.20 instead of $198'), ['$198', '$79.20']);
  assert.deepEqual(pair('$399 → $239'), ['$399', '$239']);
  assert.deepEqual(pair('3.490.000đ → 1.990.000đ'), ['3.490.000đ', '1.990.000đ']);
  assert.deepEqual(pair('1517 USD → 579 USD'), ['1517 USD', '579 USD']);
  assert.deepEqual(pair('1,199.50 EUR → 899.50 EUR'), ['1,199.50 EUR', '899.50 EUR']);
});

test('two sale prices for different plans or terms are not a list → sale pair', () => {
  assert.equal(pair('Business $14.99 / $12.99 per month billed annually (ex VAT)'), null);
  assert.equal(pair('Monthly $20 and yearly $15 per month'), null);
  assert.equal(offerPrice('Business $14.99 / $12.99 per month billed annually (ex VAT)'), null);
  assert.deepEqual(pair('$17.99 Save 88% $1.99/mo.'), ['$17.99', '$1.99/mo.']);
  assert.deepEqual(pair('Pro Regular $99 Sale $59'), ['$99', '$59']);
  assert.deepEqual(pair('Originally From $64.99 now From $49.06'), ['$64.99', '$49.06']);
});

test('sale higher than list is never paired', () => {
  assert.equal(pair('$10 → $20'), null);
});

test('offerPrice reads the sale amount and currency, or nothing when unclear', () => {
  assert.deepEqual(offerPrice('$12.99 $1.99/mo'), { price: '1.99', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('$399 → $239'), { price: '239', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('€9.99/month'), { price: '9.99', priceCurrency: 'EUR' });
  assert.deepEqual(offerPrice('3.490.000đ → 1.990.000đ'), { price: '1990000', priceCurrency: 'VND' });
  assert.deepEqual(offerPrice('$1,620 → $540'), { price: '540', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('1517 USD → 579 USD'), { price: '579', priceCurrency: 'USD' });
  assert.equal(offerPrice(null), null);
  assert.equal(offerPrice('Courses starting at $9.99; bundles from $29'), null, 'several amounts, no clear sale price');
  assert.equal(offerPrice('Giảm đến 50%'), null);
  assert.equal(offerPrice('Basic $99/license before the code (sale total not printed)'), null, 'pre-discount amount');
});
