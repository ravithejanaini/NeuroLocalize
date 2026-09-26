// Amendment A36. Frozen expected outputs for the cavernous sinus and the face by trigeminal
// division, written from the sources in docs/P30-analysis.md (S122, S165, S166, S70) before any
// P30 engine code, and run red against the P29 engine first.
//
// Reading guide. `face_division` is the skin one division feels: V1 the forehead, V2 the cheek,
// V3 the jaw. Neither pupil's size is asserted (C45, C77).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];

const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const division = (side: 'L' | 'R', d: 'V1' | 'V2' | 'V3', oneOf: readonly ('intact' | 'impaired' | 'lost')[], e: E): BrainAssertion => ({
  kind: 'face_division', side, division: d, oneOf, ...e,
});
const at = (brain: BrainRegion['brain'], compartments: BrainRegion['compartments']): BrainRegion => ({
  brain, sides: ['L'], compartments, severity: 'complete',
});

export const CAVERNOUS_CASES: readonly BrainCase[] = [
  {
    id: 'cavernous-sinus-left',
    title: 'Left cavernous sinus, the whole sinus',
    pattern: 'III, IV and VI with a numb forehead and cheek; the jaw spared',
    lesion: [
      at('midbrain', ['oculomotor_nerve', 'trochlear_nerve', 'ophthalmic_maxillary', 'carotid_sympathetic']),
      at('pons', ['abducens_nerve']),
    ],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'oculomotor_palsy', true, { cite: ['S165', 'S70'], basis: 'stated', note: 'total ophthalmoplegia, due to CN III, IV, and VI injury' }),
        sign('L', 'superior_oblique_weakness', true, { cite: ['S165', 'S70'], basis: 'stated' }),
        sign('L', 'abduction_weakness', true, { cite: ['S165', 'S70'], basis: 'stated' }),
        sign('L', 'ptosis', true, { cite: ['S62'], basis: 'composed', note: 'the third nerve carries the levator' }),
        sign('R', 'oculomotor_palsy', false, { cite: ['S165'], basis: 'composed', note: 'one sinus, one side' }),
        sign('R', 'abduction_weakness', false, { cite: ['S165'], basis: 'composed' }),
        sign('R', 'superior_oblique_weakness', false, { cite: ['S165'], basis: 'composed' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed', note: 'a nerve lesion, not the abducens nucleus' }),
        division('L', 'V1', ['lost', 'impaired'], { cite: ['S165', 'S122'], basis: 'stated', note: 'V1 runs in the lateral wall of the sinus' }),
        division('L', 'V2', ['lost', 'impaired'], { cite: ['S165', 'S122'], basis: 'stated', note: 'V2 runs below V1 in the lateral wall' }),
        division('L', 'V3', ['intact'], { cite: ['S122', 'S165'], basis: 'composed', note: 'V3 leaves by the foramen ovale and is not among the sinus’s nerves' }),
        division('R', 'V1', ['intact'], { cite: ['S165'], basis: 'composed' }),
        sign('L', 'jaw_deviation', false, { cite: ['S122'], basis: 'composed', note: 'the motor root travels with V3, outside the sinus' }),
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S165', 'S70'], basis: 'stated', note: 'the sympathetic plexus around the internal carotid' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S165'], basis: 'composed' },
        { kind: 'face_weakness', side: 'L', oneOf: ['none'], cite: ['S165'], basis: 'composed', note: 'the seventh nerve is not in the sinus' },
        { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S165'], basis: 'composed', note: 'outside the brainstem' } as Assertion,
      ],
      unasserted: ['the pupil: fixed and dilated from the third nerve, small from the plexus (C77)', 'proptosis and chemosis: not modelled', 'partial lesions (C78)'],
    }],
  },
  {
    id: 'ophthalmic-maxillary-left',
    title: 'Left ophthalmic and maxillary divisions in the sinus wall, alone',
    pattern: 'forehead and cheek numb, jaw spared, eyes moving',
    lesion: [at('midbrain', ['ophthalmic_maxillary'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        division('L', 'V1', ['lost', 'impaired'], { cite: ['S122', 'S165'], basis: 'stated' }),
        division('L', 'V2', ['lost', 'impaired'], { cite: ['S122', 'S165'], basis: 'stated' }),
        division('L', 'V3', ['intact'], { cite: ['S122'], basis: 'composed' }),
        { kind: 'face_sensation', side: 'L', oneOf: ['lost', 'impaired'], cite: ['S122'], basis: 'composed', note: 'the face is abnormal where two of its three divisions are' },
        sign('L', 'oculomotor_palsy', false, { cite: ['S165'], basis: 'composed' }),
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S165'], basis: 'composed', note: 'the plexus is a separate part' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'trigeminal-sensory-nucleus-divisions-left',
    title: 'Left principal trigeminal sensory nucleus: every division',
    pattern: 'the whole face, forehead to jaw',
    lesion: [at('pons', ['trigeminal_sensory'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        division('L', 'V1', ['lost', 'impaired'], { cite: ['S122'], basis: 'composed', note: 'all three divisions come together at the ganglion and the nucleus' }),
        division('L', 'V2', ['lost', 'impaired'], { cite: ['S122'], basis: 'composed' }),
        division('L', 'V3', ['lost', 'impaired'], { cite: ['S122'], basis: 'composed' }),
        division('R', 'V3', ['intact'], { cite: ['S122'], basis: 'composed' }),
      ],
      unasserted: ['the onion-skin layout of the spinal nucleus (C79)'],
    }],
  },
];
