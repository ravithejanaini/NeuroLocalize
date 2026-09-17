// Amendment A7. Reverse inference across the whole neuraxis: one examination, candidates
// ranked from cortex to muscle. Written before any brain code existed; every expectation is
// a property of the ranking, never a number (as in A3 and A4).
import type {
  CranialSign,
  FaceWeaknessObservation,
  LesionFamily,
  SensoryModality,
  SensoryObservation,
  Side,
  SignObservation,
  SourceId,
  StrengthObservation,
  Territory,
  Timepoint,
} from '../../src/kb/vocab.ts';
import type { ReverseExpectation } from './reverse.ts';
import type { LimbObservation } from './reverse-plexus.ts';
import type { Span } from './types.ts';

export type BrainObservation =
  | LimbObservation
  | { readonly kind: 'face_sensation'; readonly side: Side; readonly value: SensoryObservation }
  | { readonly kind: 'face_weakness'; readonly side: Side; readonly value: FaceWeaknessObservation }
  | { readonly kind: 'cranial'; readonly side: Side; readonly sign: CranialSign; readonly value: SignObservation }
  | { readonly kind: 'ataxia'; readonly side: Side; readonly value: SignObservation }
  | { readonly kind: 'vertigo'; readonly value: SignObservation };

export type BrainReverseExpectation = ReverseExpectation & {
  readonly timepoint: Timepoint;
  readonly topFamily?: LesionFamily;
  /** Every candidate in the best-ranked group lies in one of these territories. */
  readonly topPlaces?: readonly Territory[];
};

export type BrainReverseCase = {
  readonly id: string;
  readonly title: string;
  readonly observations: readonly BrainObservation[];
  readonly expectations: readonly BrainReverseExpectation[];
  readonly cite: readonly SourceId[];
  readonly basis: 'stated' | 'composed';
  readonly note: string;
};

const sense = (side: Side, modality: SensoryModality, at: Span[0], value: SensoryObservation): BrainObservation => ({
  kind: 'sensory', side, modality, span: [at, at], value,
});
const power = (side: Side, at: Span[0], value: StrengthObservation): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const face = (side: Side, value: FaceWeaknessObservation): BrainObservation => ({ kind: 'face_weakness', side, value });

/** A right hemiparesis, arm and leg. */
const rightHemiparesis: BrainObservation[] = [
  power('R', 'C6', 'weak'),
  power('R', 'C7', 'weak'),
  power('R', 'L3', 'weak'),
  power('R', 'L4', 'weak'),
  power('L', 'C6', 'normal'),
  power('L', 'L3', 'normal'),
];

export const BRAIN_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-lateral-medullary',
    title: 'Left face and right body lose pain; left Horner, hoarseness, ataxia and vertigo; no weakness',
    observations: [
      { kind: 'face_sensation', side: 'L', value: 'abnormal' },
      { kind: 'face_sensation', side: 'R', value: 'normal' },
      sense('R', 'pain_temperature', 'C6', 'abnormal'),
      sense('R', 'pain_temperature', 'T10', 'abnormal'),
      sense('R', 'pain_temperature', 'L4', 'abnormal'),
      sense('L', 'pain_temperature', 'L4', 'normal'),
      sense('L', 'posterior_column', 'L4', 'normal'),
      sense('R', 'posterior_column', 'L4', 'normal'),
      power('L', 'C6', 'normal'),
      power('R', 'C6', 'normal'),
      power('L', 'L3', 'normal'),
      power('R', 'L3', 'normal'),
      { kind: 'horner', side: 'L', value: 'present' },
      { kind: 'horner', side: 'R', value: 'absent' },
      cn('L', 'palate_weakness', 'present'),
      { kind: 'ataxia', side: 'L', value: 'present' },
      { kind: 'vertigo', value: 'present' },
      { kind: 'babinski', side: 'L', value: 'absent' },
      { kind: 'babinski', side: 'R', value: 'absent' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['lateral_medullary'], unexplained: false }],
    cite: ['S47', 'S58', 'S60', 'S16'],
    basis: 'stated',
    note: 'The crossed sensory loss — face on one side, body on the other — is what only the lateral medulla gives (S58).',
  },
  {
    id: 'reverse-internal-capsule',
    title: 'Right face, arm and leg weak alike; sensation normal; eyes normal',
    observations: [
      ...rightHemiparesis,
      face('R', 'lower'),
      face('L', 'normal'),
      sense('R', 'pain_temperature', 'C6', 'normal'),
      sense('R', 'pain_temperature', 'L4', 'normal'),
      sense('R', 'posterior_column', 'C6', 'normal'),
      sense('R', 'posterior_column', 'L4', 'normal'),
      { kind: 'face_sensation', side: 'R', value: 'normal' },
      cn('L', 'oculomotor_palsy', 'absent'),
      { kind: 'babinski', side: 'R', value: 'present' },
      { kind: 'babinski', side: 'L', value: 'absent' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['internal_capsule'] }],
    cite: ['S55', 'S56', 'S51'],
    basis: 'stated',
    note: 'Face, arm and leg equally, with nothing else: the pure motor lacune (S55). The leg separates it from the MCA cortex.',
  },
  {
    id: 'reverse-mca-cortex',
    title: 'Right face and arm weak and numb, right leg spared',
    observations: [
      power('R', 'C6', 'weak'),
      power('R', 'C7', 'weak'),
      power('R', 'L3', 'normal'),
      power('R', 'L4', 'normal'),
      power('L', 'C6', 'normal'),
      face('R', 'lower'),
      sense('R', 'pain_temperature', 'C6', 'abnormal'),
      sense('R', 'pain_temperature', 'L4', 'normal'),
      { kind: 'face_sensation', side: 'R', value: 'abnormal' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['mca_cortex'] }],
    cite: ['S54', 'S66'],
    basis: 'stated',
    note: 'Face and arm without the leg is the lateral convexity (S54, S66).',
  },
  {
    id: 'reverse-weber',
    title: 'Left third nerve palsy with a right hemiparesis',
    observations: [...rightHemiparesis, cn('L', 'oculomotor_palsy', 'present'), face('R', 'lower')],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['midbrain_peduncle'] }],
    cite: ['S50', 'S62', 'S65'],
    basis: 'stated',
    note: 'An ipsilateral cranial nerve palsy with contralateral weakness is the crossed sign of the brainstem (S65).',
  },
  {
    id: 'reverse-medial-medullary',
    title: 'Right hemiparesis with right vibration loss and a left weak tongue; face normal',
    observations: [
      ...rightHemiparesis,
      sense('R', 'posterior_column', 'C6', 'abnormal'),
      sense('R', 'posterior_column', 'L4', 'abnormal'),
      sense('R', 'pain_temperature', 'L4', 'normal'),
      cn('L', 'tongue_weakness', 'present'),
      face('R', 'normal'),
      face('L', 'normal'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'brainstem_left', topPlaces: ['medial_medullary'] }],
    cite: ['S48', 'S63'],
    basis: 'stated',
    note: 'The spared face places the lesion below the pons (S48); the tongue puts it on the left.',
  },
  {
    id: 'reverse-thalamus',
    title: 'Right face and body numb to every modality, strength normal',
    observations: [
      sense('R', 'pain_temperature', 'C6', 'abnormal'),
      sense('R', 'pain_temperature', 'L4', 'abnormal'),
      sense('R', 'posterior_column', 'C6', 'abnormal'),
      sense('R', 'posterior_column', 'L4', 'abnormal'),
      sense('L', 'pain_temperature', 'L4', 'normal'),
      { kind: 'face_sensation', side: 'R', value: 'abnormal' },
      power('R', 'C6', 'normal'),
      power('R', 'L3', 'normal'),
      face('R', 'normal'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['thalamus'] }],
    cite: ['S55', 'S57', 'S58', 'S60'],
    basis: 'stated',
    note: 'Face, arm and leg lose sensation together and nothing else fails: the pure sensory stroke (S55).',
  },
];
