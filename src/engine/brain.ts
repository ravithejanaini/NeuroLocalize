// Above the cord: the long tracts' continuation, the face, the cranial nerves, ataxia and
// vertigo (D39–D43). Every route is a list of parts read from the knowledge base; a finding
// is the worst damage along it, exactly as in the cord.
import type { BrainRoute, BrainStep, Kb, Laterality, Span } from '../kb/types.ts';
import {
  BODY_REGIONS,
  CRANIAL_SIGNS,
  SEGMENTS,
  SIDES,
  type BodyRegion,
  type BrainCompartment,
  type BrainLevel,
  type CranialSign,
  type FaceWeakness,
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

export function mapBrain(kb: Kb, regions: readonly BrainRegion[]): BrainMap {
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
  readonly vertigo: SignState;
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

export function brainFindings(kb: Kb, map: BrainMap): BrainFindings {
  const faceSensation = {} as Record<Side, SensoryState>;
  const faceWeak = {} as Record<Side, FaceWeakness>;
  const cranial = {} as Record<Side, Record<CranialSign, SignState>>;
  const ataxia = {} as Record<Side, SignState>;
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
      }
    }
    cranial[x] = signs;
    ataxia[x] = present(routeDamage(map, b.ataxia, x, 'face'));
  }
  const vertigo = present(worst(SIDES.map((h) => along(map, b.vertigo.steps, h, 'face'))));
  return { faceSensation, faceWeakness: faceWeak, cranial, ataxia, vertigo };
}

/** The ipsilateral oculosympathetic pathway in the brainstem (S16). */
export const brainHorner = (kb: Kb, map: BrainMap, x: Side): boolean => routeDamage(map, kb.brain.sympathetic, x, 'face') > 0;
