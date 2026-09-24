import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { buildWorksheet } from '../scripts/review-data.ts';
import { parseResponse, triage, type ReviewResponse } from '../scripts/review-lib.ts';

const ws = buildWorksheet();
const base = {
  kind: 'neurolocalize-review',
  format: 1,
  worksheet: ws.version,
  reviewer: { name: ' Dr A ', role: 'neurology' },
  savedAt: '2026-09-17T10:00:00.000Z',
  answers: {},
};
const parsed = (x: unknown): ReviewResponse => {
  const r = parseResponse(JSON.stringify(x));
  assert.ok(r.ok, r.ok ? '' : r.error);
  return r.value;
};

describe('the review worksheet', () => {
  it('asks about every claim once, with a stable id', () => {
    const ids = ws.items.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
    const findings = ws.items.flatMap((i) => i.findings ?? []).map((f) => f.id);
    assert.equal(new Set(findings).size, findings.length, 'two composed findings share an id');
    for (const s of ['claim', 'fact', 'question', 'case'] as const) assert.ok(ws.items.some((i) => i.section === s), s);
    assert.equal(buildWorksheet().version, ws.version, 'the version is deterministic');
  });

  it('asks every reviewer question in docs/DECISIONS.md, the last one too', () => {
    // The last question ends the file with no blank line after it; until P14 that one was dropped.
    const text = readFileSync(resolve(import.meta.dirname, '..', 'docs', 'DECISIONS.md'), 'utf8');
    const inDoc = [...text.matchAll(/^\*\*(R\d+)\*\* — /gm)].map((m) => m[1]);
    const asked = ws.items.filter((i) => i.section === 'question').map((i) => i.id);
    assert.ok(inDoc.length > 40, `found ${inDoc.length} questions; the pattern no longer reads the file`);
    assert.deepEqual(asked, inDoc);
  });

  it('cites only sources in the source list', () => {
    const all = ws.items.flatMap((i) => [...i.sources, ...(i.findings ?? []).flatMap((f) => f.sources)]);
    for (const s of all) assert.notEqual(s.url, '#', `${s.id} is not in docs/SOURCES.md`);
  });
});

describe('a returned review', () => {
  it('is read strictly', () => {
    for (const [bad, why] of [
      ['nope', 'not JSON'],
      ['{"kind":"other"}', 'not a NeuroLocalize review file'],
      [JSON.stringify({ ...base, format: 2 }), 'unknown format 2'],
      [JSON.stringify({ ...base, reviewer: null }), 'missing reviewer'],
      [JSON.stringify({ ...base, answers: { x: { verdict: 'maybe' } } }), 'answer x has verdict maybe'],
      [JSON.stringify({ ...base, answers: { x: { flagged: [1] } } }), 'answer x has bad flags'],
      [JSON.stringify({ ...base, answers: { x: { correction: 'a'.repeat(5000) } } }), 'answer x has a bad correction'],
    ] as const) {
      const r = parseResponse(bad);
      assert.equal(r.ok, false, bad.slice(0, 40));
      if (!r.ok) assert.equal(r.error, why);
    }
  });

  it('is trimmed, and empty notes are dropped', () => {
    const r = parsed({ ...base, answers: { a: { verdict: 'right', correction: '  ', source: ' p. 12 ', flagged: [] } } });
    assert.deepEqual(r.reviewer, { name: 'Dr A', role: 'neurology' });
    assert.deepEqual(r.answers.a, { verdict: 'right', source: 'p. 12' });
  });
});

describe('triage', () => {
  const claim = ws.items.find((i) => i.section === 'claim');
  const kase = ws.items.find((i) => i.section === 'case');
  const finding = kase?.findings?.[0];
  assert.ok(claim && kase && finding);

  it('puts what was marked wrong first, with the correction and the line flagged', () => {
    const r = parsed({
      ...base,
      answers: {
        [claim.id]: { verdict: 'wrong', correction: 'It crosses higher', source: 'Brazis p. 40' },
        [kase.id]: { verdict: 'wrong', flagged: [finding.id] },
        R1: { verdict: 'unsure' },
        'gone.row': { verdict: 'wrong' },
      },
    });
    const md = triage(ws, [r]);
    const wrong = md.slice(md.indexOf('## Marked wrong'), md.indexOf('## Not sure'));
    assert.match(wrong, /## Marked wrong \(2\)/);
    assert.ok(wrong.includes(claim.title.slice(0, 40)));
    assert.match(wrong, /correction: It crosses higher/);
    assert.match(wrong, /source: Brazis p\. 40/);
    assert.ok(wrong.includes(`flagged: ${finding.text}`));
    assert.ok(wrong.indexOf(claim.id) < wrong.indexOf(kase.id), 'in worksheet order');
    assert.match(md, /## Not sure \(1\)[\s\S]*`R1`/);
    assert.match(md, /## Answers to items no longer asked \(1\)[\s\S]*`gone\.row`/);
    assert.match(md, /\| Dr A \| neurology \| 2026-09-17 \| current \| 3 of \d+ \| 2 \| 1 \|/);
  });

  it('says when a review was given on an older worksheet, and when there are none', () => {
    assert.match(triage(ws, [parsed({ ...base, worksheet: 'abc' })]), /abc \(older\)/);
    assert.match(triage(ws, []), /No reviews have been returned yet/);
  });
});
