// Amendment A34. Frozen expected outputs for the sectoranopias of the lateral geniculate nucleus,
// written from the sources in docs/P28-analysis.md (S160–S162) before any P28 code, and run
// against the P27 engine first.
//
// Reading guide. From P28 each quadrant of each eye's field is two cells: `_horizontal`, beside the
// horizontal meridian, and `_vertical`, beside the vertical meridian. The right half-field is the
// left eye's nasal cells and the right eye's temporal cells. The dorsal crest of the nucleus
// (lateral posterior choroidal artery) takes the horizontal band — a wedge; its horns (anterior
// choroidal artery) take the vertical band — the quadruple sectoranopia (S160, S162).
import type { FieldRegion } from '../../src/kb/vocab.ts';
import type { VisionAssertion, VisionCase } from './types.ts';

type E = Pick<VisionAssertion, 'cite' | 'basis'> & { readonly note?: string };
const field = (eye: 'L' | 'R', sectors: readonly FieldRegion[], state: 'normal' | 'lost', e: E): VisionAssertion => ({ kind: 'field', eye, sectors, oneOf: [state], ...e });
const noDefect = (side: 'L' | 'R'): VisionAssertion => ({ kind: 'rapd', side, oneOf: ['absent'], cite: ['S137', 'S91'], basis: 'composed', note: 'behind the pupil’s fibres, as the whole nucleus (P24)' });

/** The right half-field's cells in each eye, by band. */
const RIGHT = {
  horizontal: { L: ['nasal_superior_horizontal', 'nasal_inferior_horizontal'], R: ['temporal_superior_horizontal', 'temporal_inferior_horizontal'] },
  vertical: { L: ['nasal_superior_vertical', 'nasal_inferior_vertical'], R: ['temporal_superior_vertical', 'temporal_inferior_vertical'] },
} as const;
const LEFT_ALL = {
  L: ['temporal_superior_horizontal', 'temporal_superior_vertical', 'temporal_inferior_horizontal', 'temporal_inferior_vertical', 'central_left'],
  R: ['nasal_superior_horizontal', 'nasal_superior_vertical', 'nasal_inferior_horizontal', 'nasal_inferior_vertical', 'central_left'],
} as const;

export const SECTORANOPIA_CASES: readonly VisionCase[] = [
  {
    id: 'lgn-crest-left',
    title: 'Left lateral geniculate nucleus, dorsal crest (lateral posterior choroidal artery)',
    pattern: 'right homonymous horizontal wedge',
    lesion: [{ vision: 'lgn_crest', sides: ['L'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        field('L', RIGHT.horizontal.L, 'lost', { cite: ['S160', 'S162'], basis: 'stated', note: 'a hemi-hourglass in the horizontal midline' }),
        field('R', RIGHT.horizontal.R, 'lost', { cite: ['S160', 'S162'], basis: 'stated' }),
        field('L', RIGHT.vertical.L, 'normal', { cite: ['S160'], basis: 'composed', note: 'the vertical band is the horns’' }),
        field('R', RIGHT.vertical.R, 'normal', { cite: ['S160'], basis: 'composed' }),
        field('L', LEFT_ALL.L, 'normal', { cite: ['S147'], basis: 'composed', note: 'the nucleus serves the opposite half-field' }),
        field('R', LEFT_ALL.R, 'normal', { cite: ['S147'], basis: 'composed' }),
        noDefect('L'),
        noDefect('R'),
      ],
      unasserted: ['the centre to the right: the hourglass narrows to fixation without saying whether fixation goes (C71)', 'incongruity (C72)'],
    }],
  },
  {
    id: 'lgn-horns-left',
    title: 'Left lateral geniculate nucleus, medial and lateral horns (anterior choroidal artery)',
    pattern: 'right homonymous quadruple sectoranopia',
    lesion: [{ vision: 'lgn_horns', sides: ['L'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        field('L', RIGHT.vertical.L, 'lost', { cite: ['S160'], basis: 'stated', note: 'superior and inferior sectorial defects along the vertical meridian' }),
        field('R', RIGHT.vertical.R, 'lost', { cite: ['S160'], basis: 'stated' }),
        field('L', [...RIGHT.horizontal.L, 'central_right'], 'normal', { cite: ['S160'], basis: 'stated', note: 'spare the horizontal macular zone' }),
        field('R', [...RIGHT.horizontal.R, 'central_right'], 'normal', { cite: ['S160'], basis: 'stated' }),
        field('L', LEFT_ALL.L, 'normal', { cite: ['S147'], basis: 'composed' }),
        field('R', LEFT_ALL.R, 'normal', { cite: ['S147'], basis: 'composed' }),
        noDefect('L'),
        noDefect('R'),
      ],
      unasserted: ['incongruity: S160’s patient had the larger defect in the other eye (C72)'],
    }],
  },
];
