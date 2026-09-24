import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { REVERSE_CASES } from '../spec/expectations/reverse.ts';
import { prepareSync, reverse, slotKey, type Observation, type Slot } from '../src/engine/reverse.ts';
import { RENDER } from '../src/kb/render.ts';
import { candidatesHtml, examBodySvg, examTables, nextValue, slotLabel, suggestionHtml } from '../src/render/examine.ts';
import { examSlots } from '../src/render/slots.ts';
import { bodySilhouetteSvg } from '../src/render/svg.ts';
import { settledC6 } from './fixtures.ts';

const SLOTS = examSlots(RENDER);
const keysIn = (html: string): string[] => [...html.matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1] ?? '');
const findingsOf = (id: string): Map<string, Observation> => {
  const kase = REVERSE_CASES.find((c) => c.id === id);
  assert.ok(kase, id);
  return new Map(kase.observations.map((o) => [slotKey(o), o]));
};

describe('examination entry', () => {
  it('every examination the engine can suggest has a control', () => {
    const empty = new Map<string, Observation>();
    const offered = new Set([
      ...keysIn(examBodySvg(RENDER, empty, 'pain_temperature', bodySilhouetteSvg('x'))),
      ...keysIn(examBodySvg(RENDER, empty, 'posterior_column', bodySilhouetteSvg('x'))),
      ...keysIn(examTables(RENDER, empty)),
    ]);
    assert.deepEqual([...offered].sort(), SLOTS.map(slotKey).sort());
  });

  it('draws one pressable mark per landmark point and nerve territory, both sides, plus the saddle', () => {
    const svg = examBodySvg(RENDER, new Map(), 'pain_temperature', bodySilhouetteSvg('x'));
    // landmark points, the saddle, and the nerve territories that are not landmarks (D30)
    const points =
      RENDER.dermatomeLandmarks.landmarks.reduce((n, l) => n + l.at.length, 0) + 1 + Object.keys(RENDER.skinPatches.at).length;
    assert.equal((svg.match(/class="exdot /g) ?? []).length, points * 2);
    assert.equal((svg.match(/role="button" tabindex="0"/g) ?? []).length, points * 2, 'every mark is keyboard-reachable');
  });

  it('cycles each control through its values and back to untested', () => {
    const sensory = SLOTS.find((s) => s.kind === 'sensory');
    const reflex = SLOTS.find((s) => s.kind === 'reflex');
    const bladder = SLOTS.find((s) => s.kind === 'bladder');
    assert.ok(sensory && reflex && bladder);
    const walk = (s: Slot): (string | undefined)[] => {
      const out: (string | undefined)[] = [];
      let v: string | undefined;
      do {
        v = nextValue(s, v);
        out.push(v);
      } while (v !== undefined && out.length < 10);
      return out;
    };
    assert.deepEqual(walk(sensory), ['normal', 'abnormal', undefined]);
    assert.deepEqual(walk(reflex), ['normal', 'reduced', 'brisk', undefined]);
    assert.deepEqual(walk(bladder), ['normal', 'overactive', 'retention', undefined]);
  });

  it('shows a recorded finding on its control, and labels every control in words', () => {
    const f = findingsOf('reverse-brown-sequard');
    const tables = examTables(RENDER, f);
    assert.match(tables, /class="ex ex-brisk" data-slot="reflex\|L\|achilles"/);
    for (const s of SLOTS) assert.doesNotMatch(slotLabel(RENDER, s), /undefined|\(\)/, slotKey(s));
    assert.equal(slotLabel(RENDER, { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['T10', 'T10'] }), 'Right pain · umbilicus (T10)');
    assert.equal(slotLabel(RENDER, { kind: 'strength', side: 'L', span: ['C6', 'C6'] }), 'Left elbow flexion, wrist extension (C6)');
  });
});

describe('examination results', () => {
  it('asks for findings before ranking anything', () => {
    prepareSync('chronic');
    const r = reverse([], 'chronic', SLOTS);
    assert.match(candidatesHtml(r, 0, 0), /Record findings/);
    assert.equal(suggestionHtml(RENDER, r, 0), '');
  });

  it('warns when no single lesion explains the findings', () => {
    prepareSync('chronic');
    const f = findingsOf('reverse-two-lesions');
    const html = candidatesHtml(reverse([...f.values()], 'chronic', SLOTS), 0, f.size);
    assert.match(html, /No single lesion in this model explains every finding/);
    assert.match(html, /conflicts \d/);
  });

  it('says so when the findings already settle it', () => {
    prepareSync('chronic');
    const obs = settledC6([...findingsOf('reverse-radiculopathy-C6').values()]);
    assert.match(suggestionHtml(RENDER, reverse(obs, 'chronic', SLOTS), obs.length), /already settle it/);
  });

  it('names the suggested test in words and shows what each result would mean', () => {
    prepareSync('chronic');
    const f = findingsOf('reverse-brown-sequard');
    const html = suggestionHtml(RENDER, reverse([...f.values()], 'chronic', SLOTS), f.size);
    assert.match(html, /data-goto="sensory\|R\|pain_temperature\|T10-T10">Right pain · umbilicus \(T10\)</);
    assert.equal((html.match(/<li>/g) ?? []).length, 2, 'one line per possible result');
    assert.doesNotMatch(html, /confirm, not change/);
  });

  it('says a test would confirm, not change, the leader when every result keeps it first (D87)', () => {
    prepareSync('chronic');
    const obs: Observation[] = [
      { kind: 'eyes', sign: 'upgaze_palsy', value: 'present' },
      { kind: 'eyes', sign: 'light_near_dissociation', value: 'present' },
    ];
    const html = suggestionHtml(RENDER, reverse(obs, 'chronic', SLOTS), obs.length);
    assert.match(html, /would confirm, not change, the leading place/);
    assert.doesNotMatch(html, /The two leading candidates predict different results/);
  });
});
