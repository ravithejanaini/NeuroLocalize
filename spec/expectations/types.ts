// The contract expectations are written against. It names output states; it does not
// compute them. The engine defines its own output type and a test checks the two agree.
import type {
  BladderState,
  Compartment,
  Dysreflexia,
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
