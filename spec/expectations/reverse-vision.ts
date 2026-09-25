// Amendment A11. Reverse inference along the visual pathway, written before any visual code.
// Each case is an examination of the fields and the pupils as the sources describe the
// lesion (docs/P8-analysis.md); each expectation is a property of the ranking.
import type { FieldSector, LesionFamily, SensoryObservation, Side, SignObservation, SourceId, Timepoint, VisionPlace } from '../../src/kb/vocab.ts';
import type { BrainObservation } from './reverse-brain.ts';
import type { ReverseExpectation } from './reverse.ts';

export type VisionObservation =
  | BrainObservation
  | { readonly kind: 'field'; readonly eye: Side; readonly sector: FieldSector; readonly value: SensoryObservation }
  | { readonly kind: 'rapd'; readonly side: Side; readonly value: SignObservation };

export type VisionReverseExpectation = ReverseExpectation & {
  readonly timepoint: Timepoint;
  readonly topFamily?: LesionFamily;
  /** Every candidate in the best-ranked group sits at one of these places. */
  readonly topPlaces?: readonly VisionPlace[];
};

export type VisionReverseCase = {
  readonly id: string;
  readonly title: string;
  readonly observations: readonly VisionObservation[];
  readonly expectations: readonly VisionReverseExpectation[];
  readonly cite: readonly SourceId[];
  readonly basis: 'stated' | 'composed';
  readonly note: string;
};

const f = (eye: Side, sector: FieldSector, value: SensoryObservation): VisionObservation => ({ kind: 'field', eye, sector, value });
const pupil = (side: Side, value: SignObservation): VisionObservation => ({ kind: 'rapd', side, value });
/** The right half-field of both eyes, as a list of observations. */
const rightHalf = (value: SensoryObservation, centre: SensoryObservation | null = value): VisionObservation[] => [
  f('L', 'nasal_superior', value),
  f('L', 'nasal_inferior', value),
  f('R', 'temporal_superior', value),
  f('R', 'temporal_inferior', value),
  ...(centre ? [f('L', 'central_right', centre), f('R', 'central_right', centre)] : []),
];
const leftHalfNormal: VisionObservation[] = [
  f('L', 'temporal_superior', 'normal'),
  f('L', 'temporal_inferior', 'normal'),
  f('R', 'nasal_superior', 'normal'),
  f('R', 'nasal_inferior', 'normal'),
  f('L', 'central_left', 'normal'),
  f('R', 'central_left', 'normal'),
];
const noPupilDefect: VisionObservation[] = [pupil('L', 'absent'), pupil('R', 'absent')];

export const VISION_REVERSE_CASES: readonly VisionReverseCase[] = [
  {
    id: 'reverse-optic-nerve',
    title: 'One eye blind, with an afferent pupillary defect on that side',
    observations: [
      f('L', 'temporal_superior', 'abnormal'),
      f('L', 'temporal_inferior', 'abnormal'),
      f('L', 'nasal_superior', 'abnormal'),
      f('L', 'nasal_inferior', 'abnormal'),
      f('L', 'central_left', 'abnormal'),
      f('L', 'central_right', 'abnormal'),
      f('R', 'temporal_superior', 'normal'),
      f('R', 'nasal_superior', 'normal'),
      f('R', 'central_left', 'normal'),
      pupil('L', 'present'),
      pupil('R', 'absent'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['optic_nerve'] }],
    cite: ['S91', 'S92', 'S95'],
    basis: 'stated',
    note: 'Loss confined to one eye is in front of the chiasm (S92); the pupillary defect is on the side of the nerve (S95).',
  },
  {
    id: 'reverse-chiasm',
    title: 'Both temporal half-fields lost, the nasal halves kept',
    observations: [
      f('L', 'temporal_superior', 'abnormal'),
      f('L', 'temporal_inferior', 'abnormal'),
      f('R', 'temporal_superior', 'abnormal'),
      f('R', 'temporal_inferior', 'abnormal'),
      f('L', 'nasal_superior', 'normal'),
      f('L', 'nasal_inferior', 'normal'),
      f('R', 'nasal_superior', 'normal'),
      f('R', 'nasal_inferior', 'normal'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_chiasm', topPlaces: ['chiasm'] }],
    cite: ['S92', 'S96'],
    basis: 'stated',
    note: 'Bitemporal loss can only be the crossing fibres (S92, S96); no single retrochiasmal lesion takes both temporal fields.',
  },
  {
    id: 'reverse-optic-tract',
    title: 'Right homonymous hemianopia with a right afferent pupillary defect',
    observations: [...rightHalf('abnormal'), ...leftHalfNormal, pupil('R', 'present'), pupil('L', 'absent')],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['optic_tract'] }],
    cite: ['S92', 'S95', 'S97'],
    basis: 'stated',
    note: 'The pupillary defect places it in front of the lateral geniculate nucleus (S97), on the opposite side (S92, S95).',
  },
  {
    id: 'reverse-occipital-cortex',
    title: 'Right homonymous hemianopia, centre lost, pupils normal, speech normal',
    // A14: a left inferior-division MCA stroke cuts both radiations and gives the same field;
    // normal comprehension is what puts this lesion in the occipital lobe instead (C31).
    observations: [...rightHalf('abnormal'), ...leftHalfNormal, ...noPupilDefect, { kind: 'language', sign: 'impaired_comprehension', value: 'absent' }],
    // A27: the lateral geniculate nucleus gives the same field with the same normal pupils
    // (S147, S137); it shares the lead now that the model has it (C70).
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['occipital_cortex', 'lgn'] }],
    cite: ['S97', 'S92', 'S101', 'S105', 'S147'],
    basis: 'stated',
    note: 'Normal pupils exclude the tract (S97); the centre being lost excludes a lesion that spares the pole (S92); understanding speech excludes a left inferior-division stroke, which gives the same field with Wernicke aphasia (S101, S105; A14).',
  },
  {
    id: 'reverse-macular-sparing',
    title: 'Right homonymous hemianopia with the centre kept',
    observations: [...rightHalf('abnormal', 'normal'), ...leftHalfNormal, ...noPupilDefect],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['pca_occipital'] }],
    cite: ['S92', 'S94'],
    basis: 'stated',
    note: 'Macular sparing points to the occipital cortex with the pole spared, the territory of the posterior cerebral artery (S92, S94).',
  },
  {
    id: 'reverse-meyer-loop',
    title: 'Right superior quadrant lost in both eyes',
    observations: [
      f('L', 'nasal_superior', 'abnormal'),
      f('R', 'temporal_superior', 'abnormal'),
      f('L', 'nasal_inferior', 'normal'),
      f('R', 'temporal_inferior', 'normal'),
      ...leftHalfNormal,
      ...noPupilDefect,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['meyer_loop'] }],
    cite: ['S93', 'S94'],
    basis: 'stated',
    note: 'The superior field runs in Meyer loop through the temporal lobe (S93).',
  },
  {
    id: 'reverse-parietal-radiation',
    title: 'Right inferior quadrant lost in both eyes',
    observations: [
      f('L', 'nasal_inferior', 'abnormal'),
      f('R', 'temporal_inferior', 'abnormal'),
      f('L', 'nasal_superior', 'normal'),
      f('R', 'temporal_superior', 'normal'),
      ...leftHalfNormal,
      ...noPupilDefect,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['parietal_radiation'] }],
    cite: ['S93', 'S94'],
    basis: 'stated',
    note: 'The inferior field runs with the parietal fibres (S93).',
  },
  {
    id: 'reverse-field-open',
    title: 'One superior quadrant abnormal in one eye, nothing else examined',
    observations: [f('R', 'temporal_superior', 'abnormal')],
    expectations: [{ timepoint: 'chronic', amongTop: { k: 4, families: [['visual_left', 'visual_right', 'visual_chiasm']] } }],
    cite: ['S92', 'S93'],
    basis: 'stated',
    note: 'One quadrant in one eye could be the eye, the chiasm or anything behind it. The next test is not required to separate the two leaders here: with so many candidates tied, the most informative test may be elsewhere, and the panel says which of the two it is.',
  },
];
