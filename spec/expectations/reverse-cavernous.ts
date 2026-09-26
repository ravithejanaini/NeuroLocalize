// Amendment A36. Reverse inference for the cavernous sinus, written from docs/P30-analysis.md
// before any P30 engine code. Each expectation is a property of the ranking, never a number.
import type { CranialSign, Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const CAVERNOUS_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-cavernous-sinus',
    title: 'Left eye frozen — third, fourth and sixth nerves — with a left Horner syndrome and a numb left forehead; the jaw feels normally; limbs strong',
    observations: [
      cn('L', 'oculomotor_palsy', 'present'),
      cn('L', 'abduction_weakness', 'present'),
      cn('L', 'superior_oblique_weakness', 'present'),
      { kind: 'horner', side: 'L', value: 'present' },
      { kind: 'face_division', side: 'L', division: 'V1', value: 'abnormal' },
      { kind: 'face_division', side: 'L', division: 'V3', value: 'normal' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topPlaces: ['cavernous_sinus'] }],
    cite: ['S165', 'S70', 'S122'],
    basis: 'stated',
    note: 'Three ocular nerves, V1 and the carotid’s sympathetic plexus meet only in the cavernous sinus (S165); a Horner syndrome with a sixth nerve palsy localises there (S70), and a normal jaw keeps V3, which does not pass through it (S122).',
  },
];
