#!/usr/bin/env node
/**
 * Sync worker/deal-ids.json from src/data/deals.json so the Worker
 * allowlist stays in lockstep with the site data.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const deals = JSON.parse(readFileSync(join(root, 'src/data/deals.json'), 'utf8'));
const ids = deals.map((d) => d.id).sort();
mkdirSync(join(root, 'worker'), { recursive: true });
const out = join(root, 'worker/deal-ids.json');
writeFileSync(out, JSON.stringify(ids, null, 2) + '\n');
console.log(`Synced ${ids.length} deal ids → worker/deal-ids.json`);
