// Amendment A15. Frozen expected outputs for the cerebellum, written from the sources in
// docs/P11-analysis.md (S109–S112) before any P11 engine code, and run red against the P10
// engine first.
//
// Reading guide. `ataxia` is limb ataxia on one side, as it has been since P5; `truncal_ataxia`
// belongs to the patient. The vermis is midline, so its lesion takes both halves. Reflexes are
// never asserted here: a cerebellar lesion can give hypotonia and pendular reflexes, which the
// model does not show (docs/P11-analysis.md §5).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
type Span = readonly [Segment, Segment];
const all: Span = ['C1', 'Co1'];

const at = (compartments: BrainRegion['compartments'], sides: BrainRegion['sides']): BrainRegion => ({
  brain: 'cerebellum', sides, compartments, severity: 'complete',
});
const limb = (side: 'L' | 'R', present: boolean, e: E): BrainAssertion => ({ kind: 'ataxia', side, oneOf: [present ? 'present' : 'absent'], ...e });
const trunk = (state: 'present' | 'absent' | 'indeterminate', e: E): BrainAssertion => ({ kind: 'truncal_ataxia', oneOf: [state], ...e });
const motor = (side: 'L' | 'R' | 'both', e: E): Assertion => ({ kind: 'motor', side, span: all, lesion: ['none'], ...e });
const sense = (side: 'L' | 'R' | 'both', e: E): Assertion => ({ kind: 'sensory', side, modality: 'all', span: all, oneOf: ['intact'], ...e });
const face = (side: 'L' | 'R', e: E): BrainAssertion => ({ kind: 'face_weakness', side, oneOf: ['none'], ...e });
const feel = (side: 'L' | 'R', e: E): BrainAssertion => ({ kind: 'face_sensation', side, oneOf: ['intact'], ...e });

export const CEREBELLUM_CASES: readonly BrainCase[] = [
  {
    id: 'cerebellar-hemisphere-left',
    title: 'Left cerebellar hemisphere',
    pattern: 'limb ataxia on the side of the lesion',
    lesion: [at(['cerebellar_hemisphere'], ['L'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        limb('L', true, { cite: ['S109', 'S110'], basis: 'stated', note: 'each hemisphere controls the same side of the body' }),
        limb('R', false, { cite: ['S110'], basis: 'composed', note: 'the right hemisphere is intact' }),
        trunk('indeterminate', { cite: ['S111', 'S109'], basis: 'stated', note: 'C35: hemispheric lesions give mainly incoordination — not only' }),
        motor('both', { cite: ['S110'], basis: 'composed', note: 'incoordination, not weakness: no motor pathway is in the lesion' }),
        sense('both', { cite: ['S110'], basis: 'composed' }),
        face('L', { cite: ['S110'], basis: 'composed' }),
        face('R', { cite: ['S110'], basis: 'composed' }),
        feel('L', { cite: ['S110'], basis: 'composed' }),
        { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S110'], basis: 'composed', note: 'the corticospinal tract is not in the cerebellum' },
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        { kind: 'romberg', oneOf: ['indeterminate'], cite: ['S67', 'S111'], basis: 'composed', note: 'an ataxic patient is unsteady with the eyes open, so closing them shows nothing (A9)' },
      ],
      unasserted: [
        'nystagmus and dysarthria: common after a hemisphere lesion (S110) but not modelled for the cerebellum (C36)',
        'reflexes: hypotonia and pendular reflexes are not modelled',
      ],
    }],
  },
  {
    id: 'vermis',
    title: 'Cerebellar vermis',
    pattern: 'truncal and gait ataxia with the limbs spared',
    lesion: [at(['vermis'], ['L', 'R'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        trunk('present', { cite: ['S109', 'S110'], basis: 'stated', note: 'truncal, gait ataxia; patients cannot maintain a straight posture' }),
        limb('L', false, { cite: ['S109'], basis: 'stated', note: 'with sparing of the limbs' }),
        limb('R', false, { cite: ['S109'], basis: 'stated' }),
        motor('both', { cite: ['S109'], basis: 'composed' }),
        sense('both', { cite: ['S109', 'S111'], basis: 'composed', note: 'the imbalance is not sensory' }),
        face('L', { cite: ['S110'], basis: 'composed' }),
        face('R', { cite: ['S110'], basis: 'composed' }),
        { kind: 'romberg', oneOf: ['indeterminate'], cite: ['S111', 'S67'], basis: 'composed', note: 'truncal ataxia shows sitting or standing with the eyes open, so the test cannot be read' },
      ],
      unasserted: [
        'titubation and the flocculonodular lobe are not modelled',
        'reflexes: not asserted',
      ],
    }],
  },
];
