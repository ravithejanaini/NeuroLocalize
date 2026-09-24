// Amendment A21. Frozen expected outputs for the ventral pons on both sides — locked-in
// syndrome — written from the sources in docs/P17-analysis.md (S132–S134) before any P17 code,
// and run against the P16 engine first.
//
// Reading guide. The patient cannot move or speak but is awake, hears, understands, and
// answers with vertical eye movements (S132, S133, S134). Nothing here is asserted about
// sensation: S132 says it is lost, while S134 says the tegmentum that carries it is spared (C52).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
type Span = readonly [Segment, Segment];
const ARM: Span = ['C5', 'T1'];
const LEG: Span = ['L2', 'S2'];
const both = <A extends Assertion | BrainAssertion>(f: (side: 'L' | 'R') => A): A[] => [f('L'), f('R')];
const motor = (side: 'L' | 'R', span: Span, e: E): Assertion => ({ kind: 'motor', side, span, lesion: ['umn'], ...e });
const sign = (side: 'L' | 'R', sign: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], state: 'present' | 'absent', e: E): BrainAssertion => ({
  kind: 'cranial', side, sign, oneOf: [state], ...e,
});

export const BASILAR_CASES: readonly BrainCase[] = [
  {
    id: 'ventral-pons-both',
    title: 'Both sides of the ventral pons',
    pattern: 'locked-in syndrome: awake, cannot move or speak, looks up to answer',
    lesion: [{ brain: 'pons', sides: ['L', 'R'], compartments: ['basis', 'facial', 'abducens_fascicle'], severity: 'complete' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          ...both((side) => motor(side, ARM, { cite: ['S132', 'S133', 'S134'], basis: 'stated', note: 'quadriplegia' })),
          ...both((side) => motor(side, LEG, { cite: ['S132', 'S133', 'S134'], basis: 'stated', note: 'quadriplegia' })),
          ...both((side): Assertion => ({ kind: 'babinski', side, oneOf: ['present'], cite: ['S132', 'S54'], basis: 'stated', note: 'corticospinal damage in the ventral brainstem' })),
          ...both((side): BrainAssertion => ({ kind: 'face_weakness', side, oneOf: ['whole'], cite: ['S132', 'S51'], basis: 'stated', note: 'bilateral peripheral facial palsy' })),
          ...both((side) => sign(side, 'tongue_weakness', 'present', { cite: ['S132', 'S133'], basis: 'stated', note: 'weak tongue movement; anarthria' })),
          ...both((side) => sign(side, 'palate_weakness', 'present', { cite: ['S132', 'S133'], basis: 'stated', note: 'absent gag reflex; dysphagia' })),
          ...both((side) => sign(side, 'abduction_weakness', 'present', { cite: ['S133', 'S132', 'S61'], basis: 'composed', note: 'lateral gaze palsies are typical; both sixth-nerve fascicles are in the lesion' })),
          ...both((side) => sign(side, 'hearing_loss', 'absent', { cite: ['S132'], basis: 'stated', note: 'retention of hearing' })),
          ...both((side) => sign(side, 'oculomotor_palsy', 'absent', { cite: ['S133', 'S134'], basis: 'composed', note: 'the midbrain is spared, so the lid and vertical movements are kept' })),
          { kind: 'eyes', sign: 'upgaze_palsy', oneOf: ['absent'], cite: ['S133', 'S134'], basis: 'stated', note: 'vertical eye movement is how the patient answers' },
          { kind: 'language', sign: 'impaired_comprehension', oneOf: ['absent'], cite: ['S132'], basis: 'stated', note: 'language comprehension is retained' },
          { kind: 'language', sign: 'nonfluent_speech', oneOf: ['absent'], cite: ['S132', 'S133'], basis: 'composed', note: 'anarthria is paralysis of the speech muscles, not aphasia' },
        ],
        unasserted: [
          'sensation of the body and face: S132 says lost, S134 spares the tegmentum that carries it (C52)',
          'adduction and horizontal gaze: S133 calls medial gaze palsy typical, but its parts lie in the spared tegmentum (C53)',
          'consciousness, blinking, breathing and the neck are not modelled',
        ],
      },
    ],
  },
];
