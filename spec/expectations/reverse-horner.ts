// Amendment A40. Reverse inference for the Horner syndrome by neurone, written from
// docs/P34-analysis.md before any P34 engine code. Each expectation is a property of the ranking,
// never a number.
import type { CranialSign, Muscle, Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const m = (muscle: Muscle, value: 'normal' | 'weak'): BrainObservation => ({ kind: 'muscle', side: 'L', muscle, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const legs: BrainObservation[] = [power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const HORNER_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-lung-apex',
    title: 'Left Horner syndrome with the left face dry; left intrinsic hand muscles weak, little finger numb; shoulder and elbow strong; legs strong',
    observations: [
      { kind: 'horner', side: 'L', value: 'present' },
      { kind: 'sweating', side: 'L', value: 'face' },
      m('interossei', 'weak'),
      m('thumb_abductor', 'weak'),
      m('deltoid', 'normal'),
      m('biceps', 'normal'),
      { kind: 'skin', side: 'L', area: 'little_finger', value: 'abnormal' },
      { kind: 'horner', side: 'R', value: 'absent' },
      ...legs,
    ],
    // C94: the C8 and T1 roots themselves give the same hand and the same second-order Horner
    // syndrome, and nothing examined separates them.
    expectations: [{ timepoint: 'chronic', amongTop: { k: 2, families: [['cranial_nerve_left'], ['root_left']] } }],
    cite: ['S177', 'S16'],
    basis: 'stated',
    note: 'A second-order Horner syndrome with the ulnar side of the hand is the lung apex — the sympathetic chain with the lower trunk (S177) — or the C8 and T1 roots themselves; the dry face rules out the cord above and the carotid beyond.',
  },
  {
    id: 'reverse-carotid-neck',
    title: 'Left Horner syndrome, sweating lost only at the left brow; the eye moves fully and the forehead feels; hand and limbs strong',
    observations: [
      { kind: 'horner', side: 'L', value: 'present' },
      { kind: 'sweating', side: 'L', value: 'brow' },
      cn('L', 'oculomotor_palsy', 'absent'),
      cn('L', 'abduction_weakness', 'absent'),
      { kind: 'face_division', side: 'L', division: 'V1', value: 'normal' },
      m('interossei', 'normal'),
      power('L', 'C6', 'normal'),
      power('R', 'C6', 'normal'),
      ...legs,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['carotid_neck'] }],
    cite: ['S178', 'S16', 'S176'],
    basis: 'stated',
    note: 'Sweating lost only at the brow is the third neurone, beyond the superior cervical ganglion (S16, S176); with the eye moving and the forehead feeling it is the carotid in the neck (S178), not the cavernous sinus.',
  },
  {
    id: 'reverse-horner-first-order',
    title: 'Left Horner syndrome with the left face and the left half of the body dry; left palate weak, left face numb to pain; right body numb to pain',
    observations: [
      { kind: 'horner', side: 'L', value: 'present' },
      { kind: 'sweating', side: 'L', value: 'body' },
      cn('L', 'palate_weakness', 'present'),
      { kind: 'face_sensation', side: 'L', value: 'abnormal' },
      { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'abnormal' },
      power('L', 'C6', 'normal'),
      power('R', 'C6', 'normal'),
      ...legs,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['lateral_medullary', 'pica'] }],
    cite: ['S16', 'S176', 'S47'],
    basis: 'stated',
    note: 'A first-order Horner syndrome — the half body dry — with the crossed signs of the lateral medulla (S16, S47).',
  },
];
