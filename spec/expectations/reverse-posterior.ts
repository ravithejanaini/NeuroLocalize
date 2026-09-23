// Amendment A16. Reverse inference for the three cerebellar arteries, written from
// docs/P12-analysis.md before any P12 engine code. Each expectation is a property of the
// ranking, never a number.
import type { Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const cn = (side: Side, sign: 'hearing_loss' | 'abduction_weakness' | 'gaze_palsy' | 'palate_weakness', value: SignObservation): BrainObservation => ({
  kind: 'cranial', side, sign, value,
});
const limb = (side: Side, value: SignObservation): BrainObservation => ({ kind: 'ataxia', side, value });
const trunk = (value: SignObservation): BrainObservation => ({ kind: 'truncal_ataxia', value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const pain = (side: Side, value: 'normal' | 'abnormal'): BrainObservation => ({ kind: 'sensory', side, modality: 'pain_temperature', span: ['L4', 'L4'], value });
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const POSTERIOR_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-aica',
    title: 'Left face weak and left ear deaf, left limbs clumsy, vertigo; right side numb to pain',
    observations: [
      cn('L', 'hearing_loss', 'present'),
      cn('R', 'hearing_loss', 'absent'),
      { kind: 'face_weakness', side: 'L', value: 'whole' },
      limb('L', 'present'),
      { kind: 'vertigo', value: 'present' },
      pain('R', 'abnormal'),
      pain('L', 'normal'),
      cn('L', 'abduction_weakness', 'absent'),
      cn('L', 'gaze_palsy', 'absent'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['aica'] }],
    cite: ['S113', 'S114', 'S65'],
    basis: 'stated',
    note: 'Hearing loss with a whole-face palsy on the same side is the AICA (S113, S114); the sixth nerve spared keeps it off the medial pons.',
  },
  {
    id: 'reverse-pica',
    title: 'Wallenberg syndrome on the left, and cannot sit or stand steadily',
    observations: [
      { kind: 'face_sensation', side: 'L', value: 'abnormal' },
      pain('R', 'abnormal'),
      { kind: 'horner', side: 'L', value: 'present' },
      cn('L', 'palate_weakness', 'present'),
      limb('L', 'present'),
      { kind: 'vertigo', value: 'present' },
      trunk('present'),
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['pica'] }],
    cite: ['S114', 'S113', 'S47'],
    basis: 'stated',
    note: 'Truncal ataxia with the lateral medullary syndrome takes the cerebellum too: the whole PICA territory (S114), not the medulla alone (C38).',
  },
  {
    id: 'reverse-sca',
    title: 'Left limbs clumsy and trunk unsteady; hearing, face, pain sensation and strength normal',
    observations: [
      limb('L', 'present'),
      limb('R', 'absent'),
      trunk('present'),
      cn('L', 'hearing_loss', 'absent'),
      { kind: 'face_weakness', side: 'L', value: 'normal' },
      pain('R', 'normal'),
      { kind: 'horner', side: 'L', value: 'absent' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cerebellum_left', topPlaces: ['sca'] }],
    cite: ['S113', 'S110'],
    basis: 'composed',
    note: 'Limb and truncal ataxia together with no brainstem sign: the superior cerebellum, hemisphere and vermis (S110, S113). The hemisphere alone leaves the trunk unsettled (C35); the vermis alone spares the limbs.',
  },
];
