// P42: every drawn nerve and pathway as something that can be walked along — its points in the
// order the signal travels, the stops along it, and where the lesion stops the signal. A walk
// adds no anatomy: its points and stops are the courses the stage already draws, and where it is
// cut is decided by the same functions that stop the pulses. Pure: no renderer, no DOM.
import type { BrainMap } from '../engine/brain.ts';
import { crossingOffsets, isSacral, type Findings, type LesionMap } from '../engine/forward.ts';
import { CORD_SITE, PART_SITE, TRUNK_SITE, type PlexusMap } from '../engine/limb.ts';
import type { VisionMap } from '../engine/vision.ts';
import { brainFate, cranialCourses, fibreFate, visionFibres } from '../geometry/brain.ts';
import { fate, motorPath, place, sensoryPath, type Path, type Vec3 } from '../geometry/paths.ts';
import { legStrands, mirror, nerveCourse, plexusStrands, siteAnchor, trunkOfRoot } from '../geometry/plexus.ts';
import { discAt } from '../geometry/section.ts';
import { sympatheticCourse, sympatheticFate } from '../geometry/sympathetic.ts';
import type { Kb, LimbPoint, RenderKb } from '../kb/types.ts';
import { ARM_NERVES, LEG_NERVES, LEG_PLEXUS_PARTS, PLEXUS_CORDS, SEGMENTS, SIDES, type Muscle, type Nerve, type PlexusSite, type Side, type SkinArea } from '../kb/vocab.ts';
import { partName, TARGET_WORD, type PartRef } from './describe.ts';
import { AREA_NAME, MUSCLE_NAME, SECTOR_NAME } from './examine.ts';

export const WALK_GROUPS = ['cranial nerves', 'visual pathway', 'sympathetic pathway', 'nerves of the arm', 'nerves of the leg', 'long tracts'] as const;
export type WalkGroup = (typeof WALK_GROUPS)[number];

/** One place worth stopping at: the point of the walk where it lies, and the part it is. */
export type WalkStop = {
  readonly point: number;
  readonly label: string;
  /** The part to describe here; absent where the walk only begins or ends. */
  readonly ref?: PartRef;
  /** A line of the walk's own about this stop — the branches drawn from it. */
  readonly note?: string;
};

/** What a walk needs to know of the lesion to say where the signal stops. */
export type WalkLesion = {
  readonly map: LesionMap;
  readonly bmap: BrainMap;
  readonly pmap: PlexusMap;
  readonly vmap: VisionMap;
  readonly fields: Findings['fields'] | null;
};

export type Walk = {
  readonly id: string;
  readonly group: WalkGroup;
  readonly name: string;
  /** Which way the walk goes, which is the way the signal travels. */
  readonly runs: string;
  readonly side: Side;
  readonly points: readonly Vec3[];
  /** In the order they are met. */
  readonly stops: readonly WalkStop[];
  /** The point at which the lesion stops the signal (-1: nowhere), and whether it arrives weakened. */
  fate(lesion: WalkLesion): { readonly diesAt: number; readonly dimmed: boolean };
};

const SIDE_WORD: Record<Side, string> = { L: 'Left', R: 'Right' };
const ordered = (stops: WalkStop[]): WalkStop[] => stops.map((s, i) => ({ s, i })).sort((a, b) => a.s.point - b.s.point || a.i - b.i).map((x) => x.s);
const stopAt = (point: number, ref: PartRef): WalkStop => ({ point, ref, label: partName(ref) });
const cortexRegion = (level: string, compartment: string): boolean => level === 'cortex' && (compartment === 'motor_cortex' || compartment === 'sensory_cortex');

const NERVE_WORD = (n: Nerve): string => (n.startsWith('nerve_') ? n.replace(/_/g, ' ') : `${n.replace(/_/g, ' ')} nerve`);
const targetWord = (t: Muscle | SkinArea): string => (t in MUSCLE_NAME ? MUSCLE_NAME[t as Muscle].muscle : `skin of the ${AREA_NAME[t as SkinArea]}`);

function cranialWalks(kb: Kb, render: RenderKb): Walk[] {
  return SIDES.flatMap((x) =>
    cranialCourses(kb, render, x)
      .filter((c) => c.points.length >= 2)
      .map((c): Walk => {
        const organ: WalkStop = stopAt(c.dir === 'motor' ? c.points.length - 1 : 0, { kind: 'organ', target: c.target, side: x });
        const parts = c.elements.map((e) =>
          stopAt(e.point, { kind: 'brain', level: e.level, compartment: e.compartment, side: e.side, ...(cortexRegion(e.level, e.compartment) ? { region: e.region } : {}) }),
        );
        return {
          id: `cranial|${x}|${c.id}`,
          group: 'cranial nerves',
          name: `${SIDE_WORD[x]} ${c.name}`,
          runs: c.dir === 'motor' ? `outward, from where it begins to the ${TARGET_WORD[c.target]}` : `inward, from the ${TARGET_WORD[c.target]} to the brain`,
          side: x,
          points: c.points,
          stops: ordered([organ, ...parts]),
          fate: ({ bmap }) => brainFate(bmap, c.elements),
        };
      }),
  );
}

function visionWalks(kb: Kb, render: RenderKb): Walk[] {
  return visionFibres(kb, render)
    .filter((f) => f.points.length >= 2)
    .map((f): Walk => ({
      id: `vision|${f.eye}|${f.cell}`,
      group: 'visual pathway',
      name: `${SIDE_WORD[f.eye]} eye — ${SECTOR_NAME[f.cell]}`,
      runs: `backward, from the retina to the visual cortex, carrying the ${f.fieldSide === 'L' ? 'left' : 'right'} half of space`,
      side: f.eye,
      points: f.points,
      stops: ordered([{ point: 0, label: `${SIDE_WORD[f.eye]} retina` }, ...f.parts.map((p) => stopAt(p.point, { kind: 'vision', part: p.part, side: p.side }))]),
      fate: ({ vmap, fields }) => fibreFate(vmap, fields ? fields[f.eye][f.cell] : 'normal', f),
    }));
}

function sympatheticWalks(kb: Kb, render: RenderKb): Walk[] {
  return SIDES.map((x): Walk => {
    const c = sympatheticCourse(kb, render, x);
    // The cord's stops are one per segment on the strand; the walk stops once where the fibres
    // enter the cord, then at the centre and the root.
    const stops: WalkStop[] = [];
    let inCord = false;
    for (const s of [...c.stops].sort((a, b) => a.point - b.point)) {
      if (s.at.kind === 'brain') {
        stops.push(stopAt(s.point, { kind: 'brain', level: s.at.level, compartment: s.at.compartment, side: s.at.side }));
      } else if (s.point === c.centre) {
        if (s.at.compartment === 'intermediolateral' && !stops.some((q) => q.point === c.centre)) stops.push(stopAt(s.point, s.at));
      } else if (s.point === c.root) {
        stops.push(stopAt(s.point, s.at));
      } else if (!inCord) {
        inCord = true;
        stops.push(stopAt(s.point, s.at));
      }
    }
    stops.push(stopAt(c.points.length - 1, { kind: 'organ', target: 'eye', side: x }));
    return {
      id: `sympathetic|${x}`,
      group: 'sympathetic pathway',
      name: `${SIDE_WORD[x]} sympathetic pathway to the eye`,
      runs: 'down the brainstem and cord to the centre, out by the root, and up the neck to the eye — three neurones',
      side: x,
      points: c.points,
      stops: ordered(stops),
      fate: ({ map, bmap }) => ({ diesAt: sympatheticFate(map, bmap, c).diesAt, dimmed: false }),
    };
  });
}

function nerveWalks(kb: Kb, render: RenderKb): Walk[] {
  const one = (nerve: Nerve, group: WalkGroup, x: Side): Walk | null => {
    const c = nerveCourse(kb, render, nerve, x);
    if (c.points.length < 2) return null;
    const stops: WalkStop[] = c.stops.map((s): WalkStop => {
      const note = s.branches?.length ? `Branches drawn from here: ${s.branches.map(targetWord).join(', ')}.` : undefined;
      const ref: PartRef | undefined = s.site ? { kind: 'plexus', site: s.site, side: x } : undefined;
      const label = s.origin
        ? ref
          ? `${partName(ref)} — where the nerve arises`
          : s.origin.from === 'nerve'
            ? `End of the ${NERVE_WORD(s.origin.nerve)} — where this nerve begins`
            : 'The roots — where the nerve arises'
        : ref
          ? partName(ref)
          : `Branches to ${(s.branches ?? []).map(targetWord).join(', ')}`;
      return { point: s.point, label, ...(ref ? { ref } : {}), ...(note ? { note } : {}) };
    });
    // Something is said at both ends: a nerve that ends by dividing names what it divides into.
    const end = c.points.length - 1;
    if (!stops.some((q) => q.point === end)) {
      const children = [...ARM_NERVES, ...LEG_NERVES].filter((m) => {
        const o = kb.plexus.nerves[m].origin;
        return o.from === 'nerve' && o.nerve === nerve;
      });
      stops.push({ point: end, label: children.length ? `Divides into the ${children.map(NERVE_WORD).join(' and the ')}` : 'The last drawn point of the nerve' });
    }
    if (!stops.some((q) => q.point === 0)) stops.push({ point: 0, label: 'Where the drawn nerve begins' });
    // The first named place the lesion takes, going outward, is where the signal stops.
    const sites = c.stops.flatMap((s) => (s.site ? [{ point: s.point, site: s.site }] : []));
    return {
      id: `nerve|${x}|${nerve}`,
      group,
      name: `${SIDE_WORD[x]} ${NERVE_WORD(nerve)}`,
      runs: 'outward, from where it arises to its last branch',
      side: x,
      points: c.points,
      stops: ordered(stops),
      fate: ({ pmap }) => {
        let dimmed = false;
        for (const s of sites) {
          const d = pmap.damage(s.site, x);
          if (d === 2) return { diesAt: s.point, dimmed };
          if (d === 1) dimmed = true;
        }
        return { diesAt: -1, dimmed };
      },
    };
  };
  return SIDES.flatMap((x) => [
    ...ARM_NERVES.flatMap((n) => one(n, 'nerves of the arm', x) ?? []),
    ...LEG_NERVES.flatMap((n) => one(n, 'nerves of the leg', x) ?? []),
  ]);
}

/** The three long tracts, each to or from the hand, at C8. */
function tractWalks(kb: Kb, render: RenderKb): Walk[] {
  const options = { model: 'classical', painFibre: 'adelta' } as const;
  const offsets = crossingOffsets(kb);
  const offset = offsets[Math.floor(offsets.length / 2)] ?? 1;
  const build = (id: string, name: string, runs: string, x: Side, path: Path, sacral: boolean, ends: { first: string; last: string }, periphery: 'first' | 'last'): Walk => {
    const stops: WalkStop[] = [{ point: 0, label: ends.first }];
    // The cord: stop where the fibre changes part, not at every segment it passes.
    let was = '';
    path.route.elements.forEach((e, i) => {
      const key = `${e.compartment}|${e.side}`;
      const point = path.elementPoint[i];
      if (key !== was && point !== undefined) stops.push(stopAt(point, { kind: 'cord', compartment: e.compartment, side: e.side, k: e.segment }));
      was = key;
    });
    for (const e of path.brain) {
      stops.push(stopAt(e.point, { kind: 'brain', level: e.level, compartment: e.compartment, side: e.side, ...(cortexRegion(e.level, e.compartment) ? { region: e.region } : {}) }));
    }
    stops.push({ point: path.points.length - 1, label: ends.last });
    // Where the walk begins or ends at a part that has its own stop, that stop stands for both.
    const named = new Set(stops.filter((q) => q.ref).map((q) => q.point));
    // P43: the path's far end in the limb is a schematic point beside the cord, which no nerve
    // reaches; the walk ends at the root, where the walks of the plexus take over.
    const off = periphery === 'first' ? 1 : 0;
    const gone = periphery === 'first' ? 0 : path.points.length - 1;
    const points = periphery === 'first' ? path.points.slice(1) : path.points.slice(0, -1);
    const kept = stops.filter((q) => q.point !== gone && (q.ref || !named.has(q.point))).map((q) => ({ ...q, point: q.point - off }));
    return {
      id,
      group: 'long tracts',
      name,
      runs,
      side: x,
      points,
      stops: ordered(kept),
      fate: ({ map, bmap }) => {
        const f = fate(map, kb, path, sacral, bmap);
        return { diesAt: f.diesAtPoint >= 0 ? Math.max(0, f.diesAtPoint - off) : -1, dimmed: f.dimmed };
      },
    };
  };
  // P43: to and from the hand at C8 and the foot at S1, so the cord can be walked to both swellings.
  const limbs = [
    { key: '', word: 'hand', seg: 'C8' },
    { key: '|foot', word: 'foot', seg: 'S1' },
  ] as const;
  return SIDES.flatMap((x) =>
    limbs.flatMap(({ key, word, seg }) => {
      const s = SEGMENTS.indexOf(seg);
      const sacral = isSacral(kb, s);
      const limb = `${SIDE_WORD[x].toLowerCase()} ${word} (${seg})`;
      return [
        build(`tract|${x}|motor${key}`, `Corticospinal tract to the ${limb}`, 'down, from the motor cortex to the muscle, crossing at the pyramids', x, motorPath(kb, render, x, s, options), sacral, {
          first: 'Motor cortex — where the command begins',
          last: `Muscles of the ${limb}`,
        }, 'last'),
        build(
          `tract|${x}|posterior${key}`,
          `Posterior column pathway from the ${limb}`,
          'up, from the skin to the sensory cortex, crossing in the medulla',
          x,
          sensoryPath(kb, render, x, 'posterior_column', s, offset, options),
          sacral,
          { first: `Skin and joints of the ${limb}`, last: 'Sensory cortex — where it arrives' },
          'first',
        ),
        build(
          `tract|${x}|pain${key}`,
          `Spinothalamic pathway from the ${limb}`,
          'up, from the skin to the sensory cortex, crossing in the cord',
          x,
          sensoryPath(kb, render, x, 'pain_temperature', s, offset, options),
          sacral,
          { first: `Skin of the ${limb}`, last: 'Sensory cortex — where it arrives' },
          'first',
        ),
      ];
    }),
  );
}

/**
 * P43: the plexuses themselves — each root from the cord into its trunk or part of the plexus,
 * and each trunk through its division into a cord — built from the strands the stage draws, so
 * that the limbs can be reached on foot from the cord.
 */
function plexusWalks(kb: Kb, render: RenderKb): Walk[] {
  const same = (a: Vec3 | undefined, b: Vec3 | undefined): boolean => !!a && !!b && Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 1e-6;
  const join = (...runs: (readonly Vec3[])[]): Vec3[] => {
    const out: Vec3[] = [];
    for (const run of runs) for (const q of run) if (!same(out[out.length - 1], q)) out.push(q);
    return out;
  };
  const nearestIndex = (points: readonly Vec3[], q: Vec3): number => {
    let best = 0;
    points.forEach((r, i) => {
      const b = points[best];
      if (b && Math.hypot(r.x - q.x, r.y - q.y, r.z - q.z) < Math.hypot(b.x - q.x, b.y - q.y, b.z - q.z)) best = i;
    });
    return best;
  };
  const cut = (pmap: PlexusMap, x: Side, sites: readonly { point: number; site: PlexusSite }[]): { diesAt: number; dimmed: boolean } => {
    let dimmed = false;
    for (const q of [...sites].sort((a, b) => a.point - b.point)) {
      const d = pmap.damage(q.site, x);
      if (d === 2) return { diesAt: q.point, dimmed };
      if (d === 1) dimmed = true;
    }
    return { diesAt: -1, dimmed };
  };
  // A root begins where it leaves the cord, at the ventral root as the slice draws it.
  const rootWalk = (x: Side, k: number, group: WalkGroup, site: PlexusSite, into: string, root: readonly Vec3[], bundle: readonly Vec3[], tag: string): Walk => {
    const start = place(render, k, discAt(render, 'ventral_root', x, k) ?? { x: 0, z: 0 });
    const points = join([start], root, bundle);
    const at = nearestIndex(points, siteAnchor(render, site, x));
    const ref: PartRef = { kind: 'root', side: x, k };
    const stops: WalkStop[] = [stopAt(0, ref), stopAt(at, { kind: 'plexus', site, side: x })];
    if (at !== points.length - 1) stops.push({ point: points.length - 1, label: `End of the ${into}` });
    return {
      id: `root|${x}|${SEGMENTS[k]}${tag}`,
      group,
      name: `${SIDE_WORD[x]} ${SEGMENTS[k]} root, into the ${into}`,
      runs: 'outward, from the cord into the plexus',
      side: x,
      points,
      stops: ordered(stops),
      fate: ({ map, pmap }) => {
        // The root is its dorsal and ventral parts: both lost stops the walk, one weakens it.
        const [d, v] = [map.damage('dorsal_root', x, k), map.damage('ventral_root', x, k)];
        if (d === 2 && v === 2) return { diesAt: 0, dimmed: false };
        const beyond = cut(pmap, x, [{ point: at, site }]);
        return { diesAt: beyond.diesAt, dimmed: beyond.dimmed || d > 0 || v > 0 };
      },
    };
  };
  return SIDES.flatMap((x) => {
    const arm = plexusStrands(kb, render, x);
    const leg = legStrands(kb, render, x);
    const out: Walk[] = [];
    for (const r of arm.filter((q) => q.kind === 'root')) {
      const k = (SEGMENTS as readonly string[]).indexOf(r.name);
      const trunk = trunkOfRoot(kb, k);
      const bundle = arm.find((q) => q.kind === 'trunk' && q.name === trunk);
      if (trunk && bundle) out.push(rootWalk(x, k, 'nerves of the arm', TRUNK_SITE[trunk], `${trunk} trunk`, r.points, bundle.points, ''));
    }
    for (const c of PLEXUS_CORDS) {
      const cord = arm.find((q) => q.kind === 'cord' && q.name === c);
      for (const t of kb.plexus.cords.formedBy[c]) {
        const division = arm.find((q) => q.kind === 'division' && q.name.startsWith(`${t} `) && same(q.points[q.points.length - 1], cord?.points[0]));
        const trunk = arm.find((q) => q.kind === 'trunk' && q.name === t);
        if (!cord || !division || !trunk) continue;
        const points = join(trunk.points, division.points, cord.points);
        const sites = [
          { point: nearestIndex(points, siteAnchor(render, TRUNK_SITE[t], x)), site: TRUNK_SITE[t] },
          { point: nearestIndex(points, siteAnchor(render, CORD_SITE[c], x)), site: CORD_SITE[c] },
        ];
        const stops: WalkStop[] = sites.map((q) => stopAt(q.point, { kind: 'plexus', site: q.site, side: x }));
        if (!stops.some((q) => q.point === 0)) stops.push({ point: 0, label: `Start of the ${t} trunk` });
        if (!stops.some((q) => q.point === points.length - 1)) stops.push({ point: points.length - 1, label: `End of the ${c} cord — where its nerves leave` });
        out.push({
          id: `plexus|${x}|${t}|${c}`,
          group: 'nerves of the arm',
          name: `${SIDE_WORD[x]} ${t} trunk to the ${c} cord`,
          runs: `outward, through the ${division.division ?? ''} division`,
          side: x,
          points,
          stops: ordered(stops),
          fate: ({ pmap }) => cut(pmap, x, sites),
        });
      }
    }
    for (const r of leg.filter((q) => q.kind === 'root')) {
      const k = (SEGMENTS as readonly string[]).indexOf(r.name);
      const part = LEG_PLEXUS_PARTS.find((q) => same(render.leg.parts[q][0] && mirror(render.leg.parts[q][0] as LimbPoint, x), r.points[r.points.length - 1]));
      const bundle = leg.find((q) => q.kind === 'trunk' && q.name === `${part} plexus`);
      if (part && bundle) out.push(rootWalk(x, k, 'nerves of the leg', PART_SITE[part], `${part} plexus`, r.points, bundle.points, `|${part}`));
    }
    return out;
  });
}

/** Every walk the stage offers. */
export function allWalks(kb: Kb, render: RenderKb): Walk[] {
  return [
    ...cranialWalks(kb, render),
    ...visionWalks(kb, render),
    ...sympatheticWalks(kb, render),
    ...plexusWalks(kb, render),
    ...nerveWalks(kb, render),
    ...tractWalks(kb, render),
  ];
}

/** The stop a walker stands at or has last passed, given how far along the points they are. */
export function stopIndexAt(walk: Walk, pointProgress: number): number {
  let at = 0;
  walk.stops.forEach((s, i) => {
    if (s.point <= pointProgress + 1e-6) at = i;
  });
  return at;
}

/** What to say of the lesion at one stop: it cuts the walk here, the signal has already stopped, or nothing. */
export function lesionAt(walk: Walk, stop: number, lesion: WalkLesion): 'here' | 'beyond' | 'weakened' | 'clear' {
  const f = walk.fate(lesion);
  const point = walk.stops[stop]?.point ?? 0;
  if (f.diesAt >= 0 && point === f.diesAt) return 'here';
  if (f.diesAt >= 0 && point > f.diesAt) return 'beyond';
  return f.dimmed ? 'weakened' : 'clear';
}

// ── P43: roaming — stepping from one walk onto another that meets it or passes close by ──

/** Another walk within reach of where the walker stands, and where on it they would land. */
export type Crossing = {
  readonly walk: Walk;
  readonly distance: number;
  readonly at: Vec3;
  /** How far along the other walk the landing lies, in its points: 2.5 is midway between its third and fourth. */
  readonly pointProgress: number;
};

/** The nearest place on a walk's drawn line to a point of the scene. */
export function nearestOn(walk: Walk, p: Vec3): { readonly distance: number; readonly at: Vec3; readonly pointProgress: number } {
  let best = { distance: Infinity, at: walk.points[0] ?? p, pointProgress: 0 };
  for (let i = 1; i < walk.points.length; i++) {
    const a = walk.points[i - 1];
    const b = walk.points[i];
    if (!a || !b) continue;
    const [dx, dy, dz] = [b.x - a.x, b.y - a.y, b.z - a.z];
    const len2 = dx * dx + dy * dy + dz * dz;
    const t = len2 > 0 ? Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy + (p.z - a.z) * dz) / len2)) : 0;
    const at = { x: a.x + dx * t, y: a.y + dy * t, z: a.z + dz * t };
    const distance = Math.hypot(at.x - p.x, at.y - p.y, at.z - p.z);
    if (distance < best.distance) best = { distance, at, pointProgress: i - 1 + t };
  }
  return best;
}

/** How near, in scene units, another walk must pass to be stepped onto. */
export const REACH = 0.45;

/**
 * The walks that can be stepped onto from a point of the current one, nearest first. Bundles
 * that run together — the fibres of one optic nerve — would fill the list, so no more than three
 * of one group are offered.
 */
export function crossings(walks: readonly Walk[], current: Walk, position: Vec3, reach = REACH, limit = 6): Crossing[] {
  const found: Crossing[] = [];
  for (const w of walks) {
    if (w.id === current.id) continue;
    const n = nearestOn(w, position);
    if (n.distance <= reach) found.push({ walk: w, ...n });
  }
  found.sort((a, b) => a.distance - b.distance || a.walk.name.localeCompare(b.walk.name));
  const perGroup = new Map<string, number>();
  const out: Crossing[] = [];
  for (const c of found) {
    const n = perGroup.get(c.walk.group) ?? 0;
    if (n >= 3) continue;
    perGroup.set(c.walk.group, n + 1);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

/** The point of the scene at a fractional position along a walk's points. */
export function pointAlong(walk: Walk, pointProgress: number): Vec3 {
  const i = Math.min(walk.points.length - 2, Math.max(0, Math.floor(pointProgress)));
  const a = walk.points[i];
  const b = walk.points[i + 1] ?? a;
  if (!a || !b) return { x: 0, y: 0, z: 0 };
  const t = Math.min(1, Math.max(0, pointProgress - i));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

/** Every walk that can be reached from one by stepping across, any number of times; the start included. */
export function reachable(walks: readonly Walk[], from: Walk, reach = REACH): Set<string> {
  const samples = new Map<string, Vec3[]>();
  const sample = (w: Walk): Vec3[] => {
    const have = samples.get(w.id);
    if (have) return have;
    const out: Vec3[] = [];
    for (let i = 0; i < w.points.length - 1; i++) {
      const a = w.points[i];
      const b = w.points[i + 1];
      if (!a || !b) continue;
      const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / 0.2));
      for (let j = 0; j <= n; j++) out.push(pointAlong(w, i + j / n));
    }
    samples.set(w.id, out);
    return out;
  };
  const seen = new Set<string>([from.id]);
  const queue: Walk[] = [from];
  while (queue.length) {
    const w = queue.pop();
    if (!w) break;
    for (const other of walks) {
      if (seen.has(other.id)) continue;
      if (sample(w).some((p) => nearestOn(other, p).distance <= reach)) {
        seen.add(other.id);
        queue.push(other);
      }
    }
  }
  return seen;
}
