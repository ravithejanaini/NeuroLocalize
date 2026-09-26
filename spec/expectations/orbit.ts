// Amendment A38. Frozen expected outputs for the superior orbital fissure and the orbital apex,
// written from the sources in docs/P32-analysis.md (S171, S122, S61, S70) before any P32 engine
// code, and run red against the P31 engine first.
//
// Reading guide. The fissure and the apex differ only in the optic nerve; both differ from the
// cavernous sinus in the cheek (V2). A Horner syndrome is never asserted here (C84).
import type { FieldRegion } from '../../src/kb/vocab.ts';
import type { BrainAssertion, BrainRegion, LanguageCase, VisionAssertion, VisionRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const division = (side: 'L' | 'R', d: 'V1' | 'V2' | 'V3', oneOf: readonly ('intact' | 'impaired' | 'lost')[], e: E): BrainAssertion => ({
  kind: 'face_division', side, division: d, oneOf, ...e,
});
const WHOLE: readonly FieldRegion[] = ['temporal_superior', 'temporal_inferior', 'nasal_superior', 'nasal_inferior', 'central_left', 'central_right'];
const field = (eye: 'L' | 'R', state: 'normal' | 'lost', e: E): VisionAssertion => ({ kind: 'field', eye, sectors: WHOLE, oneOf: [state], ...e });

const fissure: readonly BrainRegion[] = [
  { brain: 'midbrain', sides: ['L'], compartments: ['oculomotor_nerve', 'trochlear_nerve', 'ophthalmic_orbit'], severity: 'complete' },
  { brain: 'pons', sides: ['L'], compartments: ['abducens_nerve'], severity: 'complete' },
];
const opticNerve: VisionRegion = { vision: 'optic_nerve', sides: ['L'], severity: 'complete' };

/** III, IV and VI on the left, and the forehead. */
const ocular = (cite: E['cite']): BrainAssertion[] => [
  sign('L', 'oculomotor_palsy', true, { cite, basis: 'stated' }),
  sign('L', 'superior_oblique_weakness', true, { cite, basis: 'stated' }),
  sign('L', 'abduction_weakness', true, { cite, basis: 'stated' }),
  division('L', 'V1', ['lost', 'impaired'], { cite, basis: 'stated', note: 'the ophthalmic division, through the fissure' }),
  division('L', 'V2', ['intact'], { cite: ['S122', 'S171'], basis: 'composed', note: 'V2 bypasses the fissure; only the sinus adds it' }),
  division('L', 'V3', ['intact'], { cite: ['S122'], basis: 'composed' }),
  sign('R', 'oculomotor_palsy', false, { cite: ['S171'], basis: 'composed' }),
];

export const ORBIT_CASES: readonly LanguageCase[] = [
  {
    id: 'superior-orbital-fissure-left',
    title: 'Left superior orbital fissure',
    pattern: 'III, IV, VI and the forehead; the eye still sees',
    lesion: fissure,
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        ...ocular(['S171', 'S70']),
        field('L', 'normal', { cite: ['S171'], basis: 'stated', note: 'it differs from the apex by sparing the optic nerve' }),
        { kind: 'rapd', side: 'L', oneOf: ['absent'], cite: ['S171'], basis: 'composed' },
      ],
      unasserted: ['a Horner syndrome (C84)', 'proptosis and pain (C86)'],
    }],
  },
  {
    id: 'orbital-apex-left',
    title: 'Left orbital apex',
    pattern: 'the fissure, and the eye blind with a pupil defect',
    lesion: [...fissure, opticNerve],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        ...ocular(['S171']),
        field('L', 'lost', { cite: ['S171'], basis: 'stated', note: 'defective vision, from the optic nerve' }),
        field('R', 'normal', { cite: ['S171'], basis: 'composed', note: 'one apex, one eye' }),
        { kind: 'rapd', side: 'L', oneOf: ['present'], cite: ['S171'], basis: 'stated', note: 'a relative afferent pupillary defect due to involvement of the optic nerve' },
      ],
      unasserted: ['a Horner syndrome (C84)', 'proptosis and pain (C86)'],
    }],
  },
];
