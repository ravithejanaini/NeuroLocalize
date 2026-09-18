// Amendment A15. Reverse inference for the cerebellum, written from docs/P11-analysis.md before
// any P11 engine code. Each examination is what a student does at the bedside — finger–nose
// and heel–shin for the limbs, sitting and standing for the trunk, the Romberg test — and each
// expectation is a property of the ranking, never a number.
import type { Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const limb = (side: Side, value: SignObservation): BrainObservation => ({ kind: 'ataxia', side, value });
const trunk = (value: SignObservation): BrainObservation => ({ kind: 'truncal_ataxia', value });
const power = (side: Side, at: 'C6' | 'L3' | 'L4', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const feel = (side: Side, modality: 'pain_temperature' | 'posterior_column', at: 'C6' | 'L4', value: 'normal' | 'abnormal'): BrainObservation => ({
  kind: 'sensory', side, modality, span: [at, at], value,
});
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const CEREBELLUM_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-cerebellar-hemisphere',
    title: 'Left arm and leg clumsy; strength, sensation, face and balance otherwise normal',
    observations: [
      limb('L', 'present'),
      limb('R', 'absent'),
      ...strong,
      feel('R', 'pain_temperature', 'L4', 'normal'),
      feel('L', 'pain_temperature', 'L4', 'normal'),
      { kind: 'face_sensation', side: 'L', value: 'normal' },
      { kind: 'face_weakness', side: 'L', value: 'normal' },
      { kind: 'vertigo', value: 'absent' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cerebellum_left', topPlaces: ['cerebellar_hemisphere'] }],
    cite: ['S109', 'S110'],
    basis: 'stated',
    note: 'Limb ataxia on one side with nothing else: that cerebellar hemisphere (S110). The brainstem places that give ataxia bring crossed sensory loss, a facial sign or vertigo with it.',
  },
  {
    id: 'reverse-vermis',
    title: 'Cannot sit or stand steadily; limbs coordinated; strength and sensation normal',
    observations: [
      trunk('present'),
      limb('L', 'absent'),
      limb('R', 'absent'),
      ...strong,
      feel('L', 'posterior_column', 'L4', 'normal'),
      feel('R', 'posterior_column', 'L4', 'normal'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cerebellum_midline', topPlaces: ['vermis'] }],
    cite: ['S109', 'S110'],
    basis: 'stated',
    note: 'Truncal and gait ataxia with the limbs spared is the vermis (S109).',
  },
  {
    id: 'reverse-sensory-unsteadiness',
    title: 'Romberg positive; trunk and limbs coordinated with the eyes open; vibration lost in both legs',
    observations: [
      { kind: 'romberg', value: 'present' },
      trunk('absent'),
      limb('L', 'absent'),
      limb('R', 'absent'),
      ...strong,
      feel('L', 'posterior_column', 'L4', 'abnormal'),
      feel('R', 'posterior_column', 'L4', 'abnormal'),
      feel('L', 'pain_temperature', 'L4', 'normal'),
      feel('R', 'pain_temperature', 'L4', 'normal'),
      { kind: 'reflex', side: 'L', reflex: 'patellar', value: 'normal' },
      { kind: 'reflex', side: 'R', reflex: 'patellar', value: 'normal' },
      { kind: 'babinski', side: 'L', value: 'absent' },
      { kind: 'babinski', side: 'R', value: 'absent' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'posterior' }],
    cite: ['S111', 'S13'],
    basis: 'stated',
    note: 'A positive Romberg test points to the sensory pathway rather than the cerebellum (S111); with vibration lost and reflexes normal, the posterior columns.',
  },
];
