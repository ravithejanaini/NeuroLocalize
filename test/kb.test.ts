import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { ALL_CASES as CASES } from '../spec/expectations/index.ts';
import { KB } from '../src/kb/kb.ts';
import { MECHANISMS } from '../src/kb/mechanisms.ts';
import { RENDER } from '../src/kb/render.ts';
import { SOURCE_IDS, SOURCES } from '../src/kb/sources.ts';
import type { Meta } from '../src/kb/types.ts';
import { metaRows } from './rows.ts';

const DOCS = resolve(import.meta.dirname, '..', 'docs');
const rows: Meta[] = [...metaRows(KB), ...metaRows(RENDER), ...MECHANISMS.map((m) => m.meta)];

describe('knowledge-base integrity', () => {
  it('every row is sourced, pending with a reason, or definitional', () => {
    const bare = rows.filter((m) => m.sources.length === 0 && !m.pendingSource && !m.definitional);
    assert.deepEqual(bare.map((m) => m.id), []);
  });

  it('T1 rows have two sources (or are definitional) and no conflict', () => {
    const weak = rows.filter((m) => m.tier === 'T1' && ((m.sources.length < 2 && !m.definitional) || m.conflict));
    assert.deepEqual(weak.map((m) => m.id), []);
  });

  it('a conflict forces T3, and every conflict is written up in DECISIONS.md', () => {
    const decisions = readFileSync(resolve(DOCS, 'DECISIONS.md'), 'utf8');
    for (const m of rows.filter((r) => r.conflict)) {
      assert.equal(m.tier, 'T3', `${m.id} carries ${m.conflict} but is ${m.tier}`);
      assert.match(decisions, new RegExp(`\\*\\*${m.conflict} —`), `${m.conflict} is not recorded`);
    }
  });

  it('row ids are unique', () => {
    const ids = rows.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('every cited source is registered, and the registry matches docs/SOURCES.md', () => {
    const table = readFileSync(resolve(DOCS, 'SOURCES.md'), 'utf8');
    const documented = [...table.matchAll(/^\| (S\d{2,3}) \|/gm)].map((m) => m[1]);
    assert.deepEqual(documented, [...SOURCE_IDS]);
    const linked = [...table.matchAll(/^\| (S\d{2,3}) \| \[([^\]]+)\]\(([^)]+)\)/gm)].map((m) => ({ id: m[1], title: m[2], url: m[3] }));
    assert.deepEqual(SOURCES.map((s) => ({ id: s.id, title: s.title, url: s.url })), linked);

    const cited = new Set([
      ...rows.flatMap((m) => m.sources),
      ...MECHANISMS.flatMap((m) => m.positions.flatMap((p) => p.sources)),
      ...CASES.flatMap((c) => c.evaluations.flatMap((e) => e.assertions.flatMap((a) => a.cite))),
    ]);
    const unknown = [...cited].filter((id) => !SOURCE_IDS.includes(id));
    assert.deepEqual(unknown, []);
  });

  it('every mechanism explains an existing observation, and a contested one names two positions', () => {
    const ids = new Set(rows.map((m) => m.id));
    for (const m of MECHANISMS) {
      assert.ok(ids.has(m.explains), `${m.meta.id} explains unknown ${m.explains}`);
      if (m.meta.tier === 'T3') assert.ok(m.positions.length >= 2, `${m.meta.id} is T3 with one position`);
    }
  });

  it('reports the rows still waiting on a source', () => {
    const pending = rows.filter((m) => m.pendingSource);
    for (const m of pending) console.log(`  pending  ${m.id}: ${m.pendingSource}`);
    console.log(`  ${pending.length} of ${rows.length} rows pending a source; ${rows.length} rows await book page references (D1)`);
    assert.ok(true);
  });
});
