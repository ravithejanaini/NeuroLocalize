// Amendment A19. Reverse inference for the basal ganglia, written from docs/P15-analysis.md
// before any P15 engine code. The expectation is a property of the ranking, never a number.
import type { Side } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const pain = (side: Side, value: 'normal' | 'abnormal'): BrainObservation => ({ kind: 'sensory', side, modality: 'pain_temperature', span: ['L4', 'L4'], value });

export const BASAL_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-hemiballismus',
    title: 'The right arm and leg fling involuntarily; strength, sensation and coordination normal',
    observations: [
      { kind: 'hemiballismus', side: 'R', value: 'present' },
      { kind: 'hemiballismus', side: 'L', value: 'absent' },
      power('R', 'C6', 'normal'),
      power('R', 'L3', 'normal'),
      power('L', 'C6', 'normal'),
      pain('R', 'normal'),
      pain('L', 'normal'),
      { kind: 'ataxia', side: 'R', value: 'absent' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['subthalamic_nucleus'] }],
    cite: ['S125', 'S126'],
    basis: 'stated',
    note: 'Right-sided hemiballismus with nothing else is the LEFT subthalamic nucleus (S125, S126); lesions elsewhere in the basal ganglia can give it too, which the model does not offer (C47).',
  },
];
