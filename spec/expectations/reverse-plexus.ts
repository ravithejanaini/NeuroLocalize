// Amendment A4. Reverse inference at the upper limb: root, plexus or nerve. Written before
// any plexus code existed. Each case is an examination as the sources describe the lesion;
// each expectation is a property of the ranking, never a number (as in A3).
//
// A sensory finding at C6, C7, C8 or T1 is tested at that segment's landmark on the body
// map — thumb, middle finger, little finger, anteromedial forearm (S21) — which is also
// where the named nerves are tested.
import type {
  LesionFamily,
  Muscle,
  PlexusSite,
  SensoryObservation,
  Side,
  SkinArea,
  SourceId,
  StrengthObservation,
  Timepoint,
} from '../../src/kb/vocab.ts';
import type { Observation as CordObservation, ReverseExpectation } from './reverse.ts';
import type { Span } from './types.ts';

export type LimbObservation =
  | CordObservation
  | { readonly kind: 'muscle'; readonly side: Side; readonly muscle: Muscle; readonly value: StrengthObservation }
  | { readonly kind: 'skin'; readonly side: Side; readonly area: SkinArea; readonly value: SensoryObservation };

export type LimbReverseExpectation = ReverseExpectation & {
  readonly timepoint: Timepoint;
  /** Every candidate in the best-ranked group lies at one of these sites. */
  readonly topSites?: readonly PlexusSite[];
  readonly topFamily?: LesionFamily;
};

export type LimbReverseCase = {
  readonly id: string;
  readonly title: string;
  readonly observations: readonly LimbObservation[];
  readonly expectations: readonly LimbReverseExpectation[];
  readonly cite: readonly SourceId[];
  readonly basis: 'stated' | 'composed';
  readonly note: string;
};

const m = (muscle: Muscle, value: StrengthObservation, side: Side = 'L'): LimbObservation => ({ kind: 'muscle', side, muscle, value });
const pain = (at: Span[0], value: SensoryObservation, side: Side = 'L'): LimbObservation => ({
  kind: 'sensory', side, modality: 'pain_temperature', span: [at, at], value,
});
const noLongTract: LimbObservation[] = [
  { kind: 'babinski', side: 'L', value: 'absent' },
  { kind: 'babinski', side: 'R', value: 'absent' },
];

export const LIMB_REVERSE_CASES: readonly LimbReverseCase[] = [
  {
    id: 'reverse-root-C8',
    title: 'Weak finger flexion and thumb abduction, interossei strong, medial forearm numb',
    observations: [
      m('finger_flexor_ulnar', 'weak'),
      m('finger_flexor_superficial', 'weak'),
      m('thumb_abductor', 'weak'),
      m('thumb_extensor', 'weak'),
      m('interossei', 'normal'),
      m('triceps', 'normal'),
      m('biceps', 'normal'),
      m('deltoid', 'normal'),
      pain('C8', 'abnormal'),
      pain('T1', 'abnormal'),
      pain('C6', 'normal'),
      pain('C7', 'normal'),
      { kind: 'horner', side: 'L', value: 'absent' },
      m('interossei', 'normal', 'R'),
      m('finger_flexor_ulnar', 'normal', 'R'),
      ...noLongTract,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'root_left', rostralEndWithin: ['C8', 'C8'], topFamilyNot: ['plexus_left', 'nerve_left'] }],
    cite: ['S19', 'S31', 'S45', 'S38', 'S16'],
    basis: 'composed',
    note: 'Medial forearm loss and a weak median muscle rule out the ulnar nerve (S38, S45); strong T1 interossei rule out the lower trunk (S19, R12).',
  },
  {
    id: 'reverse-lower-trunk',
    title: 'Every intrinsic hand muscle and the thumb extensor weak, medial forearm numb, no Horner',
    observations: [
      m('thumb_abductor', 'weak'),
      m('finger_flexor_ulnar', 'weak'),
      m('finger_flexor_superficial', 'weak'),
      m('interossei', 'weak'),
      m('thumb_extensor', 'weak'),
      m('triceps', 'normal'),
      m('deltoid', 'normal'),
      m('biceps', 'normal'),
      pain('C8', 'abnormal'),
      pain('T1', 'abnormal'),
      pain('C6', 'normal'),
      { kind: 'horner', side: 'L', value: 'absent' },
      ...noLongTract,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'plexus_left', topSites: ['lower_trunk'] }],
    cite: ['S33', 'S36', 'S34', 'S16'],
    basis: 'composed',
    note: 'C8 and T1 are both involved, so no single root explains it; the radial thumb extensor separates the trunk from the medial cord (S34).',
  },
  {
    id: 'reverse-ulnar-elbow',
    title: 'Claw hand with the thumb abductor strong and the medial forearm spared',
    observations: [
      m('finger_flexor_ulnar', 'weak'),
      m('interossei', 'weak'),
      m('thumb_abductor', 'normal'),
      m('finger_flexor_superficial', 'normal'),
      m('thumb_extensor', 'normal'),
      m('triceps', 'normal'),
      pain('C8', 'abnormal'),
      pain('T1', 'normal'),
      { kind: 'horner', side: 'L', value: 'absent' },
      ...noLongTract,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topSites: ['ulnar_elbow'] }],
    cite: ['S38', 'S45', 'S36'],
    basis: 'stated',
    note: 'S38 and S45 give exactly these two separations; the weak long flexor places the lesion above the wrist.',
  },
  {
    id: 'reverse-wrist-drop',
    title: 'Wrist drop with the triceps strong',
    observations: [
      m('wrist_extensors', 'weak'),
      m('thumb_extensor', 'weak'),
      m('brachioradialis', 'weak'),
      m('triceps', 'normal'),
      m('deltoid', 'normal'),
      m('finger_flexor_ulnar', 'normal'),
      { kind: 'skin', side: 'L', area: 'dorsal_web', value: 'abnormal' },
      { kind: 'reflex', side: 'L', reflex: 'triceps', value: 'normal' },
      ...noLongTract,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topSites: ['radial_spiral_groove'] }],
    cite: ['S39', 'S40', 'S42'],
    basis: 'stated',
    note: 'S39 separates the three radial levels by the triceps and by sensation; the strong deltoid excludes the posterior cord.',
  },
  // A5
  {
    id: 'reverse-little-finger-numb',
    title: 'Numb little finger with the medial forearm spared, nothing else abnormal',
    observations: [
      pain('C8', 'abnormal'),
      { kind: 'sensory', side: 'L', modality: 'posterior_column', span: ['C8', 'C8'], value: 'abnormal' },
      pain('T1', 'normal'),
      pain('C7', 'normal'),
      pain('C6', 'normal'),
      pain('C8', 'normal', 'R'),
      ...noLongTract,
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'nerve_left', topSites: ['ulnar_elbow', 'ulnar_wrist'] }],
    cite: ['S38', 'S45', 'S21'],
    basis: 'stated',
    note: 'The little finger is ulnar and the medial forearm is not (S38, S45); a C8 root would take both (S45).',
  },
  {
    id: 'reverse-hand-weakness-open',
    title: 'Weak ulnar finger flexion and interossei, nothing else yet examined at the arm',
    observations: [
      m('finger_flexor_ulnar', 'weak'),
      m('interossei', 'weak'),
      m('finger_flexor_ulnar', 'normal', 'R'),
      m('interossei', 'normal', 'R'),
      ...noLongTract,
    ],
    expectations: [
      { timepoint: 'chronic', amongTop: { k: 3, families: [['plexus_left'], ['nerve_left']] }, nextTestSeparatesTopTwo: true },
    ],
    cite: ['S33', 'S38'],
    basis: 'stated',
    note: 'Both the lower plexus and the ulnar nerve give these findings (S33, S38); the tool must name a test that separates them.',
  },
];
