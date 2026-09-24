// Amendment A19. Frozen expected outputs for the basal ganglia, written from the sources in
// docs/P15-analysis.md (S125–S127) before any P15 engine code, and run red against the P14
// engine first.
//
// Reading guide. `hemiballismus` is about one side: flinging involuntary movements of that arm
// and leg. It comes from the subthalamic nucleus of the other side. Parkinsonism and chorea are
// never asserted: the sources describe them as degenerations, not places (C48).
import type { Segment } from '../../src/kb/vocab.ts';
import type { BrainCase } from './types.ts';

const all: readonly [Segment, Segment] = ['C1', 'Co1'];

export const BASAL_CASES: readonly BrainCase[] = [
  {
    id: 'subthalamic-nucleus-left',
    title: 'Left subthalamic nucleus',
    pattern: 'hemiballismus of the right arm and leg',
    lesion: [{ brain: 'thalamus', sides: ['L'], compartments: ['subthalamic'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'hemiballismus', side: 'R', oneOf: ['present'], cite: ['S125', 'S126'], basis: 'stated', note: 'contralateral to the injured subthalamic nucleus' },
        { kind: 'hemiballismus', side: 'L', oneOf: ['absent'], cite: ['S125', 'S126'], basis: 'stated', note: 'the nucleus acts on the other side' },
        { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S125', 'S54'], basis: 'composed', note: 'the corticospinal tract runs in the capsule, lateral to the nucleus' },
        { kind: 'sensory', side: 'both', modality: 'all', span: all, oneOf: ['intact'], cite: ['S125', 'S57'], basis: 'composed', note: 'the sensory relays are in the thalamus above it' },
        { kind: 'face_weakness', side: 'R', oneOf: ['none'], cite: ['S54'], basis: 'composed' },
        { kind: 'ataxia', side: 'both', oneOf: ['absent'], cite: ['S110'], basis: 'composed', note: 'flinging is not incoordination' },
      ],
      unasserted: [
        'hemiballismus from basal ganglia lesions sparing the subthalamic nucleus (C47)',
        'parkinsonism and chorea (C48)',
        'reflexes and tone',
      ],
    }],
  },
];
