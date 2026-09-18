import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hypotheses } from '../src/engine/hypotheses.ts';
import { prepareSync } from '../src/engine/reverse.ts';
import { RENDER } from '../src/kb/render.ts';
import { choiceLabel, generateCase, isCorrect } from '../src/practice/generate.ts';
import { emptyProgress, record } from '../src/practice/schedule.ts';
import { caseHtml, findingsHtml, progressHtml } from '../src/render/practice-view.ts';
import { exportText, importText } from '../src/render/progress-store.ts';
import { examSlots } from '../src/render/slots.ts';

const SLOTS = examSlots(RENDER);
const byId = (id: string | undefined) => hypotheses().find((h) => h.id === id);
const count = (html: string, pattern: RegExp): number => [...html.matchAll(pattern)].length;
// Entities as the page escapes them, so labels can be found in the markup.
const escaped = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

describe('a practice case on the page', () => {
  prepareSync('chronic');
  const c = generateCase(11, 'corticospinal', SLOTS);
  const truth = byId(c.hypothesisId);
  const wrong = c.options.findIndex((_, i) => !isCorrect(c, i));
  const right = c.options.findIndex((_, i) => isCorrect(c, i));

  it('shows every finding once and gives nothing away before the answer', () => {
    const html = caseHtml(RENDER, c, { chosen: null, revealed: false, present: false }, truth, undefined);
    assert.equal(count(findingsHtml(RENDER, c), /class="pf[ "]/g), c.observations.length);
    assert.equal(count(html, /data-choice="/g), c.options.length);
    assert.doesNotMatch(html, /is-right|is-wrong|Why it is here|Show it on the model/);
    assert.doesNotMatch(html, /\bdisabled\b/);
  });

  it('after a wrong answer, marks both and shows what refutes the choice', () => {
    assert.ok(wrong >= 0 && right >= 0);
    const chosen = byId(c.options[wrong]?.memberIds[0]);
    const html = caseHtml(RENDER, c, { chosen: wrong, revealed: true, present: false }, truth, chosen);
    assert.equal(count(html, /is-right/g), 1);
    assert.equal(count(html, /is-wrong/g), 1);
    assert.ok(html.includes(escaped(choiceLabel(c.answer))));
    assert.match(html, /Why it is here/);
    assert.match(html, /Why not your answer/);
    assert.ok(count(html, /w-conflicts/g) >= 1, 'a wrong option is refuted by something shown');
    assert.equal(count(html, /data-choice="\d+" disabled/g), c.options.length);
  });

  it('after a right answer, has no case against it', () => {
    const html = caseHtml(RENDER, c, { chosen: right, revealed: true, present: false }, truth, byId(c.options[right]?.memberIds[0]));
    assert.match(html, /Right\./);
    assert.doesNotMatch(html, /Why not your answer|w-conflicts|is-wrong/);
    assert.ok(count(html, /w-fits/g) >= 1);
  });

  it('lets a presenter reveal without choosing', () => {
    const before = caseHtml(RENDER, c, { chosen: null, revealed: false, present: true }, truth, undefined);
    assert.match(before, /id="practice-reveal"/);
    assert.match(before, /not added to your progress/);
    const after = caseHtml(RENDER, c, { chosen: null, revealed: true, present: true }, truth, undefined);
    assert.match(after, /It is <b>/);
    assert.doesNotMatch(after, /id="practice-reveal"|is-wrong/);
  });
});

describe('progress on the page', () => {
  it('lists every pathway, weakest first, and counts what is due', () => {
    const now = Date.UTC(2026, 0, 1);
    let p = emptyProgress();
    p = record(p, ['corticospinal'], false, now, 1);
    p = record(p, ['spinothalamic'], true, now, 2);
    const html = progressHtml(p, now);
    assert.equal(count(html, /class="pp[ "]/g), 13, 'ten pathways, the visual fields since P8, conjugate gaze since P9 and language since P10');
    assert.ok(html.indexOf('Upper motor neuron') < html.indexOf('Pain and temperature'), 'the missed pathway comes first');
    assert.match(html, /<b>2<\/b> answered · <b>50%<\/b> right · <b>1<\/b> pathway due/);
  });

  it('reads back what it wrote, and refuses anything else', () => {
    const p = record(emptyProgress(), ['autonomic'], true, 5, 9);
    assert.deepEqual(importText(`  ${exportText(p)}\n`), p);
    assert.equal(importText(exportText(emptyProgress())), null);
    assert.equal(importText('{"version":2}'), null);
    assert.equal(importText('not json'), null);
  });
});
