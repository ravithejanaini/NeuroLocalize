// Where each cord segment sits against the vertebral column (D16). Positions are in
// vertebral units: 0 is the top of C1, and each vertebra is one unit tall (D16: heights
// are drawn equal). Between the sourced anchors, positions are interpolated.
import type { RenderKb } from '../kb/types.ts';
import { SEGMENTS, VERTEBRAE, type Vertebra } from '../kb/vocab.ts';

type Point = readonly [segmentIndex: number, vertebral: number];

function anchors(render: RenderKb): Point[] {
  const pts: Point[] = render.ruler.anchors.map((a): Point => [SEGMENTS.indexOf(a.segment), a.vertebraTop]);
  pts.push([SEGMENTS.length, render.ruler.cordEndsAtVertebra]);
  return pts;
}

/** Vertebral position of the rostral edge of segment k (k may equal SEGMENTS.length). */
export function segmentTop(render: RenderKb, k: number): number {
  const pts = anchors(render);
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (!first || !last) throw new Error('The segment ruler has no anchors.');
  if (k <= first[0]) return first[1];
  if (k >= last[0]) return last[1];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (a && b && k >= a[0] && k <= b[0]) return a[1] + ((k - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);
  }
  throw new Error(`Segment index ${k} falls outside the ruler.`);
}

export const segmentBounds = (render: RenderKb, k: number): readonly [number, number] => [
  segmentTop(render, k),
  segmentTop(render, k + 1),
];

export const segmentMid = (render: RenderKb, k: number): number => {
  const [top, bottom] = segmentBounds(render, k);
  return (top + bottom) / 2;
};

export const vertebraTop = (v: Vertebra): number => VERTEBRAE.indexOf(v);

/** Segments whose extent overlaps the open interval (top, bottom). Touching is not overlap. */
export function segmentsBetween(render: RenderKb, top: number, bottom: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < SEGMENTS.length; k++) {
    const [a, b] = segmentBounds(render, k);
    if (a < bottom && b > top) out.push(k);
  }
  return out;
}
