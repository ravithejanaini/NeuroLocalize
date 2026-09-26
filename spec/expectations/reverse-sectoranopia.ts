// Amendment A34. Reverse inference for the sectoranopias, written from docs/P28-analysis.md before
// any P28 engine code. The expectation is a property of the ranking, never a number.
import type { FieldRegion, Side } from '../../src/kb/vocab.ts';
import type { VisionObservation, VisionReverseCase } from './reverse-vision.ts';

const f = (eye: Side, sector: FieldRegion, value: 'normal' | 'abnormal'): VisionObservation => ({ kind: 'field', eye, sector, value });
const H = { L: ['nasal_superior_horizontal', 'nasal_inferior_horizontal'], R: ['temporal_superior_horizontal', 'temporal_inferior_horizontal'] } as const;
const V = { L: ['nasal_superior_vertical', 'nasal_inferior_vertical'], R: ['temporal_superior_vertical', 'temporal_inferior_vertical'] } as const;
const leftHalfNormal: VisionObservation[] = [
  ...(['temporal_superior', 'temporal_inferior', 'central_left'] as const).map((s) => f('L', s, 'normal')),
  ...(['nasal_superior', 'nasal_inferior', 'central_left'] as const).map((s) => f('R', s, 'normal')),
];
const pupils: VisionObservation[] = [{ kind: 'rapd', side: 'L', value: 'absent' }, { kind: 'rapd', side: 'R', value: 'absent' }];
const eyes = ['L', 'R'] as const;

export const SECTORANOPIA_REVERSE_CASES: readonly VisionReverseCase[] = [
  {
    id: 'reverse-lgn-wedge',
    title: 'A wedge along the horizontal meridian is lost to the right in both eyes; above and below it are seen',
    observations: [
      ...eyes.flatMap((e) => H[e].map((s) => f(e, s, 'abnormal'))),
      ...eyes.flatMap((e) => V[e].map((s) => f(e, s, 'normal'))),
      ...leftHalfNormal,
      ...pupils,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['lgn_crest'], unexplained: false }],
    cite: ['S160', 'S161', 'S162'],
    basis: 'stated',
    note: 'A horizontal wedge-shaped homonymous defect is the dorsal crest of the lateral geniculate nucleus, the lateral posterior choroidal artery’s (S160, S162); a sectoranopia is produced only by a geniculate lesion (S161).',
  },
  {
    id: 'reverse-lgn-quadruple',
    title: 'Above and below are lost to the right in both eyes; a band along the horizontal meridian is spared',
    observations: [
      ...eyes.flatMap((e) => V[e].map((s) => f(e, s, 'abnormal'))),
      ...eyes.flatMap((e) => H[e].map((s) => f(e, s, 'normal'))),
      f('L', 'central_right', 'normal'),
      f('R', 'central_right', 'normal'),
      ...leftHalfNormal,
      ...pupils,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'visual_left', topPlaces: ['lgn_horns'], unexplained: false }],
    cite: ['S160', 'S161'],
    basis: 'stated',
    note: 'Superior and inferior sectorial defects sparing the horizontal zone are the horns of the lateral geniculate nucleus, the distal anterior choroidal artery’s (S160).',
  },
];
