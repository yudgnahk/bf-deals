import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicNotes } from '../src/lib/notes.ts';

test('keeps shopper-facing terms', () => {
  const n = 'Official /black-friday page, 48-month Premium. Renews at $10.99/mo for the same term.';
  assert.equal(publicNotes(n), n);
});

test('drops editor-only sentences about fetches, sessions, rechecks and affiliates', () => {
  assert.equal(
    publicNotes('Sale runs Nov 11–29, 60% off annual Premium. Renewal price not printed on the VPS card in this fetch. No joinable affiliate program confirmed this session.'),
    'Sale runs Nov 11–29, 60% off annual Premium.'
  );
  assert.equal(
    publicNotes('Code BFCM802 by December 4. Affiliate: https://www.cloudways.com/en/affiliate.php. Recheck before 27/11.'),
    'Code BFCM802 by December 4.'
  );
  assert.equal(publicNotes('Plan prices and end date did not render (JS merch cards); kept 55% until the body renders.'), null);
});

test('drops remarks about third-party figures, extraction and bots', () => {
  assert.equal(
    publicNotes("Save up to 55%. Third-party 57% / $29.99 figures were not seen on this official page and are not used."),
    'Save up to 55%.'
  );
  assert.equal(publicNotes('Half price. Monthly cards showed $30.00, not the yearly figures (those were not clearly extracted).'), 'Half price.');
  assert.equal(publicNotes('$330 → $132. Automated HEAD/CI may see 403 (bot wall), not 404.'), '$330 → $132.');
  assert.equal(publicNotes('Ends Dec 4. Uncertain whether the dedicated BF page will change.'), 'Ends Dec 4.');
});

test('null or fully internal notes give null', () => {
  assert.equal(publicNotes(undefined), null);
  assert.equal(publicNotes('No official affiliate program confirmed this session.'), null);
});
