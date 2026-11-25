import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePriceParts } from '../src/lib/price.ts';

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
});

test('sale higher than list is never paired', () => {
  assert.equal(pair('$10 → $20'), null);
});
