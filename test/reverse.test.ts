import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BRAIN_REVERSE_CASES } from '../spec/expectations/reverse-brain.ts';
import { LIMB_REVERSE_CASES } from '../spec/expectations/reverse-plexus.ts';
import { LEG_REVERSE_CASES } from '../spec/expectations/reverse-leg.ts';
import { VISION_REVERSE_CASES } from '../spec/expectations/reverse-vision.ts';
import { REVERSE_CASES } from '../spec/expectations/reverse.ts';
import { forward } from '../src/engine/forward.ts';
import { hypotheses } from '../src/engine/hypotheses.ts';
import { explain, predict, prepareSync, reverse, slotKey, type Observation, type Slot } from '../src/engine/reverse.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { MUSCLES } from '../src/kb/vocab.ts';
import { settledC6 } from './fixtures.ts';
import { reverseFailures } from './harness.ts';
import { examSlots } from '../src/render/slots.ts';

const SLOTS = examSlots(RENDER);

describe('frozen reverse expectations (A3, A4, A7)', () => {
  for (const kase of [...REVERSE_CASES, ...LIMB_REVERSE_CASES, ...LEG_REVERSE_CASES, ...BRAIN_REVERSE_CASES, ...VISION_REVERSE_CASES]) {
    it(kase.id, () => {
      assert.deepEqual(reverseFailures(kase, SLOTS).map((f) => `${f.timepoint}: ${f.message}`), []);
    });
  }
});

describe('reverse engine contract', () => {
  it('offers only examinations the body map and myotome grid can show', () => {
    assert.equal(new Set(SLOTS.map(slotKey)).size, SLOTS.length, 'duplicate slots');
    // 2 sides × 2 modalities × (12 landmarks + saddle) + 2 × 12 myotomes + 2 × 6 reflexes + 4 signs + romberg + bladder,
    // then per side 14 arm and 11 leg muscles and the 3 arm and 6 leg patches that are not
    // landmarks (D30, P7), and per side facial sensation, facial strength, ataxia and five
    // cranial signs, plus vertigo (P5)
    // P8 adds, per side, six sectors of that eye's field and its pupil.
    assert.equal(SLOTS.length, 2 * 2 * 13 + 2 * 12 + 2 * 6 + 4 + 2 + 2 * (14 + 11) + 2 * (3 + 6) + 2 * 8 + 1 + 2 * 7);
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
    const r = reverse(settledC6(kase.observations), 'chronic', SLOTS);
    assert.equal(r.groups[0]?.family, 'root_left');
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

  // ── the upper limb (D30–D32) ──
  const at = (id: string) => {
    const h = hypotheses().find((x) => x.id === id);
    assert.ok(h, id);
    return forward(h.regions, 'chronic');
  };
  const pain = (seg: 'C6' | 'C7' | 'C8' | 'T1'): Slot => ({ kind: 'sensory', side: 'L', modality: 'pain_temperature', span: [seg, seg] });
  const power = (seg: 'C5' | 'C6' | 'C7' | 'C8' | 'T1'): Slot => ({ kind: 'strength', side: 'L', span: [seg, seg] });

  it('reads an arm landmark through the nerve that supplies it (D30)', () => {
    assert.equal(predict(at('nerve_left:ulnar_elbow'), pain('C8')), 'abnormal', 'the little finger is ulnar');
    assert.equal(predict(at('nerve_left:ulnar_elbow'), pain('T1')), 'normal', 'the medial forearm is not');
    assert.equal(predict(at('nerve_left:median_wrist'), pain('C7')), 'abnormal', 'the middle finger is median');
    assert.equal(predict(at('nerve_left:median_wrist'), pain('C6')), 'abnormal', 'half the thumb is median');
    assert.equal(predict(at('root_left:C8'), pain('T1')), 'abnormal', 'the medial forearm carries C8 (S45)');
    assert.equal(predict(at('root_left:C8'), pain('C7')), 'normal');
  });

  it('reads a single-segment strength test through its muscles (D31)', () => {
    assert.equal(predict(at('nerve_left:axillary'), power('C5')), 'weak', 'deltoid');
    assert.equal(predict(at('nerve_left:radial_spiral_groove'), power('C6')), 'weak', 'wrist extensors');
    assert.equal(predict(at('nerve_left:radial_spiral_groove'), power('C7')), 'normal', 'triceps is spared');
    assert.equal(predict(at('nerve_left:radial_axilla'), power('C7')), 'weak');
    assert.equal(predict(at('nerve_left:ulnar_wrist'), power('T1')), 'weak', 'interossei');
    assert.equal(predict(at('nerve_left:ulnar_wrist'), power('C8')), 'normal', 'the forearm flexor is above the canal');
    assert.equal(predict(at('nerve_left:long_thoracic'), power('C5')), 'normal', 'no myotome row asks about serratus');
  });

  it('asks each strength row only about muscles that perform the movement its sources name (D31)', () => {
    const words: Record<string, string> = {
      deltoid: 'shoulder abduction',
      biceps: 'elbow flexion',
      wrist_extensors: 'wrist extension',
      triceps: 'elbow extension',
      wrist_flexor_ulnar: 'wrist flexion',
      thumb_extensor: 'thumb extension',
      interossei: 'finger abduction',
      iliopsoas: 'hip flexion',
      quadriceps: 'knee extension',
      tibialis_anterior: 'ankle dorsiflexion',
      toe_extensor: 'great toe extension',
      gastrocnemius: 'ankle plantar flexion',
      hamstrings: 'knee flexion',
    };
    const mapped = MUSCLES.filter((m) => KB.plexus.muscles[m].myotome);
    assert.deepEqual(mapped.sort(), Object.keys(words).sort());
    for (const m of mapped) {
      const seg = KB.plexus.muscles[m].myotome;
      const row = RENDER.myotomes.rows.find((r) => r.span[0] === seg && r.span[1] === seg);
      assert.ok(row, `${m}: no myotome row at ${seg}`);
      assert.ok(row.movement.includes(words[m] ?? '?'), `${m} at ${seg}: the row says "${row.movement}"`);
    }
  });

  it('counts a patch abnormal when either modality is lost, and a disputed root as unknown', () => {
    const posterior = at('posterior:C4-C4');
    assert.equal(posterior.skin.L.pain_temperature.lateral_forearm, 'intact');
    assert.equal(predict(posterior, { kind: 'skin', side: 'L', area: 'lateral_forearm' }), 'abnormal');
    assert.equal(predict(at('root_left:C7'), { kind: 'muscle', side: 'L', muscle: 'serratus_anterior' }), 'unknown', 'C10');
    assert.equal(predict(at('root_left:C7'), { kind: 'muscle', side: 'L', muscle: 'triceps' }), 'weak');
  });

  it('names the place beyond the roots that each verdict turns on', () => {
    const h = hypotheses().find((x) => x.id === 'plexus_left:lower_trunk');
    assert.ok(h);
    const [apb, horner, forearm] = explain(
      h,
      [
        { kind: 'muscle', side: 'L', muscle: 'thumb_abductor', value: 'weak' },
        { kind: 'horner', side: 'L', value: 'absent' },
        { kind: 'sensory', side: 'L', modality: 'pain_temperature', span: ['T1', 'T1'], value: 'abnormal' },
      ],
      'chronic',
    );
    assert.equal(apb?.verdict, 'fits');
    assert.match(apb?.because ?? '', /left lower trunk is cut/);
    assert.equal(horner?.verdict, 'fits');
    assert.match(horner?.because ?? '', /leave with the T1 root/);
    assert.equal(forearm?.verdict, 'fits');
    assert.match(forearm?.because ?? '', /lower trunk/);
  });

  it('groups plexus and nerve candidates by place', () => {
    prepareSync('chronic');
    const r = reverse([{ kind: 'muscle', side: 'L', muscle: 'serratus_anterior', value: 'weak' }], 'chronic', SLOTS);
    const nerve = r.groups.find((g) => g.family === 'nerve_left' && g.sites.includes('long_thoracic'));
    assert.ok(nerve);
    assert.deepEqual(nerve.sites, ['long_thoracic'], 'the only nerve place that weakens serratus');
    const places = hypotheses().filter((x) => x.site);
    assert.equal(places.filter((x) => x.family.startsWith('plexus') || x.family.startsWith('nerve')).length, 56, 'D32, P7: 18 arm and 10 leg places on each side');
    assert.equal(places.filter((x) => x.family.startsWith('brainstem') || x.family.startsWith('hemisphere')).length, 18, 'D44: 9 territories on each side');
  });

  // ── above the cord (D42–D44) ──
  it('reads the face as sensation, and strength as lower or whole', () => {
    const lms = at('brainstem_left:lateral_medullary');
    assert.equal(predict(lms, { kind: 'face_sensation', side: 'L' }), 'abnormal');
    assert.equal(predict(lms, { kind: 'face_sensation', side: 'R' }), 'normal');
    const capsule = at('hemisphere_left:internal_capsule');
    assert.equal(predict(capsule, { kind: 'face_weakness', side: 'R' }), 'lower');
    assert.equal(predict(capsule, { kind: 'face_weakness', side: 'L' }), 'normal');
    assert.equal(predict(at('brainstem_left:ventral_pons'), { kind: 'face_weakness', side: 'L' }), 'whole');
    assert.equal(predict(capsule, { kind: 'cranial', side: 'R', sign: 'palate_weakness' }), 'unknown', 'bilateral supply (S64)');
    assert.equal(predict(capsule, { kind: 'cranial', side: 'R', sign: 'tongue_weakness' }), 'present');
    assert.equal(predict(lms, { kind: 'vertigo' }), 'present');
    assert.equal(predict(lms, { kind: 'ataxia', side: 'R' }), 'absent');
  });

  it('explains a crossed brainstem finding by the part and level it cuts', () => {
    const h = hypotheses().find((x) => x.id === 'brainstem_left:lateral_medullary');
    assert.ok(h);
    const [face, body, horner] = explain(
      h,
      [
        { kind: 'face_sensation', side: 'L', value: 'abnormal' },
        { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'abnormal' },
        { kind: 'horner', side: 'L', value: 'present' },
      ],
      'chronic',
    );
    assert.match(face?.because ?? '', /left spinal trigeminal nucleus in the medulla is damaged/);
    assert.match(body?.because ?? '', /left spinothalamic tract in the medulla is damaged, above the crossing/);
    assert.match(horner?.because ?? '', /left descending sympathetic fibres in the medulla are damaged/);
    const weber = hypotheses().find((x) => x.id === 'brainstem_left:midbrain_peduncle');
    assert.ok(weber);
    const [weak] = explain(weber, [{ kind: 'strength', side: 'R', span: ['L3', 'L3'], value: 'weak' }], 'chronic');
    assert.match(weak?.because ?? '', /left cerebral peduncle in the midbrain is damaged, above the decussation/);
  });
});
