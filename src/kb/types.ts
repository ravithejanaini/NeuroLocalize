// Shape of the knowledge base. The engine receives a value of type Kb as an argument,
// which is what lets the mutation harness hand it a corrupted copy.
import type {
  BladderState,
  BodyRegion,
  BrainCompartment,
  BrainLevel,
  Compartment,
  ArmMuscle,
  ArmNerve,
  ArmSkinArea,
  Deformity,
  LegMuscle,
  LegNerve,
  LegPlexusPart,
  LegSkinArea,
  Muscle,
  Nerve,
  PlexusCord,
  PlexusSite,
  Reflex,
  Segment,
  SensoryModality,
  SensoryState,
  Side,
  SignState,
  SkinArea,
  SourceId,
  Timepoint,
  Tone,
  VisionPlace,
  VisualPart,
  Territory,
  Trunk,
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

// ─── The upper limb (P4) ───
export type Division = 'anterior' | 'posterior';
/**
 * Where a nerve leaves the plexus: straight from the roots, from a trunk, or from cords (the
 * brachial plexus); from a part of the lumbosacral plexus, or from another nerve (P7).
 */
export type NerveOrigin =
  | { readonly from: 'roots' }
  | { readonly from: 'trunk'; readonly trunk: Trunk }
  | { readonly from: 'cords'; readonly cords: readonly PlexusCord[] }
  | { readonly from: 'plexus'; readonly part: LegPlexusPart }
  | { readonly from: 'nerve'; readonly nerve: Nerve };
/**
 * A branch of a nerve. `after` counts the nerve's named lesion places that lie proximal to
 * the branch, so a lesion at place i (0-based) damages the branch when i < after (D27).
 */
export type Supply = { readonly nerve: Nerve; readonly after: number };

export type Plexus = {
  readonly trunks: Row<{
    /** The roots that form the plexus; the trunks must divide exactly these between them. */
    readonly plexusRoots: Span;
    readonly roots: Readonly<Record<Trunk, Span>>;
  }>;
  readonly cords: Row<{ readonly formedBy: Readonly<Record<PlexusCord, readonly Trunk[]>> }>;
  /** P7: the roots of each part of the lumbosacral plexus. Unlike the trunks, they may share one (C19). */
  readonly legParts: Row<{ readonly roots: Readonly<Record<LegPlexusPart, Span>> }>;
  /** A nerve's own root values are drawn, not computed with (D29); they live in the render KB. */
  readonly nerves: Readonly<
    Record<
      Nerve,
      Row<{
        readonly origin: NerveOrigin;
        /** Named lesion places along the nerve, proximal to distal. */
        readonly sites: readonly PlexusSite[];
      }>
    >
  >;
  readonly muscles: Readonly<
    Record<
      Muscle,
      Row<{
        /** Every nerve that reaches the muscle; cutting some of them leaves it `indeterminate` (P7). */
        readonly supply: readonly Supply[];
        /** From the myotome sources, not from the nerve (D29). Null when no source gives them. */
        readonly roots: Span | null;
        readonly disputedRoots?: Span;
        /** The single-segment strength test this muscle answers (D31). */
        readonly myotome?: Segment;
      }>
    >
  >;
  readonly skin: Readonly<
    Record<
      SkinArea,
      Row<{
        readonly supply: readonly Supply[];
        /** Null when no source read gives the patch's roots; disputedRoots then lists the nerve's. */
        readonly roots: Span | null;
        readonly disputedRoots?: Span;
        /** The dermatome landmark this patch is (D30). */
        readonly landmark?: Segment;
        /** P23: a multi-segment sensory test that also reads this patch — the saddle reads the perineum. */
        readonly landmarkSpan?: Span;
      }>
    >
  >;
  readonly reflexMuscles: Row<{ readonly muscles: Readonly<Partial<Record<Reflex, Muscle>>> }>;
  /** P23: a reflex with no tested muscle whose arc still runs through a nerve (D123). */
  readonly reflexNerves: Row<{ readonly nerves: Readonly<Partial<Record<Reflex, Nerve>>> }>;
  /** A deformity follows when every listed muscle has lower-motor-neuron weakness (D36). */
  readonly deformities: Readonly<Record<Deformity, Row<{ readonly muscles: readonly Muscle[] }>>>;
};

// ─── Above the cord (P5) ───
export type BrainStep = { readonly level: BrainLevel; readonly compartment: BrainCompartment };
/**
 * A route through the brain. `serves` says which side of the body or head a damaged part on
 * one side affects: 'contralateral' for tracts that have crossed below (D40).
 */
export type BrainRoute = Row<{ readonly steps: readonly BrainStep[]; readonly serves: Laterality }>;

export type Brain = {
  readonly corticospinal: BrainRoute;
  readonly lemniscal: BrainRoute;
  readonly spinothalamic: BrainRoute;
  /** Facial sensation: the ipsilateral nucleus, then a crossed route to the cortex (C16). */
  readonly faceNucleus: BrainRoute;
  readonly faceAscending: BrainRoute;
  /** Corticobulbar routes: to the lower face (crossed), the tongue (mostly crossed), the palate (bilateral). */
  readonly corticobulbarFace: BrainRoute;
  readonly upperFaceBilateral: Row<{ readonly bilateral: boolean }>;
  readonly corticobulbarTongue: BrainRoute;
  readonly corticobulbarPalate: Row<{ readonly steps: readonly BrainStep[]; readonly bilateral: boolean }>;
  /** Cranial nerve nuclei and fascicles, each acting on its own side. */
  readonly facialNucleus: BrainRoute;
  readonly hypoglossal: BrainRoute;
  readonly ambiguus: BrainRoute;
  readonly oculomotor: BrainRoute;
  readonly abduction: BrainRoute;
  readonly gaze: BrainRoute;
  /** P9 eye movements: the MLF, the lid and the superior rectus (C29). */
  readonly adduction: BrainRoute;
  readonly adductionGaze: BrainRoute;
  readonly abductingNystagmus: BrainRoute;
  readonly ptosis: BrainRoute;
  readonly ptosisNuclear: Row<{ readonly steps: readonly BrainStep[]; readonly bilateral: boolean }>;
  readonly elevation: BrainRoute;
  readonly elevationCrossed: BrainRoute;
  /** P12: the cochlear nuclei, on the side of the lesion. */
  readonly hearing: BrainRoute;
  /** P14: the fourth nerve (its nucleus serves the other eye) and the fifth's motor nucleus. */
  /** P16: the frontal eye field loses gaze to the other side, for a time only (S131). */
  readonly gazeCortex: Row<{ readonly steps: readonly BrainStep[]; readonly serves: Laterality; readonly course: Readonly<Record<Timepoint, SignState>> }>;
  /** P16: Gerstmann syndrome, read from the dominant hemisphere as language is. */
  readonly gerstmann: Row<{ readonly steps: readonly BrainStep[] }>;
  /** P15: the subthalamic nucleus, acting on the other side's limbs. */
  readonly ballismus: BrainRoute;
  readonly trochlear: BrainRoute;
  readonly jaw: BrainRoute;
  /** P13: the three dorsal midbrain signs, each read from either half of the pretectum. */
  readonly upgaze: Row<{ readonly steps: readonly BrainStep[] }>;
  readonly lightNear: Row<{ readonly steps: readonly BrainStep[] }>;
  readonly convergenceRetraction: Row<{ readonly steps: readonly BrainStep[] }>;
  readonly sympathetic: BrainRoute;
  readonly ataxia: BrainRoute;
  readonly vertigo: Row<{ readonly steps: readonly BrainStep[] }>;
  /** P11: truncal ataxia from the vermis; after a hemisphere lesion the answer is data (C35). */
  readonly truncalAtaxia: Row<{ readonly steps: readonly BrainStep[] }>;
  readonly truncalAfterHemisphere: Row<{ readonly steps: readonly BrainStep[]; readonly state: SignState }>;
  /** P10: which hemisphere holds language (D68), and the three facets read from it. */
  readonly dominance: Row<{ readonly language: Side }>;
  readonly fluency: Row<{ readonly steps: readonly BrainStep[] }>;
  readonly comprehension: Row<{ readonly steps: readonly BrainStep[] }>;
  readonly repetition: Row<{ readonly steps: readonly BrainStep[] }>;
  /** Neglect of the side of space opposite the damaged part; after a dominant lesion, C32. */
  readonly neglect: Row<{ readonly steps: readonly BrainStep[]; readonly afterDominant: SignState }>;
  /** Which parts exist at each level; routes and territories may name no others (D46). */
  readonly partsAt: Row<{ readonly parts: Readonly<Record<BrainLevel, readonly BrainCompartment[]>> }>;
  /** Parts laid out by body region (D41). */
  readonly somatotopic: Row<{ readonly compartments: readonly BrainCompartment[] }>;
  readonly limbRegions: Row<{ readonly arm: Span; readonly leg: Span }>;
  readonly axialRegions: Row<{ readonly neck: Span; readonly trunk: Span }>;
  readonly territories: Readonly<
    Record<
      Territory,
      Row<{
        readonly level: BrainLevel;
        readonly compartments: readonly BrainCompartment[];
        readonly regions?: readonly BodyRegion[];
        /** P10: the parts of the visual pathway the same territory takes (C31). */
        readonly vision?: readonly VisualPart[];
        /** P11: a midline place takes both sides at once, and is one candidate, not two. */
        readonly midline?: boolean;
        /** P12: parts at other levels on the same side — PICA takes the medulla and the cerebellum. */
        readonly also?: readonly { readonly level: BrainLevel; readonly compartments: readonly BrainCompartment[] }[];
      }>
    >
  >;
};

// ─── The visual pathway (P8) ───
/**
 * What one part of the visual pathway carries. `eye`: its own eye's fibres, or both eyes'.
 * `field`: the whole field, the temporal half-fields (the crossing nasal fibres), or the
 * half-field opposite the part's side. `quadrants`: which half of the periphery. `centre`:
 * whether it carries the centre of that half-field with the rest, only the centre, half of
 * it (one quadrant's worth), or none. `rapd`: which pupil shows a relative afferent defect.
 */
export type VisionPartRow = Row<{
  readonly eye: 'same' | 'both';
  readonly field: 'whole' | 'temporal' | 'opposite';
  readonly quadrants: 'both' | 'upper' | 'lower' | 'none';
  readonly centre: 'with' | 'half' | 'only' | 'none';
  readonly rapd: 'same' | 'opposite' | 'none' | 'open';
}>;

export type Vision = {
  readonly parts: Readonly<Record<VisualPart, VisionPartRow>>;
  readonly places: Readonly<Record<VisionPlace, Row<{ readonly parts: readonly VisualPart[]; readonly midline?: boolean }>>>;
  /** R30 (D131): what a relative defect shows when both sides are equally affected. */
  readonly rapd: Row<{ readonly whenEqual: SignState }>;
};

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
    /** The root whose loss interrupts the second-order oculosympathetic neuron (D33). */
    readonly sympatheticOutflow: Row<{ readonly root: Segment }>;
    readonly sympatheticRootCompartment: Row<{ readonly compartment: Compartment }>;
  };
  readonly reflexes: { readonly [R in Reflex]: Row<{ readonly span: Span }> };
  readonly vertebrae: readonly Row<{ readonly vertebra: Vertebra; readonly segments: Span }>[];
  readonly regions: {
    readonly cervical: Row<{ readonly span: Span }>;
    readonly lowerLimb: Row<{ readonly span: Span }>;
    readonly sacral: Row<{ readonly span: Span }>;
  };
  readonly plexus: Plexus;
  readonly brain: Brain;
  readonly vision: Vision;
  readonly observations: {
    readonly spinalShock: Row<{
      readonly reflexesAbsent: readonly Timepoint[];
      /** Reflexes that return within the first day (S02), so never asserted absent in shock. */
      readonly returnEarly: readonly Reflex[];
      /** Tone below the lesion while the tendon reflexes are absent. */
      readonly tone: Tone;
      readonly babinskiAbsent: readonly Timepoint[];
      readonly bladderImpaired: readonly Timepoint[];
    }>;
    readonly neurogenicShock: Row<{
      readonly strictlyAbove: Segment;
      readonly during: readonly Timepoint[];
      /** Phases in which it may persist (S03: up to four to five weeks). */
      readonly mayPersist: readonly Timepoint[];
    }>;
    readonly dysreflexia: Row<{ readonly atOrAbove: Segment; readonly rareBelow: Segment; readonly from: readonly Timepoint[] }>;
    readonly chronicUmn: Row<{ readonly reflex: 'brisk'; readonly tone: Tone; readonly babinskiPresent: boolean }>;
    readonly babinski: Row<{ readonly corticospinalRostralTo: Segment }>;
    readonly lmn: Row<{ readonly tone: Tone; readonly partialReflex: 'reduced' }>;
    readonly armPredominance: Row<{ readonly compartment: Compartment; readonly region: 'cervical' }>;
    readonly sacralSparing: Row<{ readonly compartment: Compartment; readonly region: 'sacral' }>;
    readonly romberg: Row<{
      readonly region: 'lowerLimb';
      readonly untestableWithWeakLegs: boolean;
      /** Vestibular or cerebellar signs make the test unreadable (S67). */
      readonly unreadableWithVertigoOrAtaxia: boolean;
    }>;
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

/** A point in the scene, for the patient's left side (x negative); the right mirrors x. */
export type LimbPoint = readonly [x: number, y: number, z: number];
/** A point along a nerve: a place a lesion can sit, or where branches leave. */
export type Waypoint = {
  readonly at: LimbPoint;
  readonly site?: PlexusSite;
  readonly branches?: readonly (Muscle | SkinArea)[];
};
export type LimbLayout = {
  /** Trunks from where their roots meet to where they divide. */
  readonly trunks: Readonly<Record<Trunk, readonly LimbPoint[]>>;
  /** Cords from where their divisions meet to where their nerves leave. */
  readonly cords: Readonly<Record<PlexusCord, readonly LimbPoint[]>>;
  /** Each nerve from where it leaves its origin to its last branch. */
  readonly nerves: Readonly<Record<ArmNerve, readonly Waypoint[]>>;
  /** Where each muscle and patch of skin is drawn. */
  readonly targets: Readonly<Record<ArmMuscle | ArmSkinArea, LimbPoint>>;
  readonly clavicle: readonly LimbPoint[];
  readonly firstRib: readonly LimbPoint[];
  readonly artery: readonly LimbPoint[];
  readonly scalenes: { readonly anterior: readonly LimbPoint[]; readonly middle: readonly LimbPoint[] };
  readonly bones: readonly (readonly LimbPoint[])[];
};

/**
 * P7: the lumbosacral plexus and the leg, for the patient's left (x negative); the right
 * mirrors x. Schematic: what is sourced is the order of places and branches, not distances.
 */
export type LegLayout = {
  /** Each part of the plexus, from where its roots meet to where its nerves leave. */
  readonly parts: Readonly<Record<LegPlexusPart, readonly LimbPoint[]>>;
  /** Each nerve from where it leaves its origin to its last branch. */
  readonly nerves: Readonly<Record<LegNerve, readonly Waypoint[]>>;
  readonly targets: Readonly<Record<LegMuscle | LegSkinArea, LimbPoint>>;
  readonly inguinalLigament: readonly LimbPoint[];
  readonly bones: readonly (readonly LimbPoint[])[];
};

/**
 * The brain above C1, for the patient's left (x negative); the right mirrors x. Each level
 * has a height and a drawn radius; each part a position at its level's height, in the
 * level's own units (x lateral, z dorsal).
 */
export type BrainLayout = {
  readonly levels: Readonly<Record<BrainLevel, { readonly y: number; readonly height: number; readonly radius: number }>>;
  readonly parts: Readonly<Partial<Record<`${BrainLevel}:${BrainCompartment}`, LimbPoint>>>;
  /** Where each body region sits on the cortical strips (motor and sensory share x and y). */
  readonly homunculus: Readonly<Record<BodyRegion, LimbPoint>>;
  /** Where the crossings happen: the pyramids and the internal arcuate fibres. */
  readonly decussationY: number;
  /** Where the face is drawn, for facial pulses. */
  readonly face: LimbPoint;
};

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
  /** Which division of each trunk runs to each cord (S34). */
  readonly divisions: Row<{ readonly ofCord: Readonly<Record<PlexusCord, Division>> }>;
  /**
   * The plexus and arm in the scene. Positions are schematic and the arm is drawn at half
   * scale; the relations — trunks between the scalenes, divisions behind the clavicle,
   * cords named around the axillary artery — are the sourced part, and tests check them.
   */
  readonly limb: Row<LimbLayout>;
  readonly leg: Row<LegLayout>;
  readonly brainLayout: Row<BrainLayout>;
  /** Root values of each nerve, as drawn. Muscles and skin carry their own (D29). */
  readonly nerveRoots: Row<{
    readonly nerves: Readonly<Record<Nerve, { readonly roots: Span; readonly disputedRoots?: Span }>>;
  }>;
  readonly dermatomeLandmarks: Row<{ readonly landmarks: readonly Landmark[] }>;
  readonly saddle: Row<{ readonly span: Span; readonly place: string; readonly at: BodyPoint }>;
  /** Nerve territories that are not dermatome landmarks, on the same body map (D30). */
  readonly skinPatches: Row<{ readonly at: Readonly<Partial<Record<SkinArea, BodyPoint>>> }>;
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
