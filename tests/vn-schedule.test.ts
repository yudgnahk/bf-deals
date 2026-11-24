import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildVnSchedule, scheduleDays } from '../src/lib/vn-schedule.ts';

const entries = [
  { deal_id: 'a', from: '2026-11-26', to: '2026-11-27', slots: '9h–11h', what: 'A' },
  { deal_id: 'b', from: '2026-11-27', to: '2026-11-27', slots: null, what: 'B' },
  { deal_id: 'gone', from: '2026-11-27', to: '2026-11-27', slots: null, what: 'expired deal' },
];
const merchants = { a: 'Alpha', b: 'Beta' };

test('scheduleDays lists every calendar day inclusive', () => {
  assert.deepEqual(scheduleDays('2026-11-29', '2026-12-01'), ['2026-11-29', '2026-11-30', '2026-12-01']);
});

test('each day lists only entries running that day, and skips deals no longer on the site', () => {
  const days = buildVnSchedule(entries, merchants, '2026-11-26', '2026-11-28');
  assert.deepEqual(days.map((d) => [d.date, d.items.map((i) => i.merchant)]), [
    ['2026-11-26', ['Alpha']],
    ['2026-11-27', ['Alpha', 'Beta']],
    ['2026-11-28', []],
  ]);
  assert.equal(days[0].label, 'Thứ Năm 26/11');
  assert.equal(days[1].items[0].slots, '9h–11h');
});

test('entries that start or end that day are flagged', () => {
  const [d26, d27] = buildVnSchedule(entries, merchants, '2026-11-26', '2026-11-27');
  assert.equal(d26.items[0].starts, true);
  assert.equal(d27.items[0].lastDay, true);
});
