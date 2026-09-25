// Amendment A27. Frozen expected outputs for the lateral geniculate nucleus, written from the
// sources in docs/P24-analysis.md (S147, with S91 and S137 re-read) before any P24 code, and run
// against the P23 engine first.
//
// Reading guide. Sectors as in `vision.ts`: the right half-field is the left eye's nasal sectors,
// the right eye's temporal sectors, and `central_right`. The nucleus gives the tract's field loss
// without its pupillary defect, because the pupil's fibres have already left for the pretectum.
import type { FieldSector } from '../../src/kb/vocab.ts';
import type { Assertion, VisionAssertion, VisionCase } from './types.ts';

type E = Pick<VisionAssertion, 'cite' | 'basis'> & { readonly note?: string };
const field = (eye: 'L' | 'R', sectors: readonly FieldSector[], state: 'normal' | 'lost', e: E): VisionAssertion => ({ kind: 'field', eye, sectors, oneOf: [state], ...e });
const rapd = (side: 'L' | 'R', e: E): VisionAssertion => ({ kind: 'rapd', side, oneOf: ['absent'], ...e });
const open = (side: 'L' | 'R', e: E): VisionAssertion => ({ kind: 'rapd', side, oneOf: ['indeterminate'], ...e });
const bodyQuiet: Assertion[] = [
  { kind: 'motor', side: 'both', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S147'], basis: 'composed', note: 'the nucleus relays vision only' },
];

export const GENICULATE_CASES: readonly VisionCase[] = [
  {
    id: 'lgn-left',
    title: 'Left lateral geniculate nucleus',
    pattern: 'right homonymous hemianopia with no afferent pupillary defect',
    lesion: [{ vision: 'lgn', sides: ['L'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        field('L', ['nasal_superior', 'nasal_inferior', 'central_right'], 'lost', { cite: ['S147'], basis: 'stated', note: 'contralateral homonymous hemianopia' }),
        field('R', ['temporal_superior', 'temporal_inferior', 'central_right'], 'lost', { cite: ['S147'], basis: 'stated' }),
        field('L', ['temporal_superior', 'temporal_inferior', 'central_left'], 'normal', { cite: ['S147'], basis: 'composed' }),
        field('R', ['nasal_superior', 'nasal_inferior', 'central_left'], 'normal', { cite: ['S147'], basis: 'composed' }),
        rapd('R', { cite: ['S137', 'S91'], basis: 'stated', note: 'the pupil’s fibres leave the tract just before the nucleus' }),
        rapd('L', { cite: ['S137', 'S91'], basis: 'composed' }),
        ...bodyQuiet,
      ],
      unasserted: [
        'quadrantanopias and sector-shaped defects from partial lesions (C69): the model shows the whole nucleus',
        'incongruity: not modelled (C26, C70)',
      ],
    }],
  },
  // Added after P24 gave the mutation run pools for the visual parts' fields (D129): three
  // P8 facts no case had pinned, because nothing had ever mutated them.
  {
    id: 'calcarine-lower-left',
    title: 'Left calcarine cortex below the fissure',
    pattern: 'right superior quadrantanopia',
    lesion: [{ vision: 'calcarine_lower', sides: ['L'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        field('L', ['nasal_superior'], 'lost', { cite: ['S93'], basis: 'stated', note: 'the inferior part of the occipital cortex below the calcarine fissure' }),
        field('R', ['temporal_superior'], 'lost', { cite: ['S93'], basis: 'stated' }),
        field('L', ['nasal_inferior'], 'normal', { cite: ['S93'], basis: 'composed', note: 'the lower quadrant is the upper lip’s' }),
        field('R', ['temporal_inferior'], 'normal', { cite: ['S93'], basis: 'composed' }),
      ],
      unasserted: ['the centre: the pole is not in this lesion, and S93 speaks only of acuity'],
    }],
  },
  {
    id: 'calcarine-upper-left',
    title: 'Left calcarine cortex above the fissure',
    pattern: 'right inferior quadrantanopia',
    lesion: [{ vision: 'calcarine_upper', sides: ['L'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        field('L', ['nasal_inferior'], 'lost', { cite: ['S93'], basis: 'composed', note: 'the inferior field’s fibres end in the superior lip of the fissure' }),
        field('R', ['temporal_inferior'], 'lost', { cite: ['S93'], basis: 'composed' }),
        field('L', ['nasal_superior'], 'normal', { cite: ['S93'], basis: 'composed' }),
        field('R', ['temporal_superior'], 'normal', { cite: ['S93'], basis: 'composed' }),
      ],
      unasserted: ['the centre: as above'],
    }],
  },
  {
    id: 'chiasm-pupil',
    title: 'The optic chiasm, examined at the pupils',
    pattern: 'an afferent pupillary defect is possible, not certain',
    lesion: [{ vision: 'chiasm', sides: ['L', 'R'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        open('L', { cite: ['S95'], basis: 'stated', note: 'may damage more fibers from one eye than the other' }),
        open('R', { cite: ['S95'], basis: 'stated' }),
      ],
      unasserted: ['the fields: in the P8 chiasm case'],
    }],
  },
];
