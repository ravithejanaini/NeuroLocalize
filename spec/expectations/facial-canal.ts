// Amendment A41. Frozen expected outputs for the facial nerve by segment, written from the
// sources in docs/P35-analysis.md (S51, S179) before any P35 engine code, and run red against
// the P34 engine first.
//
// Reading guide. Each lesion is one stretch of the nerve inside the temporal bone, named by the
// branch points. `tear_loss`, `hyperacusis` and `taste_loss` are each about one side. Salivation
// is never asserted (C98).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];
const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const at = (compartments: BrainRegion['compartments']): BrainRegion => ({ brain: 'pons', sides: ['L'], compartments, severity: 'complete' });
const face: BrainAssertion = { kind: 'face_weakness', side: 'L', oneOf: ['whole'], cite: ['S51'], basis: 'stated', note: 'ipsilateral facial plegia at every level of the canal' };
const otherSide: BrainAssertion = { kind: 'face_weakness', side: 'R', oneOf: ['none'], cite: ['S51'], basis: 'composed' };
const noLimbs: Assertion = { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S51'], basis: 'composed' };
const S: E = { cite: ['S51', 'S179'], basis: 'stated' };
const spared = (note: string): E => ({ cite: ['S51', 'S179'], basis: 'stated', note });

export const FACIAL_CANAL_CASES: readonly BrainCase[] = [
  {
    id: 'facial-above-geniculate-left',
    title: 'Left facial nerve between the internal acoustic meatus and the geniculate ganglion',
    pattern: 'the face, with tears, the stapedius and taste all lost',
    lesion: [at(['facial_above_geniculate'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        face,
        sign('L', 'tear_loss', true, { ...S, note: 'above the greater petrosal nerve: loss of lacrimation' }),
        sign('L', 'hyperacusis', true, S),
        sign('L', 'taste_loss', true, S),
        sign('R', 'tear_loss', false, { cite: ['S51'], basis: 'composed' }),
        sign('R', 'taste_loss', false, { cite: ['S51'], basis: 'composed' }),
        sign('L', 'hearing_loss', false, { cite: ['S51'], basis: 'composed', note: 'S51 adds deafness only if the eighth nerve is involved too' }),
        otherSide,
        noLimbs,
      ],
      unasserted: ['salivation (C98)'],
    }],
  },
  {
    id: 'facial-above-stapedius-left',
    title: 'Left facial nerve between the geniculate ganglion and the nerve to stapedius',
    pattern: 'the face, hyperacusis and taste; the eye still waters',
    lesion: [at(['facial_above_stapedius'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        face,
        sign('L', 'tear_loss', false, spared('the greater petrosal nerve has already left, at the ganglion')),
        sign('L', 'hyperacusis', true, S),
        sign('L', 'taste_loss', true, S),
        otherSide,
        noLimbs,
      ],
      unasserted: ['salivation (C98)'],
    }],
  },
  {
    id: 'facial-above-chorda-left',
    title: 'Left facial nerve between the nerve to stapedius and the chorda tympani',
    pattern: 'the face and taste; hearing comfortable, the eye waters',
    lesion: [at(['facial_above_chorda'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        face,
        sign('L', 'tear_loss', false, spared('the greater petrosal nerve leaves above')),
        sign('L', 'hyperacusis', false, spared('the nerve to stapedius leaves above')),
        sign('L', 'taste_loss', true, S),
        otherSide,
        noLimbs,
      ],
      unasserted: ['salivation (C98)'],
    }],
  },
  {
    id: 'facial-below-chorda-left',
    title: 'Left facial nerve below the chorda tympani, at the stylomastoid foramen',
    pattern: 'the face alone',
    lesion: [at(['facial_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        face,
        sign('L', 'tear_loss', false, spared('after giving the branch of chorda tympani: ipsilateral facial plegia alone')),
        sign('L', 'hyperacusis', false, spared('every branch has left above')),
        sign('L', 'taste_loss', false, spared('the chorda tympani has left above')),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'facial-nucleus-signs-left',
    title: 'Left facial nucleus and fascicle in the pons: the face alone',
    pattern: 'inside the brainstem the three branch signs are spared',
    lesion: [at(['facial'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        face,
        sign('L', 'taste_loss', false, { cite: ['S51', 'S179'], basis: 'composed', note: 'taste runs in the nervus intermedius to the nucleus of the solitary tract, not the motor nucleus' }),
        sign('L', 'tear_loss', false, { cite: ['S179'], basis: 'composed', note: 'the lacrimal nucleus is separate' }),
      ],
      unasserted: ['hyperacusis: the stapedius is supplied from the motor nucleus (S179), yet S51’s pontine lesions do not list it (C99)'],
    }],
  },
];
