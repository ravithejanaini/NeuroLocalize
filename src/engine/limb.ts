// The limbs: routes from a root through the brachial or lumbosacral plexus to a muscle or a
// patch of skin, and the states those routes leave (D27–D33, P7). The cord and the roots are judged by
// forward(); this file adds what lies beyond the roots and reads the cord's verdict at
// each root it needs.
import type { Kb, Span, Supply } from '../kb/types.ts';
import {
  DEFORMITIES,
  MUSCLES,
  SEGMENTS,
  SENSORY_MODALITIES,
  SKIN_AREAS,
  type Deformity,
  type LegPlexusPart,
  type MotorLesion,
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
  type SignState,
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
  /** The brachial trunk the root forms; null in the leg. */
  readonly trunk: Trunk | null;
  /** Null for a nerve that leaves before the cords form, and in the leg. */
  readonly cord: PlexusCord | null;
  /** The part of the lumbosacral plexus the route leaves from; null in the arm (P7). */
  readonly part: LegPlexusPart | null;
  /** Nerves passed before this one, each with all of its places: the sciatic before its divisions (P7). */
  readonly parents: readonly { readonly nerve: Nerve; readonly sites: readonly PlexusSite[] }[];
  readonly nerve: Nerve;
  /** The nerve's lesion places the fibre passes before its branch leaves. */
  readonly sites: readonly PlexusSite[];
  /** True when the nerve leaves the brachial roots before the trunk forms. */
  readonly fromRoots: boolean;
};

export const PART_SITE: Readonly<Record<LegPlexusPart, PlexusSite>> = { lumbar: 'lumbar_plexus', sacral: 'sacral_plexus' };

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

/** Whether a root joins a part of the lumbosacral plexus. Parts may share a root (C19). */
export function inPart(kb: Kb, part: LegPlexusPart, root: Segment): boolean {
  const [a, b] = kb.plexus.legParts.roots[part];
  if (idx(a) > idx(b)) throw new Error(`the ${part} plexus runs backwards`);
  return idx(root) >= idx(a) && idx(root) <= idx(b);
}

export function limbRoute(kb: Kb, supply: Supply, root: Segment, through: readonly Nerve[] = []): LimbRoute | null {
  const nerve = kb.plexus.nerves[supply.nerve];
  if (!Number.isInteger(supply.after) || supply.after < 0 || supply.after > nerve.sites.length) {
    throw new Error(`a ${supply.nerve} branch cannot leave after place ${supply.after}: the nerve has ${nerve.sites.length}`);
  }
  const sites = nerve.sites.slice(0, supply.after);
  const origin = nerve.origin;
  const base = { root, nerve: supply.nerve, sites };
  if (origin.from === 'plexus') {
    return inPart(kb, origin.part, root) ? { ...base, trunk: null, cord: null, part: origin.part, parents: [], fromRoots: false } : null;
  }
  if (origin.from === 'nerve') {
    if (origin.nerve === supply.nerve || through.includes(origin.nerve)) throw new Error(`the ${supply.nerve} nerve cannot leave itself`);
    const parent = kb.plexus.nerves[origin.nerve];
    const up = limbRoute(kb, { nerve: origin.nerve, after: parent.sites.length }, root, [...through, supply.nerve]);
    if (!up) return null;
    return { ...base, trunk: up.trunk, cord: up.cord, part: up.part, fromRoots: up.fromRoots, parents: [...up.parents, { nerve: up.nerve, sites: up.sites }] };
  }
  const trunk = trunkOf(kb, root);
  if (!trunk) return null;
  const arm = { ...base, trunk, part: null, parents: [] };
  if (origin.from === 'roots') return { ...arm, cord: null, fromRoots: true };
  if (origin.from === 'trunk') return origin.trunk === trunk ? { ...arm, cord: null, fromRoots: false } : null;
  const cord = origin.cords.find((c) => kb.plexus.cords.formedBy[c].includes(trunk));
  if (!cord) return null;
  return { ...arm, cord, fromRoots: false };
}

/** The lesion places on a route beyond its root, proximal first. */
export function routeSites(route: LimbRoute): PlexusSite[] {
  const head = route.part
    ? [PART_SITE[route.part]]
    : route.fromRoots || !route.trunk
      ? []
      : [TRUNK_SITE[route.trunk], ...(route.cord ? [CORD_SITE[route.cord]] : [])];
  return [...head, ...route.parents.flatMap((p) => p.sites), ...route.sites];
}

export const routeDamage = (pmap: PlexusMap, route: LimbRoute, side: Side): Damage =>
  routeSites(route).reduce<Damage>((m, s) => Math.max(m, pmap.damage(s, side)) as Damage, 0);

/** Every route by which a root's fibres reach a target through its listed supplies. */
export function routesTo(kb: Kb, supplies: readonly Supply[], root: Segment, required: string | null): LimbRoute[] {
  const routes = supplies.map((s) => limbRoute(kb, s, root)).filter((r): r is LimbRoute => r !== null);
  if (required !== null && routes.length === 0) {
    throw new Error(`${required}: no route from ${root} to ${supplies.map((s) => `the ${s.nerve} nerve`).join(' or ')}`);
  }
  return routes;
}

// ── the verdicts ─────────────────────────────────────────────────────────

/** What forward() already knows about the cord and roots, at each segment. */
export type CordView = {
  motor(side: Side, s: Segment): MotorLesion;
  sensory(side: Side, m: SensoryModality, s: Segment): SensoryState;
};

/** A muscle's strength, and whether any of its weakness is of the lower motor neuron. */
export type MuscleFinding = { readonly state: MuscleState; readonly lowerMotor: boolean };

export function muscleFinding(kb: Kb, pmap: PlexusMap, cord: CordView, side: Side, muscle: Muscle): MuscleFinding {
  const row = kb.plexus.muscles[muscle];
  // One root's fibres to this muscle: untouched, cut on some of its supplies only, or lost.
  const hit = (root: Segment, routes: readonly LimbRoute[]): 'none' | 'partial' | 'upper' | 'lower' => {
    const cut = routes.filter((r) => routeDamage(pmap, r, side) > 0).length;
    if (routes.length > 0 && cut === routes.length) return 'lower';
    const m = cord.motor(side, root);
    if (m !== 'none') return m === 'umn' ? 'upper' : 'lower';
    return cut > 0 ? 'partial' : 'none';
  };
  const full = (h: string): boolean => h === 'upper' || h === 'lower';
  const definite = spanSegments(row.roots).map((r) => hit(r, routesTo(kb, row.supply, r, muscle)));
  const disputed = spanSegments(row.disputedRoots).map((r) => hit(r, routesTo(kb, row.supply, r, null)));
  const lowerMotor = [...definite, ...disputed].some((h) => h === 'lower' || h === 'partial');
  if (row.roots === null) {
    // No source gives the roots (P7): weak only when every root that could serve it is lost.
    if (disputed.length > 0 && disputed.every(full)) return { state: 'weak', lowerMotor };
    return { state: disputed.some((h) => h !== 'none') ? 'indeterminate' : 'normal', lowerMotor };
  }
  if (definite.some(full)) return { state: 'weak', lowerMotor };
  const open = definite.includes('partial') || disputed.some((h) => h !== 'none');
  return { state: open ? 'indeterminate' : 'normal', lowerMotor };
}

export const muscleState = (kb: Kb, pmap: PlexusMap, cord: CordView, side: Side, muscle: Muscle): MuscleState =>
  muscleFinding(kb, pmap, cord, side, muscle).state;

/**
 * D36: present when every listed muscle is weak from a lower-motor-neuron lesion; absent
 * when any is strong; otherwise indeterminate — including weakness of the upper motor
 * neuron, after which no source read describes these deformities.
 */
export function deformityState(kb: Kb, found: (m: Muscle) => MuscleFinding, deformity: Deformity): SignState {
  const muscles = kb.plexus.deformities[deformity].muscles.map(found);
  if (muscles.length === 0) throw new Error(`${deformity} names no muscle`);
  if (muscles.some((m) => m.state === 'normal')) return 'absent';
  return muscles.every((m) => m.state === 'weak' && m.lowerMotor) ? 'present' : 'indeterminate';
}

const LEVEL: Record<Exclude<SensoryState, 'indeterminate'>, Damage> = { intact: 0, impaired: 1, lost: 2 };

export function skinState(kb: Kb, pmap: PlexusMap, cord: CordView, side: Side, modality: SensoryModality, area: SkinArea): SensoryState {
  const row = kb.plexus.skin[area];
  // One root's contribution: its own segmental state, and every nerve that carries it here.
  const perRoot = (root: Segment, required: boolean): Damage | 'open' => {
    const routes = required
      ? row.supply.map((s) => {
          const r = limbRoute(kb, s, root);
          if (!r) throw new Error(`${area}: no route from ${root} to the ${s.nerve} nerve`);
          return r;
        })
      : row.supply.map((s) => limbRoute(kb, s, root)).filter((r): r is LimbRoute => r !== null);
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
  // P23 (D123): a reflex with no tested muscle whose arc runs through a nerve — the
  // bulbocavernosus through the pudendal. A cut there leaves a normal reflex unsettled.
  const nerve = kb.plexus.reflexNerves.nerves[reflex];
  if (!muscle && nerve && !pmap.empty) {
    const through = { nerve, after: kb.plexus.nerves[nerve].sites.length };
    const cut = spanSegments(kb.reflexes[reflex].span).some((r) => {
      const route = limbRoute(kb, through, r);
      return route !== null && routeDamage(pmap, route, side) > 0;
    });
    return cut && cordState === 'normal' ? 'indeterminate' : cordState;
  }
  if (!muscle || pmap.empty) return cordState;
  const supplies = kb.plexus.muscles[muscle].supply;
  const roots = spanSegments(kb.reflexes[reflex].span);
  // One root's arc beyond the cord: lost when every supply carrying it is cut.
  const ds = roots.map((r): Damage => {
    const d = routesTo(kb, supplies, r, null).map((route) => routeDamage(pmap, route, side));
    if (d.length === 0) return 0;
    if (d.every((x) => x === 2)) return 2;
    return d.some((x) => x > 0) ? 1 : 0;
  });
  if (ds.every((d) => d === 0)) return cordState;
  if (ds.every((d) => d === 2)) return 'absent';
  if (cordState === 'normal') return 'reduced';
  if (cordState === 'reduced' || cordState === 'absent') return cordState;
  return 'indeterminate';
}

export type LimbFindings = {
  readonly muscles: Readonly<Record<Side, Readonly<Record<Muscle, MuscleState>>>>;
  readonly deformities: Readonly<Record<Side, Readonly<Record<Deformity, SignState>>>>;
  readonly skin: Readonly<Record<Side, Readonly<Record<SensoryModality, Readonly<Record<SkinArea, SensoryState>>>>>>;
};

export function limbFindings(kb: Kb, pmap: PlexusMap, cord: CordView, sides: readonly Side[]): LimbFindings {
  const muscles = {} as Record<Side, Record<Muscle, MuscleState>>;
  const deformities = {} as Record<Side, Record<Deformity, SignState>>;
  const skin = {} as Record<Side, Record<SensoryModality, Record<SkinArea, SensoryState>>>;
  for (const x of sides) {
    const found = new Map(MUSCLES.map((m) => [m, muscleFinding(kb, pmap, cord, x, m)] as const));
    const get = (m: Muscle): MuscleFinding => found.get(m) ?? { state: 'normal', lowerMotor: false };
    muscles[x] = {} as Record<Muscle, MuscleState>;
    for (const m of MUSCLES) muscles[x][m] = get(m).state;
    deformities[x] = {} as Record<Deformity, SignState>;
    for (const d of DEFORMITIES) deformities[x][d] = deformityState(kb, get, d);
    skin[x] = {} as Record<SensoryModality, Record<SkinArea, SensoryState>>;
    for (const mod of SENSORY_MODALITIES) {
      skin[x][mod] = {} as Record<SkinArea, SensoryState>;
      for (const a of SKIN_AREAS) skin[x][mod][a] = skinState(kb, pmap, cord, x, mod, a);
    }
  }
  return { muscles, deformities, skin };
}
