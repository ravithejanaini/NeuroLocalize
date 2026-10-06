// The brain above C1 as 3D points and polylines. Routes are the knowledge base's own step
// lists (D39), so a pulse passes exactly the parts the engine judges, on the side the engine
// judges them (D40), and stops at the first one it says is cut (D18).
import { regionOf, type BrainMap } from '../engine/brain.ts';
import { carriers, isMidlinePart, sideOfSector, type VisionMap } from '../engine/vision.ts';
import type { BrainRoute, BrainStep, Kb, LimbPoint, RenderKb } from '../kb/types.ts';
import {
  BODY_REGIONS,
  BRAIN_LEVELS,
  FIELD_CELLS,
  type BodyRegion,
  type BrainCompartment,
  type BrainLevel,
  type CranialSign,
  type CranialTarget,
  type FieldCell,
  type FieldState,
  type SensoryModality,
  type Side,
  type TrigeminalDivision,
  type VisualPart,
} from '../kb/vocab.ts';
import type { Vec3 } from './paths.ts';

/** One part of the brain on a drawn path, with the point that stands for it. */
export type BrainElement = {
  readonly level: BrainLevel;
  readonly compartment: BrainCompartment;
  readonly side: Side;
  readonly region: BodyRegion;
  readonly point: number;
};

const other = (s: Side): Side => (s === 'L' ? 'R' : 'L');
const sign = (s: Side): number => (s === 'L' ? 1 : -1);
const SOMATOTOPIC_CORTEX: readonly BrainCompartment[] = ['motor_cortex', 'sensory_cortex'];
const STRIP_Z: Partial<Record<BrainCompartment, number>> = { motor_cortex: -0.3, sensory_cortex: 0.4 };

export const levelY = (render: RenderKb, level: BrainLevel): number => render.brainLayout.levels[level].y;

/** Where a part is drawn on side `side`; cortical strips are placed by body region. */
export function partPoint(render: RenderKb, level: BrainLevel, compartment: BrainCompartment, side: Side, region: BodyRegion): Vec3 {
  const layout = render.brainLayout;
  const y0 = layout.levels[level].y;
  if (SOMATOTOPIC_CORTEX.includes(compartment)) {
    const [x, dy] = layout.homunculus[region];
    return { x: sign(side) * x, y: y0 + dy, z: STRIP_Z[compartment] ?? 0 };
  }
  const p: LimbPoint | undefined = layout.parts[`${level}:${compartment}`];
  if (!p) throw new Error(`no drawn position for ${compartment} in the ${level}`);
  return { x: sign(side) * p[0], y: y0 + p[1], z: p[2] };
}

const onSide = (x: Side, route: BrainRoute): Side => (route.serves === 'ipsilateral' ? x : other(x));

function walk(render: RenderKb, steps: readonly BrainStep[], side: Side, region: BodyRegion, out: Vec3[], elements: BrainElement[]): void {
  for (const s of steps) {
    elements.push({ level: s.level, compartment: s.compartment, side, region, point: out.length });
    out.push(partPoint(render, s.level, s.compartment, side, region));
  }
}

/** From the top of the cord to the cortex, for input from segment s on side x (D40). */
export function ascendingTail(
  kb: Kb,
  render: RenderKb,
  modality: SensoryModality,
  x: Side,
  s: number,
  from: Vec3,
  firstPoint: number,
): { readonly points: Vec3[]; readonly elements: BrainElement[] } {
  const route = modality === 'posterior_column' ? kb.brain.lemniscal : kb.brain.spinothalamic;
  const side = onSide(x, route);
  const region = regionOf(kb, s);
  const points: Vec3[] = [];
  if (modality === 'posterior_column') {
    // The dorsal column nuclei, then across in the internal arcuate fibres.
    const y = render.brainLayout.decussationY;
    points.push({ x: from.x, y, z: from.z }, { x: 0, y: y + 0.2, z: -0.1 });
  }
  const elements: BrainElement[] = [];
  const local: Vec3[] = [];
  walk(render, route.steps, side, region, local, elements);
  const base = firstPoint + points.length;
  return {
    points: [...points, ...local],
    elements: elements.map((e) => ({ ...e, point: e.point + base })),
  };
}

/** From the cortex down to the top of the cord, crossing at the pyramids, for segment s on side x. */
export function descendingHead(
  kb: Kb,
  render: RenderKb,
  x: Side,
  s: number,
  to: Vec3,
): { readonly points: Vec3[]; readonly elements: BrainElement[] } {
  const route = kb.brain.corticospinal;
  const side = onSide(x, route);
  const points: Vec3[] = [];
  const elements: BrainElement[] = [];
  walk(render, route.steps, side, regionOf(kb, s), points, elements);
  const y = render.brainLayout.decussationY;
  points.push({ x: 0, y: y + 0.1, z: to.z }, { x: to.x, y, z: to.z });
  return { points, elements };
}

/** Facial sensation: face, ipsilateral nucleus, then across to VPM and the cortex (C16). */
export function faceSensoryPath(kb: Kb, render: RenderKb, x: Side): { readonly points: Vec3[]; readonly elements: BrainElement[] } {
  const f = render.brainLayout.face;
  const points: Vec3[] = [{ x: sign(x) * f[0], y: f[1], z: f[2] }];
  const elements: BrainElement[] = [];
  walk(render, kb.brain.faceNucleus.steps, onSide(x, kb.brain.faceNucleus), 'face', points, elements);
  walk(render, kb.brain.faceAscending.steps, onSide(x, kb.brain.faceAscending), 'face', points, elements);
  return { points, elements };
}

/** Facial movement: cortex to the facial nucleus of the other side, then out to the face. */
export function faceMotorPath(kb: Kb, render: RenderKb, x: Side): { readonly points: Vec3[]; readonly elements: BrainElement[] } {
  const points: Vec3[] = [];
  const elements: BrainElement[] = [];
  walk(render, kb.brain.corticobulbarFace.steps, onSide(x, kb.brain.corticobulbarFace), 'face', points, elements);
  walk(render, kb.brain.facialNucleus.steps, onSide(x, kb.brain.facialNucleus), 'face', points, elements);
  const f = render.brainLayout.face;
  points.push({ x: sign(x) * f[0], y: f[1] - 0.4, z: f[2] });
  return { points, elements };
}

/** P38: where a part of the visual pathway is drawn; a midline part sits on the midline. */
export function visualPartPoint(kb: Kb, render: RenderKb, part: VisualPart, side: Side): Vec3 {
  const p = render.visionLayout.parts[part];
  return { x: isMidlinePart(kb, part) ? 0 : sign(side) * p[0], y: p[1], z: p[2] };
}

/**
 * P38: the fibre of one cell of one eye's field, from the retina back through every part the
 * engine says carries it (`carriers`), in the pathway's own order. Light from one side of space
 * falls on the other side of the retina, and from above on its lower half, so the fibre starts
 * there.
 */
export type Fibre = {
  readonly eye: Side;
  readonly cell: FieldCell;
  /** The side of space the cell lies on. */
  readonly fieldSide: Side;
  readonly points: Vec3[];
  /** One per point after the first: the part drawn there, and how it carries the cell. */
  readonly parts: { readonly part: VisualPart; readonly side: Side; readonly how: 'whole' | 'upper' | 'lower'; readonly point: number }[];
};

export function visionFibres(kb: Kb, render: RenderKb): Fibre[] {
  const out: Fibre[] = [];
  const r = render.visionLayout.retina;
  for (const eye of ['L', 'R'] as const) {
    const centre = targetPoint(render, 'eye', eye);
    for (const cell of FIELD_CELLS) {
      const fieldSide = sideOfSector(eye, cell);
      const upper = cell.includes('_superior');
      const lower = cell.includes('_inferior');
      const central = !upper && !lower;
      // The retina is the field turned over: left field on the right of the retina, upper below.
      const retina: Vec3 = {
        x: centre.x - sign(fieldSide) * r * (central ? 0.35 : cell.endsWith('_vertical') ? 0.45 : 1),
        y: centre.y + (central ? 0 : upper ? -r : r) * (cell.endsWith('_horizontal') ? 0.45 : 1),
        z: centre.z + 0.15,
      };
      const points: Vec3[] = [retina];
      const parts: Fibre['parts'] = [];
      const all = carriers(kb, eye, cell);
      // The centre of the field runs in both halves of the radiation: one point, midway, stands
      // for the two parts that each carry half of it.
      const halves = all.filter((c) => c.how !== 'whole').map((c) => visualPartPoint(kb, render, c.part, c.side));
      let shared = -1;
      for (const c of all) {
        if (c.how !== 'whole' && halves.length > 1) {
          if (shared < 0) {
            shared = points.length;
            const n = halves.length;
            points.push({ x: halves.reduce((a, h) => a + h.x, 0) / n, y: halves.reduce((a, h) => a + h.y, 0) / n, z: halves.reduce((a, h) => a + h.z, 0) / n });
          }
          parts.push({ ...c, point: shared });
          continue;
        }
        parts.push({ ...c, point: points.length });
        points.push(visualPartPoint(kb, render, c.part, c.side));
      }
      out.push({ eye, cell, fieldSide, points, parts });
    }
  }
  return out;
}

/**
 * P38: where a pulse on a fibre stops. The engine's own field decides whether it does — lost,
 * unsettled or seen — and the first damaged part on the fibre is where.
 */
export function fibreFate(vmap: VisionMap, state: FieldState, fibre: Fibre): { readonly diesAt: number; readonly dimmed: boolean } {
  if (state === 'normal') return { diesAt: -1, dimmed: false };
  const hit = fibre.parts.find((p) => vmap.damage(p.part, p.side) > 0);
  if (state === 'lost') return { diesAt: hit ? hit.point : -1, dimmed: false };
  return { diesAt: -1, dimmed: true };
}

/** P37: where an end organ of a cranial nerve is drawn on side `side`. */
export function targetPoint(render: RenderKb, target: CranialTarget, side: Side): Vec3 {
  const p = render.brainLayout.targets[target];
  return { x: sign(side) * p[0], y: p[1], z: p[2] };
}

/**
 * P37: one cranial nerve as it is drawn — its parts in the order the signal meets them, and the
 * end organ at one end. `reads` names the finding the engine computes from exactly these parts,
 * so a test can hold the drawing to the engine.
 */
export type Course = {
  readonly id: string;
  readonly name: string;
  /** The side of the end organ. */
  readonly side: Side;
  readonly dir: 'motor' | 'sense';
  readonly target: CranialTarget;
  readonly reads: { readonly sign: CranialSign } | { readonly division: TrigeminalDivision };
  readonly points: Vec3[];
  readonly elements: BrainElement[];
};

/**
 * Every cranial nerve course for the end organs of side `x`. Each is built from the knowledge
 * base's own step lists, in their own order, on the side each route serves — so a pulse passes
 * exactly the parts the engine judges (D39). A motor course ends at its organ; a sensory one
 * starts there.
 */
export function cranialCourses(kb: Kb, render: RenderKb, x: Side): Course[] {
  const b = kb.brain;
  type Leg = readonly [readonly BrainStep[], Side];
  const build = (id: string, name: string, dir: Course['dir'], target: CranialTarget, reads: Course['reads'], legs: readonly Leg[]): Course => {
    const organ = targetPoint(render, target, x);
    const points: Vec3[] = dir === 'sense' ? [organ] : [];
    const elements: BrainElement[] = [];
    for (const [steps, side] of legs) walk(render, steps, side, 'face', points, elements);
    if (dir === 'motor') points.push(organ);
    return { id, name, side: x, dir, target, reads, points, elements };
  };
  const reading = (s: CranialSign): Course['reads'] => ({ sign: s });
  // The face by division: the parts that carry this division, distal first, then the nuclei on
  // the same side and the crossed route to the cortex (C16).
  const division = (d: TrigeminalDivision, target: CranialTarget): Course =>
    build(d, `trigeminal nerve, ${d}`, 'sense', target, { division: d }, [
      ...b.faceDivisions.filter((r) => r.divisions.includes(d)).map((r): Leg => [r.steps, onSide(x, r)]),
      [b.faceNucleus.steps, onSide(x, b.faceNucleus)],
      [b.faceAscending.steps, onSide(x, b.faceAscending)],
    ]);
  return [
    build('III', 'oculomotor nerve', 'motor', 'eye', reading('oculomotor_palsy'), [[b.oculomotor.steps, onSide(x, b.oculomotor)]]),
    // The fourth nerve's nucleus is on the other side: its fibres cross before they leave.
    build('IV', 'trochlear nerve', 'motor', 'eye', reading('superior_oblique_weakness'), [
      [b.trochlear.steps, onSide(x, b.trochlear)],
      [b.trochlearNerve.steps, onSide(x, b.trochlearNerve)],
    ]),
    build('VI', 'abducens nerve', 'motor', 'eye', reading('abduction_weakness'), [[b.abduction.steps, onSide(x, b.abduction)]]),
    division('V1', 'forehead'),
    division('V2', 'cheek'),
    division('V3', 'jaw_skin'),
    build('V motor', 'trigeminal motor root', 'motor', 'jaw_muscle', reading('jaw_deviation'), [[b.jaw.steps, onSide(x, b.jaw)]]),
    build('VII tears', 'greater petrosal nerve', 'motor', 'lacrimal', reading('tear_loss'), [[b.lacrimation.steps, onSide(x, b.lacrimation)]]),
    build('VII stapedius', 'nerve to stapedius', 'motor', 'ear', reading('hyperacusis'), [[b.stapedius.steps, onSide(x, b.stapedius)]]),
    build('VII taste', 'chorda tympani', 'sense', 'tongue_front', reading('taste_loss'), [[b.tasteAnterior.steps, onSide(x, b.tasteAnterior)]]),
    build('VIII', 'cochlear nerve', 'sense', 'ear', reading('hearing_loss'), [[b.hearing.steps, onSide(x, b.hearing)]]),
    build('IX', 'glossopharyngeal nerve', 'sense', 'tongue_back', reading('posterior_tongue_loss'), [[b.posteriorTongue.steps, onSide(x, b.posteriorTongue)]]),
    build('X', 'vagus nerve', 'motor', 'palate', reading('palate_weakness'), [[b.ambiguus.steps, onSide(x, b.ambiguus)]]),
    build('XI', 'accessory nerve', 'motor', 'shoulder', reading('accessory_weakness'), [[b.accessory.steps, onSide(x, b.accessory)]]),
    // The tongue: the crossed corticobulbar route, then the nucleus and nerve of its own side.
    build('XII', 'hypoglossal nerve', 'motor', 'tongue', reading('tongue_weakness'), [
      [b.corticobulbarTongue.steps, onSide(x, b.corticobulbarTongue)],
      [b.hypoglossal.steps, onSide(x, b.hypoglossal)],
    ]),
  ];
}

/** The first brain element this map cuts completely, and whether any is cut in part. */
export function brainFate(bmap: BrainMap, elements: readonly BrainElement[]): { readonly diesAt: number; readonly dimmed: boolean } {
  let dimmed = false;
  for (const e of [...elements].sort((a, b) => a.point - b.point)) {
    const d = bmap.damage(e.level, e.compartment, e.side, e.region);
    if (d === 2) return { diesAt: e.point, dimmed };
    if (d === 1) dimmed = true;
  }
  return { diesAt: -1, dimmed };
}

/** Every part drawn at every level, both sides, for the static scene. */
export function allParts(render: RenderKb): { level: BrainLevel; compartment: BrainCompartment; side: Side; region: BodyRegion; at: Vec3 }[] {
  const out: { level: BrainLevel; compartment: BrainCompartment; side: Side; region: BodyRegion; at: Vec3 }[] = [];
  for (const side of ['L', 'R'] as const) {
    for (const key of Object.keys(render.brainLayout.parts) as `${BrainLevel}:${BrainCompartment}`[]) {
      const [level, compartment] = key.split(':') as [BrainLevel, BrainCompartment];
      out.push({ level, compartment, side, region: 'arm', at: partPoint(render, level, compartment, side, 'arm') });
    }
    for (const compartment of SOMATOTOPIC_CORTEX) {
      for (const region of BODY_REGIONS) {
        out.push({ level: 'cortex', compartment, side, region, at: partPoint(render, 'cortex', compartment, side, region) });
      }
    }
  }
  return out;
}

export { BRAIN_LEVELS };
