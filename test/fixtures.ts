// Examinations shared by several test files.
import type { Observation } from '../src/engine/reverse.ts';

/**
 * A C6 radiculopathy examined far enough to settle it. Since P4 the upper trunk competes
 * with the C6 root on the frozen examination alone (one conflict, larger prior share);
 * serratus weakness, a strong deltoid and a normal dorsal web separate them (S35, S37, S39).
 */
export const settledC6 = (observations: readonly Observation[]): Observation[] => [
  ...observations,
  { kind: 'muscle', side: 'L', muscle: 'serratus_anterior', value: 'weak' },
  { kind: 'muscle', side: 'L', muscle: 'deltoid', value: 'normal' },
  { kind: 'skin', side: 'L', area: 'dorsal_web', value: 'normal' },
];
