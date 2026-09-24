// Amendment A24. Reverse inference for the tarsal tunnel, written from docs/P20-analysis.md
// before any P20 engine code. The expectation is a property of the ranking, never a number.
import type { Muscle, SkinArea } from '../../src/kb/vocab.ts';
import type { LimbObservation, LimbReverseCase } from './reverse-plexus.ts';

const m = (muscle: Muscle, value: 'weak' | 'normal'): LimbObservation => ({ kind: 'muscle', side: 'L', muscle, value });
const s = (area: SkinArea, value: 'normal' | 'abnormal'): LimbObservation => ({ kind: 'skin', side: 'L', area, value });

export const TARSAL_REVERSE_CASES: readonly LimbReverseCase[] = [
  {
    id: 'reverse-tarsal-tunnel',
    title: 'The sole is numb; plantar flexion, inversion and the ankle reflex are normal',
    observations: [
      s('sole', 'abnormal'),
      m('gastrocnemius', 'normal'),
      m('tibialis_posterior', 'normal'),
      { kind: 'reflex', side: 'L', reflex: 'achilles', value: 'normal' },
      s('lateral_foot', 'normal'),
      s('dorsum_foot', 'normal'),
      s('first_web', 'normal'),
      m('tibialis_anterior', 'normal'),
      m('fibularis', 'normal'),
      // Added after the first P20 run (D111): with one foot examined, both S2 roots ranked first
      // with no conflict, because no source gives the sole its roots. The other sole is the
      // comparison a bedside examination makes.
      { kind: 'skin', side: 'R', area: 'sole', value: 'normal' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topSites: ['tarsal_tunnel'] }],
    cite: ['S140', 'S141'],
    basis: 'stated',
    note: 'A numb sole with the calf strong and the ankle reflex kept is the tibial nerve at the ankle, below its branches to the leg (S140, S141). A tibial lesion in the leg would weaken plantar flexion and the reflex; S1 would numb the lateral foot.',
  },
];
