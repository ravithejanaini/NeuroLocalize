// forward(): from a lesion and a point in time to the deficits it produces.
// Every threshold and route is read from the knowledge base passed in; nothing clinical is
// decided here. Named syndromes never appear — the engine sees compartments, not diagnoses.
import { KB } from '../kb/kb.ts';
import type { Kb, Laterality } from '../kb/types.ts';
import {
  REFLEXES,
  SEGMENTS,
  SENSORY_MODALITIES,
  SIDES,
  type BladderState,
  type Dysreflexia,
  type MotorLesion,
  type NeurogenicShock,
  type Qualifier,
  type Reflex,
  type ReflexState,
  type Segment,
  type SensoryModality,
  type SensoryState,
  type Side,
  type SignState,
  type Timepoint,
  type Tone,
} from '../kb/vocab.ts';
import { idx, mapLesion, opposite, type Damage, type LesionMap, type LesionRegion } from './lesion.ts';
import { brainBodyDamage, brainFindings, brainHorner, mapBrain, type BrainFindings, type BrainMap, type BrainRegion } from './brain.ts';
import { limbFindings, limbReflex, mapPlexus, type LimbFindings, type PlexusRegion } from './limb.ts';
import { crossingOffsets, damageAlong, motorRoute, sensoryRoute, type Route } from './routes.ts';

export type { LesionMap, LesionRegion } from './lesion.ts';
export type { PlexusRegion } from './limb.ts';
export type { BrainRegion } from './brain.ts';

/** Anything forward() can be asked about: a region of the cord or roots, or a place beyond them. */
export type AnyRegion = LesionRegion | PlexusRegion | BrainRegion;
export const isPlexus = (r: AnyRegion): r is PlexusRegion => 'plexus' in r;
export const isBrain = (r: AnyRegion): r is BrainRegion => 'brain' in r;
export const isCord = (r: AnyRegion): r is LesionRegion => 'at' in r;
export { mapLesion } from './lesion.ts';
export type { Element, Route } from './routes.ts';
export { crossingOffsets, motorRoute, sensoryRoute } from './routes.ts';

export type MotorFinding = { readonly lesion: MotorLesion; readonly tone: Tone };

export type Findings = {
  readonly resolvedSegments: readonly Segment[];
  readonly sensory: Readonly<Record<Side, Readonly<Record<SensoryModality, Readonly<Record<Segment, SensoryState>>>>>>;
  readonly motor: Readonly<Record<Side, Readonly<Record<Segment, MotorFinding>>>>;
  readonly reflexes: Readonly<Record<Side, Readonly<Record<Reflex, ReflexState>>>>;
  readonly babinski: Readonly<Record<Side, SignState>>;
  readonly horner: Readonly<Record<Side, SignState>>;
  readonly romberg: SignState;
  readonly bladder: BladderState;
  readonly neurogenicShock: NeurogenicShock;
  readonly dysreflexia: Dysreflexia;
  readonly qualifiers: Readonly<Record<Qualifier, boolean>>;
} & LimbFindings &
  BrainFindings;

export type ForwardOptions = {
  readonly kb?: Kb;
  /**
   * Which spinothalamic lamination the renderer should draw. Findings must not depend on
   * it — a test enforces that — because the arrangement is disputed (S23).
   */
  readonly laminationModel?: 'classical' | 'revised';
};

const STATE: Record<Damage, SensoryState> = { 0: 'intact', 1: 'impaired', 2: 'lost' };
const worst = (ds: readonly Damage[]): Damage => ds.reduce<Damage>((m, d) => (d > m ? d : m), 0);
const onSide = (x: Side, l: Laterality): Side => (l === 'ipsilateral' ? x : opposite(x));
const within = (k: number, span: readonly [Segment, Segment]): boolean => k >= idx(span[0]) && k <= idx(span[1]);
const range = (from: number, to: number): number[] => {
  const out: number[] = [];
  for (let k = from; k <= to; k++) out.push(k);
  return out;
};

/** State of one route: how the renderer's pulse ends, and what the engine reports for it. */
export function routeState(map: LesionMap, kb: Kb, route: Route, inputIsSacral: boolean): SensoryState {
  return STATE[worst(route.elements.map((e) => damageAlong(map, kb, e, inputIsSacral)))];
}

export const isSacral = (kb: Kb, s: number): boolean =>
  within(s, kb.regions[kb.observations.sacralSparing.region].span);

function sensoryFor(map: LesionMap, bmap: BrainMap, kb: Kb, x: Side, modality: SensoryModality, s: number): SensoryState {
  const offsets = modality === 'posterior_column' ? [0] : crossingOffsets(kb);
  const outcomes = new Set(
    offsets.map((o) => routeState(map, kb, sensoryRoute(kb, x, modality, s, o), isSacral(kb, s))),
  );
  const [only] = outcomes;
  const cord: SensoryState = outcomes.size === 1 && only ? only : 'indeterminate';
  // Above C1 the route is single; its damage adds to whatever the cord did (D39).
  const above = brainBodyDamage(kb, bmap, modality, x, s);
  if (above === 2) return 'lost';
  if (above === 1) return cord === 'lost' ? 'lost' : 'impaired';
  return cord;
}

function applyOverlap(column: Record<Segment, SensoryState>, kb: Kb): void {
  const before = { ...column };
  for (let k = 1; k < SEGMENTS.length - 1; k++) {
    const here = SEGMENTS[k];
    const above = SEGMENTS[k - 1];
    const below = SEGMENTS[k + 1];
    if (!here || !above || !below) continue;
    if (before[here] === 'lost' && before[above] === 'intact' && before[below] === 'intact') {
      column[here] = kb.observations.overlap.isolatedLossReadsAs;
    }
  }
}

/**
 * Damage to the corticospinal fibres serving side x, anywhere rostral to segment `below` —
 * in the cord or above it.
 */
function corticospinalAbove(map: LesionMap, bmap: BrainMap, kb: Kb, x: Side, below: number): Damage {
  const descending = motorRoute(kb, x, below).elements.slice(0, below);
  return worst([...descending.map((e) => map.damage(e.compartment, e.side, e.segment)), brainBodyDamage(kb, bmap, 'motor', x, below)]);
}

const shockAbove = (map: LesionMap, below: number): boolean => map.transectionAt >= 0 && map.transectionAt < below;

function motorFor(map: LesionMap, bmap: BrainMap, kb: Kb, t: Timepoint, x: Side, s: number): MotorFinding {
  const final = motorRoute(kb, x, s).elements.slice(s);
  const lmn = worst(final.map((e) => map.damage(e.compartment, e.side, e.segment)));
  const umn = corticospinalAbove(map, bmap, kb, x, s);

  if (lmn === 2 || (lmn === 1 && umn === 0)) return { lesion: 'lmn', tone: kb.observations.lmn.tone };
  if (lmn === 1) return { lesion: 'umn_lmn', tone: 'indeterminate' };
  if (umn === 0) return { lesion: 'none', tone: 'normal' };
  if (t === 'chronic') return { lesion: 'umn', tone: kb.observations.chronicUmn.tone };
  // Spinal shock is a flaccid paralysis while the tendon reflexes are absent (S02, A9).
  const shock = kb.observations.spinalShock;
  if (shockAbove(map, s) && shock.reflexesAbsent.includes(t)) return { lesion: 'umn', tone: shock.tone };
  return { lesion: 'umn', tone: 'indeterminate' };
}

function reflexFor(map: LesionMap, bmap: BrainMap, kb: Kb, t: Timepoint, x: Side, reflex: Reflex): ReflexState {
  const [from, to] = kb.reflexes[reflex].span;
  const segs = range(idx(from), idx(to));
  const arc = segs.map((k) => worst(kb.compartments.reflexArc.via.map((c) => map.damage(c, x, k))));
  if (arc.every((d) => d === 2)) return 'absent';
  const shock = kb.observations.spinalShock;
  if (shockAbove(map, idx(from)) && shock.reflexesAbsent.includes(t)) {
    // S02: the bulbocavernosus reflex is among the first to return, within the first day.
    return shock.returnEarly.includes(reflex) ? 'indeterminate' : 'absent';
  }
  const arcHurt = arc.some((d) => d > 0);
  // Before the chronic phase an interrupted corticospinal tract leaves the reflex
  // unsettled — including Ditunno phase 3, when reflexes are returning (S02).
  if (corticospinalAbove(map, bmap, kb, x, idx(from)) > 0) {
    if (t !== 'chronic' || arcHurt) return 'indeterminate';
    return kb.observations.chronicUmn.reflex;
  }
  return arcHurt ? kb.observations.lmn.partialReflex : 'normal';
}

function babinskiFor(map: LesionMap, bmap: BrainMap, kb: Kb, t: Timepoint, x: Side): SignState {
  const level = idx(kb.observations.babinski.corticospinalRostralTo);
  if (corticospinalAbove(map, bmap, kb, x, level) === 0) return 'absent';
  if (shockAbove(map, level) && kb.observations.spinalShock.babinskiAbsent.includes(t)) return 'absent';
  if (t !== 'chronic') return 'indeterminate';
  return kb.observations.chronicUmn.babinskiPresent ? 'present' : 'absent';
}

function hornerFor(map: LesionMap, bmap: BrainMap, kb: Kb, x: Side): SignState {
  const { centre, firstOrderRunsOn } = kb.autonomic.ciliospinal;
  const fibres = onSide(x, firstOrderRunsOn);
  const [start, end] = [idx(centre[0]), idx(centre[1])];
  const descending = range(0, end).some((k) => map.damage('descending_autonomic', fibres, k) > 0);
  const centreHit = range(start, end).some((k) => map.damage('intermediolateral', x, k) > 0);
  const outflow = idx(kb.autonomic.sympatheticOutflow.root);
  const rootHit = map.damage(kb.autonomic.sympatheticRootCompartment.compartment, x, outflow) > 0;
  return descending || centreHit || rootHit || brainHorner(kb, bmap, x) ? 'present' : 'absent';
}

/** Level at which descending autonomic control is cut on both sides, or -1. */
function bilateralAutonomicLevel(map: LesionMap): number {
  const levels = SIDES.map((side) => map.segments.find((k) => map.damage('descending_autonomic', side, k) > 0) ?? -1);
  return levels.includes(-1) ? -1 : Math.max(...levels);
}

function bladderFor(map: LesionMap, kb: Kb, t: Timepoint): BladderState {
  const { span, arc } = kb.autonomic.micturitionCentre;
  const [c0, c1] = [idx(span[0]), idx(span[1])];
  const out = kb.observations.bladder;
  const arcHit = (side: Side): boolean => range(c0, c1).some((k) => arc.some((c) => map.damage(c, side, k) > 0));
  if (arcHit('L') && arcHit('R')) return out.atCentre;

  const cut = (side: Side): boolean => range(0, c0 - 1).some((k) => map.damage('descending_autonomic', side, k) > 0);
  const descending = kb.autonomic.bladderControl.requiresBilateralLesion ? cut('L') && cut('R') : cut('L') || cut('R');
  if (!descending) return 'normal';
  if (shockAbove(map, c0) && kb.observations.spinalShock.bladderImpaired.includes(t)) return out.duringShock;
  return out.aboveCentre;
}

function neurogenicShockFor(map: LesionMap, kb: Kb, t: Timepoint): NeurogenicShock {
  const rule = kb.observations.neurogenicShock;
  const acute = rule.during.includes(t);
  if (!acute && !rule.mayPersist.includes(t)) return 'not_applicable';
  const level = bilateralAutonomicLevel(map);
  if (!(level >= 0 && level < idx(rule.strictlyAbove))) return 'not_expected';
  return acute ? 'expected' : 'possible';
}

function dysreflexiaFor(map: LesionMap, kb: Kb, t: Timepoint): Dysreflexia {
  const rule = kb.observations.dysreflexia;
  const level = bilateralAutonomicLevel(map);
  if (level < 0) return 'none';
  if (!rule.from.includes(t)) return 'not_yet';
  if (level <= idx(rule.atOrAbove)) return 'susceptible';
  if (level > idx(rule.rareBelow)) return 'rare';
  return 'possible';
}

export function forward(lesion: readonly AnyRegion[], timepoint: Timepoint, options: ForwardOptions = {}): Findings {
  const kb = options.kb ?? KB;
  const map = mapLesion(lesion.filter(isCord), kb);
  const pmap = mapPlexus(lesion.filter(isPlexus));
  const bmap = mapBrain(kb, lesion.filter(isBrain));


  const sensory = {} as Record<Side, Record<SensoryModality, Record<Segment, SensoryState>>>;
  const motor = {} as Record<Side, Record<Segment, MotorFinding>>;
  const reflexes = {} as Record<Side, Record<Reflex, ReflexState>>;
  for (const x of SIDES) {
    sensory[x] = {} as Record<SensoryModality, Record<Segment, SensoryState>>;
    for (const m of SENSORY_MODALITIES) {
      const column = {} as Record<Segment, SensoryState>;
      SEGMENTS.forEach((seg, k) => {
        column[seg] = sensoryFor(map, bmap, kb, x, m, k);
      });
      applyOverlap(column, kb);
      sensory[x][m] = column;
    }
    motor[x] = {} as Record<Segment, MotorFinding>;
    SEGMENTS.forEach((seg, k) => {
      motor[x][seg] = motorFor(map, bmap, kb, timepoint, x, k);
    });
    reflexes[x] = {} as Record<Reflex, ReflexState>;
    for (const r of REFLEXES) reflexes[x][r] = limbReflex(kb, pmap, x, r, reflexFor(map, bmap, kb, timepoint, x, r));
  }

  const lowerLimb = kb.regions[kb.observations.romberg.region].span;
  const legs = range(idx(lowerLimb[0]), idx(lowerLimb[1]));
  const legSense = SIDES.some((x) =>
    legs.some((k) => {
      const seg = SEGMENTS[k];
      return seg !== undefined && ['lost', 'impaired'].includes(sensory[x].posterior_column[seg]);
    }),
  );
  const weakLegs = SIDES.some((x) =>
    legs.some((k) => {
      const seg = SEGMENTS[k];
      return seg !== undefined && motor[x][seg].lesion !== 'none';
    }),
  );
  // S67: vestibular dysfunction can make the test positive, and cerebellar ataxia makes a
  // patient unsteady with the eyes open, so either leaves the test unreadable.
  const brain = brainFindings(kb, bmap);
  const unreadable =
    kb.observations.romberg.unreadableWithVertigoOrAtaxia &&
    (brain.vertigo !== 'absent' || SIDES.some((x) => brain.ataxia[x] !== 'absent'));
  const romberg: SignState = unreadable
    ? 'indeterminate'
    : !legSense
      ? 'absent'
      : kb.observations.romberg.untestableWithWeakLegs && weakLegs
        ? 'indeterminate'
        : 'present';

  const arms = kb.observations.armPredominance;
  const armPredominant = map.segments.some(
    (k) =>
      within(k, kb.regions[arms.region].span) &&
      SIDES.some((x) => map.damage(arms.compartment, x, k) === 1 && map.centralPartial(arms.compartment, x, k)),
  );

  const sacral = kb.regions[kb.observations.sacralSparing.region].span;
  const justAbove = SEGMENTS[idx(sacral[0]) - 1];
  const sacralIntact = SIDES.every((x) =>
    range(idx(sacral[0]), idx(sacral[1])).every((k) => {
      const seg = SEGMENTS[k];
      return seg !== undefined && sensory[x].pain_temperature[seg] === 'intact';
    }),
  );
  const affectedJustAbove =
    justAbove !== undefined &&
    SIDES.some((x) => ['lost', 'impaired'].includes(sensory[x].pain_temperature[justAbove]));

  const limb = limbFindings(kb, pmap, {
    motor: (x, s) => motor[x][s].lesion,
    sensory: (x, m, s) => sensory[x][m][s],
  }, SIDES);

  return {
    ...limb,
    ...brain,
    resolvedSegments: map.segments.map((k) => SEGMENTS[k]).filter((s): s is Segment => s !== undefined),
    sensory,
    motor,
    reflexes,
    babinski: { L: babinskiFor(map, bmap, kb, timepoint, 'L'), R: babinskiFor(map, bmap, kb, timepoint, 'R') },
    horner: { L: hornerFor(map, bmap, kb, 'L'), R: hornerFor(map, bmap, kb, 'R') },
    romberg,
    bladder: bladderFor(map, kb, timepoint),
    neurogenicShock: neurogenicShockFor(map, kb, timepoint),
    dysreflexia: dysreflexiaFor(map, kb, timepoint),
    qualifiers: {
      upper_limb_predominant_weakness: armPredominant,
      sacral_sparing: sacralIntact && affectedJustAbove,
    },
  };
}
