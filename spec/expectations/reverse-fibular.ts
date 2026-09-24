// Amendment A23. Reverse inference for the fibular branches, written from docs/P19-analysis.md
// before any P19 engine code. The expectation is a property of the ranking, never a number.
import type { Muscle, SkinArea } from '../../src/kb/vocab.ts';
import type { LimbObservation, LimbReverseCase } from './reverse-plexus.ts';

const m = (muscle: Muscle, value: 'weak' | 'normal'): LimbObservation => ({ kind: 'muscle', side: 'L', muscle, value });
const s = (area: SkinArea, value: 'normal' | 'abnormal'): LimbObservation => ({ kind: 'skin', side: 'L', area, value });
const around: LimbObservation[] = [
  m('tibialis_posterior', 'normal'),
  m('gluteus_medius', 'normal'),
  m('gastrocnemius', 'normal'),
  s('sole', 'normal'),
  { kind: 'reflex', side: 'L', reflex: 'achilles', value: 'normal' },
];

export const FIBULAR_REVERSE_CASES: readonly LimbReverseCase[] = [
  {
    id: 'reverse-deep-fibular',
    title: 'Foot drop with eversion strong; only the first web space is numb',
    observations: [
      m('tibialis_anterior', 'weak'),
      m('toe_extensor', 'weak'),
      m('fibularis', 'normal'),
      s('first_web', 'abnormal'),
      s('dorsum_foot', 'normal'),
      s('lateral_leg', 'normal'),
      ...around,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topSites: ['deep_fibular'] }],
    cite: ['S139', 'S138'],
    basis: 'stated',
    note: 'Foot drop with the first web numb is the deep branch (S139); strong eversion and a normal dorsum spare the superficial branch (S138), so it is not the common fibular nerve. Strong inversion rules out L5, as in P7.',
  },
  {
    id: 'reverse-anterior-tarsal',
    title: 'The first web space is numb; every muscle of the leg is strong',
    observations: [
      m('tibialis_anterior', 'normal'),
      m('toe_extensor', 'normal'),
      m('fibularis', 'normal'),
      s('first_web', 'abnormal'),
      s('dorsum_foot', 'normal'),
      s('lateral_leg', 'normal'),
      ...around,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topSites: ['anterior_tarsal'] }],
    cite: ['S139'],
    basis: 'stated',
    note: 'A numb first web with the leg muscles strong is the deep fibular nerve at the ankle, below its muscle branches (S139). C58: the short toe extensors on the foot, which it can weaken, are not tested here.',
  },
];
