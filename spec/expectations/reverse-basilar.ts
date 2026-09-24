// Amendment A21. Reverse inference for locked-in syndrome, written from docs/P17-analysis.md
// before any P17 engine code. The expectation is a property of the ranking, never a number.
import type { Side } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const power = (side: Side, at: 'C6' | 'L3'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value: 'weak' });
const face = (side: Side): BrainObservation => ({ kind: 'face_weakness', side, value: 'whole' });
const tongue = (side: Side): BrainObservation => ({ kind: 'cranial', side, sign: 'tongue_weakness', value: 'present' });

export const BASILAR_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-locked-in',
    title: 'Awake, cannot move any limb or the face, cannot speak; looks up to answer and understands',
    observations: [
      power('L', 'C6'),
      power('R', 'C6'),
      power('L', 'L3'),
      power('R', 'L3'),
      face('L'),
      face('R'),
      tongue('L'),
      tongue('R'),
      { kind: 'eyes', sign: 'upgaze_palsy', value: 'absent' },
      { kind: 'language', sign: 'impaired_comprehension', value: 'absent' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_midline', topPlaces: ['ventral_pons_bilateral'], unexplained: false }],
    cite: ['S132', 'S133', 'S134'],
    basis: 'stated',
    note: 'Quadriplegia and a weak face and tongue on both sides, with vertical eye movement and comprehension kept, is the ventral pons on both sides — the basilar artery (S133, S134). A cervical cord lesion would spare the face. C54: both cerebral peduncles can do it too, which the model does not offer.',
  },
];
