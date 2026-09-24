import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BRAIN_REVERSE_CASES } from '../spec/expectations/reverse-brain.ts';
import { LIMB_REVERSE_CASES } from '../spec/expectations/reverse-plexus.ts';
import { LEG_REVERSE_CASES } from '../spec/expectations/reverse-leg.ts';
import { VISION_REVERSE_CASES } from '../spec/expectations/reverse-vision.ts';
import { LANGUAGE_REVERSE_CASES } from '../spec/expectations/reverse-language.ts';
import { CEREBELLUM_REVERSE_CASES } from '../spec/expectations/reverse-cerebellum.ts';
import { POSTERIOR_REVERSE_CASES } from '../spec/expectations/reverse-posterior.ts';
import { MIDBRAIN_REVERSE_CASES } from '../spec/expectations/reverse-midbrain.ts';
import { NERVE_REVERSE_CASES } from '../spec/expectations/reverse-nerves.ts';
import { BASAL_REVERSE_CASES } from '../spec/expectations/reverse-basal.ts';
import { CORTEX_REVERSE_CASES } from '../spec/expectations/reverse-cortex.ts';
import { BASILAR_REVERSE_CASES } from '../spec/expectations/reverse-basilar.ts';
import { OCCIPITAL_REVERSE_CASES } from '../spec/expectations/reverse-occipital.ts';
import { FIBULAR_REVERSE_CASES } from '../spec/expectations/reverse-fibular.ts';
import { TARSAL_REVERSE_CASES } from '../spec/expectations/reverse-tarsal.ts';
import { TRANSCORTICAL_REVERSE_CASES } from '../spec/expectations/reverse-transcortical.ts';
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
  for (const kase of [...REVERSE_CASES, ...LIMB_REVERSE_CASES, ...LEG_REVERSE_CASES, ...BRAIN_REVERSE_CASES, ...VISION_REVERSE_CASES, ...LANGUAGE_REVERSE_CASES, ...CEREBELLUM_REVERSE_CASES, ...POSTERIOR_REVERSE_CASES, ...MIDBRAIN_REVERSE_CASES, ...NERVE_REVERSE_CASES, ...BASAL_REVERSE_CASES, ...CORTEX_REVERSE_CASES, ...BASILAR_REVERSE_CASES, ...OCCIPITAL_REVERSE_CASES, ...FIBULAR_REVERSE_CASES, ...TARSAL_REVERSE_CASES, ...TRANSCORTICAL_REVERSE_CASES]) {
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
    // P9 takes the cranial signs per side from five to nine: adduction, abducting nystagmus,
    // ptosis and elevation join them, so that term is 2 * 12 rather than 2 * 8.
    // P10 adds three facets of language, which belong to the patient and not a side, and
    // neglect of each side of space: 3 + 2.
    // P11 adds truncal ataxia, which belongs to the patient: + 1. P12 adds hearing, a tenth
    // cranial sign on each side, so that term becomes 2 * 13.
    // P13 adds three signs of both eyes together, about the patient: + 3. P14 adds the superior
    // oblique and the jaw, two more cranial signs on each side, so that term becomes 2 * 15.
    // P15 adds hemiballismus, one on each side: + 2. P16 adds Gerstmann signs, about the patient: + 1.
    assert.equal(SLOTS.length, 2 * 2 * 13 + 2 * 12 + 2 * 6 + 4 + 2 + 2 * (14 + 11) + 2 * (3 + 6) + 2 * 15 + 1 + 2 * 7 + 3 + 2 + 1 + 3 + 2 + 1);
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

  it('says when every result of the suggested test leaves the same candidate first (D87)', () => {
    prepareSync('chronic');
    const r = reverse(
      [
        { kind: 'eyes', sign: 'upgaze_palsy', value: 'present' },
        { kind: 'eyes', sign: 'light_near_dissociation', value: 'present' },
      ],
      'chronic',
      SLOTS,
    );
    assert.deepEqual(r.groups[0]?.sites, ['dorsal_midbrain']);
    assert.ok((r.groups[1]?.mismatches ?? 0) > 0, 'the runner-up already conflicts');
    const s = r.suggestion;
    assert.ok(s, 'the test still teaches more than the D26 bar');
    assert.equal(slotKey(s.slot), 'eyes|convergence_retraction_nystagmus');
    assert.equal(s.separatesTopTwo, true);
    assert.deepEqual(s.outcomes.map((o) => o.leader?.site), ['dorsal_midbrain', 'dorsal_midbrain']);
    assert.equal(s.confirmsLeader, true);
  });

  it('does not call a test confirmatory when a result could change the leader (D87)', () => {
    prepareSync('chronic');
    const kase = LIMB_REVERSE_CASES.find((c) => c.id === 'reverse-hand-weakness-open');
    assert.ok(kase);
    const s = reverse(kase.observations, 'chronic', SLOTS).suggestion;
    assert.ok(s);
    assert.ok(new Set(s.outcomes.map((o) => `${o.leader?.family}|${o.leader?.site ?? o.leader?.rostral}`)).size > 1);
    assert.equal(s.confirmsLeader, false);
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
    assert.equal(places.filter((x) => x.family.startsWith('plexus') || x.family.startsWith('nerve')).length, 64, 'D32, P7, P19, P20: 18 arm and 14 leg places on each side — P19 adds the deep fibular nerve at two places and the superficial at one, P20 the tarsal tunnel');
    assert.equal(
      places.filter((x) => x.family.startsWith('brainstem') || x.family.startsWith('hemisphere')).length,
      52,
      'D44, P9, P10, P12, P13, P14, P15, P16, P17, P21: 25 brainstem and cerebral territories on each side — nine from P5, three from P9, five from P10, AICA and PICA from P12, the trochlear nucleus and mid-pontine tegmentum from P14, the subthalamic nucleus from P15, the frontal eye field from P16, two border zones from P21 — and two midline places, the dorsal midbrain (P13) and the ventral pons on both sides (P17)',
    );
    // P11: a hemisphere on each side and one midline vermis, never counted twice.
    assert.equal(places.filter((x) => x.family.startsWith('cerebellum')).length, 5, 'P11, P12: two cerebellar hemispheres, one vermis and the SCA on each side');
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

  it('explains each eye-movement sign by its own route (P9)', () => {
    const mlf = hypotheses().find((x) => x.id === 'brainstem_left:mlf_pons');
    assert.ok(mlf);
    const [adduct, nystagmus] = explain(
      mlf,
      [
        { kind: 'cranial', side: 'L', sign: 'adduction_weakness', value: 'present' },
        { kind: 'cranial', side: 'R', sign: 'abducting_nystagmus', value: 'present' },
      ],
      'chronic',
    );
    assert.match(adduct?.because ?? '', /left medial longitudinal fasciculus in the pons is damaged/);
    assert.match(nystagmus?.because ?? '', /left medial longitudinal fasciculus in the pons is damaged/, 'the nystagmus is of the far eye');

    // The conjugate half of a gaze palsy: the other eye's medial rectus goes with it (D63).
    const gaze = hypotheses().find((x) => x.id === 'brainstem_left:dorsal_pons');
    assert.ok(gaze);
    const [far] = explain(gaze, [{ kind: 'cranial', side: 'R', sign: 'adduction_weakness', value: 'present' }], 'chronic');
    assert.match(far?.because ?? '', /left abducens nucleus in the pons is damaged/);

    // C29: the nuclear lid is unsettled, and the working says why.
    const nucleus = hypotheses().find((x) => x.id === 'brainstem_left:oculomotor_nucleus');
    assert.ok(nucleus);
    const [lid] = explain(nucleus, [{ kind: 'cranial', side: 'R', sign: 'ptosis', value: 'present' }], 'chronic');
    assert.match(lid?.because ?? '', /both lids: ptosis on both sides or on neither/);
  });
});

describe('the working for language and attention (P10)', () => {
  it('names the damaged gyrus and the dominant hemisphere', () => {
    prepareSync('chronic');
    const broca = hypotheses().find((x) => x.id === 'hemisphere_left:broca_area');
    assert.ok(broca);
    const [fluency] = explain(broca, [{ kind: 'language', sign: 'nonfluent_speech', value: 'present' }], 'chronic');
    assert.match(fluency?.because ?? '', /left inferior frontal gyrus is damaged, in the dominant hemisphere/);
  });

  it('says why a right-sided lesion leaves speech alone (D68)', () => {
    const right = hypotheses().find((x) => x.id === 'hemisphere_right:broca_area');
    assert.ok(right);
    const [fluency] = explain(right, [{ kind: 'language', sign: 'nonfluent_speech', value: 'absent' }], 'chronic');
    assert.match(fluency?.because ?? '', /language lives in the dominant hemisphere/);
  });

  it('explains neglect from the side of space, and the dominant side as unsettled (C32)', () => {
    const right = hypotheses().find((x) => x.id === 'hemisphere_right:supramarginal');
    const left = hypotheses().find((x) => x.id === 'hemisphere_left:supramarginal');
    assert.ok(right && left);
    const [l] = explain(right, [{ kind: 'neglect', side: 'L', value: 'present' }], 'chronic');
    assert.match(l?.because ?? '', /right inferior parietal lobule is damaged: the nondominant parietal lobe/);
    const [r] = explain(left, [{ kind: 'neglect', side: 'R', value: 'present' }], 'chronic');
    assert.match(r?.because ?? '', /the dominant side, after which neglect is rarer/);
  });
});

describe('the working names the part a spared facet depends on (P10)', () => {
  it('does not call the language cortex intact when only another part of it is damaged', () => {
    prepareSync('chronic');
    const conduction = hypotheses().find((x) => x.id === 'hemisphere_left:supramarginal');
    assert.ok(conduction);
    const [fluent, understands] = explain(
      conduction,
      [
        { kind: 'language', sign: 'nonfluent_speech', value: 'absent' },
        { kind: 'language', sign: 'impaired_comprehension', value: 'absent' },
      ],
      'chronic',
    );
    // P21: fluency and comprehension each depend on a border zone too, so the working names both.
    assert.match(fluent?.because ?? '', /the left inferior frontal gyrus and anterior border zone, which this depends on, are intact/);
    assert.match(understands?.because ?? '', /the left posterior superior temporal gyrus and posterior border zone, which this depends on, are intact/);
  });
});

describe('the working for the cerebellum (P11)', () => {
  it('explains truncal ataxia by the vermis, and leaves it unsettled after a hemisphere lesion (C35)', () => {
    prepareSync('chronic');
    const vermis = hypotheses().find((x) => x.id === 'cerebellum_midline:vermis');
    const hemisphere = hypotheses().find((x) => x.id === 'cerebellum_left:cerebellar_hemisphere');
    assert.ok(vermis && hemisphere);
    const [v] = explain(vermis, [{ kind: 'truncal_ataxia', value: 'present' }], 'chronic');
    assert.match(v?.because ?? '', /half of the vermis is damaged: the vermis coordinates the trunk/);
    const [limb, trunk] = explain(
      hemisphere,
      [
        { kind: 'ataxia', side: 'L', value: 'present' },
        { kind: 'truncal_ataxia', value: 'present' },
      ],
      'chronic',
    );
    assert.match(limb?.because ?? '', /left cerebellar hemisphere is damaged/);
    assert.match(trunk?.because ?? '', /truncal imbalance is unsettled \(C35\)/);
  });

  it('offers the vermis once, whatever the side (D74)', () => {
    const ids = hypotheses().filter((x) => x.site === 'vermis').map((x) => x.id);
    assert.deepEqual(ids, ['cerebellum_midline:vermis']);
  });
});

describe('the working for the posterior circulation (P12)', () => {
  it('explains hearing loss by the cochlear nuclei, and PICA’s truncal ataxia by the vermis (D77, D78)', () => {
    prepareSync('chronic');
    const aica = hypotheses().find((x) => x.id === 'brainstem_left:aica');
    const pica = hypotheses().find((x) => x.id === 'brainstem_left:pica');
    assert.ok(aica && pica);
    const [ear] = explain(aica, [{ kind: 'cranial', side: 'L', sign: 'hearing_loss', value: 'present' }], 'chronic');
    assert.match(ear?.because ?? '', /left cochlear nuclei in the pons are damaged/);
    const [trunk] = explain(pica, [{ kind: 'truncal_ataxia', value: 'present' }], 'chronic');
    assert.match(trunk?.because ?? '', /half of the vermis is damaged: the vermis coordinates the trunk/);
  });
});

describe('the working for the dorsal midbrain (P13)', () => {
  it('explains each eye sign by the pretectum, and offers the place once (D83, D84)', () => {
    prepareSync('chronic');
    const dm = hypotheses().find((x) => x.id === 'brainstem_midline:dorsal_midbrain');
    assert.ok(dm);
    const [up, pupils] = explain(
      dm,
      [
        { kind: 'eyes', sign: 'upgaze_palsy', value: 'present' },
        { kind: 'eyes', sign: 'light_near_dissociation', value: 'present' },
      ],
      'chronic',
    );
    assert.match(up?.because ?? '', /half of the pretectum in the midbrain is damaged: the dorsal midbrain/);
    assert.match(pupils?.because ?? '', /pretectum/);
    assert.deepEqual(hypotheses().filter((x) => x.site === 'dorsal_midbrain').map((x) => x.id), ['brainstem_midline:dorsal_midbrain']);
  });
});

describe('the working for the fourth and fifth nerves (P14)', () => {
  it('traces a right superior oblique palsy to the left nucleus, and the jaw to the motor nucleus (D88)', () => {
    prepareSync('chronic');
    const iv = hypotheses().find((x) => x.id === 'brainstem_left:trochlear_nucleus');
    const mp = hypotheses().find((x) => x.id === 'brainstem_left:midpontine_tegmentum');
    assert.ok(iv && mp);
    const [eye] = explain(iv, [{ kind: 'cranial', side: 'R', sign: 'superior_oblique_weakness', value: 'present' }], 'chronic');
    assert.match(eye?.because ?? '', /left trochlear nucleus in the midbrain is damaged/);
    const [jaw] = explain(mp, [{ kind: 'cranial', side: 'L', sign: 'jaw_deviation', value: 'present' }], 'chronic');
    assert.match(jaw?.because ?? '', /left trigeminal motor nucleus in the pons is damaged/);
  });
});

describe('the working for the basal ganglia (P15)', () => {
  it('traces right-sided hemiballismus to the left subthalamic nucleus', () => {
    prepareSync('chronic');
    const stn = hypotheses().find((x) => x.id === 'hemisphere_left:subthalamic_nucleus');
    assert.ok(stn);
    const [right, left] = explain(
      stn,
      [
        { kind: 'hemiballismus', side: 'R', value: 'present' },
        { kind: 'hemiballismus', side: 'L', value: 'absent' },
      ],
      'chronic',
    );
    assert.match(right?.because ?? '', /left subthalamic nucleus is damaged: it acts on the opposite limbs/);
    assert.match(left?.because ?? '', /the opposite subthalamic nucleus is intact/);
  });
});
