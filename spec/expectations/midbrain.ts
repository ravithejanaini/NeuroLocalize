// Amendment A17. Frozen expected outputs for the dorsal midbrain, written from the sources in
// docs/P13-analysis.md (S116–S119) before any P13 engine code, and run red against the P12
// engine first.
//
// Reading guide. An `eyes` assertion is about both eyes together and names the abnormal
// state. The dorsal midbrain is compressed from the midline, so the lesion takes both halves
// of the pretectum (C43). The lid, downgaze and skew deviation are left unasserted (C41, C42).
import type { Segment } from '../../src/kb/vocab.ts';
import type { BrainAssertion, BrainCase } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];

const eyes = (sign: Extract<BrainAssertion, { kind: 'eyes' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'eyes', sign, oneOf: [present ? 'present' : 'absent'], ...e,
});
const cn = (side: 'L' | 'R', sign: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], e: E): BrainAssertion => ({
  kind: 'cranial', side, sign, oneOf: ['absent'], ...e,
});

export const MIDBRAIN_CASES: readonly BrainCase[] = [
  {
    id: 'dorsal-midbrain',
    title: 'Dorsal midbrain: the pretectum at the superior colliculus',
    pattern: 'Parinaud syndrome',
    lesion: [{ brain: 'midbrain', sides: ['L', 'R'], compartments: ['pretectum'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        eyes('upgaze_palsy', true, { cite: ['S116', 'S119'], basis: 'stated', note: 'limited conjugate upgaze: the characteristic sign' }),
        eyes('light_near_dissociation', true, { cite: ['S116', 'S118'], basis: 'stated', note: 'poor constriction to light, preserved with convergence' }),
        eyes('convergence_retraction_nystagmus', true, { cite: ['S116'], basis: 'stated', note: 'especially on attempted upgaze' }),
        // Horizontal gaze is pontine (P9); the MLF and the third nerve are not in this lesion.
        cn('L', 'gaze_palsy', { cite: ['S61'], basis: 'composed', note: 'horizontal gaze is organised in the pons' }),
        cn('R', 'gaze_palsy', { cite: ['S61'], basis: 'composed' }),
        cn('L', 'adduction_weakness', { cite: ['S98'], basis: 'composed', note: 'the MLF is not in the pretectum' }),
        cn('R', 'adduction_weakness', { cite: ['S98'], basis: 'composed' }),
        cn('L', 'oculomotor_palsy', { cite: ['S62'], basis: 'composed', note: 'the third nerve fascicles run ventrally, to the peduncle' }),
        cn('R', 'oculomotor_palsy', { cite: ['S62'], basis: 'composed' }),
        { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S119'], basis: 'composed', note: 'the peduncle is ventral' },
        { kind: 'sensory', side: 'both', modality: 'all', span: all, oneOf: ['intact'], cite: ['S116'], basis: 'composed' },
      ],
      unasserted: [
        'the lid: Collier sign in about 40% (C41)',
        'downgaze: classically preserved, for reasons not entirely explained (C42); the model has no downgaze finding',
        'skew deviation and the fourth nerve are not modelled',
        'the relative afferent pupillary defect: the light reflex is lost in both eyes alike, and no source read says what the swinging-light test shows',
      ],
    }],
  },
];
