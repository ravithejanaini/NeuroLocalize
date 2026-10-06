// P40: the oculosympathetic pathway as it is drawn — three neurones in one strand a side, built
// from the rows the engine reads for a Horner syndrome and nothing else: the first-order fibres in
// the brainstem and down the cord to the ciliospinal centre, the second from the centre out by
// the T1 root and up the chain, the third on the carotid to the eye. Pure: no renderer.
import type { BrainMap } from '../engine/brain.ts';
import type { LesionMap } from '../engine/forward.ts';
import type { Kb, RenderKb } from '../kb/types.ts';
import { SEGMENTS, type BrainCompartment, type BrainLevel, type Compartment, type Segment, type Side } from '../kb/vocab.ts';
import { partPoint, targetPoint } from './brain.ts';
import { place, type Vec3 } from './paths.ts';
import { fibrePoint } from './section.ts';

export type Neurone = 1 | 2 | 3;

/** One thing the engine tests for a Horner syndrome, and the point of the strand where it lies. */
export type SympatheticStop = {
  readonly point: number;
  readonly neurone: Neurone;
  readonly at:
    | { readonly kind: 'brain'; readonly level: BrainLevel; readonly compartment: BrainCompartment; readonly side: Side }
    | { readonly kind: 'cord'; readonly compartment: Compartment; readonly side: Side; readonly k: number };
};

export type SympatheticCourse = {
  /** The side of the eye. */
  readonly side: Side;
  readonly points: Vec3[];
  readonly stops: SympatheticStop[];
  /** The point at which each neurone begins, and the points worth a name. */
  readonly starts: Readonly<Record<Neurone, number>>;
  readonly centre: number;
  readonly root: number;
};

const idx = (s: Segment): number => SEGMENTS.indexOf(s);
const opposite = (s: Side): Side => (s === 'L' ? 'R' : 'L');
const onSide = (x: Side, l: 'ipsilateral' | 'contralateral'): Side => (l === 'ipsilateral' ? x : opposite(x));

export function sympatheticCourse(kb: Kb, render: RenderKb, x: Side): SympatheticCourse {
  const points: Vec3[] = [];
  const stops: SympatheticStop[] = [];
  const brain = (row: { readonly steps: readonly { level: BrainLevel; compartment: BrainCompartment }[]; readonly serves: 'ipsilateral' | 'contralateral' }, neurone: Neurone): void => {
    const side = onSide(x, row.serves);
    for (const s of row.steps) {
      stops.push({ point: points.length, neurone, at: { kind: 'brain', level: s.level, compartment: s.compartment, side } });
      points.push(partPoint(render, s.level, s.compartment, side, 'face'));
    }
  };
  const cordPoint = (c: Compartment, side: Side, k: number): Vec3 => place(render, k, fibrePoint(render, c, side, k, k, 'classical') ?? { x: 0, z: 0 });

  // First order: the brainstem, then down the cord on the side the knowledge base says.
  brain(kb.brain.sympathetic, 1);
  const { centre, firstOrderRunsOn } = kb.autonomic.ciliospinal;
  const fibres = onSide(x, firstOrderRunsOn);
  const [start, end] = [idx(centre[0]), idx(centre[1])];
  const outflow = idx(kb.autonomic.sympatheticOutflow.root);
  for (let k = 0; k <= outflow; k++) {
    stops.push({ point: points.length, neurone: 1, at: { kind: 'cord', compartment: 'descending_autonomic', side: fibres, k } });
    points.push(cordPoint('descending_autonomic', fibres, k));
  }
  // The centre: one point, at the segment the second neurone leaves by, standing for every
  // segment of the centre and for the fibres that descend beside it below that segment.
  const centreAt = points.length;
  points.push(cordPoint('intermediolateral', x, outflow));
  for (let k = outflow + 1; k <= end; k++) stops.push({ point: centreAt, neurone: 1, at: { kind: 'cord', compartment: 'descending_autonomic', side: fibres, k } });
  for (let k = start; k <= end; k++) stops.push({ point: centreAt, neurone: 1, at: { kind: 'cord', compartment: 'intermediolateral', side: x, k } });

  // Second order: out by the root, and up the chain.
  const second = points.length;
  const rootCompartment = kb.autonomic.sympatheticRootCompartment.compartment;
  stops.push({ point: points.length, neurone: 2, at: { kind: 'cord', compartment: rootCompartment, side: x, k: outflow } });
  points.push(cordPoint(rootCompartment, x, outflow));
  brain(kb.brain.sympatheticSecond, 2);

  // Third order: on the carotid, to the eye.
  const third = points.length;
  brain(kb.brain.sympatheticThird, 3);
  points.push(targetPoint(render, 'eye', x));

  return { side: x, points, stops, starts: { 1: 0, 2: second, 3: third }, centre: centreAt, root: second };
}

/**
 * Where a pulse on the strand stops: the first thing along it that the lesion damages, and the
 * neurone that is. The neurones lie in order along the strand, so the first met is the most
 * central one cut — which is what the engine reports.
 */
export function sympatheticFate(map: LesionMap, bmap: BrainMap, course: SympatheticCourse): { readonly diesAt: number; readonly neurone: 0 | Neurone } {
  const ordered = [...course.stops].sort((a, b) => a.point - b.point);
  for (const s of ordered) {
    const d = s.at.kind === 'brain' ? bmap.damage(s.at.level, s.at.compartment, s.at.side, 'face') : map.damage(s.at.compartment, s.at.side, s.at.k);
    if (d > 0) return { diesAt: s.point, neurone: s.neurone };
  }
  return { diesAt: -1, neurone: 0 };
}
