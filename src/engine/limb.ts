// The upper limb: routes from a root through the brachial plexus to a muscle or a patch of
// skin, and the states those routes leave (D27–D33). The cord and the roots are judged by
// forward(); this file adds what lies beyond the roots and reads the cord's verdict at
// each root it needs.
import type { Kb, Span, Supply } from '../kb/types.ts';
import {
  MUSCLES,
  SEGMENTS,
  SENSORY_MODALITIES,
  SKIN_AREAS,
  type Muscle,
  type MuscleState,
  type Nerve,
  type PlexusCord,
  type PlexusSite,
  type Reflex,
  type ReflexState,
  type Segment,
  type SensoryModality,
  type SensoryState,
  type Severity,
  type Side,
  type SkinArea,
  type Trunk,
} from '../kb/vocab.ts';
import type { Damage } from './lesion.ts';

/** A lesion beyond the roots. */
export type PlexusRegion = {
  readonly plexus: PlexusSite;
  readonly sides: readonly Side[];
  readonly severity: Severity;
};

export const TRUNK_SITE: Readonly<Record<Trunk, PlexusSite>> = { upper: 'upper_trunk', middle: 'middle_trunk', lower: 'lower_trunk' };
export const CORD_SITE: Readonly<Record<PlexusCord, PlexusSite>> = {
  lateral: 'lateral_cord',
  posterior: 'posterior_cord',
  medial: 'medial_cord',
};

export type PlexusMap = {
  damage(site: PlexusSite, side: Side): Damage;
  readonly empty: boolean;
};

export function mapPlexus(regions: readonly PlexusRegion[]): PlexusMap {
  const cells = new Map<string, Damage>();
  for (const r of regions) {
    const d: Damage = r.severity === 'complete' ? 2 : 1;
    for (const side of r.sides) {
      const key = `${r.plexus}|${side}`;
      cells.set(key, Math.max(cells.get(key) ?? 0, d) as Damage);
    }
  }
  return { damage: (site, side) => cells.get(`${site}|${side}`) ?? 0, empty: cells.size === 0 };
}

const idx = (s: Segment): number => SEGMENTS.indexOf(s);
const spanSegments = (span: Span | null | undefined): Segment[] =>
  span ? SEGMENTS.slice(idx(span[0]), idx(span[1]) + 1) : [];

/** The path one root's fibres take to a branch. Null when that root cannot reach it. */
export type LimbRoute = {
  readonly root: Segment;
  readonly trunk: Trunk;
  /** Null for a nerve that leaves before the cords form. */
  readonly cord: PlexusCord | null;
  readonly nerve: Nerve;
  /** The nerve's lesion places the fibre passes before its branch leaves. */
  readonly sites: readonly PlexusSite[];
  /** True when the nerve leaves the roots before the trunk forms. */
  readonly fromRoots: boolean;
};

/**
 * The trunk a root forms. Refuses a knowledge base whose trunks do not divide the plexus
 * roots exactly between them — overlapping, missing or stray roots.
 */
export function trunkOf(kb: Kb, root: Segment): Trunk | null {
  const { plexusRoots, roots } = kb.plexus.trunks;
  const owned = Object.values(roots).flatMap((span) => spanSegments(span));
  const plexus = spanSegments(plexusRoots);
  if (owned.length !== plexus.length || plexus.some((s) => owned.filter((o) => o === s).length !== 1)) {
    throw new Error('the trunks must divide the plexus roots exactly between them');
  }
  const k = idx(root);
  const entry = Object.entries(roots).find(([, [a, b]]) => k >= idx(a) && k <= idx(b));
  return entry ? (entry[0] as Trunk) : null;
}

export function limbRoute(kb: Kb, supply: Supply, root: Segment): LimbRoute | null {
  const nerve = kb.plexus.nerves[supply.nerve];
  if (!Number.isInteger(supply.after) || supply.after < 0 || supply.after > nerve.sites.length) {
    throw new Error(`a ${supply.nerve} branch cannot leave after place ${supply.after}: the nerve has ${nerve.sites.length}`);
  }
  const trunk = trunkOf(kb, root);
  if (!trunk) return null;
  const sites = nerve.sites.slice(0, supply.after);
  const origin = nerve.origin;
  if (origin.from === 'roots') return { root, trunk, cord: null, nerve: supply.nerve, sites, fromRoots: true };
  if (origin.from === 'trunk') {
    return origin.trunk === trunk ? { root, trunk, cord: null, nerve: supply.nerve, sites, fromRoots: false } : null;
  }
  const cord = origin.cords.find((c) => kb.plexus.cords.formedBy[c].includes(trunk));
  if (!cord) return null;
  return { root, trunk, cord, nerve: supply.nerve, sites, fromRoots: false };
}

/** The lesion places on a route beyond its root, proximal first. */
export function routeSites(route: LimbRoute): PlexusSite[] {
  if (route.fromRoots) return [...route.sites];
  return [TRUNK_SITE[route.trunk], ...(route.cord ? [CORD_SITE[route.cord]] : []), ...route.sites];
}

export const routeDamage = (pmap: PlexusMap, route: LimbRoute, side: Side): Damage =>
  routeSites(route).reduce<Damage>((m, s) => Math.max(m, pmap.damage(s, side)) as Damage, 0);

function requireRoute(kb: Kb, supply: Supply, root: Segment, what: string): LimbRoute {
  const r = limbRoute(kb, supply, root);
  if (!r) throw new Error(`${what}: no route from ${root} to the ${supply.nerve} nerve`);
  return r;
}

// ── the verdicts ─────────────────────────────────────────────────────────

/** What forward() already knows about the cord and roots, at each segment. */
export type CordView = {
  motorHit(side: Side, s: Segment): boolean;
  sensory(side: Side, m: SensoryModality, s: Segment): SensoryState;
};

export function muscleState(kb: Kb, pmap: PlexusMap, cord: CordView, side: Side, muscle: Muscle): MuscleState {
  const row = kb.plexus.muscles[muscle];
  const hit = (root: Segment, route: LimbRoute | null): boolean =>
    cord.motorHit(side, root) || (route !== null && routeDamage(pmap, route, side) > 0);
  const definite = spanSegments(row.roots).some((r) => hit(r, requireRoute(kb, row.supply, r, muscle)));
  if (definite) return 'weak';
  const disputed = spanSegments(row.disputedRoots).some((r) => hit(r, limbRoute(kb, row.supply, r)));
  return disputed ? 'indeterminate' : 'normal';
}

const LEVEL: Record<Exclude<SensoryState, 'indeterminate'>, Damage> = { intact: 0, impaired: 1, lost: 2 };

export function skinState(kb: Kb, pmap: PlexusMap, cord: CordView, side: Side, modality: SensoryModality, area: SkinArea): SensoryState {
  const row = kb.plexus.skin[area];
  // One root's contribution: its own segmental state, and every nerve that carries it here.
  const perRoot = (root: Segment, required: boolean): Damage | 'open' => {
    const routes = row.supply
      .map((s) => (required ? requireRoute(kb, s, root, area) : limbRoute(kb, s, root)))
      .filter((r): r is LimbRoute => r !== null);
    const ds = routes.map((r) => routeDamage(pmap, r, side));
    const nerves: Damage = ds.length > 0 && ds.every((d) => d === 2) ? 2 : ds.some((d) => d > 0) ? 1 : 0;
    const own = cord.sensory(side, modality, root);
    if (own === 'indeterminate') return nerves > 0 ? nerves : 'open';
    return Math.max(nerves, LEVEL[own]) as Damage;
  };

  const definite = spanSegments(row.roots).map((r) => perRoot(r, true));
  const disputed = spanSegments(row.disputedRoots).map((r) => perRoot(r, false));
  if (definite.length > 0) {
    if (definite.every((d) => d === 2)) return 'lost';
    if (definite.some((d) => d !== 'open' && d > 0)) return 'impaired';
    if (definite.includes('open')) return 'indeterminate';
    return disputed.some((d) => d !== 0) ? 'indeterminate' : 'intact';
  }
  // No roots given: only when every root that could serve the patch is cut is it certainly lost.
  if (disputed.length > 0 && disputed.every((d) => d === 2)) return 'lost';
  return disputed.some((d) => d !== 0) ? 'indeterminate' : 'intact';
}

/** A reflex judged by the cord, then by the nerve that carries its arc beyond the roots. */
export function limbReflex(kb: Kb, pmap: PlexusMap, side: Side, reflex: Reflex, cordState: ReflexState): ReflexState {
  const muscle = kb.plexus.reflexMuscles.muscles[reflex];
  if (!muscle || pmap.empty) return cordState;
  const supply = kb.plexus.muscles[muscle].supply;
  const roots = spanSegments(kb.reflexes[reflex].span);
  const ds = roots.map((r) => {
    const route = limbRoute(kb, supply, r);
    return route ? routeDamage(pmap, route, side) : 0;
  });
  if (ds.every((d) => d === 0)) return cordState;
  if (ds.every((d) => d === 2)) return 'absent';
  if (cordState === 'normal') return 'reduced';
  if (cordState === 'reduced' || cordState === 'absent') return cordState;
  return 'indeterminate';
}

export type LimbFindings = {
  readonly muscles: Readonly<Record<Side, Readonly<Record<Muscle, MuscleState>>>>;
  readonly skin: Readonly<Record<Side, Readonly<Record<SensoryModality, Readonly<Record<SkinArea, SensoryState>>>>>>;
};

export function limbFindings(kb: Kb, pmap: PlexusMap, cord: CordView, sides: readonly Side[]): LimbFindings {
  const muscles = {} as Record<Side, Record<Muscle, MuscleState>>;
  const skin = {} as Record<Side, Record<SensoryModality, Record<SkinArea, SensoryState>>>;
  for (const x of sides) {
    muscles[x] = {} as Record<Muscle, MuscleState>;
    for (const m of MUSCLES) muscles[x][m] = muscleState(kb, pmap, cord, x, m);
    skin[x] = {} as Record<SensoryModality, Record<SkinArea, SensoryState>>;
    for (const mod of SENSORY_MODALITIES) {
      skin[x][mod] = {} as Record<SkinArea, SensoryState>;
      for (const a of SKIN_AREAS) skin[x][mod][a] = skinState(kb, pmap, cord, x, mod, a);
    }
  }
  return { muscles, skin };
}
