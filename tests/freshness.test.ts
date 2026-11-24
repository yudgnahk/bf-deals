import { test } from 'node:test';
import assert from 'node:assert/strict';
import { endingWithin, isNewDeal, newUntil, sortBySoonestEnd } from '../src/lib/freshness.ts';

const deal = (id: string, end_date: string | null, added_at?: string) => ({ id, end_date, added_at });

test('isNewDeal is true inside the 48h window and false after', () => {
  const added = '2026-11-25T03:00:00+07:00';
  assert.equal(isNewDeal(added, new Date('2026-11-26T03:00:00+07:00')), true);
  assert.equal(isNewDeal(added, new Date('2026-11-27T03:00:01+07:00')), false);
  assert.equal(isNewDeal(undefined, new Date()), false);
});

test('date-only added_at counts from midnight Asia/Saigon', () => {
  assert.equal(newUntil('2026-11-25'), '2026-11-26T17:00:00.000Z');
});

test('sortBySoonestEnd puts unknown end dates last', () => {
  const sorted = sortBySoonestEnd([deal('a', null), deal('b', '2026-12-01'), deal('c', '2026-11-27')]);
  assert.deepEqual(sorted.map((d) => d.id), ['c', 'b', 'a']);
});

test('endingWithin keeps only deals ending in the next N days', () => {
  const today = new Date(2026, 10, 25);
  const list = [deal('past', '2026-11-24'), deal('today', '2026-11-25'), deal('in3', '2026-11-28'), deal('in5', '2026-11-30'), deal('none', null)];
  assert.deepEqual(endingWithin(list, 3, today).map((d) => d.id), ['today', 'in3']);
});
