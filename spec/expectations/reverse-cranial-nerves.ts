// Amendment A35. Reverse inference for the cranial nerves outside the brainstem, written from
// docs/P29-analysis.md before any P29 engine code. Each expectation is a property of the
// ranking, never a number.
import type { CranialSign, Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const CRANIAL_NERVE_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-oculomotor-nerve',
    title: 'Left eye down and out with a drooping lid; right lid and right eye normal; limbs strong',
    observations: [
      cn('L', 'oculomotor_palsy', 'present'),
      cn('L', 'ptosis', 'present'),
      cn('R', 'ptosis', 'absent'),
      cn('R', 'elevation_weakness', 'absent'),
      cn('R', 'oculomotor_palsy', 'absent'),
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topPlaces: ['oculomotor_nerve'] }],
    cite: ['S62', 'S70'],
    basis: 'stated',
    note: 'Strong limbs rule out Weber syndrome (S62); one lid and a normal right eye rule out the nucleus, which droops both lids or neither and weakens the other eye’s elevation (S70).',
  },
  {
    id: 'reverse-abducens-nerve',
    title: 'The left eye will not abduct; gaze to the left otherwise full; face and limbs strong',
    observations: [
      cn('L', 'abduction_weakness', 'present'),
      cn('L', 'gaze_palsy', 'absent'),
      cn('R', 'adduction_weakness', 'absent'),
      { kind: 'face_weakness', side: 'L', value: 'normal' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topPlaces: ['abducens_nerve'] }],
    cite: ['S61', 'S70'],
    basis: 'stated',
    note: 'An isolated ipsilateral abduction deficit is the nerve; the nucleus would give a gaze palsy, and the ventral pons weak limbs and often a facial palsy (S61).',
  },
  {
    id: 'reverse-facial-nerve',
    title: 'The whole left face is weak, forehead included; eye movements, hearing, face sensation and limbs normal',
    observations: [
      { kind: 'face_weakness', side: 'L', value: 'whole' },
      { kind: 'face_sensation', side: 'L', value: 'normal' },
      cn('L', 'abduction_weakness', 'absent'),
      cn('L', 'gaze_palsy', 'absent'),
      cn('L', 'hearing_loss', 'absent'),
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topPlaces: ['facial_nerve'] }],
    cite: ['S51', 'S163'],
    basis: 'stated',
    note: 'A forehead that is weak too puts it at the nucleus or the nerve (S51, S163); with no other brainstem sign it is the nerve.',
  },
  {
    id: 'reverse-hypoglossal-nerve',
    title: 'The tongue deviates to the left on protrusion; palate and limbs normal',
    observations: [
      cn('L', 'tongue_weakness', 'present'),
      cn('R', 'tongue_weakness', 'absent'),
      cn('L', 'palate_weakness', 'absent'),
      { kind: 'sensory', side: 'R', modality: 'posterior_column', span: ['L4', 'L4'], value: 'normal' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topPlaces: ['hypoglossal_nerve'] }],
    cite: ['S63', 'S164'],
    basis: 'stated',
    note: 'The tongue deviates towards the damaged nerve (S63); strong limbs and a normal lemniscus rule out the medial medulla.',
  },
  // The isolated fourth nerve palsy is `reverse-trochlear-nucleus`, amended by A35: the nerve and
  // the other side's nucleus lead together.
];
