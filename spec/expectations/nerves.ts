// Amendment A18. Frozen expected outputs for the fourth and fifth nerves, written from the
// sources in docs/P14-analysis.md (S115, S120–S124) before any P14 engine code, and run red
// against the P13 engine first.
//
// Reading guide. `superior_oblique_weakness` is about one eye: that eye rides high, worse on
// looking down. `jaw_deviation` names the side the jaw swings to on opening. The pupil is never
// asserted: it depends on the cause in the nerve trunk, which the model does not have (C45).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];

const at = (brain: BrainRegion['brain'], compartments: BrainRegion['compartments']): BrainRegion => ({
  brain, sides: ['L'], compartments, severity: 'complete',
});
const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const sense = (side: 'L' | 'R', modality: 'pain_temperature' | 'posterior_column', state: 'lost' | 'intact', e: E): Assertion => ({
  kind: 'sensory', side, modality, span: all, oneOf: [state], ...e,
});

export const NERVE_CASES: readonly BrainCase[] = [
  {
    id: 'trochlear-nucleus-left',
    title: 'Left trochlear nucleus',
    pattern: 'a fourth nerve palsy of the other eye',
    lesion: [at('midbrain', ['trochlear_nucleus'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('R', 'superior_oblique_weakness', true, { cite: ['S120', 'S124'], basis: 'stated', note: 'a nuclear lesion affects the contralateral superior oblique: the fibres cross before they exit (C46)' }),
        sign('L', 'superior_oblique_weakness', false, { cite: ['S120'], basis: 'stated', note: 'the nucleus does not serve its own side' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        sign('R', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed' }),
        sign('L', 'adduction_weakness', false, { cite: ['S98'], basis: 'composed', note: 'the MLF runs beside the nucleus but is not in this lesion' }),
        sign('R', 'adduction_weakness', false, { cite: ['S98'], basis: 'composed' }),
        { kind: 'eyes', sign: 'upgaze_palsy', oneOf: ['absent'], cite: ['S116'], basis: 'composed', note: 'the pretectum is at the superior colliculus, the trochlear nucleus at the inferior' },
        { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S120'], basis: 'composed' },
      ],
      unasserted: ['head tilt: to the side away from the weak eye (S120); not modelled as a finding', 'the trochlear fascicle (C44)'],
    }],
  },
  {
    id: 'midpontine-tegmentum-left',
    title: 'Left mid-pontine tegmentum',
    pattern: 'the jaw and face on one side, the body on the other',
    lesion: [at('pons', ['trigeminal_motor', 'trigeminal_sensory', 'spinothalamic', 'medial_lemniscus', 'cerebellar_peduncle'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'jaw_deviation', true, { cite: ['S121', 'S123', 'S115'], basis: 'stated', note: 'masticator paralysis; the jaw deviates to the paralysed side on opening' }),
        sign('R', 'jaw_deviation', false, { cite: ['S123'], basis: 'composed', note: 'the right pterygoids are strong: they push the jaw to the left' }),
        { kind: 'face_sensation', side: 'L', oneOf: ['lost', 'impaired'], cite: ['S115', 'S122'], basis: 'stated', note: 'ipsilateral facial sensory disturbance: the principal sensory nucleus' },
        { kind: 'face_sensation', side: 'R', oneOf: ['intact'], cite: ['S115'], basis: 'composed' },
        sense('R', 'pain_temperature', 'lost', { cite: ['S115'], basis: 'stated', note: 'contralateral hemisensory loss: the spinothalamic tract' }),
        sense('R', 'posterior_column', 'lost', { cite: ['S115'], basis: 'stated', note: 'and the medial lemniscus' }),
        sense('L', 'pain_temperature', 'intact', { cite: ['S58'], basis: 'composed' }),
        { kind: 'ataxia', side: 'L', oneOf: ['present'], cite: ['S115'], basis: 'stated', note: 'ipsilateral hemiataxia' },
        { kind: 'ataxia', side: 'R', oneOf: ['absent'], cite: ['S115'], basis: 'composed' },
        { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S115'], basis: 'composed', note: 'the basis pontis is not in the tegmentum' },
        { kind: 'face_weakness', side: 'L', oneOf: ['none'], cite: ['S51'], basis: 'composed', note: 'the facial nucleus lies lower, in the caudal pons' },
        sign('L', 'hearing_loss', false, { cite: ['S114'], basis: 'composed', note: 'the cochlear nuclei are not in this lesion' }),
      ],
      unasserted: ['the jaw jerk is not modelled', 'which peduncle: S115 names the superior; the model has one pontine peduncle'],
    }],
  },
  // Added after the first P14 mutation run: each trigeminal nucleus alone, so that neither
  // sign can be carried by the other nucleus (A18). S122 puts the motor nucleus medial and
  // anterior to the principal sensory nucleus: the two are separate parts.
  {
    id: 'pons-trigeminal-motor-left',
    title: 'Left trigeminal motor nucleus alone',
    pattern: 'the jaw without the face',
    lesion: [at('pons', ['trigeminal_motor'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'jaw_deviation', true, { cite: ['S121', 'S123'], basis: 'stated' }),
        { kind: 'face_sensation', side: 'L', oneOf: ['intact'], cite: ['S122'], basis: 'composed', note: 'the principal sensory nucleus is a separate part, lateral to the motor nucleus' },
      ],
      unasserted: ['the jaw jerk is not modelled'],
    }],
  },
  {
    id: 'pons-trigeminal-sensory-left',
    title: 'Left principal trigeminal sensory nucleus alone',
    pattern: 'the face without the jaw',
    lesion: [at('pons', ['trigeminal_sensory'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'face_sensation', side: 'L', oneOf: ['lost', 'impaired'], cite: ['S122', 'S115'], basis: 'composed' },
        sign('L', 'jaw_deviation', false, { cite: ['S122'], basis: 'composed', note: 'the motor nucleus is a separate part, medial to the sensory nucleus' }),
      ],
      unasserted: [],
    }],
  },
];
