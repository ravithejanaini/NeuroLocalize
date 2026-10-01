// Amendment A39. Frozen expected outputs for the jugular foramen and the three nerves that
// leave by it, written from the sources in docs/P33-analysis.md (S172–S175) before any P33
// engine code, and run red against the P32 engine first.
//
// Reading guide. `posterior_tongue_loss` is sensation and taste on the back third of the tongue
// on that side (the ninth nerve). `accessory_weakness` is about one side: that shoulder droops
// and shrugs weakly, and turning the head to the OTHER side is weak (the eleventh nerve). The
// gag reflex is never asserted (C87).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];
const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const at = (compartments: BrainRegion['compartments']): BrainRegion => ({ brain: 'medulla', sides: ['L'], compartments, severity: 'complete' });
const noLimbs: Assertion = { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S172'], basis: 'composed', note: 'outside the brainstem' };

export const JUGULAR_CASES: readonly BrainCase[] = [
  {
    id: 'jugular-foramen-left',
    title: 'Left jugular foramen (Vernet)',
    pattern: 'palate, back of the tongue and shoulder on one side; the tongue itself strong',
    lesion: [at(['glossopharyngeal_nerve', 'vagus_nerve', 'accessory_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'palate_weakness', true, { cite: ['S172'], basis: 'stated', note: 'unilateral paralysis of the soft palate, the uvula deviating toward the normal side' }),
        sign('R', 'palate_weakness', false, { cite: ['S172'], basis: 'composed' }),
        sign('L', 'posterior_tongue_loss', true, { cite: ['S172', 'S174', 'S175'], basis: 'stated', note: 'loss of sensation to the posterior ipsilateral aspect of the tongue' }),
        sign('R', 'posterior_tongue_loss', false, { cite: ['S172'], basis: 'composed' }),
        sign('L', 'accessory_weakness', true, { cite: ['S172', 'S173', 'S174'], basis: 'stated', note: 'the ipsilateral sternocleidomastoid and trapezius' }),
        sign('R', 'accessory_weakness', false, { cite: ['S172'], basis: 'stated', note: 'the nerve supplies its own side' }),
        sign('L', 'tongue_weakness', false, { cite: ['S172'], basis: 'stated', note: 'the hypoglossal nerve does not traverse the jugular foramen' }),
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S47'], basis: 'composed', note: 'unlike the lateral medulla, which has the palate with a Horner syndrome' },
        { kind: 'face_sensation', side: 'L', oneOf: ['intact'], cite: ['S47'], basis: 'composed' },
        { kind: 'ataxia', side: 'L', oneOf: ['absent'], cite: ['S47'], basis: 'composed' },
        { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: all, oneOf: ['intact'], cite: ['S47'], basis: 'composed' },
        noLimbs,
      ],
      unasserted: ['the gag reflex (C87)', 'hoarseness, dysphagia and parotid secretion (C90)'],
    }],
  },
  // Each nerve alone, so that no sign can be carried by another nerve.
  {
    id: 'glossopharyngeal-nerve-left',
    title: 'Left glossopharyngeal nerve alone',
    pattern: 'the back of the tongue, nothing else',
    lesion: [at(['glossopharyngeal_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'posterior_tongue_loss', true, { cite: ['S174', 'S175'], basis: 'stated' }),
        sign('L', 'palate_weakness', false, { cite: ['S172'], basis: 'composed', note: 'the palate is the vagus nerve’s' }),
        sign('L', 'accessory_weakness', false, { cite: ['S173'], basis: 'composed' }),
      ],
      unasserted: ['the gag reflex (C87)'],
    }],
  },
  {
    id: 'vagus-nerve-left',
    title: 'Left vagus nerve alone',
    pattern: 'the palate, nothing else',
    lesion: [at(['vagus_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'palate_weakness', true, { cite: ['S172'], basis: 'stated' }),
        sign('L', 'posterior_tongue_loss', false, { cite: ['S175'], basis: 'composed', note: 'the back of the tongue is the ninth nerve’s' }),
        sign('L', 'accessory_weakness', false, { cite: ['S173'], basis: 'composed' }),
      ],
      unasserted: ['hoarseness (C90)'],
    }],
  },
  {
    id: 'accessory-nerve-left',
    title: 'Left accessory nerve alone',
    pattern: 'the shoulder and the turn of the head, nothing else',
    lesion: [at(['accessory_nerve'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'accessory_weakness', true, { cite: ['S173', 'S174'], basis: 'stated' }),
        sign('L', 'palate_weakness', false, { cite: ['S172'], basis: 'composed' }),
        sign('L', 'posterior_tongue_loss', false, { cite: ['S175'], basis: 'composed' }),
        noLimbs,
      ],
      unasserted: ['the nerve’s spinal root in C1–C5 (C88)'],
    }],
  },
];
