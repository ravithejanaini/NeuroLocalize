// Above the cord: the long tracts' continuation, the face, the cranial nerves, ataxia and
// vertigo (D39–D43). Every route is a list of parts read from the knowledge base; a finding
// is the worst damage along it, exactly as in the cord.
import type { BrainRoute, BrainStep, Kb, Laterality, Span } from '../kb/types.ts';
import {
  BODY_REGIONS,
  BRAIN_LEVELS,
  CRANIAL_SIGNS,
  LANGUAGE_SIGNS,
  DORSAL_MIDBRAIN_SIGNS,
  SEGMENTS,
  SIDES,
  type BodyRegion,
  type BrainCompartment,
  type BrainLevel,
  type CranialSign,
  type FaceWeakness,
  type LanguageSign,
  type DorsalMidbrainSign,
  type Segment,
  type SensoryModality,
  type SensoryState,
  type Severity,
  type Side,
  type SignState,
} from '../kb/vocab.ts';
import type { Damage } from './lesion.ts';

export type BrainRegion = {
  readonly brain: BrainLevel;
  readonly sides: readonly Side[];
  readonly compartments: readonly BrainCompartment[];
  readonly regions?: readonly BodyRegion[];
  readonly severity: Severity;
};

export type BrainMap = {
  damage(level: BrainLevel, compartment: BrainCompartment, side: Side, region: BodyRegion): Damage;
  readonly empty: boolean;
};

const other = (s: Side): Side => (s === 'L' ? 'R' : 'L');
const worst = (ds: readonly Damage[]): Damage => ds.reduce<Damage>((m, d) => (d > m ? d : m), 0);

const checked = new WeakSet<Kb>();

/**
 * Refuses a knowledge base whose routes or territories name a part at a level that does not
 * hold it, or whose body regions overlap or leave a segment out (D46).
 */
export function validateBrain(kb: Kb): void {
  if (checked.has(kb)) return;
  const b = kb.brain;
  const holds = (level: BrainLevel, c: BrainCompartment): boolean => b.partsAt.parts[level].includes(c);
  const routes: (readonly BrainStep[])[] = [
    b.corticospinal.steps,
    b.lemniscal.steps,
    b.spinothalamic.steps,
    b.faceNucleus.steps,
    b.faceAscending.steps,
    b.corticobulbarFace.steps,
    b.corticobulbarTongue.steps,
    b.corticobulbarPalate.steps,
    b.facialNucleus.steps,
    b.hypoglossal.steps,
    b.ambiguus.steps,
    b.oculomotor.steps,
    b.abduction.steps,
    b.gaze.steps,
    b.adduction.steps,
    b.adductionGaze.steps,
    b.abductingNystagmus.steps,
    b.ptosis.steps,
    b.ptosisNuclear.steps,
    b.elevation.steps,
    b.elevationCrossed.steps,
    b.hearing.steps,
    b.ballismus.steps,
    b.trochlear.steps,
    b.jaw.steps,
    b.upgaze.steps,
    b.lightNear.steps,
    b.convergenceRetraction.steps,
    b.sympathetic.steps,
    b.ataxia.steps,
    b.vertigo.steps,
    b.truncalAtaxia.steps,
    b.truncalAfterHemisphere.steps,
    b.fluency.steps,
    b.comprehension.steps,
    b.repetition.steps,
    b.neglect.steps,
  ];
  for (const steps of routes) {
    if (steps.length === 0) throw new Error('a brain route has no steps');
    for (const s of steps) if (!holds(s.level, s.compartment)) throw new Error(`no ${s.compartment} in the ${s.level}`);
  }
  for (const [name, t] of Object.entries(b.territories)) {
    if (t.compartments.length === 0) throw new Error(`territory ${name} takes nothing`);
    for (const c of t.compartments) if (!holds(t.level, c)) throw new Error(`territory ${name}: no ${c} in the ${t.level}`);
    for (const v of t.vision ?? []) if (!(v in kb.vision.parts)) throw new Error(`territory ${name}: no visual part ${v}`);
    for (const a of t.also ?? []) {
      if (a.compartments.length === 0) throw new Error(`territory ${name} takes nothing in the ${a.level}`);
      for (const c of a.compartments) if (!holds(a.level, c)) throw new Error(`territory ${name}: no ${c} in the ${a.level}`);
    }
  }
  for (const c of b.somatotopic.compartments) {
    if (!BRAIN_LEVELS.some((l) => holds(l, c))) throw new Error(`somatotopic ${c} exists nowhere`);
  }
  // Every segment in exactly one body region.
  const spans: Span[] = [b.limbRegions.arm, b.limbRegions.leg, b.axialRegions.neck, b.axialRegions.trunk];
  for (let k = 0; k < SEGMENTS.length; k++) {
    const n = spans.filter((sp) => within(k, sp)).length;
    if (n !== 1) throw new Error(`segment ${SEGMENTS[k] ?? k} lies in ${n} body regions`);
  }
  checked.add(kb);
}

export function mapBrain(kb: Kb, regions: readonly BrainRegion[]): BrainMap {
  validateBrain(kb);
  const cells = new Map<string, Damage>();
  const somatotopic = new Set<BrainCompartment>(kb.brain.somatotopic.compartments);
  for (const r of regions) {
    const d: Damage = r.severity === 'complete' ? 2 : 1;
    for (const side of r.sides) {
      for (const c of r.compartments) {
        const served = somatotopic.has(c) ? (r.regions ?? BODY_REGIONS) : BODY_REGIONS;
        for (const region of served) {
          const key = `${r.brain}|${c}|${side}|${region}`;
          cells.set(key, Math.max(cells.get(key) ?? 0, d) as Damage);
        }
      }
    }
  }
  return {
    damage: (level, compartment, side, region) => cells.get(`${level}|${compartment}|${side}|${region}`) ?? 0,
    empty: cells.size === 0,
  };
}

const idx = (s: Segment): number => SEGMENTS.indexOf(s);
const within = (k: number, [a, b]: Span): boolean => k >= idx(a) && k <= idx(b);

/** The body region a segment belongs to (D41). */
export function regionOf(kb: Kb, k: number): BodyRegion {
  const { arm, leg } = kb.brain.limbRegions;
  const { neck, trunk } = kb.brain.axialRegions;
  if (within(k, arm)) return 'arm';
  if (within(k, leg)) return 'leg';
  if (within(k, neck)) return 'neck';
  if (within(k, trunk)) return 'trunk';
  throw new Error(`segment ${SEGMENTS[k] ?? k} belongs to no body region`);
}

/** The side a part must lie on to affect side x, given which side the route serves. */
const partSide = (x: Side, serves: Laterality): Side => (serves === 'ipsilateral' ? x : other(x));

const along = (map: BrainMap, steps: readonly BrainStep[], side: Side, region: BodyRegion): Damage =>
  worst(steps.map((s) => map.damage(s.level, s.compartment, side, region)));

export const routeDamage = (map: BrainMap, route: BrainRoute, x: Side, region: BodyRegion): Damage =>
  along(map, route.steps, partSide(x, route.serves), region);

/** Damage above C1 to the signal from or to segment k on side x. */
export function brainBodyDamage(kb: Kb, map: BrainMap, kind: 'motor' | SensoryModality, x: Side, k: number): Damage {
  if (map.empty) return 0;
  const route = kind === 'motor' ? kb.brain.corticospinal : kind === 'posterior_column' ? kb.brain.lemniscal : kb.brain.spinothalamic;
  return routeDamage(map, route, x, regionOf(kb, k));
}

const STATE: Record<Damage, SensoryState> = { 0: 'intact', 1: 'impaired', 2: 'lost' };
const present = (d: Damage): SignState => (d > 0 ? 'present' : 'absent');

export type BrainFindings = {
  readonly faceSensation: Readonly<Record<Side, SensoryState>>;
  readonly faceWeakness: Readonly<Record<Side, FaceWeakness>>;
  readonly cranial: Readonly<Record<Side, Readonly<Record<CranialSign, SignState>>>>;
  readonly ataxia: Readonly<Record<Side, SignState>>;
  /** P15: flinging involuntary movements of that side's limbs. */
  readonly hemiballismus: Readonly<Record<Side, SignState>>;
  readonly vertigo: SignState;
  /** P11: truncal ataxia, from the vermis; unsettled after a hemisphere lesion (C35). */
  readonly truncalAtaxia: SignState;
  /** P13: signs of both eyes together, from either half of the pretectum (C43). */
  readonly eyes: Readonly<Record<DorsalMidbrainSign, SignState>>;
  /** P10: each facet of language, read from the dominant hemisphere only (D68). */
  readonly language: Readonly<Record<LanguageSign, SignState>>;
  /** P10: neglect of each side of SPACE — the side opposite the damaged hemisphere. */
  readonly neglect: Readonly<Record<Side, SignState>>;
};

function faceWeakness(kb: Kb, map: BrainMap, x: Side): FaceWeakness {
  if (routeDamage(map, kb.brain.facialNucleus, x, 'face') > 0) return 'whole';
  const route = kb.brain.corticobulbarFace;
  const lower = routeDamage(map, route, x, 'face') > 0;
  if (!lower) return 'none';
  // The forehead needs both hemispheres gone when it has both (S51).
  const bothSides = SIDES.every((h) => along(map, route.steps, h, 'face') > 0);
  return kb.brain.upperFaceBilateral.bilateral && !bothSides ? 'lower' : 'whole';
}

function palate(kb: Kb, map: BrainMap, x: Side): SignState {
  if (routeDamage(map, kb.brain.ambiguus, x, 'face') > 0) return 'present';
  const { steps, bilateral } = kb.brain.corticobulbarPalate;
  const cut = SIDES.filter((h) => along(map, steps, h, 'face') > 0);
  if (!bilateral) return along(map, steps, other(x), 'face') > 0 ? 'present' : 'absent';
  if (cut.length === 2) return 'present';
  return cut.length === 1 ? 'indeterminate' : 'absent';
}

/** The lid: the fascicles droop their own side, the nucleus both sides or neither (C29). */
function lid(kb: Kb, map: BrainMap, x: Side): SignState {
  if (routeDamage(map, kb.brain.ptosis, x, 'face') > 0) return 'present';
  const { steps, bilateral } = kb.brain.ptosisNuclear;
  const cut = SIDES.filter((h) => along(map, steps, h, 'face') > 0);
  if (!bilateral) return along(map, steps, x, 'face') > 0 ? 'present' : 'absent';
  return cut.length > 0 ? 'indeterminate' : 'absent';
}

export function brainFindings(kb: Kb, map: BrainMap): BrainFindings {
  const faceSensation = {} as Record<Side, SensoryState>;
  const faceWeak = {} as Record<Side, FaceWeakness>;
  const cranial = {} as Record<Side, Record<CranialSign, SignState>>;
  const ataxia = {} as Record<Side, SignState>;
  const hemiballismus = {} as Record<Side, SignState>;
  const b = kb.brain;
  for (const x of SIDES) {
    faceSensation[x] = STATE[worst([routeDamage(map, b.faceNucleus, x, 'face'), routeDamage(map, b.faceAscending, x, 'face')])];
    faceWeak[x] = faceWeakness(kb, map, x);
    const signs = {} as Record<CranialSign, SignState>;
    for (const sign of CRANIAL_SIGNS) {
      switch (sign) {
        case 'oculomotor_palsy':
          signs[sign] = present(routeDamage(map, b.oculomotor, x, 'face'));
          break;
        case 'abduction_weakness':
          signs[sign] = present(routeDamage(map, b.abduction, x, 'face'));
          break;
        case 'gaze_palsy':
          signs[sign] = present(routeDamage(map, b.gaze, x, 'face'));
          break;
        case 'tongue_weakness':
          signs[sign] = present(worst([routeDamage(map, b.hypoglossal, x, 'face'), routeDamage(map, b.corticobulbarTongue, x, 'face')]));
          break;
        case 'palate_weakness':
          signs[sign] = palate(kb, map, x);
          break;
        case 'adduction_weakness':
          signs[sign] = present(worst([routeDamage(map, b.adduction, x, 'face'), routeDamage(map, b.adductionGaze, x, 'face')]));
          break;
        case 'abducting_nystagmus':
          signs[sign] = present(routeDamage(map, b.abductingNystagmus, x, 'face'));
          break;
        case 'ptosis':
          signs[sign] = lid(kb, map, x);
          break;
        case 'hearing_loss':
          signs[sign] = present(routeDamage(map, b.hearing, x, 'face'));
          break;
        case 'superior_oblique_weakness':
          signs[sign] = present(routeDamage(map, b.trochlear, x, 'face'));
          break;
        case 'jaw_deviation':
          signs[sign] = present(routeDamage(map, b.jaw, x, 'face'));
          break;
        case 'elevation_weakness':
          signs[sign] = present(worst([routeDamage(map, b.elevation, x, 'face'), routeDamage(map, b.elevationCrossed, x, 'face')]));
          break;
      }
    }
    cranial[x] = signs;
    ataxia[x] = present(routeDamage(map, b.ataxia, x, 'face'));
    hemiballismus[x] = present(routeDamage(map, b.ballismus, x, 'face'));
  }
  const vertigo = present(worst(SIDES.map((h) => along(map, b.vertigo.steps, h, 'face'))));
  // The vermis is midline: a lesion of either half gives truncal ataxia (S109, S110).
  const trunkHit = SIDES.some((h) => along(map, b.truncalAtaxia.steps, h, 'face') > 0);
  const hemisphereHit = SIDES.some((h) => along(map, b.truncalAfterHemisphere.steps, h, 'face') > 0);
  const truncalAtaxia: SignState = trunkHit ? 'present' : hemisphereHit ? b.truncalAfterHemisphere.state : 'absent';
  // The dorsal midbrain is compressed from the midline; either half is enough (C43).
  const eyeRoute: Record<DorsalMidbrainSign, readonly BrainStep[]> = {
    upgaze_palsy: b.upgaze.steps,
    light_near_dissociation: b.lightNear.steps,
    convergence_retraction_nystagmus: b.convergenceRetraction.steps,
  };
  const eyes = {} as Record<DorsalMidbrainSign, SignState>;
  for (const sign of DORSAL_MIDBRAIN_SIGNS) eyes[sign] = present(worst(SIDES.map((h) => along(map, eyeRoute[sign], h, 'face'))));
  // Language is read from the dominant hemisphere alone (D68). The parts are not somatotopic,
  // so every body region carries the same damage and 'face' is only the key it is read by.
  const dominant = b.dominance.language;
  const facet: Record<LanguageSign, readonly BrainStep[]> = {
    nonfluent_speech: b.fluency.steps,
    impaired_comprehension: b.comprehension.steps,
    impaired_repetition: b.repetition.steps,
  };
  const language = {} as Record<LanguageSign, SignState>;
  for (const sign of LANGUAGE_SIGNS) language[sign] = present(along(map, facet[sign], dominant, 'face'));
  // Neglect of side x of space comes from the hemisphere opposite; from the dominant one it
  // is rarer, and the knowledge base says what to report (C32).
  const neglect = {} as Record<Side, SignState>;
  for (const x of SIDES) {
    const h = other(x);
    neglect[x] = along(map, b.neglect.steps, h, 'face') === 0 ? 'absent' : h === dominant ? b.neglect.afterDominant : 'present';
  }
  return { faceSensation, faceWeakness: faceWeak, cranial, ataxia, hemiballismus, vertigo, truncalAtaxia, eyes, language, neglect };
}

/** The ipsilateral oculosympathetic pathway in the brainstem (S16). */
export const brainHorner = (kb: Kb, map: BrainMap, x: Side): boolean => routeDamage(map, kb.brain.sympathetic, x, 'face') > 0;
