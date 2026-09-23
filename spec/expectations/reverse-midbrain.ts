// Amendment A17. Reverse inference for the dorsal midbrain, written from docs/P13-analysis.md
// before any P13 engine code. The expectation is a property of the ranking, never a number.
import type { Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const eyes = (sign: 'upgaze_palsy' | 'light_near_dissociation' | 'convergence_retraction_nystagmus', value: SignObservation): BrainObservation => ({
  kind: 'eyes', sign, value,
});
const cn = (side: Side, sign: 'gaze_palsy' | 'adduction_weakness' | 'oculomotor_palsy', value: SignObservation): BrainObservation => ({
  kind: 'cranial', side, sign, value,
});
const power = (side: Side, value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: ['C6', 'C6'], value });

export const MIDBRAIN_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-parinaud',
    title: 'Cannot look up; pupils poor to light but constrict to near; eyes jerk inward on trying to look up',
    observations: [
      eyes('upgaze_palsy', 'present'),
      eyes('light_near_dissociation', 'present'),
      eyes('convergence_retraction_nystagmus', 'present'),
      cn('L', 'gaze_palsy', 'absent'),
      cn('R', 'gaze_palsy', 'absent'),
      cn('L', 'adduction_weakness', 'absent'),
      cn('R', 'adduction_weakness', 'absent'),
      cn('L', 'oculomotor_palsy', 'absent'),
      cn('R', 'oculomotor_palsy', 'absent'),
      power('L', 'normal'),
      power('R', 'normal'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_midline', topPlaces: ['dorsal_midbrain'] }],
    cite: ['S116', 'S119'],
    basis: 'stated',
    note: 'The triad of Parinaud syndrome, with horizontal gaze and the third nerve normal: the dorsal midbrain at the superior colliculus (S116), not the pontine gaze places of P9.',
  },
];
