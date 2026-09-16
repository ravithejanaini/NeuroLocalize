// Shape of the knowledge base. The engine receives a value of type Kb as an argument,
// which is what lets the mutation harness hand it a corrupted copy.
import type {
  BladderState,
  Compartment,
  Reflex,
  Segment,
  SensoryModality,
  SensoryState,
  SourceId,
  Timepoint,
  Tone,
  Vertebra,
} from './vocab.ts';

export type Span = readonly [Segment, Segment];
export type Tier = 'T1' | 'T2' | 'T3';
export type Laterality = 'ipsilateral' | 'contralateral';

/**
 * T1: uncontested and stated by two or more sources.
 * T2: stated by one source, or by several that are silent rather than contradictory.
 * T3: sources disagree; `conflict` names the entry in DECISIONS.md.
 */
export type Meta = {
  readonly id: string;
  /** One line a clinical reviewer can mark true or false. */
  readonly claim: string;
  readonly sources: readonly SourceId[];
  readonly tier: Tier;
  /** Page references in Brazis or Blumenfeld; nobody has read them yet (D1). */
  readonly bookRef: 'pending';
  /** Present when no source read supports the row. Printed on every test run. */
  readonly pendingSource?: string;
  /** Sources disagree. Names the entry in DECISIONS.md; forces tier T3. */
  readonly conflict?: string;
  /** True by naming alone (segments C1–C8 are the cervical cord). Needs no source. */
  readonly definitional?: true;
};

type Row<T> = { readonly meta: Meta } & T;

export type Kb = {
  readonly pathways: {
    readonly posteriorColumn: Row<{ readonly ascendsOn: Laterality }>;
    readonly spinothalamic: Row<{
      /** Segments rostral to entry at which the fibre crosses: [fewest, most]. */
      readonly crossingOffset: readonly [number, number];
      readonly ascendsOn: Laterality;
    }>;
    readonly corticospinal: Row<{ readonly descendsOn: Laterality }>;
  };
  readonly compartments: {
    readonly motorNeuron: Row<{ readonly lowerMotorNeuron: readonly Compartment[] }>;
    readonly dorsalRoot: Row<{ readonly carries: readonly SensoryModality[] }>;
    readonly reflexArc: Row<{ readonly via: readonly Compartment[] }>;
  };
  readonly autonomic: {
    readonly ciliospinal: Row<{ readonly centre: Span; readonly firstOrderRunsOn: Laterality }>;
    readonly micturitionCentre: Row<{ readonly span: Span; readonly arc: readonly Compartment[] }>;
    readonly bladderControl: Row<{ readonly requiresBilateralLesion: boolean }>;
  };
  readonly reflexes: { readonly [R in Reflex]: Row<{ readonly span: Span }> };
  readonly vertebrae: readonly Row<{ readonly vertebra: Vertebra; readonly segments: Span }>[];
  readonly regions: {
    readonly cervical: Row<{ readonly span: Span }>;
    readonly lowerLimb: Row<{ readonly span: Span }>;
    readonly sacral: Row<{ readonly span: Span }>;
  };
  readonly observations: {
    readonly spinalShock: Row<{
      readonly reflexesAbsent: readonly Timepoint[];
      readonly reflexesReturning: readonly Timepoint[];
      readonly babinskiAbsent: readonly Timepoint[];
      readonly bladderImpaired: readonly Timepoint[];
    }>;
    readonly neurogenicShock: Row<{ readonly strictlyAbove: Segment; readonly during: readonly Timepoint[] }>;
    readonly dysreflexia: Row<{ readonly atOrAbove: Segment; readonly rareBelow: Segment; readonly from: readonly Timepoint[] }>;
    readonly chronicUmn: Row<{ readonly reflex: 'brisk'; readonly tone: Tone; readonly babinskiPresent: boolean }>;
    readonly babinski: Row<{ readonly corticospinalRostralTo: Segment }>;
    readonly lmn: Row<{ readonly tone: Tone; readonly partialReflex: 'reduced' }>;
    readonly armPredominance: Row<{ readonly compartment: Compartment; readonly region: 'cervical' }>;
    readonly sacralSparing: Row<{ readonly compartment: Compartment; readonly region: 'sacral' }>;
    readonly romberg: Row<{ readonly region: 'lowerLimb'; readonly untestableWithWeakLegs: boolean }>;
    readonly overlap: Row<{ readonly isolatedLossReadsAs: SensoryState }>;
    readonly bladder: Row<{
      readonly aboveCentre: BladderState;
      readonly atCentre: BladderState;
      readonly duringShock: BladderState;
    }>;
  };
};

/** A mechanism explains an observation. The engine is forbidden to import these. */
export type Mechanism = {
  readonly meta: Meta;
  readonly explains: string;
  readonly positions: readonly { readonly account: string; readonly sources: readonly SourceId[] }[];
};
