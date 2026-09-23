// Every row the findings panel cites for its source chips must exist. The panel drops an
// unknown id silently, so a typo or a renamed row would lose its chips with nothing failing.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { metaRows } from './rows.ts';

describe('the findings panel cites only rows that exist', () => {
  it('every driver id names a knowledge-base or render row', () => {
    const src = readFileSync(resolve(import.meta.dirname, '..', 'src', 'render', 'panel.ts'), 'utf8');
    const blocks = [...src.matchAll(/drivers:\s*\[([^\]]*)\]/g)].map((m) => m[1] ?? '');
    const ids = blocks.flatMap((b) => [...b.matchAll(/'([a-z0-9.-]+)'/g)].map((m) => m[1] ?? ''));
    assert.ok(ids.length > 40, `found ${ids.length} driver ids; the pattern no longer reads panel.ts`);
    const known = new Set([...metaRows(KB), ...metaRows(RENDER)].map((m) => m.id));
    assert.deepEqual(ids.filter((id) => !known.has(id)), []);
  });
});
