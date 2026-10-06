// P42: every drawn nerve and pathway as something that can be walked along — its points in the
// order the signal travels, the stops along it, and where the lesion stops the signal. A walk
// adds no anatomy: its points and stops are the courses the stage already draws, and where it is
// cut is decided by the same functions that stop the pulses. Pure: no renderer, no DOM.
import type { BrainMap } from '../engine/brain.ts';
import { crossingOffsets, type Findings, type LesionMap } from '../engine/forward.ts';
import type { PlexusMap } from '../engine/limb.ts';
import type { VisionMap } from '../engine/vision.ts';
import { brainFate, cranialCourses, fibreFate, visionFibres } from '../geometry/brain.ts';
import { fate, motorPath, sensoryPath, type Path, type Vec3 } from '../geometry/paths.ts';
import { nerveCourse } from '../geometry/plexus.ts';
import { sympatheticCourse, sympatheticFate } from '../geometry/sympathetic.ts';
import type { Kb, RenderKb } from '../kb/types.ts';
import { ARM_NERVES, LEG_NERVES, SEGMENTS, SIDES, type Muscle, type Nerve, type Side, type SkinArea } from '../kb/vocab.ts';
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
  const s = SEGMENTS.indexOf('C8');
  const seg = SEGMENTS[s] ?? '';
  const options = { model: 'classical', painFibre: 'adelta' } as const;
  const offsets = crossingOffsets(kb);
  const offset = offsets[Math.floor(offsets.length / 2)] ?? 1;
  const build = (id: string, name: string, runs: string, x: Side, path: Path, ends: { first: string; last: string }): Walk => {
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
    const kept = stops.filter((q) => q.ref || !named.has(q.point));
    return {
      id,
      group: 'long tracts',
      name,
      runs,
      side: x,
      points: path.points,
      stops: ordered(kept),
      fate: ({ map, bmap }) => {
        const f = fate(map, kb, path, false, bmap);
        return { diesAt: f.diesAtPoint, dimmed: f.dimmed };
      },
    };
  };
  return SIDES.flatMap((x) => {
    const hand = `${SIDE_WORD[x].toLowerCase()} hand (${seg})`;
    return [
      build(`tract|${x}|motor`, `Corticospinal tract to the ${hand}`, 'down, from the motor cortex to the muscle, crossing at the pyramids', x, motorPath(kb, render, x, s, options), {
        first: 'Motor cortex — where the command begins',
        last: `Muscles of the ${hand}`,
      }),
      build(
        `tract|${x}|posterior`,
        `Posterior column pathway from the ${hand}`,
        'up, from the skin to the sensory cortex, crossing in the medulla',
        x,
        sensoryPath(kb, render, x, 'posterior_column', s, offset, options),
        { first: `Skin and joints of the ${hand}`, last: 'Sensory cortex — where it arrives' },
      ),
      build(
        `tract|${x}|pain`,
        `Spinothalamic pathway from the ${hand}`,
        'up, from the skin to the sensory cortex, crossing in the cord',
        x,
        sensoryPath(kb, render, x, 'pain_temperature', s, offset, options),
        { first: `Skin of the ${hand}`, last: 'Sensory cortex — where it arrives' },
      ),
    ];
  });
}

/** Every walk the stage offers. */
export function allWalks(kb: Kb, render: RenderKb): Walk[] {
  return [...cranialWalks(kb, render), ...visionWalks(kb, render), ...sympatheticWalks(kb, render), ...nerveWalks(kb, render), ...tractWalks(kb, render)];
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
