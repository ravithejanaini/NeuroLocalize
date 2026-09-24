// Amendment A20. Frozen expected outputs for the frontal eye field, written from the sources in
// docs/P16-analysis.md (S129–S131) before any P16 engine code, and run red against the P15
// engine first.
//
// Reading guide. A frontal eye field lesion loses gaze to the OPPOSITE side — the eyes deviate
// toward the lesion (S129, S130). It is the first brain finding that changes with time: S131
// has it gone within 48 hours in 57% and within five days in 90%. The pontine gaze palsy of P9
// does not fade, which is what lets time tell the two apart.
import type { Segment } from '../../src/kb/vocab.ts';
import type { BrainAssertion, BrainCase } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];
const gaze = (side: 'L' | 'R', state: 'present' | 'absent' | 'indeterminate', e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: 'gaze_palsy', oneOf: [state], ...e,
});

export const CORTEX_CASES: readonly BrainCase[] = [
  {
    id: 'frontal-eye-field-left',
    title: 'Left frontal eye field',
    pattern: 'the eyes deviate toward the lesion, then recover',
    lesion: [{ brain: 'cortex', sides: ['L'], compartments: ['frontal_eye_field'], severity: 'complete' }],
    evaluations: [
      {
        timepoint: 'hyperacute',
        assertions: [
          gaze('R', 'present', { cite: ['S129', 'S130'], basis: 'stated', note: 'deviation toward the lesion: gaze to the other side is lost (C49)' }),
          gaze('L', 'absent', { cite: ['S130'], basis: 'stated', note: 'unlike a brainstem palsy, which is on the side of the lesion' }),
        ],
        unasserted: [],
      },
      {
        timepoint: 'acute',
        assertions: [gaze('R', 'indeterminate', { cite: ['S131'], basis: 'stated', note: 'subsided within 48 hours in 57%' })],
        unasserted: [],
      },
      {
        timepoint: 'subacute',
        assertions: [gaze('R', 'indeterminate', { cite: ['S131'], basis: 'stated', note: 'no longer than five days in 90%' })],
        unasserted: [],
      },
      {
        timepoint: 'chronic',
        assertions: [
          gaze('R', 'absent', { cite: ['S131'], basis: 'stated', note: 'usually of brief duration (C50: the exception after earlier contralateral frontal damage)' }),
          gaze('L', 'absent', { cite: ['S130'], basis: 'composed' }),
          { kind: 'cranial', side: 'R', sign: 'abduction_weakness', oneOf: ['absent'], cite: ['S130', 'S61'], basis: 'composed', note: 'the abducens nucleus and nerve are untouched' },
          { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S130', 'S54'], basis: 'composed', note: 'Brodmann area 8 lies in front of the motor strip' },
          { kind: 'language', sign: 'nonfluent_speech', oneOf: ['absent'], cite: ['S100'], basis: 'composed', note: 'Broca area is not in this lesion' },
          { kind: 'gerstmann', oneOf: ['absent'], cite: ['S128'], basis: 'composed' },
        ],
        unasserted: ['the oculocephalic reflex is not modelled', 'the seizure (irritative) direction is not modelled'],
      },
    ],
  },
];
