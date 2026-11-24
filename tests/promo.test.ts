import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCodes } from '../src/lib/promo.ts';

test('finds labelled codes in discount text, price and notes', () => {
  assert.deepEqual(extractCodes(['Use the code BLACK_FRIDAY_2026 at checkout', null, 'with code plerdyBF2026']), [
    'BLACK_FRIDAY_2026',
    'plerdyBF2026',
  ]);
  assert.deepEqual(extractCodes([null, 'Was $9.49, now $4.69 with code CYBER_2026', null]), ['CYBER_2026']);
});

test('ignores prose after the word code', () => {
  assert.deepEqual(extractCodes(['the code already applied; the code works on annual plans; code stops Monday']), []);
  assert.deepEqual(extractCodes(['No promo code needed']), []);
  assert.deepEqual(extractCodes(['Earlier note listed code BFCM802; it is gone']), []);
});
