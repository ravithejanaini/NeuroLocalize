// Amendment A37. Reverse inference for the eighth nerve and the cerebellopontine angle, written
// from docs/P31-analysis.md before any P31 engine code. Each expectation is a property of the
// ranking, never a number.
import type { CranialSign, Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const ANGLE_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-eighth-nerve',
    title: 'Deaf in the left ear; face moves and feels normally; no clumsiness; limbs strong',
    observations: [
      cn('L', 'hearing_loss', 'present'),
      cn('R', 'hearing_loss', 'absent'),
      { kind: 'face_weakness', side: 'L', value: 'normal' },
      { kind: 'face_sensation', side: 'L', value: 'normal' },
      { kind: 'ataxia', side: 'L', value: 'absent' },
      { kind: 'horner', side: 'L', value: 'absent' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['eighth_nerve'] }],
    cite: ['S167', 'S169', 'S170'],
    basis: 'stated',
    note: 'Unilateral sensorineural hearing loss from the cochlear nerve (S169); a normal face and no Horner syndrome keep it off the lateral pons, which the AICA takes with the cochlear nuclei.',
  },
  {
    id: 'reverse-cerebellopontine-angle',
    title: 'Deaf in the left ear, left face numb, left arm clumsy; the face moves; the right body feels; limbs strong',
    observations: [
      cn('L', 'hearing_loss', 'present'),
      { kind: 'face_sensation', side: 'L', value: 'abnormal' },
      { kind: 'ataxia', side: 'L', value: 'present' },
      { kind: 'face_weakness', side: 'L', value: 'normal' },
      { kind: 'horner', side: 'L', value: 'absent' },
      { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'normal' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['cerebellopontine_angle'] }],
    cite: ['S167', 'S169'],
    basis: 'stated',
    note: 'Hearing, the fifth nerve and the cerebellum on one side, with the face moving and the body’s sensation intact: a mass at the angle (S167), not the AICA’s lateral pons, which would take the facial nucleus and the spinothalamic tract.',
  },
];
