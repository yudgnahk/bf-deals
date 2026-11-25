import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCodes, isAutoApplied } from '../src/lib/promo.ts';

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
  assert.deepEqual(extractCodes(['Discount applies with code ONLY at checkout; code OFFICIAL page']), []);
  assert.deepEqual(extractCodes(['Earlier note listed code BFCM802; it is gone']), []);
});

test('flags codes the merchant applies by itself', () => {
  assert.equal(isAutoApplied('BLACKFRIDAY', ['Official pricing page; code BLACKFRIDAY is applied automatically at checkout. Monthly excluded.']), true);
  assert.equal(isAutoApplied('BLACKFRIDAY26', ['Regular License only, code BLACKFRIDAY26 pre-applied at checkout; Agency excluded.']), true);
  assert.equal(isAutoApplied('BFCM26', ['code BFCM26 is added when starting the trial via this page; monthly option is 25% off.']), true);
  assert.equal(isAutoApplied('PAYPAL100', ['Code PAYPAL100: $100 off select Galaxy devices. Discount applied automatically to bundles.']), false);
  assert.equal(isAutoApplied('BF2026', ['Use code BF2026 at checkout.']), false);
  assert.equal(isAutoApplied('LITEFRIDAY26', ['Annual plans only. Code LITEFRIDAY26 must be entered (not automatic).']), false);
  assert.equal(isAutoApplied('SEMBLY20', ['Use code SEMBLY20. Code SEMBLY20 is not applied automatically.']), false);
});
