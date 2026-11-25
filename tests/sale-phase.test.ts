import { test } from 'node:test';
import assert from 'node:assert/strict';
import { salePhase, splitDuration } from '../src/lib/sale-phase.ts';

const at = (iso: string) => new Date(iso).getTime();

test('before Black Friday counts down to 27 Nov 00:00 +07', () => {
  const p = salePhase(at('2026-11-25T07:00:00+07:00'));
  assert.equal(p.key, 'pre-bf');
  assert.equal(p.target, at('2026-11-27T00:00:00+07:00'));
});

test('during Black Friday weekend counts down to Cyber Monday', () => {
  for (const iso of ['2026-11-27T00:00:00+07:00', '2026-11-29T23:59:59+07:00']) {
    const p = salePhase(at(iso));
    assert.equal(p.key, 'bf-live');
    assert.equal(p.target, at('2026-11-30T00:00:00+07:00'));
  }
});

test('on Cyber Monday counts down to its end', () => {
  const p = salePhase(at('2026-11-30T12:00:00+07:00'));
  assert.equal(p.key, 'cm-live');
  assert.equal(p.target, at('2026-12-01T00:00:00+07:00'));
});

test('after Cyber Monday there is no target', () => {
  const p = salePhase(at('2026-12-01T00:00:00+07:00'));
  assert.equal(p.key, 'over');
  assert.equal(p.target, null);
});

test('every phase has English and Vietnamese labels', () => {
  for (const iso of ['2026-11-25T00:00:00+07:00', '2026-11-28T00:00:00+07:00', '2026-11-30T01:00:00+07:00', '2026-12-02T00:00:00+07:00']) {
    const p = salePhase(at(iso));
    assert.ok(p.label.en && p.label.vi, p.key);
  }
});

test('splitDuration breaks milliseconds into d/h/m/s and clamps negatives', () => {
  assert.deepEqual(splitDuration(((1 * 24 + 2) * 3600 + 3 * 60 + 4) * 1000), { d: 1, h: 2, m: 3, s: 4 });
  assert.deepEqual(splitDuration(-5), { d: 0, h: 0, m: 0, s: 0 });
});
