// Amendment A22. Reverse inference for both occipital lobes, written from docs/P18-analysis.md
// before any P18 engine code. The expectation is a property of the ranking, never a number.
import type { FieldSector, Side } from '../../src/kb/vocab.ts';
import type { VisionObservation, VisionReverseCase } from './reverse-vision.ts';

const f = (eye: Side, sector: FieldSector, value: 'normal' | 'abnormal'): VisionObservation => ({ kind: 'field', eye, sector, value });
const PERIPHERY: readonly FieldSector[] = ['temporal_superior', 'temporal_inferior', 'nasal_superior', 'nasal_inferior'];
const eyes: readonly Side[] = ['L', 'R'];

export const OCCIPITAL_REVERSE_CASES: readonly VisionReverseCase[] = [
  {
    id: 'reverse-cortical-blindness',
    title: 'Cannot see to either side with either eye; the centre is seen, and the pupils react equally',
    observations: [
      ...eyes.flatMap((eye) => PERIPHERY.map((s) => f(eye, s, 'abnormal'))),
      ...eyes.flatMap((eye) => (['central_left', 'central_right'] as const).map((s) => f(eye, s, 'normal'))),
      { kind: 'rapd', side: 'L', value: 'absent' },
      { kind: 'rapd', side: 'R', value: 'absent' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_both', topPlaces: ['pca_bilateral'], unexplained: false }],
    cite: ['S137'],
    basis: 'stated',
    note: 'Loss of vision on both sides with normal pupils is both occipital lobes (S137); the centre is kept because the occipital pole has a second supply. Both optic nerves would take the centre too, and the chiasm spares the nasal fields.',
  },
];
