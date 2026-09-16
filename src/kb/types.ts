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

// ─── Render-only knowledge (P1). The engine is forbidden to import any of this. ───

export type Range = readonly [number, number];
/** classical: the textbook arrangement. revised: the account current evidence supports. */
export type LaminationModel = 'classical' | 'revised';
/** Position inside a tract, each axis in [-1, 1]. */
export type TractPoint = { readonly lateral: number; readonly dorsal: number };
/**
 * Where a fibre sits in its tract, by the body region it serves, at the cervical and
 * lumbar ends of the cord. Levels between are interpolated.
 */
export type LaminationProfile = {
  readonly upperLimb: { readonly cervical: TractPoint; readonly lumbar: TractPoint };
  readonly lowerLimb: { readonly cervical: TractPoint; readonly lumbar: TractPoint };
  /** 0 keeps fibres ordered; 1 scatters them across the whole tract. */
  readonly scatter: number;
};

export type Disc = { readonly x: number; readonly z: number; readonly r: number };

/** A point on the schematic front-view body, for the patient's left side. */
export type BodyPoint = { readonly x: number; readonly y: number };
export type Landmark = { readonly segment: Segment; readonly place: string; readonly at: readonly BodyPoint[] };
export type MyotomeRow = {
  readonly span: Span;
  readonly movement: string;
  readonly sources: readonly SourceId[];
  /** Present when sources disagree; names the other account. */
  readonly otherAccount?: string;
};

export type RenderKb = {
  readonly dermatomeLandmarks: Row<{ readonly landmarks: readonly Landmark[] }>;
  readonly saddle: Row<{ readonly span: Span; readonly place: string; readonly at: BodyPoint }>;
  readonly myotomes: Row<{ readonly rows: readonly MyotomeRow[] }>;
  readonly cord: Row<{
    readonly lengthCm: Range;
    readonly widthCm: { readonly cervical: Range; readonly thoracic: Range; readonly lumbar: Range };
  }>;
  readonly enlargements: Row<{ readonly cervical: readonly Span[]; readonly lumbar: readonly Span[] }>;
  readonly ruler: Row<{
    /** Segment at the top edge of a vertebra, in order. Between anchors, interpolated. */
    readonly anchors: readonly { readonly segment: Segment; readonly vertebraTop: number }[];
    readonly cordEndsAtVertebra: number;
  }>;
  readonly lateralHorn: Row<{ readonly span: Span }>;
  readonly posteriorColumn: Row<{ readonly cuneatusCarriesRostralTo: Segment }>;
  /**
   * Cross-section on the left side, in units of cord radius: x lateral (negative = left),
   * z dorsal. The right side mirrors x.
   */
  readonly layout: Row<{ readonly discs: Readonly<Record<Compartment, Disc>> }>;
  readonly speeds: Row<{
    readonly abeta: Range;
    readonly adelta: Range;
    readonly c: Range;
    readonly adeltaTypical: number;
    readonly cTypical: number;
    readonly corticospinal: number;
  }>;
  readonly intraspinalSpeed: Row<{ readonly illustrative: number }>;
  readonly lamination: {
    readonly spinothalamic: Row<{ readonly models: Readonly<Record<LaminationModel, LaminationProfile>> }>;
    readonly corticospinal: Row<{ readonly models: Readonly<Record<LaminationModel, LaminationProfile>> }>;
  };
};

/** A mechanism explains an observation. The engine is forbidden to import these. */
export type Mechanism = {
  readonly meta: Meta;
  readonly explains: string;
  readonly positions: readonly { readonly account: string; readonly sources: readonly SourceId[] }[];
};
