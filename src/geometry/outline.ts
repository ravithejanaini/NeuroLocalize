// A lesion shape as a closed outline in the cross-section, in units of cord radius,
// clipped just outside the cord. Shared by the 3D scene and the flat slice diagram.
import type { Shape } from './lesion3d.ts';

const EDGE = 1.04;

const arc = (from: number, to: number, steps: number): { x: number; z: number }[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps;
    return { x: Math.cos(a) * EDGE, z: Math.sin(a) * EDGE };
  });

export function outline(shape: Shape): { x: number; z: number }[] {
  const n = 72;
  switch (shape.kind) {
    case 'complete':
      return arc(0, 2 * Math.PI, n).slice(0, n);
    case 'half': {
      // A continuous arc; the chord along the midline closes it.
      const start = shape.side === 'L' ? Math.PI / 2 : -Math.PI / 2;
      return arc(start, start + Math.PI, n / 2);
    }
    case 'ventral': {
      const a0 = Math.asin(Math.max(-1, Math.min(1, shape.dorsalLimit / EDGE)));
      return arc(Math.PI - a0, 2 * Math.PI + a0, n);
    }
    case 'ellipse':
      return Array.from({ length: n }, (_, i) => {
        const a = (2 * Math.PI * i) / n;
        const p = { x: shape.x + Math.cos(a) * shape.rx, z: shape.z + Math.sin(a) * shape.rz };
        const d = Math.hypot(p.x, p.z);
        return d > EDGE ? { x: (p.x / d) * EDGE, z: (p.z / d) * EDGE } : p;
      });
  }
}
