// Amendment A3. Frozen expectations for reverse inference, written from the sources before
// any reverse code existed. Each case is an examination as a source describes the syndrome;
// each expectation is a property the ranking must have, not a number read off an engine.
import type {
  BladderObservation,
  LesionFamily,
  Reflex,
  ReflexObservation,
  SensoryModality,
  SensoryObservation,
  Side,
  SignObservation,
  SourceId,
  StrengthObservation,
  Timepoint,
} from '../../src/kb/vocab.ts';
import type { Span } from './types.ts';

export type Observation =
  | { readonly kind: 'sensory'; readonly side: Side; readonly modality: SensoryModality; readonly span: Span; readonly value: SensoryObservation }
  | { readonly kind: 'strength'; readonly side: Side; readonly span: Span; readonly value: StrengthObservation }
  | { readonly kind: 'reflex'; readonly side: Side; readonly reflex: Reflex; readonly value: ReflexObservation }
  | { readonly kind: 'babinski' | 'horner'; readonly side: Side; readonly value: SignObservation }
  | { readonly kind: 'romberg'; readonly value: SignObservation }
  | { readonly kind: 'bladder'; readonly value: BladderObservation };

export type ReverseExpectation = {
  readonly timepoint: Timepoint;
  /** The best-ranked group belongs to this family. */
  readonly topFamily?: LesionFamily;
  readonly topFamilyNot?: readonly LesionFamily[];
  /** The rostral end of every lesion in the best group lies in this span. */
  readonly rostralEndWithin?: Span;
  /** True when no single candidate explains every finding. */
  readonly unexplained?: boolean;
  /** Each family listed appears among the first `k` groups. */
  readonly amongTop?: { readonly k: number; readonly families: readonly (readonly LesionFamily[])[] };
  /** The suggested next test is untested, and the top two groups predict different results for it. */
  readonly nextTestSeparatesTopTwo?: true;
};

export type ReverseCase = {
  readonly id: string;
  readonly title: string;
  readonly observations: readonly Observation[];
  readonly expectations: readonly ReverseExpectation[];
  readonly cite: readonly SourceId[];
  readonly basis: 'stated' | 'composed';
  readonly note: string;
};

const both = <O extends { side: Side }>(o: Omit<O, 'side'>): O[] =>
  (['L', 'R'] as const).map((side) => ({ ...o, side }) as O);
type Sensory = Extract<Observation, { kind: 'sensory' }>;
type Strength = Extract<Observation, { kind: 'strength' }>;
type ReflexObs = Extract<Observation, { kind: 'reflex' }>;
type Sign = Extract<Observation, { kind: 'babinski' | 'horner' }>;
const sense = (side: Side, modality: SensoryModality, at: Span[0], value: SensoryObservation): Sensory => ({
  kind: 'sensory', side, modality, span: [at, at], value,
});
const power = (side: Side, at: Span[0], value: StrengthObservation): Strength => ({ kind: 'strength', side, span: [at, at], value });

const brownSequard: Observation[] = [
  sense('L', 'posterior_column', 'T6', 'normal'),
  sense('L', 'posterior_column', 'T10', 'abnormal'),
  sense('L', 'posterior_column', 'L3', 'abnormal'),
  sense('L', 'posterior_column', 'L4', 'abnormal'),
  sense('L', 'posterior_column', 'S1', 'abnormal'),
  sense('R', 'posterior_column', 'T10', 'normal'),
  sense('R', 'posterior_column', 'L4', 'normal'),
  sense('R', 'posterior_column', 'S1', 'normal'),
  sense('R', 'pain_temperature', 'T4', 'normal'),
  sense('R', 'pain_temperature', 'L4', 'abnormal'),
  sense('R', 'pain_temperature', 'S1', 'abnormal'),
  sense('L', 'pain_temperature', 'L4', 'normal'),
  sense('L', 'pain_temperature', 'S1', 'normal'),
  power('L', 'L3', 'weak'),
  power('L', 'L4', 'weak'),
  power('L', 'S1', 'weak'),
  power('R', 'L3', 'normal'),
  power('R', 'S1', 'normal'),
  power('L', 'C6', 'normal'),
  power('R', 'C6', 'normal'),
  { kind: 'reflex', side: 'L', reflex: 'achilles', value: 'brisk' },
  { kind: 'reflex', side: 'R', reflex: 'achilles', value: 'normal' },
  { kind: 'babinski', side: 'L', value: 'present' },
  { kind: 'babinski', side: 'R', value: 'absent' },
  { kind: 'bladder', value: 'normal' },
];

const radiculopathyC6: Observation[] = [
  power('L', 'C6', 'weak'),
  power('L', 'C5', 'normal'),
  power('L', 'C7', 'normal'),
  power('R', 'C6', 'normal'),
  { kind: 'reflex', side: 'L', reflex: 'brachioradialis', value: 'reduced' },
  { kind: 'reflex', side: 'L', reflex: 'biceps', value: 'reduced' },
  { kind: 'reflex', side: 'L', reflex: 'triceps', value: 'normal' },
  { kind: 'reflex', side: 'R', reflex: 'biceps', value: 'normal' },
  sense('L', 'pain_temperature', 'C6', 'abnormal'),
  sense('L', 'pain_temperature', 'C7', 'normal'),
  sense('R', 'pain_temperature', 'C6', 'normal'),
  ...both<Sign>({ kind: 'babinski', value: 'absent' }),
];

const caudaEquina: Observation[] = [
  ...both<Strength>({ kind: 'strength', span: ['L3', 'L3'], value: 'weak' }),
  ...both<Strength>({ kind: 'strength', span: ['L4', 'L4'], value: 'weak' }),
  ...both<Strength>({ kind: 'strength', span: ['S1', 'S1'], value: 'weak' }),
  ...both<ReflexObs>({ kind: 'reflex', reflex: 'achilles', value: 'reduced' }),
  ...both<ReflexObs>({ kind: 'reflex', reflex: 'patellar', value: 'reduced' }),
  ...both<Sign>({ kind: 'babinski', value: 'absent' }),
  ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['S3', 'S5'], value: 'abnormal' }),
  ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'abnormal' }),
  ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['T10', 'T10'], value: 'normal' }),
  { kind: 'bladder', value: 'retention' },
];

export const REVERSE_CASES: readonly ReverseCase[] = [
  {
    id: 'reverse-brown-sequard',
    title: 'Left-sided weakness and vibration loss, right-sided pain loss',
    observations: brownSequard,
    expectations: [{ timepoint: 'chronic', topFamily: 'hemicord_left', rostralEndWithin: ['T7', 'T10'], unexplained: false }],
    cite: ['S01', 'S15', 'S12', 'S21'],
    basis: 'composed',
    note: 'Vibration lost at T10 but kept at T6 puts the rostral end of the lesion between T7 and T10.',
  },
  {
    id: 'reverse-anterior-spinal-artery',
    title: 'Paraparesis and pain loss with vibration spared',
    observations: [
      ...both<Strength>({ kind: 'strength', span: ['L3', 'L3'], value: 'weak' }),
      ...both<Strength>({ kind: 'strength', span: ['S1', 'S1'], value: 'weak' }),
      ...both<Strength>({ kind: 'strength', span: ['C6', 'C6'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'abnormal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['S1', 'S1'], value: 'abnormal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['T4', 'T4'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['L4', 'L4'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['S1', 'S1'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['T10', 'T10'], value: 'normal' }),
      ...both<Sign>({ kind: 'babinski', value: 'present' }),
      { kind: 'bladder', value: 'overactive' },
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'anterior', topFamilyNot: ['complete'] }],
    cite: ['S07', 'S15', 'S20'],
    basis: 'stated',
    note: 'Preserved posterior columns separate an anterior lesion from a complete one.',
  },
  {
    id: 'reverse-syringomyelia',
    title: 'Suspended bilateral pain loss in the upper limbs',
    observations: [
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['C6', 'C6'], value: 'abnormal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['C8', 'C8'], value: 'abnormal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['T1', 'T1'], value: 'abnormal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['T10', 'T10'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['L4', 'L4'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['S1', 'S1'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['C6', 'C6'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['C8', 'C8'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['L4', 'L4'], value: 'normal' }),
      ...both<Strength>({ kind: 'strength', span: ['C6', 'C6'], value: 'normal' }),
      ...both<Strength>({ kind: 'strength', span: ['C8', 'C8'], value: 'normal' }),
      ...both<Strength>({ kind: 'strength', span: ['L4', 'L4'], value: 'normal' }),
      ...both<ReflexObs>({ kind: 'reflex', reflex: 'biceps', value: 'normal' }),
      ...both<Sign>({ kind: 'babinski', value: 'absent' }),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'central_small' }],
    cite: ['S08', 'S11'],
    basis: 'stated',
    note: 'Dissociated, segmental, bilateral loss with the posterior columns and motor system spared.',
  },
  {
    id: 'reverse-cauda-equina',
    title: 'Areflexic weak legs with saddle anaesthesia and retention',
    observations: caudaEquina,
    expectations: [{ timepoint: 'chronic', topFamily: 'roots_bilateral', topFamilyNot: ['complete'] }],
    cite: ['S09', 'S12', 'S14', 'S20'],
    basis: 'stated',
    note: 'Lower-motor-neuron signs without upper-motor-neuron signs point to the roots, not the cord.',
  },
  {
    id: 'reverse-conus-or-cauda',
    title: 'Saddle anaesthesia and retention, nothing else examined',
    observations: [
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['S3', 'S5'], value: 'abnormal' }),
      { kind: 'bladder', value: 'retention' },
    ],
    expectations: [
      {
        timepoint: 'chronic',
        amongTop: { k: 4, families: [['roots_bilateral'], ['complete', 'anterior', 'hemicord_left', 'hemicord_right']] },
        nextTestSeparatesTopTwo: true,
      },
    ],
    cite: ['S09', 'S14'],
    basis: 'stated',
    note: 'S09 and S14 give both syndromes saddle anaesthesia and bladder dysfunction; the tool must say what separates them.',
  },
  {
    id: 'reverse-radiculopathy-C6',
    title: 'Left C6 weakness, reflex loss and thumb numbness',
    observations: radiculopathyC6,
    expectations: [{ timepoint: 'chronic', topFamily: 'root_left', rostralEndWithin: ['C6', 'C6'], unexplained: false }],
    cite: ['S19', 'S12', 'S21'],
    basis: 'composed',
    note: 'A segmental lower-motor-neuron deficit with no long-tract signs.',
  },
  {
    id: 'reverse-two-lesions',
    title: 'A left C6 root lesion and a cauda equina lesion together',
    observations: [...radiculopathyC6.filter((o) => o.kind !== 'babinski'), ...caudaEquina],
    expectations: [{ timepoint: 'chronic', unexplained: true }],
    cite: ['S19', 'S09'],
    basis: 'composed',
    note: 'No single lesion in the model gives both; the tool must say so rather than force a fit.',
  },
  {
    id: 'reverse-spinal-shock',
    title: 'Areflexic paraplegia with a thoracic sensory level',
    observations: [
      ...both<Strength>({ kind: 'strength', span: ['L3', 'L3'], value: 'weak' }),
      ...both<Strength>({ kind: 'strength', span: ['S1', 'S1'], value: 'weak' }),
      ...both<ReflexObs>({ kind: 'reflex', reflex: 'achilles', value: 'reduced' }),
      ...both<ReflexObs>({ kind: 'reflex', reflex: 'patellar', value: 'reduced' }),
      ...both<Sign>({ kind: 'babinski', value: 'absent' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['T10', 'T10'], value: 'abnormal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['T10', 'T10'], value: 'abnormal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'pain_temperature', span: ['T2', 'T2'], value: 'normal' }),
      ...both<Sensory>({ kind: 'sensory', modality: 'posterior_column', span: ['T2', 'T2'], value: 'normal' }),
    ],
    expectations: [
      { timepoint: 'hyperacute', topFamily: 'complete', unexplained: false },
      { timepoint: 'chronic', unexplained: true },
    ],
    cite: ['S02', 'S05', 'S09'],
    basis: 'composed',
    note: 'In the first day this is spinal shock below a complete lesion; months later no single lesion explains flaccid areflexic legs with a thoracic level.',
  },
];
