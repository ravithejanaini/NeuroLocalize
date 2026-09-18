// The contract expectations are written against. It names output states; it does not
// compute them. The engine defines its own output type and a test checks the two agree.
import type {
  BladderState,
  BodyRegion,
  BrainCompartment,
  BrainLevel,
  CranialSign,
  FaceWeakness,
  Compartment,
  Deformity,
  Dysreflexia,
  FieldSector,
  FieldState,
  LanguageSign,
  MotorLesion,
  Muscle,
  MuscleState,
  PlexusSite,
  NeurogenicShock,
  Portion,
  Qualifier,
  Reflex,
  ReflexState,
  SensoryModality,
  SensoryState,
  Segment,
  Severity,
  Side,
  SignState,
  SkinArea,
  SourceId,
  Timepoint,
  VisualPart,
  Tone,
  Vertebra,
} from '../../src/kb/vocab.ts';

/** Inclusive, rostral end first. */
export type Span = readonly [Segment, Segment];

export type LesionRegion = {
  readonly at: { readonly segments: Span } | { readonly vertebra: Vertebra };
  readonly sides: readonly Side[];
  readonly compartments: readonly Compartment[];
  readonly severity: Severity;
  readonly portion: Portion;
};

type Evidence = {
  readonly cite: readonly SourceId[];
  /** stated: a source says it. composed: it follows from several stated facts. */
  readonly basis: 'stated' | 'composed';
  readonly note?: string;
};

type Sided = { readonly side: Side | 'both' };

export type Assertion = Evidence &
  (
    | (Sided & {
        readonly kind: 'sensory';
        readonly modality: SensoryModality | 'all';
        readonly span: Span;
        readonly oneOf: readonly SensoryState[];
      })
    | (Sided & {
        readonly kind: 'motor';
        readonly span: Span;
        readonly lesion: readonly MotorLesion[];
        readonly tone?: readonly Tone[];
      })
    | (Sided & { readonly kind: 'reflex'; readonly reflex: Reflex; readonly oneOf: readonly ReflexState[] })
    | (Sided & { readonly kind: 'babinski'; readonly oneOf: readonly SignState[] })
    | (Sided & { readonly kind: 'horner'; readonly oneOf: readonly SignState[] })
    | { readonly kind: 'romberg'; readonly oneOf: readonly SignState[] }
    | { readonly kind: 'bladder'; readonly oneOf: readonly BladderState[] }
    | { readonly kind: 'neurogenicShock'; readonly oneOf: readonly NeurogenicShock[] }
    | { readonly kind: 'dysreflexia'; readonly oneOf: readonly Dysreflexia[] }
    | { readonly kind: 'qualifier'; readonly qualifier: Qualifier; readonly present: boolean }
    | { readonly kind: 'resolvedSegments'; readonly span: Span }
  );

export type Evaluation = {
  readonly timepoint: Timepoint;
  readonly assertions: readonly Assertion[];
  /** What was deliberately left unasserted, and why. */
  readonly unasserted: readonly string[];
};

export type Case = {
  readonly id: string;
  readonly title: string;
  /** The clinical pattern this lesion is chosen to reproduce. Never read by the engine. */
  readonly pattern: string;
  readonly lesion: readonly LesionRegion[];
  readonly evaluations: readonly Evaluation[];
};

// ─── The upper limb (amendment A4) ───────────────────────────────────────────

/** A lesion beyond the roots: a trunk, a cord, or a named place on a nerve. */
export type PlexusRegion = {
  readonly plexus: PlexusSite;
  readonly sides: readonly Side[];
  readonly severity: Severity;
};

export type LimbAssertion = Evidence &
  Sided &
  (
    | { readonly kind: 'muscle'; readonly muscles: readonly Muscle[]; readonly oneOf: readonly MuscleState[] }
    /** A6: a deformity or posture, judged present, absent or indeterminate. */
    | { readonly kind: 'deformity'; readonly deformity: Deformity; readonly oneOf: readonly SignState[] }
    | {
        readonly kind: 'skin';
        readonly modality: SensoryModality | 'all';
        readonly areas: readonly SkinArea[];
        readonly oneOf: readonly SensoryState[];
      }
  );

export type LimbEvaluation = {
  readonly timepoint: Timepoint;
  readonly assertions: readonly (Assertion | LimbAssertion)[];
  readonly unasserted: readonly string[];
};

export type LimbCase = {
  readonly id: string;
  readonly title: string;
  readonly pattern: string;
  readonly lesion: readonly (LesionRegion | PlexusRegion)[];
  readonly evaluations: readonly LimbEvaluation[];
};

// ─── Above the cord (amendment A7) ───────────────────────────────────────────

/** A lesion in the brain: a level, a side, the parts it takes, and for somatotopic parts the regions. */
export type BrainRegion = {
  readonly brain: BrainLevel;
  readonly sides: readonly Side[];
  readonly compartments: readonly BrainCompartment[];
  /** For cortex, capsule and thalamus: which body regions the damaged part serves. All when absent. */
  readonly regions?: readonly BodyRegion[];
  readonly severity: Severity;
};

export type BrainAssertion = Evidence &
  (
    | (Sided & { readonly kind: 'face_sensation'; readonly oneOf: readonly SensoryState[] })
    | (Sided & { readonly kind: 'face_weakness'; readonly oneOf: readonly FaceWeakness[] })
    | (Sided & { readonly kind: 'cranial'; readonly sign: CranialSign; readonly oneOf: readonly SignState[] })
    | (Sided & { readonly kind: 'ataxia'; readonly oneOf: readonly SignState[] })
    | { readonly kind: 'vertigo'; readonly oneOf: readonly SignState[] }
  );

export type BrainEvaluation = {
  readonly timepoint: Timepoint;
  /** A14 admits language assertions: the superior-division case says what it does to speech. */
  readonly assertions: readonly (Assertion | LimbAssertion | BrainAssertion | LanguageAssertion)[];
  readonly unasserted: readonly string[];
};

export type BrainCase = {
  readonly id: string;
  readonly title: string;
  readonly pattern: string;
  readonly lesion: readonly (LesionRegion | PlexusRegion | BrainRegion)[];
  readonly evaluations: readonly BrainEvaluation[];
};

// ─── The visual pathway (amendment A11) ─────────────────────────────────────

/** A lesion of the visual pathway. The chiasm is midline: its sides are ignored. */
export type VisionRegion = {
  readonly vision: VisualPart;
  readonly sides: readonly Side[];
  readonly severity: Severity;
};

export type VisionAssertion = Evidence &
  (
    | {
        readonly kind: 'field';
        /** Which eye's field; 'both' asserts the same of each eye. */
        readonly eye: Side | 'both';
        readonly sectors: readonly FieldSector[];
        readonly oneOf: readonly FieldState[];
      }
    | (Sided & { readonly kind: 'rapd'; readonly oneOf: readonly SignState[] })
  );

export type VisionEvaluation = {
  readonly timepoint: Timepoint;
  readonly assertions: readonly (Assertion | LimbAssertion | BrainAssertion | VisionAssertion)[];
  readonly unasserted: readonly string[];
};

export type VisionCase = {
  readonly id: string;
  readonly title: string;
  readonly pattern: string;
  readonly lesion: readonly (LesionRegion | PlexusRegion | BrainRegion | VisionRegion)[];
  readonly evaluations: readonly VisionEvaluation[];
};

// ─── Language and the dominant hemisphere (amendment A14) ──────────────────

/**
 * `language`: one bedside facet, named for its abnormal state, so 'present' means impaired.
 * It belongs to the patient, not a side. `neglect`: the side is the side of **space** that is
 * neglected, not the side of the lesion.
 */
export type LanguageAssertion = Evidence &
  (
    | { readonly kind: 'language'; readonly sign: LanguageSign; readonly oneOf: readonly SignState[] }
    | (Sided & { readonly kind: 'neglect'; readonly oneOf: readonly SignState[] })
  );

export type LanguageEvaluation = {
  readonly timepoint: Timepoint;
  readonly assertions: readonly (Assertion | BrainAssertion | VisionAssertion | LanguageAssertion)[];
  readonly unasserted: readonly string[];
};

export type LanguageCase = {
  readonly id: string;
  readonly title: string;
  readonly pattern: string;
  readonly lesion: readonly (BrainRegion | VisionRegion)[];
  readonly evaluations: readonly LanguageEvaluation[];
};
