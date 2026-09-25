// Amendment A27. Reverse inference for the lateral geniculate nucleus, written from
// docs/P24-analysis.md before any P24 engine code. The expectation is a property of the ranking,
// never a number.
import type { FieldSector, Side } from '../../src/kb/vocab.ts';
import type { VisionObservation, VisionReverseCase } from './reverse-vision.ts';

const f = (eye: Side, sector: FieldSector, value: 'normal' | 'abnormal'): VisionObservation => ({ kind: 'field', eye, sector, value });

export const GENICULATE_REVERSE_CASES: readonly VisionReverseCase[] = [
  {
    id: 'reverse-lgn',
    title: 'The whole right half of the field is lost in both eyes, centre included; the pupils react equally',
    observations: [
      f('L', 'nasal_superior', 'abnormal'), f('L', 'nasal_inferior', 'abnormal'), f('L', 'central_right', 'abnormal'),
      f('R', 'temporal_superior', 'abnormal'), f('R', 'temporal_inferior', 'abnormal'), f('R', 'central_right', 'abnormal'),
      f('L', 'temporal_superior', 'normal'), f('L', 'temporal_inferior', 'normal'), f('L', 'central_left', 'normal'),
      f('R', 'nasal_superior', 'normal'), f('R', 'nasal_inferior', 'normal'), f('R', 'central_left', 'normal'),
      { kind: 'rapd', side: 'L', value: 'absent' },
      { kind: 'rapd', side: 'R', value: 'absent' },
    ],
    // C70: the whole occipital cortex, pole included, gives the same; both may share the lead.
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['lgn', 'occipital_cortex'], unexplained: false }],
    cite: ['S147', 'S137', 'S91'],
    basis: 'stated',
    note: 'A complete right hemianopia with no pupillary defect is behind the optic tract (S137, S91): the left nucleus, or the whole left occipital cortex, which the model cannot separate from it (C70). The tract would add a right afferent pupillary defect.',
  },
];
