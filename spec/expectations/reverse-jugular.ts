// Amendment A39. Reverse inference for the jugular foramen, written from docs/P33-analysis.md
// before any P33 engine code. Each expectation is a property of the ranking, never a number.
import type { CranialSign, Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const JUGULAR_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-jugular-foramen',
    title: 'Left palate weak, the back of the tongue numb on the left, left shoulder droops; tongue strong; no Horner syndrome; face and body feel; limbs strong',
    observations: [
      cn('L', 'palate_weakness', 'present'),
      cn('L', 'posterior_tongue_loss', 'present'),
      cn('L', 'accessory_weakness', 'present'),
      cn('L', 'tongue_weakness', 'absent'),
      { kind: 'horner', side: 'L', value: 'absent' },
      { kind: 'face_sensation', side: 'L', value: 'normal' },
      { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'normal' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['jugular_foramen'] }],
    cite: ['S172', 'S173'],
    basis: 'stated',
    note: 'The ninth, tenth and eleventh nerves leave together by the jugular foramen (S172); a strong tongue fits, since the twelfth leaves by its own canal, and no Horner syndrome or facial numbness keeps it out of the lateral medulla.',
  },
];
