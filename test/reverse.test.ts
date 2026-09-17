import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { REVERSE_CASES } from '../spec/expectations/reverse.ts';
import { forward } from '../src/engine/forward.ts';
import { hypotheses } from '../src/engine/hypotheses.ts';
import { explain, predict, prepareSync, reverse, slotKey, type Observation } from '../src/engine/reverse.ts';
import { RENDER } from '../src/kb/render.ts';
import { SEGMENTS } from '../src/kb/vocab.ts';
import { examSlots } from '../src/render/slots.ts';

const SLOTS = examSlots(RENDER);
const k = (s: (typeof SEGMENTS)[number]): number => SEGMENTS.indexOf(s);

describe('frozen reverse expectations (A3)', () => {
  for (const kase of REVERSE_CASES) {
    for (const ex of kase.expectations) {
      it(`${kase.id} at ${ex.timepoint}`, () => {
        prepareSync(ex.timepoint);
        const observations: readonly Observation[] = kase.observations;
        const r = reverse(observations, ex.timepoint, SLOTS);
        const top = r.groups[0];
        assert.ok(top, 'no candidate ranked');
        const summary = r.groups.slice(0, 4).map((g) => `${g.family} ${g.rostral.join('–')} (${g.mismatches} conflicts)`).join(' | ');

        if (ex.topFamily) assert.equal(top.family, ex.topFamily, summary);
        if (ex.topFamilyNot) assert.ok(!ex.topFamilyNot.includes(top.family), summary);
        if (ex.rostralEndWithin) {
          const [a, b] = ex.rostralEndWithin;
          for (const h of top.members) {
            assert.ok(h.rostral >= k(a) && h.rostral <= k(b), `${h.id} starts outside ${a}–${b}; ${summary}`);
          }
        }
        if (ex.unexplained !== undefined) assert.equal(r.unexplained, ex.unexplained, summary);
        if (ex.amongTop) {
          const leaders = r.groups.slice(0, ex.amongTop.k).map((g) => g.family);
          for (const set of ex.amongTop.families) {
            assert.ok(leaders.some((f) => set.includes(f)), `none of ${set.join('/')} in the top ${ex.amongTop.k}: ${summary}`);
          }
        }
        if (ex.nextTestSeparatesTopTwo) {
          const s = r.suggestion;
          assert.ok(s, 'no test suggested');
          assert.ok(!observations.some((o) => slotKey(o) === slotKey(s.slot)), 'suggested a test already done');
          assert.ok(s.separatesTopTwo, `suggested ${slotKey(s.slot)} does not separate ${summary}`);
          const [g0, g1] = r.groups;
          const rep = (g: typeof g0) => (g ? g.members[0] : undefined);
          const h0 = rep(g0);
          const h1 = rep(g1);
          assert.ok(h0 && h1);
          const p0 = predict(forward(h0.regions, ex.timepoint), s.slot);
          const p1 = predict(forward(h1.regions, ex.timepoint), s.slot);
          assert.notEqual(p0, p1, `both leaders predict ${p0} for ${slotKey(s.slot)}`);
        }
      });
    }
  }
});

describe('reverse engine contract', () => {
  it('offers only examinations the body map and myotome grid can show', () => {
    assert.equal(new Set(SLOTS.map(slotKey)).size, SLOTS.length, 'duplicate slots');
    // 2 sides × 2 modalities × (12 landmarks + saddle) + 2 × 12 myotomes + 2 × 6 reflexes + 4 signs + romberg + bladder
    assert.equal(SLOTS.length, 2 * 2 * 13 + 2 * 12 + 2 * 6 + 4 + 2);
  });

  it('with no findings, prefers nothing in particular and still suggests a test', () => {
    prepareSync('chronic');
    const r = reverse([], 'chronic', SLOTS);
    assert.equal(r.unexplained, false);
    assert.ok(r.suggestion);
  });

  it('treats the crossing band as no evidence either way (C1, D2)', () => {
    const h = hypotheses().find((x) => x.id === 'hemicord_left:T8-T8');
    assert.ok(h);
    const f = forward(h.regions, 'chronic');
    assert.equal(f.sensory.R.pain_temperature.T10, 'indeterminate');
    assert.equal(predict(f, { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['T10', 'T10'] }), 'unknown');
    assert.equal(predict(f, { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['T12', 'T12'] }), 'abnormal');
  });

  it('reads every segment of a multi-segment myotome row', () => {
    const h = hypotheses().find((x) => x.id === 'root_left:T6');
    assert.ok(h);
    const f = forward(h.regions, 'chronic');
    assert.equal(predict(f, { kind: 'strength', side: 'L', span: ['T2', 'L1'] }), 'weak', 'T6 lies inside T2–L1');
    assert.equal(predict(f, { kind: 'strength', side: 'R', span: ['T2', 'L1'] }), 'normal');
  });

  it('suggests nothing when the findings already settle the question (D26)', () => {
    prepareSync('chronic');
    const kase = REVERSE_CASES.find((c) => c.id === 'reverse-radiculopathy-C6');
    assert.ok(kase);
    const r = reverse(kase.observations, 'chronic', SLOTS);
    assert.ok((r.groups[0]?.posterior ?? 0) > 0.99);
    assert.equal(r.suggestion, null);
  });

  it('every candidate reproduces its own findings with no conflicts', () => {
    prepareSync('chronic');
    for (const id of ['hemicord_left:T8-T8', 'anterior:T6-T6', 'roots_bilateral:L3-Co1', 'root_left:C6']) {
      const h = hypotheses().find((x) => x.id === id);
      assert.ok(h, id);
      const f = forward(h.regions, 'chronic');
      const observations = SLOTS.flatMap((s): Observation[] => {
        const p = predict(f, s);
        return p === 'unknown' ? [] : [{ ...s, value: p } as Observation];
      });
      const r = reverse(observations, 'chronic', SLOTS);
      assert.equal(r.unexplained, false, id);
      assert.ok(r.groups[0]?.members.some((m) => m.id === id), `${id} is not in the best group`);
    }
  });

  it('explains each finding through a route, and flags the ones that conflict', () => {
    const h = hypotheses().find((x) => x.id === 'hemicord_left:T8-T8');
    assert.ok(h);
    const [pain, vib, weak] = explain(
      h,
      [
        { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'abnormal' },
        { kind: 'sensory', side: 'R', modality: 'posterior_column', span: ['L4', 'L4'], value: 'abnormal' },
        { kind: 'strength', side: 'L', span: ['L3', 'L3'], value: 'weak' },
      ],
      'chronic',
    );
    assert.equal(pain?.verdict, 'fits');
    assert.match(pain?.because ?? '', /left spinothalamic tract at T8/);
    assert.equal(vib?.verdict, 'conflicts');
    assert.equal(weak?.verdict, 'fits');
    assert.match(weak?.because ?? '', /left corticospinal tract at T8/);
  });
});
