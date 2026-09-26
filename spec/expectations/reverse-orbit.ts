// Amendment A38. Reverse inference for the three orbital syndromes, written from
// docs/P32-analysis.md before any P32 engine code. Each expectation is a property of the ranking,
// never a number. The three examinations share the eyes and the forehead and differ in the cheek and
// the vision, as S171 separates them.
import type { CranialSign, FieldRegion, Side, SignObservation } from '../../src/kb/vocab.ts';
import type { LanguageReverseCase } from './reverse-language.ts';
import type { BrainObservation } from './reverse-brain.ts';

const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const strong: BrainObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];
const frozenEye = [
  cn('L', 'oculomotor_palsy', 'present'),
  cn('L', 'superior_oblique_weakness', 'present'),
  cn('L', 'abduction_weakness', 'present'),
  { kind: 'face_division', side: 'L', division: 'V1', value: 'abnormal' } as BrainObservation,
];
const CELLS: readonly FieldRegion[] = ['temporal_superior_horizontal', 'nasal_superior_horizontal', 'central_left', 'central_right'];
const sees = (eye: Side, value: 'normal' | 'abnormal') => CELLS.map((sector) => ({ kind: 'field' as const, eye, sector, value }));

export const ORBIT_REVERSE_CASES: readonly LanguageReverseCase[] = [
  {
    id: 'reverse-superior-orbital-fissure',
    title: 'Left eye frozen, left forehead numb; the cheek feels; the left eye sees, no pupil defect; no Horner syndrome',
    observations: [
      ...frozenEye,
      { kind: 'face_division', side: 'L', division: 'V2', value: 'normal' },
      { kind: 'horner', side: 'L', value: 'absent' },
      ...sees('L', 'normal'),
      { kind: 'rapd', side: 'L', value: 'absent' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['superior_orbital_fissure'] }],
    cite: ['S171'],
    basis: 'stated',
    note: 'III, IV, VI and V1 with the optic nerve spared is the superior orbital fissure; the cheek spared keeps it out of the cavernous sinus (S171, S122).',
  },
  {
    id: 'reverse-orbital-apex',
    title: 'Left eye frozen and blind with a pupil defect, left forehead numb; the cheek feels',
    observations: [
      ...frozenEye,
      { kind: 'face_division', side: 'L', division: 'V2', value: 'normal' },
      ...sees('L', 'abnormal'),
      ...sees('R', 'normal'),
      { kind: 'rapd', side: 'L', value: 'present' },
      ...strong,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['orbital_apex'] }],
    cite: ['S171'],
    basis: 'stated',
    note: 'The fissure’s nerves with the optic nerve — vision lost, a relative afferent pupillary defect — is the orbital apex (S171).',
  },
];
