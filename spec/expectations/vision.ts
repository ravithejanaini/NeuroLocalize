// Amendment A11. Frozen expected outputs for the visual pathway, written from the sources in
// docs/P8-analysis.md (S91–S97) before any visual code existed.
//
// Reading guide. A field sector belongs to one eye: `temporal` is the half of that eye's field
// away from the nose, `nasal` the half toward it, and `central_left` and `central_right` are
// the halves of the centre either side of fixation, named by the patient's left and right. So
// the right half-field of both eyes is the left eye's nasal sectors and the right eye's
// temporal sectors. 'stated' means a source says it of this lesion; 'composed' means it
// follows from which fibres the sources put in the part.
import type { FieldSector } from '../../src/kb/vocab.ts';
import type { Assertion, VisionAssertion, VisionCase, VisionRegion } from './types.ts';

const at = (vision: VisionRegion['vision'], sides: VisionRegion['sides'] = ['L']): VisionRegion => ({ vision, sides, severity: 'complete' });

type E = Pick<VisionAssertion, 'cite' | 'basis'> & { readonly note?: string };
const field = (eye: 'L' | 'R' | 'both', sectors: readonly FieldSector[], oneOf: readonly ('normal' | 'lost' | 'indeterminate')[], e: E): VisionAssertion =>
  ({ kind: 'field', eye, sectors, oneOf, ...e });
const lost = (eye: 'L' | 'R' | 'both', sectors: readonly FieldSector[], e: E): VisionAssertion => field(eye, sectors, ['lost'], e);
const seen = (eye: 'L' | 'R' | 'both', sectors: readonly FieldSector[], e: E): VisionAssertion => field(eye, sectors, ['normal'], e);
const rapd = (side: 'L' | 'R', present: boolean, e: E): VisionAssertion => ({ kind: 'rapd', side, oneOf: [present ? 'present' : 'absent'], ...e });

const ALL: readonly FieldSector[] = ['temporal_superior', 'temporal_inferior', 'nasal_superior', 'nasal_inferior', 'central_left', 'central_right'];
/** The right half-field: the left eye's nasal sectors and the right eye's temporal sectors. */
const RIGHT_PERIPHERY = { L: ['nasal_superior', 'nasal_inferior'], R: ['temporal_superior', 'temporal_inferior'] } as const;
const LEFT_PERIPHERY = { L: ['temporal_superior', 'temporal_inferior'], R: ['nasal_superior', 'nasal_inferior'] } as const;

/** Nothing below the neck is touched by a lesion of the visual pathway. */
const bodyQuiet: Assertion[] = [
  { kind: 'motor', side: 'both', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S91'], basis: 'composed', note: 'the visual pathway carries no motor fibres' },
  { kind: 'sensory', side: 'both', modality: 'all', span: ['C1', 'Co1'], oneOf: ['intact'], cite: ['S91'], basis: 'composed' },
];

export const VISION_CASES: readonly VisionCase[] = [
  {
    id: 'optic-nerve-left',
    title: 'Left optic nerve',
    pattern: 'monocular loss with an afferent pupillary defect',
    lesion: [at('optic_nerve')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lost('L', ALL, { cite: ['S91', 'S92'], basis: 'stated', note: 'a lesion of the optic nerve loses vision in that eye' }),
        seen('R', ALL, { cite: ['S91'], basis: 'composed', note: 'the other eye’s fibres are untouched' }),
        rapd('L', true, { cite: ['S95'], basis: 'stated' }),
        rapd('R', false, { cite: ['S95'], basis: 'composed' }),
        ...bodyQuiet,
      ],
      unasserted: ['visual acuity and colour vision: not modelled'],
    }],
  },
  {
    id: 'chiasm',
    title: 'The optic chiasm',
    pattern: 'bitemporal hemianopia',
    lesion: [at('chiasm', ['L', 'R'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lost('L', ['temporal_superior', 'temporal_inferior', 'central_left'], { cite: ['S92', 'S96'], basis: 'stated', note: 'the crossing nasal fibres serve the temporal field' }),
        lost('R', ['temporal_superior', 'temporal_inferior', 'central_right'], { cite: ['S92', 'S96'], basis: 'stated' }),
        seen('L', ['nasal_superior', 'nasal_inferior', 'central_right'], { cite: ['S91'], basis: 'composed', note: 'temporal retinal fibres do not cross' }),
        seen('R', ['nasal_superior', 'nasal_inferior', 'central_left'], { cite: ['S91'], basis: 'composed' }),
        ...bodyQuiet,
      ],
      unasserted: ['the pupil: S95 says a chiasmal lesion may cause a defect when one eye loses more fibres (C27)'],
    }],
  },
  {
    id: 'optic-tract-left',
    title: 'Left optic tract',
    pattern: 'right homonymous hemianopia with a right afferent pupillary defect',
    lesion: [at('optic_tract')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lost('L', [...RIGHT_PERIPHERY.L, 'central_right'], { cite: ['S91', 'S92'], basis: 'stated', note: 'the tract carries the opposite half-field of both eyes' }),
        lost('R', [...RIGHT_PERIPHERY.R, 'central_right'], { cite: ['S91', 'S92'], basis: 'stated' }),
        seen('L', [...LEFT_PERIPHERY.L, 'central_left'], { cite: ['S91'], basis: 'composed' }),
        seen('R', [...LEFT_PERIPHERY.R, 'central_left'], { cite: ['S91'], basis: 'composed' }),
        rapd('R', true, { cite: ['S92', 'S95'], basis: 'stated', note: 'the defect is on the side opposite the lesion' }),
        rapd('L', false, { cite: ['S92'], basis: 'composed' }),
        ...bodyQuiet,
      ],
      unasserted: ['congruity: S97 reports it separates tract from cortex in only about half of cases (C26)'],
    }],
  },
  {
    id: 'meyer-loop-left',
    title: 'Left Meyer loop, in the temporal lobe',
    pattern: 'right superior quadrantanopia — “pie in the sky”',
    lesion: [at('meyer_loop')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lost('L', ['nasal_superior'], { cite: ['S91', 'S93'], basis: 'stated', note: 'Meyer loop carries the opposite superior field' }),
        lost('R', ['temporal_superior'], { cite: ['S91', 'S93'], basis: 'stated' }),
        seen('L', ['nasal_inferior', ...LEFT_PERIPHERY.L, 'central_left'], { cite: ['S93'], basis: 'composed', note: 'the parietal fibres are intact' }),
        seen('R', ['temporal_inferior', ...LEFT_PERIPHERY.R, 'central_left'], { cite: ['S93'], basis: 'composed' }),
        field('both', ['central_right'], ['indeterminate'], { cite: ['S93'], basis: 'composed', note: 'only the upper half of the centre is lost; the model does not split the centre into quadrants' }),
        rapd('L', false, { cite: ['S97'], basis: 'stated', note: 'lesions behind the lateral geniculate nucleus cause no afferent defect' }),
        rapd('R', false, { cite: ['S97'], basis: 'stated' }),
        ...bodyQuiet,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'parietal-radiation-left',
    title: 'Left parietal optic radiation',
    pattern: 'right inferior quadrantanopia',
    lesion: [at('parietal_radiation')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lost('L', ['nasal_inferior'], { cite: ['S91', 'S93'], basis: 'stated', note: 'the parietal fibres carry the opposite inferior field' }),
        lost('R', ['temporal_inferior'], { cite: ['S91', 'S93'], basis: 'stated' }),
        seen('L', ['nasal_superior', ...LEFT_PERIPHERY.L, 'central_left'], { cite: ['S93'], basis: 'composed' }),
        seen('R', ['temporal_superior', ...LEFT_PERIPHERY.R, 'central_left'], { cite: ['S93'], basis: 'composed' }),
        field('both', ['central_right'], ['indeterminate'], { cite: ['S93'], basis: 'composed' }),
        rapd('L', false, { cite: ['S97'], basis: 'stated' }),
        rapd('R', false, { cite: ['S97'], basis: 'stated' }),
        ...bodyQuiet,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'pca-occipital-left',
    title: 'Left occipital cortex, the posterior cerebral artery territory',
    pattern: 'right homonymous hemianopia with macular sparing',
    lesion: [at('calcarine_lower'), at('calcarine_upper')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lost('L', RIGHT_PERIPHERY.L, { cite: ['S94', 'S92'], basis: 'stated' }),
        lost('R', RIGHT_PERIPHERY.R, { cite: ['S94', 'S92'], basis: 'stated' }),
        seen('both', ['central_right'], { cite: ['S94', 'S92'], basis: 'stated', note: 'macular sparing: the occipital pole keeps its supply from the middle cerebral artery' }),
        seen('L', [...LEFT_PERIPHERY.L, 'central_left'], { cite: ['S91'], basis: 'composed' }),
        seen('R', [...LEFT_PERIPHERY.R, 'central_left'], { cite: ['S91'], basis: 'composed' }),
        rapd('L', false, { cite: ['S97'], basis: 'stated' }),
        rapd('R', false, { cite: ['S97'], basis: 'stated' }),
        ...bodyQuiet,
      ],
      unasserted: ['the thalamus and midbrain, which the posterior cerebral artery also supplies (S94): not part of this place'],
    }],
  },
  {
    id: 'occipital-cortex-left',
    title: 'The whole left occipital cortex',
    pattern: 'right homonymous hemianopia, the macula lost too',
    lesion: [at('calcarine_lower'), at('calcarine_upper'), at('occipital_pole')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lost('L', [...RIGHT_PERIPHERY.L, 'central_right'], { cite: ['S97', 'S92'], basis: 'composed', note: 'the pole carries the centre of the opposite half-field' }),
        lost('R', [...RIGHT_PERIPHERY.R, 'central_right'], { cite: ['S97', 'S92'], basis: 'composed' }),
        seen('L', [...LEFT_PERIPHERY.L, 'central_left'], { cite: ['S91'], basis: 'composed' }),
        seen('R', [...LEFT_PERIPHERY.R, 'central_left'], { cite: ['S91'], basis: 'composed' }),
        rapd('L', false, { cite: ['S97'], basis: 'stated' }),
        rapd('R', false, { cite: ['S97'], basis: 'stated' }),
        ...bodyQuiet,
      ],
      unasserted: ['cortical blindness from lesions of both sides: not modelled'],
    }],
  },
];
