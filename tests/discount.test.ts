import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDiscountBadge } from '../src/lib/discount.ts';

test('single percentage keeps its exact badge', () => {
  assert.equal(formatDiscountBadge('85% off'), '-85%');
  assert.equal(formatDiscountBadge('Up to 78% off'), 'up to 78%');
  assert.equal(formatDiscountBadge('Giảm đến 50%'), 'up to 50%');
  assert.equal(formatDiscountBadge('Get Broadcast for $150'), null);
});

test('tiered percentages show the top tier as "up to", not the first number', () => {
  assert.equal(formatDiscountBadge('15% off one eligible product, 20% off two and 25% off three'), 'up to 25%');
  assert.equal(formatDiscountBadge('40% off Echo fan favorites; up to 65% off Ring bundles'), 'up to 65%');
  assert.equal(formatDiscountBadge('50% Off Yearly, 25% Off Monthly'), 'up to 50%');
});
