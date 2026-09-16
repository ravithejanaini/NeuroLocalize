// A lesion as a shape in space, turned into the same LesionRegion[] the engine accepts.
// Coverage of each compartment is measured, never assumed (D18).
import type { LesionRegion } from '../engine/forward.ts';
import type { RenderKb } from '../kb/types.ts';
import { SEGMENTS, SIDES, type Compartment, type Portion, type Segment, type Severity, type Side } from '../kb/vocab.ts';
import { segmentBounds, segmentsBetween } from './ruler.ts';
import { CORD_COMPARTMENTS, discAt, samples, type Point2 } from './section.ts';

export type Shape =
  | { readonly kind: 'complete' }
  /** Everything on one side of the midline. */
  | { readonly kind: 'half'; readonly side: Side }
  /** Everything ventral to a coronal plane, in units of cord radius. */
  | { readonly kind: 'ventral'; readonly dorsalLimit: number }
  /** An ellipse in the cross-section, in units of cord radius. */
  | { readonly kind: 'ellipse'; readonly x: number; readonly z: number; readonly rx: number; readonly rz: number };

/** A shape extruded between two vertebral positions (top < bottom). */
export type Volume = { readonly shape: Shape; readonly top: number; readonly bottom: number };

export type RootCut = {
  readonly side: Side;
  readonly from: Segment;
  readonly to: Segment;
  readonly roots: readonly ('dorsal_root' | 'ventral_root')[];
};

/** An ellipse whose centre lies this close to the canal counts as a central lesion. */
const CENTRAL = 0.25;

function inside(shape: Shape, p: Point2): boolean {
  switch (shape.kind) {
    case 'complete':
      return true;
    case 'half':
      return shape.side === 'L' ? p.x < 0 : p.x > 0;
    case 'ventral':
      return p.z < shape.dorsalLimit;
    case 'ellipse':
      return ((p.x - shape.x) / shape.rx) ** 2 + ((p.z - shape.z) / shape.rz) ** 2 <= 1;
  }
}

export function coverage(shape: Shape, points: readonly Point2[]): number {
  return points.filter((p) => inside(shape, p)).length / points.length;
}

const isCentral = (shape: Shape): boolean =>
  shape.kind === 'ellipse' && Math.hypot(shape.x, shape.z) <= CENTRAL;

type Cell = { compartment: Compartment; side: Side; severity: Severity; portion: Portion };

function runs(cells: Map<string, Cell & { k: number }>): LesionRegion[] {
  const groups = new Map<string, number[]>();
  const meta = new Map<string, Cell>();
  for (const c of cells.values()) {
    const key = `${c.compartment}|${c.side}|${c.severity}|${c.portion}`;
    groups.set(key, [...(groups.get(key) ?? []), c.k]);
    meta.set(key, c);
  }
  const out: LesionRegion[] = [];
  for (const [key, ks] of groups) {
    const m = meta.get(key);
    if (!m) continue;
    const sorted = [...ks].sort((a, b) => a - b);
    let start = sorted[0];
    for (let i = 0; i < sorted.length; i++) {
      const k = sorted[i];
      const next = sorted[i + 1];
      if (start === undefined || k === undefined) continue;
      if (next !== k + 1) {
        const from = SEGMENTS[start];
        const to = SEGMENTS[k];
        if (from && to) {
          out.push({
            at: { segments: [from, to] },
            sides: [m.side],
            compartments: [m.compartment],
            severity: m.severity,
            portion: m.portion,
          });
        }
        start = next;
      }
    }
  }
  return out;
}

export function toRegions(render: RenderKb, volumes: readonly Volume[], roots: readonly RootCut[] = []): LesionRegion[] {
  const cells = new Map<string, Cell & { k: number }>();
  const worse = (a: Severity, b: Severity): Severity => (a === 'complete' || b === 'complete' ? 'complete' : 'partial');

  for (const v of volumes) {
    for (const k of segmentsBetween(render, v.top, v.bottom)) {
      for (const side of SIDES) {
        for (const c of CORD_COMPARTMENTS) {
          const d = discAt(render, c, side, k);
          if (!d) continue;
          const f = coverage(v.shape, samples(d));
          if (f === 0) continue;
          const severity: Severity = f === 1 ? 'complete' : 'partial';
          const portion: Portion = severity === 'partial' && isCentral(v.shape) ? 'central' : 'whole';
          const key = `${c}|${side}|${k}`;
          const prev = cells.get(key);
          cells.set(key, {
            compartment: c,
            side,
            k,
            severity: prev ? worse(prev.severity, severity) : severity,
            portion: prev && prev.portion === 'whole' ? 'whole' : portion,
          });
        }
      }
    }
  }

  const rootRegions: LesionRegion[] = roots.map((r) => ({
    at: { segments: [r.from, r.to] },
    sides: [r.side],
    compartments: r.roots,
    severity: 'complete',
    portion: 'whole',
  }));
  return [...runs(cells), ...rootRegions];
}

/** The vertebral extent of a run of segments. */
export function spanOf(render: RenderKb, from: Segment, to: Segment): { top: number; bottom: number } {
  return {
    top: segmentBounds(render, SEGMENTS.indexOf(from))[0],
    bottom: segmentBounds(render, SEGMENTS.indexOf(to))[1],
  };
}

/** Named lesion shapes. Vascular and traumatic lesions are volumes; see D19. */
export const SHAPES = {
  complete: { kind: 'complete' },
  hemisectionLeft: { kind: 'half', side: 'L' },
  hemisectionRight: { kind: 'half', side: 'R' },
  // The anterior spinal artery supplies the anterior two-thirds of the cord (S07).
  anterior: { kind: 'ventral', dorsalLimit: 0.3 },
  posterior: { kind: 'ellipse', x: 0, z: 0.62, rx: 0.4, rz: 0.2 },
  syrinx: { kind: 'ellipse', x: 0, z: -0.1, rx: 0.13, rz: 0.13 },
  centralCord: { kind: 'ellipse', x: 0, z: -0.05, rx: 0.72, rz: 0.45 },
} as const satisfies Record<string, Shape>;
