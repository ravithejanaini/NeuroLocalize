// Engine routes as 3D polylines, with the speed of every leg. The render animates these;
// it never builds a route of its own (D18).
import { sensoryRoute, motorRoute, type LesionMap, type Route } from '../engine/forward.ts';
import { damageAlong } from '../engine/routes.ts';
import type { Kb, LaminationModel, RenderKb } from '../kb/types.ts';
import { SEGMENTS, type SensoryModality, type Side } from '../kb/vocab.ts';
import { segmentMid } from './ruler.ts';
import { fibrePoint, widthCm } from './section.ts';

export type Vec3 = { readonly x: number; readonly y: number; readonly z: number };
export type SpeedClass = 'abeta' | 'adelta' | 'c' | 'illustrative' | 'corticospinal';
export type Leg = { readonly from: number; readonly to: number; readonly speed: SpeedClass };

export type Path = {
  readonly points: readonly Vec3[];
  readonly legs: readonly Leg[];
  /** Index into `points` for each element of the route. */
  readonly elementPoint: readonly number[];
  readonly route: Route;
};

/** Drawn cross-sections are this many times wider than true, so tracts can be told apart. */
export const EXAGGERATION = 3;
/** Distance of skin and muscle from the cord axis, in vertebral units. Schematic. */
const PERIPHERY = 2.4;
/** Height above the top of C1 at which the brainstem crossings are drawn. */
const MEDULLA = 0.8;
const BRAIN = 1.6;

const cmPerUnit = (render: RenderKb): number =>
  (render.cord.lengthCm[0] + render.cord.lengthCm[1]) / 2 / render.ruler.cordEndsAtVertebra;

/** Scene coordinates: y up (rostral), x toward the patient's right, z dorsal. */
function place(render: RenderKb, k: number, p: { x: number; z: number }): Vec3 {
  const radius = (widthCm(render, k) / 2 / cmPerUnit(render)) * EXAGGERATION;
  return { x: p.x * radius, y: -segmentMid(render, k), z: p.z * radius };
}

const sideSign = (x: Side): number => (x === 'L' ? -1 : 1);

export type PathOptions = { readonly model: LaminationModel; readonly painFibre: 'adelta' | 'c' };

export function sensoryPath(
  kb: Kb,
  render: RenderKb,
  x: Side,
  modality: SensoryModality,
  s: number,
  offset: number,
  options: PathOptions,
): Path {
  const route = sensoryRoute(kb, x, modality, s, offset);
  const points: Vec3[] = [{ x: sideSign(x) * PERIPHERY, y: -segmentMid(render, s), z: 0.3 }];
  const elementPoint: number[] = [];
  for (const e of route.elements) {
    const p = fibrePoint(render, e.compartment, e.side, e.segment, s, options.model);
    elementPoint.push(points.length);
    if (p) points.push(place(render, e.segment, p));
  }
  const peripheralEnd = 1;
  const last = points[points.length - 1];
  if (last) {
    if (modality === 'posterior_column') {
      // Up to the dorsal column nuclei, then across in the medulla.
      points.push({ x: last.x, y: MEDULLA, z: last.z });
      points.push({ x: -last.x, y: MEDULLA + 0.25, z: last.z * 0.5 });
      points.push({ x: -last.x, y: BRAIN, z: 0 });
    } else {
      points.push({ x: last.x, y: BRAIN, z: 0 });
    }
  }
  const fibre: SpeedClass = modality === 'posterior_column' ? 'abeta' : options.painFibre;
  return {
    points,
    legs: [
      { from: 0, to: peripheralEnd, speed: fibre },
      { from: peripheralEnd, to: points.length - 1, speed: 'illustrative' },
    ],
    elementPoint,
    route,
  };
}

export function motorPath(kb: Kb, render: RenderKb, x: Side, s: number, options: PathOptions): Path {
  const route = motorRoute(kb, x, s);
  const firstTract = route.elements[0];
  const tractSide = firstTract?.side ?? x;
  const top = fibrePoint(render, 'lateral_cst', tractSide, 0, s, options.model) ?? { x: 0, z: 0 };
  const start = place(render, 0, top);
  const points: Vec3[] = [
    { x: -start.x, y: BRAIN, z: 0 },
    { x: -start.x, y: MEDULLA + 0.25, z: start.z },
    { x: start.x, y: MEDULLA, z: start.z },
  ];
  const elementPoint: number[] = [];
  for (const e of route.elements) {
    const p = fibrePoint(render, e.compartment, e.side, e.segment, s, options.model);
    elementPoint.push(points.length);
    if (p) points.push(place(render, e.segment, p));
  }
  const tractEnd = points.length - 1;
  points.push({ x: sideSign(x) * PERIPHERY, y: -segmentMid(render, Math.min(s, SEGMENTS.length - 1)), z: -0.3 });
  return {
    points,
    legs: [
      { from: 0, to: tractEnd, speed: 'corticospinal' },
      { from: tractEnd, to: points.length - 1, speed: 'illustrative' },
    ],
    elementPoint,
    route,
  };
}

export type Fate = { readonly diesAtPoint: number; readonly dimmed: boolean };

/** Where a pulse on this path stops, and whether it arrives weakened. */
export function fate(map: LesionMap, kb: Kb, path: Path, inputIsSacral: boolean): Fate {
  let dimmed = false;
  for (let i = 0; i < path.route.elements.length; i++) {
    const e = path.route.elements[i];
    if (!e) continue;
    const d = damageAlong(map, kb, e, inputIsSacral);
    if (d === 2) return { diesAtPoint: path.elementPoint[i] ?? 0, dimmed };
    if (d === 1) dimmed = true;
  }
  return { diesAtPoint: -1, dimmed };
}

export function speedOf(render: RenderKb, c: SpeedClass): number {
  const v = render.speeds;
  switch (c) {
    case 'abeta':
      return (v.abeta[0] + v.abeta[1]) / 2;
    case 'adelta':
      return v.adeltaTypical;
    case 'c':
      return v.cTypical;
    case 'corticospinal':
      return v.corticospinal;
    case 'illustrative':
      return render.intraspinalSpeed.illustrative;
  }
}
