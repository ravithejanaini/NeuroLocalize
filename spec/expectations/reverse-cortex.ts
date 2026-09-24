// Amendment A20. Reverse inference for gaze deviation, written from docs/P16-analysis.md before
// any P16 engine code. The expectation is a property of the ranking, never a number.
//
// The teaching pair: a gaze palsy on the first day, with a hemisphere's signs, is the
// hemisphere (S104); the same gaze palsy still present after a month is the pons, because the
// frontal eye field's deviation is usually gone within five days (S131) and a brainstem palsy
// is on the side of the lesion (S130).
import type { Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const gaze = (side: Side, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign: 'gaze_palsy', value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const say = (sign: 'nonfluent_speech' | 'impaired_comprehension', value: SignObservation): BrainObservation => ({ kind: 'language', sign, value });

export const CORTEX_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-gaze-first-day',
    title: 'First day: cannot look to the right, right arm weak, speech non-fluent and not understood',
    observations: [
      gaze('R', 'present'),
      gaze('L', 'absent'),
      power('R', 'C6', 'weak'),
      power('L', 'C6', 'normal'),
      say('nonfluent_speech', 'present'),
      say('impaired_comprehension', 'present'),
    ],
    expectations: [
      // One lesion explains every finding on the first day...
      { timepoint: 'hyperacute', topFamily: 'hemisphere_left', topPlaces: ['mca_whole'], unexplained: false },
      // ...but not after a month, when the hemisphere's deviation has gone (S131).
      { timepoint: 'chronic', unexplained: true },
    ],
    cite: ['S104', 'S129', 'S130', 'S131'],
    basis: 'stated',
    note: 'S104: a large MCA stroke gives flaccidity, forced gaze deviation and, if dominant, speech deficits. The eyes look toward the lesion, so gaze to the right is lost from the LEFT hemisphere (S129, S130). After a month the deviation is usually gone (S131), and a pontine palsy toward the right would weaken the LEFT limbs — so no one lesion is left.',
  },
  {
    id: 'reverse-gaze-after-a-month',
    title: 'A month on: still cannot look to the right; strength and speech normal',
    observations: [
      gaze('R', 'present'),
      gaze('L', 'absent'),
      power('R', 'C6', 'normal'),
      power('L', 'C6', 'normal'),
      power('R', 'L3', 'normal'),
      power('L', 'L3', 'normal'),
      say('nonfluent_speech', 'absent'),
      say('impaired_comprehension', 'absent'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_right', topFamilyNot: ['hemisphere_left'] }],
    cite: ['S130', 'S131'],
    basis: 'composed',
    note: 'A frontal eye field deviation lasts no longer than five days in 90% (S131); a brainstem gaze palsy is on the side of the lesion (S130) — so a palsy toward the right that lasts points to the right pons. C50: after earlier damage to the other frontal lobe the deviation can last weeks.',
  },
];
