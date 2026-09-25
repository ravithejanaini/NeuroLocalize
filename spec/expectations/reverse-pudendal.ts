// Amendment A26. Reverse inference for the pudendal nerve, written from docs/P23-analysis.md
// before any P23 engine code. The expectation is a property of the ranking, never a number.
import type { Muscle, Side } from '../../src/kb/vocab.ts';
import type { LimbObservation, LimbReverseCase } from './reverse-plexus.ts';

const m = (side: Side, muscle: Muscle): LimbObservation => ({ kind: 'muscle', side, muscle, value: 'normal' });
const saddle = (side: Side, value: 'normal' | 'abnormal'): LimbObservation => ({ kind: 'sensory', side, modality: 'pain_temperature', span: ['S3', 'S5'], value });

export const PUDENDAL_REVERSE_CASES: readonly LimbReverseCase[] = [
  {
    id: 'reverse-pudendal',
    title: 'The left side of the saddle is numb; the right side and both legs are normal',
    observations: [
      saddle('L', 'abnormal'),
      saddle('R', 'normal'),
      m('L', 'gastrocnemius'),
      m('L', 'tibialis_anterior'),
      m('L', 'hamstrings'),
      m('R', 'gastrocnemius'),
      { kind: 'reflex', side: 'L', reflex: 'achilles', value: 'normal' },
      { kind: 'skin', side: 'L', area: 'sole', value: 'normal' },
    ],
    // C68: with these tests a left sacral root looks the same, so both are expected to lead.
    expectations: [{ timepoint: 'chronic', amongTop: { k: 2, families: [['nerve_left'], ['root_left']] }, topFamilyNot: ['roots_bilateral', 'complete'] }],
    cite: ['S22', 'S09'],
    basis: 'composed',
    note: 'One-sided perineal numbness with normal legs is the pudendal nerve (S22) or a single sacral root, not cauda equina or the conus, which S09 gives with leg and bladder signs. The model cannot separate the nerve from the root here (C68).',
  },
];
