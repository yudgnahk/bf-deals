import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterBoard, type BoardRow } from '../src/lib/board-filter.ts';

const today = new Date(2026, 10, 25, 12); // 25 Nov 2026, local noon
const row = (over: Partial<BoardRow>): BoardRow => ({
  category: 'ai', region: 'both', endDate: '2026-11-30', search: 'acme ai', hasCode: false, ...over,
});
const rows = [
  row({ category: 'ai', hasCode: true }),
  row({ category: 'ai' }),
  row({ category: 'vpn', hasCode: true }),
  row({ category: 'vpn', endDate: '2026-11-24' }), // expired yesterday
  row({ category: 'travel', region: 'vn' }), // VN-only, hidden from intl
];
const state = { region: 'intl', category: 'all', query: '', codeOnly: false };

test('shows live rows in the region and counts them per category', () => {
  const r = filterBoard(rows, state, today);
  assert.deepEqual(r.visible, [true, true, true, false, false]);
  assert.deepEqual(r.counts, { all: 3, byCategory: { ai: 2, vpn: 1 }, withCode: 2 });
});

test('a deal stays live through the whole end day', () => {
  const lastDay = new Date(2026, 10, 30, 23, 59);
  assert.deepEqual(filterBoard([row({})], state, lastDay).visible, [true]);
  assert.deepEqual(filterBoard([row({})], state, new Date(2026, 11, 1, 0, 1)).visible, [false]);
});

test('Has code narrows rows and the category chips, but its own count ignores the toggle', () => {
  const r = filterBoard(rows, { ...state, codeOnly: true }, today);
  assert.deepEqual(r.visible, [true, false, true, false, false]);
  assert.deepEqual(r.counts, { all: 2, byCategory: { ai: 1, vpn: 1 }, withCode: 2 });
});

test('category and search narrow rows; Has code count follows the category', () => {
  const r = filterBoard(rows, { ...state, category: 'vpn' }, today);
  assert.deepEqual(r.visible, [false, false, true, false, false]);
  assert.equal(r.counts.withCode, 1);
  assert.equal(r.counts.all, 3, 'All chip still counts every category');
  assert.deepEqual(filterBoard(rows, { ...state, query: 'nomatch' }, today).counts.all, 0);
});

test('region all and vn include VN-only rows', () => {
  assert.equal(filterBoard(rows, { ...state, region: 'all' }, today).counts.all, 4);
  assert.equal(filterBoard(rows, { ...state, region: 'vn' }, today).counts.all, 4);
});
