// Amendment A35. Frozen expected outputs for five cranial nerves after they leave the
// brainstem, written from the sources in docs/P29-analysis.md (S51, S61–S63, S70, S120,
// S163, S164) before any P29 engine code, and run red against the P28 engine first.
//
// Reading guide. Each lesion is the nerve alone, outside the brainstem. The point every source
// makes is what is ABSENT: no long-tract sign, no gaze palsy, nothing in the other eye. The
// pupil is never asserted (C45, C74).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];

const at = (brain: BrainRegion['brain'], compartments: BrainRegion['compartments']): BrainRegion => ({
  brain, sides: ['L'], compartments, severity: 'complete',
});
const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const noLimbs: Assertion = { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S62', 'S70'], basis: 'composed', note: 'outside the brainstem: no corticospinal fibres' };
const feelsAll = (side: 'L' | 'R'): Assertion => ({ kind: 'sensory', side, modality: 'posterior_column', span: all, oneOf: ['intact'], cite: ['S63'], basis: 'composed' });

export const CRANIAL_NERVE_CASES: readonly BrainCase[] = [
  {
    id: 'oculomotor-nerve-left',
    title: 'Left oculomotor nerve, beside the posterior communicating artery',
    pattern: 'a third nerve palsy and nothing else',
    lesion: [at('midbrain', ['oculomotor_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'oculomotor_palsy', true, { cite: ['S62', 'S70'], basis: 'stated', note: 'the nerve passes the posterior communicating artery on its way to the cavernous sinus' }),
        sign('L', 'ptosis', true, { cite: ['S62'], basis: 'stated', note: 'the superior division innervates the levator palpebrae superioris' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed', note: 'only a nuclear lesion reaches both lids' }),
        sign('L', 'elevation_weakness', true, { cite: ['S62'], basis: 'stated', note: 'the superior division innervates the superior rectus' }),
        sign('R', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed', note: 'the crossed superior rectus fibres are in the nucleus, not the nerve' }),
        sign('L', 'adduction_weakness', true, { cite: ['S70'], basis: 'stated', note: 'the medial rectus (third nerve) adducts the eye' }),
        sign('R', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        sign('L', 'abduction_weakness', false, { cite: ['S70'], basis: 'composed', note: 'the sixth nerve is a separate nerve' }),
        noLimbs,
      ],
      unasserted: ['the pupil: involved when compressed, often spared when ischaemic (C45, C74)'],
    }],
  },
  {
    id: 'trochlear-nerve-left',
    title: 'Left trochlear nerve, around the midbrain',
    pattern: 'a fourth nerve palsy of the SAME eye',
    lesion: [at('midbrain', ['trochlear_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'superior_oblique_weakness', true, { cite: ['S120', 'S70'], basis: 'stated', note: 'past the decussation the nerve runs to the superior oblique of its own side' }),
        sign('R', 'superior_oblique_weakness', false, { cite: ['S120', 'S70'], basis: 'stated', note: 'only the nucleus serves the other eye' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'abduction_weakness', false, { cite: ['S70'], basis: 'composed' }),
        noLimbs,
      ],
      unasserted: ['head tilt (S120); not modelled as a finding'],
    }],
  },
  {
    id: 'abducens-nerve-left',
    title: 'Left abducens nerve, along the clivus',
    pattern: 'an abduction deficit and nothing else',
    lesion: [at('pons', ['abducens_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'abduction_weakness', true, { cite: ['S61', 'S70'], basis: 'stated', note: 'an isolated ipsilateral abduction deficit' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'stated', note: 'only the nucleus gives a conjugate gaze palsy' }),
        sign('R', 'adduction_weakness', false, { cite: ['S61'], basis: 'composed', note: 'the internuclear neurons are in the nucleus' }),
        sign('R', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed' }),
        { kind: 'face_weakness', side: 'L', oneOf: ['none'], cite: ['S61'], basis: 'composed', note: 'the facial genu wraps the nucleus, not the nerve on the clivus' },
        noLimbs,
      ],
      unasserted: ['a false localising sign of raised pressure (S61); not modelled'],
    }],
  },
  {
    id: 'facial-nerve-left',
    title: 'Left facial nerve, at the stylomastoid foramen',
    pattern: 'the whole face on one side, forehead included',
    lesion: [at('pons', ['facial_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'face_weakness', side: 'L', oneOf: ['whole'], cite: ['S51', 'S163'], basis: 'stated', note: 'complete paralysis of all the facial muscles on the ipsilateral side; the forehead is not spared' },
        { kind: 'face_weakness', side: 'R', oneOf: ['none'], cite: ['S51'], basis: 'composed' },
        { kind: 'face_sensation', side: 'L', oneOf: ['intact'], cite: ['S51'], basis: 'composed', note: 'the face is felt through the fifth nerve' },
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed', note: 'the abducens nucleus is inside the brainstem, the lesion outside it' }),
        sign('L', 'hearing_loss', false, { cite: ['S51'], basis: 'composed', note: 'below the chorda tympani the only finding is facial plegia' }),
        noLimbs,
      ],
      unasserted: ['taste, tears, saliva and hyperacusis by segment of the facial canal (C75)'],
    }],
  },
  {
    id: 'hypoglossal-nerve-left',
    title: 'Left hypoglossal nerve, in the hypoglossal canal',
    pattern: 'the tongue deviates to the lesion, nothing else',
    lesion: [at('medulla', ['hypoglossal_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'tongue_weakness', true, { cite: ['S63', 'S164'], basis: 'stated', note: 'the tongue deviates towards the damaged nerve' }),
        sign('R', 'tongue_weakness', false, { cite: ['S63'], basis: 'composed' }),
        sign('L', 'palate_weakness', false, { cite: ['S64'], basis: 'composed', note: 'the nucleus ambiguus is inside the medulla' }),
        feelsAll('R'),
        noLimbs,
      ],
      unasserted: ['atrophy and fasciculation (S63); not modelled as findings'],
    }],
  },
];
