// The brain above C1 as 3D points and polylines. Routes are the knowledge base's own step
// lists (D39), so a pulse passes exactly the parts the engine judges, on the side the engine
// judges them (D40), and stops at the first one it says is cut (D18).
import { regionOf, type BrainMap } from '../engine/brain.ts';
import type { BrainRoute, BrainStep, Kb, LimbPoint, RenderKb } from '../kb/types.ts';
import {
  BODY_REGIONS,
  BRAIN_LEVELS,
  type BodyRegion,
  type BrainCompartment,
  type BrainLevel,
  type SensoryModality,
  type Side,
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
