// Amendment A18. Reverse inference for the fourth and fifth nerves, written from
// docs/P14-analysis.md before any P14 engine code. Each expectation is a property of the
// ranking, never a number.
import type { Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

type Cn = 'superior_oblique_weakness' | 'jaw_deviation' | 'oculomotor_palsy' | 'hearing_loss' | 'palate_weakness' | 'abduction_weakness';
const cn = (side: Side, sign: Cn, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const NERVE_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-trochlear-nucleus',
    title: 'The right eye rides high, worse looking down; nothing else',
    observations: [
      cn('R', 'superior_oblique_weakness', 'present'),
      cn('L', 'superior_oblique_weakness', 'absent'),
      cn('L', 'oculomotor_palsy', 'absent'),
      cn('R', 'oculomotor_palsy', 'absent'),
      cn('L', 'abduction_weakness', 'absent'),
      cn('R', 'abduction_weakness', 'absent'),
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['trochlear_nucleus'] }],
    cite: ['S120', 'S124'],
    basis: 'stated',
    note: 'A right superior oblique palsy from the brainstem is the LEFT trochlear nucleus: its fibres cross before they leave the midbrain (S120).',
  },
  {
    id: 'reverse-midpontine',
    title: 'Jaw deviates left, left face numb, left limbs clumsy; right body numb; hearing, face strength and balance normal',
    observations: [
      cn('L', 'jaw_deviation', 'present'),
      cn('R', 'jaw_deviation', 'absent'),
      { kind: 'face_sensation', side: 'L', value: 'abnormal' },
      { kind: 'face_weakness', side: 'L', value: 'normal' },
      { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'abnormal' },
      { kind: 'sensory', side: 'R', modality: 'posterior_column', span: ['L4', 'L4'], value: 'abnormal' },
      { kind: 'ataxia', side: 'L', value: 'present' },
      cn('L', 'hearing_loss', 'absent'),
      cn('L', 'palate_weakness', 'absent'),
      { kind: 'vertigo', value: 'absent' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['midpontine_tegmentum'] }],
    cite: ['S115', 'S121', 'S123'],
    basis: 'stated',
    note: 'The jaw puts it in the pons, at the trigeminal motor nucleus (S121, S123); normal hearing and face strength keep it off the AICA, and a normal palate and no vertigo off the lateral medulla.',
  },
];
