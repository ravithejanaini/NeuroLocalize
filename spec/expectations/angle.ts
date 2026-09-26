// Amendment A37. Frozen expected outputs for the eighth nerve and the cerebellopontine angle,
// written from the sources in docs/P31-analysis.md (S122, S167–S170) before any P31 engine code,
// and run red against the P30 engine first.
//
// Reading guide. The face's strength is never asserted at the angle (C81), nor vertigo beyond
// "present or unsettled" (C80).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];

const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const at = (brain: BrainRegion['brain'], compartments: BrainRegion['compartments']): BrainRegion => ({
  brain, sides: ['L'], compartments, severity: 'complete',
});
const noLimbs: Assertion = { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S167'], basis: 'composed', note: 'the brainstem is not compressed (C82)' };

export const ANGLE_CASES: readonly BrainCase[] = [
  {
    id: 'eighth-nerve-left',
    title: 'Left vestibulocochlear nerve, in the internal acoustic canal',
    pattern: 'one ear deaf, the face spared',
    lesion: [at('pons', ['vestibulocochlear_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'hearing_loss', true, { cite: ['S167', 'S169', 'S170'], basis: 'stated', note: 'unilateral sensorineural hearing loss, from the cochlear nerve' }),
        sign('R', 'hearing_loss', false, { cite: ['S169'], basis: 'stated', note: 'mostly unilateral' }),
        { kind: 'vertigo', oneOf: ['present', 'indeterminate'], cite: ['S170', 'S168'], basis: 'stated', note: 'often with vertigo (S170); imbalance (S168) — left unsettled (C80)' },
        { kind: 'face_weakness', side: 'L', oneOf: ['none'], cite: ['S170', 'S168'], basis: 'composed', note: 'the facial nerve is a separate nerve, and resists compression' },
        { kind: 'face_sensation', side: 'L', oneOf: ['intact'], cite: ['S122'], basis: 'composed' },
        { kind: 'ataxia', side: 'L', oneOf: ['absent'], cite: ['S167'], basis: 'composed', note: 'the cerebellum is compressed only by large tumours' },
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed' }),
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed', note: 'unlike the AICA, which takes the lateral pons' },
        noLimbs,
      ],
      unasserted: ['tinnitus (C83)'],
    }],
  },
  {
    id: 'cerebellopontine-angle-left',
    title: 'Left cerebellopontine angle, a large mass',
    pattern: 'deaf ear, numb face, clumsy arm on the same side; the face moves',
    lesion: [at('pons', ['vestibulocochlear_nerve', 'trigeminal_root']), { brain: 'cerebellum', sides: ['L'], compartments: ['cerebellar_hemisphere'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'hearing_loss', true, { cite: ['S167', 'S169'], basis: 'stated' }),
        { kind: 'face_sensation', side: 'L', oneOf: ['lost', 'impaired'], cite: ['S167', 'S122'], basis: 'stated', note: 'paraesthesia in the trigeminal nerve distribution' },
        { kind: 'face_division', side: 'L', division: 'V1', oneOf: ['lost', 'impaired'], cite: ['S122'], basis: 'composed', note: 'at the angle the nerve is one root, before the ganglion divides it' },
        { kind: 'face_division', side: 'L', division: 'V3', oneOf: ['lost', 'impaired'], cite: ['S122'], basis: 'composed' },
        { kind: 'ataxia', side: 'L', oneOf: ['present'], cite: ['S167'], basis: 'stated', note: 'cerebellar compression in large tumours' },
        { kind: 'ataxia', side: 'R', oneOf: ['absent'], cite: ['S167'], basis: 'composed' },
        { kind: 'face_sensation', side: 'R', oneOf: ['intact'], cite: ['S167'], basis: 'composed' },
        sign('R', 'hearing_loss', false, { cite: ['S169'], basis: 'stated' }),
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: all, oneOf: ['intact'], cite: ['S167'], basis: 'composed', note: 'the brainstem’s spinothalamic tract is not taken, unlike the AICA' },
        noLimbs,
      ],
      unasserted: ['the face’s strength: the facial nerve is rarely affected (C81)', 'the corneal reflex (C83)', 'brainstem compression (C82)'],
    }],
  },
];
