// The brachial plexus and arm as 3D polylines. Every fibre path is built from the engine's
// own route (limbRoute), so a pulse travels exactly the trunk, cord and nerve places the
// engine judges, and stops at the one it says is cut (D18, D27).
import { CORD_SITE, limbRoute, TRUNK_SITE, type LimbRoute, type PlexusMap } from '../engine/limb.ts';
import type { Kb, LimbPoint, RenderKb, Supply } from '../kb/types.ts';
import {
  MUSCLES,
  NERVES,
  PLEXUS_CORDS,
  SEGMENTS,
  SKIN_AREAS,
  TRUNKS,
  VERTEBRAE,
  type Muscle,
  type Nerve,
  type PlexusCord,
  type PlexusSite,
  type Segment,
  type Side,
  type SkinArea,
  type Trunk,
} from '../kb/vocab.ts';
import { radiusAt, type Vec3 } from './paths.ts';

export type Target = Muscle | SkinArea;
export const TARGETS: readonly Target[] = [...MUSCLES, ...SKIN_AREAS];

const idx = (s: Segment): number => SEGMENTS.indexOf(s);
export const mirror = (p: LimbPoint, side: Side): Vec3 => ({ x: side === 'L' ? p[0] : -p[0], y: p[1], z: p[2] });

// ── where roots leave the column ─────────────────────────────────────────

/** Widest drawn cord radius: the roots leave just outside it. */
export const maxCordRadius = (render: RenderKb): number => Math.max(...SEGMENTS.map((_, k) => radiusAt(render, k)));

/**
 * The vertebral level at which root k leaves: C1–C7 above the same-numbered vertebra, C8
 * below C7 (S26), and caudally below the same-numbered vertebra. Schematic below L5.
 */
export function rootExitLevel(k: number): number {
  const seg = SEGMENTS[k] ?? '';
  if (seg.startsWith('C')) return Math.min(k, 6) + (k === 7 ? 1 : 0);
  const v = (VERTEBRAE as readonly string[]).indexOf(seg);
  return v >= 0 ? v + 1 : VERTEBRAE.length + 0.5 + (k - idx('S1')) * 0.45;
}

export const rootExit = (render: RenderKb, k: number, side: Side): Vec3 => ({
  x: (side === 'L' ? -1 : 1) * (maxCordRadius(render) + 0.35),
  y: -rootExitLevel(k),
  z: -0.1,
});

// ── one fibre's path ─────────────────────────────────────────────────────

export type LimbPath = {
  /** From the root's exit to the muscle or patch of skin, in the motor direction. */
  readonly points: readonly Vec3[];
  /** Where on `points` each lesion place along this route is drawn. */
  readonly sitePoint: ReadonlyMap<PlexusSite, number>;
  readonly route: LimbRoute;
  readonly target: Target;
};

const supplyOf = (kb: Kb, target: Target): readonly Supply[] =>
  (MUSCLES as readonly string[]).includes(target)
    ? [kb.plexus.muscles[target as Muscle].supply]
    : kb.plexus.skin[target as SkinArea].supply;

/** Every nerve that serves a target, as the knowledge base lists them. */
export const suppliesOf = supplyOf;

export function limbPath(kb: Kb, render: RenderKb, supply: Supply, root: Segment, target: Target, side: Side): LimbPath | null {
  const route = limbRoute(kb, supply, root);
  if (!route) return null;
  const layout = render.limb;
  const at = (p: LimbPoint): Vec3 => mirror(p, side);
  const points: Vec3[] = [rootExit(render, idx(root), side)];
  const sitePoint = new Map<PlexusSite, number>();

  if (!route.fromRoots) {
    const trunk = layout.trunks[route.trunk];
    const origin = kb.plexus.nerves[supply.nerve].origin;
    const [t0, t1, t2] = trunk;
    if (!t0 || !t1 || !t2) throw new Error(`the ${route.trunk} trunk needs three points`);
    points.push(at(t0));
    sitePoint.set(TRUNK_SITE[route.trunk], points.length);
    points.push(at(t1));
    if (origin.from === 'cords' && route.cord) {
      points.push(at(t2));
      const [c0, c1, c2] = layout.cords[route.cord];
      if (!c0 || !c1 || !c2) throw new Error(`the ${route.cord} cord needs three points`);
      points.push(at(c0));
      sitePoint.set(CORD_SITE[route.cord], points.length);
      points.push(at(c1), at(c2));
    }
  }

  for (const w of layout.nerves[supply.nerve]) {
    points.push(at(w.at));
    if (w.site) sitePoint.set(w.site, points.length - 1);
    if (w.branches?.includes(target)) break;
  }
  points.push(at(layout.targets[target]));
  return { points, sitePoint, route, target };
}

/** The first place on this path that the lesion cuts completely, and whether any place weakens it. */
export function limbFate(pmap: PlexusMap, path: LimbPath, side: Side): { readonly diesAt: number; readonly dimmed: boolean } {
  let dimmed = false;
  const order = [...path.sitePoint.entries()].sort((a, b) => a[1] - b[1]);
  for (const [site, point] of order) {
    const d = pmap.damage(site, side);
    if (d === 2) return { diesAt: point, dimmed };
    if (d === 1) dimmed = true;
  }
  return { diesAt: -1, dimmed };
}

// ── the static plexus ────────────────────────────────────────────────────

export type Strand = {
  readonly kind: 'root' | 'trunk' | 'division' | 'cord' | 'nerve' | 'branch';
  readonly name: string;
  readonly points: readonly Vec3[];
  /** For a division: which kind it is. */
  readonly division?: 'anterior' | 'posterior';
};

export function trunkOfRoot(kb: Kb, k: number): Trunk | null {
  const entry = TRUNKS.find((t) => {
    const [a, b] = kb.plexus.trunks.roots[t];
    return k >= idx(a) && k <= idx(b);
  });
  return entry ?? null;
}

const nerveStart = (kb: Kb, render: RenderKb, nerve: Nerve, side: Side): Vec3[] => {
  const layout = render.limb;
  const origin = kb.plexus.nerves[nerve].origin;
  if (origin.from === 'roots') return [];
  if (origin.from === 'trunk') {
    const p = layout.trunks[origin.trunk][1];
    return p ? [mirror(p, side)] : [];
  }
  return origin.cords.flatMap((c) => {
    const end = layout.cords[c][layout.cords[c].length - 1];
    return end ? [mirror(end, side)] : [];
  });
};

/** The whole plexus on one side, as strands to draw. */
export function plexusStrands(kb: Kb, render: RenderKb, side: Side): Strand[] {
  const layout = render.limb;
  const out: Strand[] = [];
  const at = (p: LimbPoint): Vec3 => mirror(p, side);
  const [from, to] = kb.plexus.trunks.plexusRoots;

  for (let k = idx(from); k <= idx(to); k++) {
    const trunk = trunkOfRoot(kb, k);
    const start = trunk ? layout.trunks[trunk][0] : undefined;
    if (start) out.push({ kind: 'root', name: SEGMENTS[k] ?? '', points: [rootExit(render, k, side), at(start)] });
  }
  for (const t of TRUNKS) out.push({ kind: 'trunk', name: t, points: layout.trunks[t].map(at) });

  for (const c of PLEXUS_CORDS) {
    const division = render.divisions.ofCord[c];
    const cordStart = layout.cords[c][0];
    for (const t of kb.plexus.cords.formedBy[c]) {
      const trunkEnd = layout.trunks[t][layout.trunks[t].length - 1];
      if (!cordStart || !trunkEnd) continue;
      const a = at(trunkEnd);
      const b = at(cordStart);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: division === 'anterior' ? -0.2 : 0.2 };
      out.push({ kind: 'division', name: `${t} ${division}`, points: [a, mid, b], division });
    }
    out.push({ kind: 'cord', name: c, points: layout.cords[c].map(at) });
  }

  for (const n of NERVES) {
    const waypoints = layout.nerves[n];
    const body = waypoints.map((w) => at(w.at));
    const first = body[0];
    const starts = kb.plexus.nerves[n].origin.from === 'roots' ? rootStartsFor(kb, render, n, side) : nerveStart(kb, render, n, side);
    for (const s of starts) if (first) out.push({ kind: 'nerve', name: n, points: [s, first] });
    if (body.length > 1) out.push({ kind: 'nerve', name: n, points: body });
    for (const w of waypoints) {
      for (const target of w.branches ?? []) out.push({ kind: 'branch', name: target, points: [at(w.at), at(layout.targets[target])] });
    }
  }
  return out;
}

/** Nerves that leave the roots join every root their muscle may draw on (D29, D28). */
function rootStartsFor(kb: Kb, render: RenderKb, nerve: Nerve, side: Side): Vec3[] {
  const roots = new Set<number>();
  for (const m of MUSCLES) {
    const row = kb.plexus.muscles[m];
    if (row.supply.nerve !== nerve) continue;
    for (const span of [row.roots, row.disputedRoots]) {
      if (!span) continue;
      for (let k = idx(span[0]); k <= idx(span[1]); k++) roots.add(k);
    }
  }
  return [...roots].sort((a, b) => a - b).map((k) => rootExit(render, k, side));
}

/** Where a lesion at this place is drawn. */
export function siteAnchor(render: RenderKb, site: PlexusSite, side: Side): Vec3 {
  const layout = render.limb;
  const trunk = TRUNKS.find((t) => site === `${t}_trunk`);
  if (trunk) return mirror(layout.trunks[trunk][1] ?? [0, 0, 0], side);
  const cord = PLEXUS_CORDS.find((c: PlexusCord) => site === `${c}_cord`);
  if (cord) return mirror(layout.cords[cord][1] ?? [0, 0, 0], side);
  for (const n of NERVES) {
    const w = layout.nerves[n].find((x) => x.site === site);
    if (w) return mirror(w.at, side);
  }
  throw new Error(`no drawn position for ${site}`);
}
