// P6 properties, written before any practice code: a generated case must be solvable from
// what it shows, its wrong options must each be refuted by something it shows, and the
// schedule must bring back what she gets wrong.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { forward } from '../src/engine/forward.ts';
import { hypotheses } from '../src/engine/hypotheses.ts';
import { explain, prepareSync, reverse, slotKey } from '../src/engine/reverse.ts';
import { RENDER } from '../src/kb/render.ts';
import { choiceLabel, generateCase, isCorrect, sameChoice } from '../src/practice/generate.ts';
import { PATHWAYS, pathwaysOf, type Pathway } from '../src/practice/pathways.ts';
import {
  dueCount,
  emptyProgress,
  nextPathway,
  parseProgress,
  record,
  weakest,
  INTERVAL_DAYS,
} from '../src/practice/schedule.ts';
import { examSlots } from '../src/render/slots.ts';

const SLOTS = examSlots(RENDER);
const KEYS = new Set(SLOTS.map(slotKey));
const at = (id: string) => {
  const h = hypotheses().find((x) => x.id === id);
  assert.ok(h, id);
  return { h, f: forward(h.regions, 'chronic') };
};

describe('pathways a lesion exercises', () => {
  it('reads them from the findings', () => {
    const lms = at('brainstem_left:lateral_medullary');
    const p = pathwaysOf(lms.f, lms.h);
    for (const want of ['spinothalamic', 'trigeminal', 'autonomic', 'cranial_nuclei', 'cerebellar_vestibular'] as Pathway[]) {
      assert.ok(p.includes(want), want);
    }
    assert.ok(!p.includes('corticospinal'));
    const ulnar = at('nerve_left:ulnar_elbow');
    assert.deepEqual([...pathwaysOf(ulnar.f, ulnar.h)].sort(), ['lower_motor_neuron', 'peripheral_nerve']);
    const hemi = at('hemicord_left:T8-T8');
    for (const want of ['corticospinal', 'dorsal_column', 'spinothalamic'] as Pathway[]) assert.ok(pathwaysOf(hemi.f, hemi.h).includes(want));
    const capsule = at('hemisphere_left:internal_capsule');
    assert.ok(pathwaysOf(capsule.f, capsule.h).includes('corticobulbar'));
  });
});

describe('generated cases', () => {
  prepareSync('chronic');

  it('is the same case for the same seed and pathway', () => {
    assert.deepEqual(generateCase(7, 'spinothalamic', SLOTS), generateCase(7, 'spinothalamic', SLOTS));
    const seeds = new Set([1, 2, 3, 4, 5, 6].map((s) => generateCase(s, 'spinothalamic', SLOTS).hypothesisId));
    assert.ok(seeds.size >= 3, 'different seeds give different lesions');
  });

  it('can be answered from what it shows, and only one option survives it', () => {
    let cases = 0;
    for (const target of PATHWAYS) {
      for (let seed = 1; seed <= 12; seed++) {
        const c = generateCase(seed * 97 + target.length, target, SLOTS);
        cases++;
        const h = hypotheses().find((x) => x.id === c.hypothesisId);
        assert.ok(h, c.hypothesisId);
        const tag = `${target} seed ${seed}: ${c.hypothesisId}`;

        assert.ok(c.pathways.includes(target), `${tag} does not exercise its pathway`);
        assert.ok(c.observations.length >= 3 && c.observations.length <= 18, `${tag} shows ${c.observations.length} findings`);
        assert.equal(new Set(c.observations.map(slotKey)).size, c.observations.length, `${tag} repeats a finding`);
        for (const o of c.observations) assert.ok(KEYS.has(slotKey(o)), `${tag}: ${slotKey(o)} is not examinable`);

        // Every finding shown is what the true lesion produces.
        for (const v of explain(h, c.observations, 'chronic')) assert.equal(v.verdict, 'fits', `${tag}: ${slotKey(v.observation)}`);

        // The engine, given only these findings, ranks the true lesion first.
        const r = reverse(c.observations, 'chronic', SLOTS, { suggest: false });
        const top = r.groups[0];
        assert.ok(top?.members.some((m) => m.id === h.id), `${tag} is not ranked first`);
        assert.equal(top?.mismatches, 0);

        // One correct option; every other option is refuted by a finding shown.
        assert.ok(c.options.length >= 2 && c.options.length <= 4, `${tag} offers ${c.options.length}`);
        assert.equal(c.options.filter((o) => sameChoice(o, c.answer)).length, 1);
        assert.equal(new Set(c.options.map(choiceLabel)).size, c.options.length, `${tag} repeats an option`);
        for (const o of c.options) {
          if (sameChoice(o, c.answer)) continue;
          const rep = hypotheses().find((x) => x.id === o.memberIds[0]);
          assert.ok(rep);
          assert.ok(explain(rep, c.observations, 'chronic').some((v) => v.verdict === 'conflicts'), `${tag}: ${choiceLabel(o)} is not refuted`);
        }
        const right = c.options.findIndex((o) => sameChoice(o, c.answer));
        assert.equal(isCorrect(c, right), true);
        assert.equal(isCorrect(c, (right + 1) % c.options.length), false);
      }
    }
    assert.equal(cases, PATHWAYS.length * 12);
  });

  it('puts the answer in different places', () => {
    const places = new Set(Array.from({ length: 20 }, (_, i) => {
      const c = generateCase(i + 1, 'corticospinal', SLOTS);
      return c.options.findIndex((o) => sameChoice(o, c.answer));
    }));
    assert.ok(places.size >= 3, `answer only ever at ${[...places].join(',')}`);
  });
});

describe('the review schedule', () => {
  const DAY = 86_400_000;
  const t0 = Date.UTC(2026, 8, 17);

  it('brings a missed pathway back at once and a known one later', () => {
    let p = emptyProgress();
    p = record(p, ['spinothalamic', 'autonomic'], false, t0, 1);
    p = record(p, ['corticospinal'], true, t0, 2);
    assert.equal(p.pathways.spinothalamic?.box, 0);
    assert.ok((p.pathways.spinothalamic?.due ?? Infinity) <= t0);
    assert.equal(p.pathways.corticospinal?.box, 1);
    assert.equal(p.pathways.corticospinal?.due, t0 + (INTERVAL_DAYS[1] ?? 0) * DAY);
    assert.equal(nextPathway(p, t0 + 1, () => 0.5) === 'corticospinal', false, 'a pathway not yet due waits');
    assert.equal(dueCount(p, t0 + 1), 2);
  });

  it('climbs a box on each correct answer and falls to the bottom on a miss', () => {
    let p = emptyProgress();
    for (let i = 0; i < 3; i++) p = record(p, ['dorsal_column'], true, t0 + i * 30 * DAY, i);
    assert.equal(p.pathways.dorsal_column?.box, 3);
    p = record(p, ['dorsal_column'], false, t0 + 100 * DAY, 9);
    assert.equal(p.pathways.dorsal_column?.box, 0);
    assert.equal(p.pathways.dorsal_column?.seen, 4);
    assert.equal(p.pathways.dorsal_column?.correct, 3);
  });

  it('asks about the weakest due pathway first, then ones never seen', () => {
    let p = emptyProgress();
    p = record(p, ['trigeminal'], false, t0, 1);
    p = record(p, ['autonomic'], true, t0, 3);
    p = record(p, ['autonomic'], false, t0, 4);
    // Both trigeminal (0 of 1) and autonomic (1 of 2) are due; trigeminal is weaker.
    assert.equal(nextPathway(p, t0 + 1, () => 0), 'trigeminal');
    const fresh = emptyProgress();
    assert.ok(PATHWAYS.includes(nextPathway(fresh, t0, () => 0.3)));
  });

  it('ranks weakness by accuracy, and keeps a bounded history', () => {
    let p = emptyProgress();
    for (let i = 0; i < 400; i++) p = record(p, [PATHWAYS[i % PATHWAYS.length] as Pathway], i % 3 === 0, t0 + i, i);
    assert.ok(p.history.length <= 200);
    const w = weakest(p);
    assert.equal(w.length, PATHWAYS.length);
    for (let i = 1; i < w.length; i++) assert.ok((w[i - 1]?.accuracy ?? 0) <= (w[i]?.accuracy ?? 0));
  });

  it('survives storage: round-trips, and refuses what it did not write', () => {
    const p = record(emptyProgress(), ['spinothalamic', 'cerebellar_vestibular'], true, t0, 1);
    assert.deepEqual(parseProgress(JSON.stringify(p)), p);
    for (const bad of ['', 'null', '{"version":99}', '{"version":1,"pathways":{"spinothalamic":{"box":"x"}}}', '[1,2]', 'not json']) {
      assert.deepEqual(parseProgress(bad), emptyProgress(), bad);
    }
  });
});
