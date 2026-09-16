// The cord in cross-section: how wide it is at each segment, where each compartment sits,
// and where an individual fibre sits inside its tract under a given lamination model.
import type { Disc, LaminationModel, LaminationProfile, RenderKb, TractPoint } from '../kb/types.ts';
import { COMPARTMENTS, SEGMENTS, type Compartment, type Side } from '../kb/vocab.ts';

export type Point2 = { readonly x: number; readonly z: number };

export const CORD_COMPARTMENTS: readonly Compartment[] = COMPARTMENTS.filter(
  (c) => c !== 'dorsal_root' && c !== 'ventral_root',
);

const index = (s: string): number => SEGMENTS.indexOf(s as (typeof SEGMENTS)[number]);
const mid = ([a, b]: readonly [number, number]): number => (a + b) / 2;
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function union(spans: readonly (readonly [string, string])[]): readonly [number, number] {
  return [Math.min(...spans.map((s) => index(s[0]))), Math.max(...spans.map((s) => index(s[1])))];
}

export const enlargementSpans = (render: RenderKb): { cervical: readonly [number, number]; lumbar: readonly [number, number] } => ({
  cervical: union(render.enlargements.cervical),
  lumbar: union(render.enlargements.lumbar),
});

/** How far segment k lies inside an enlargement: 1 inside, falling to 0 over two segments. */
function bulge(k: number, [a, b]: readonly [number, number]): number {
  const outside = k < a ? a - k : k > b ? k - b : 0;
  return clamp01(1 - outside / 2);
}

/**
 * Cord width at segment k, in cm. Enlargements carry the regional width (S24); elsewhere the
 * cord has the thoracic width. The conus tapers — its profile is schematic.
 */
export function widthCm(render: RenderKb, k: number): number {
  const w = render.cord.widthCm;
  const e = enlargementSpans(render);
  const thin = mid(w.thoracic);
  const width = Math.max(
    thin + (mid(w.cervical) - thin) * bulge(k, e.cervical),
    thin + (mid(w.lumbar) - thin) * bulge(k, e.lumbar),
  );
  const taperFrom = e.lumbar[1];
  if (k <= taperFrom) return width;
  const t = clamp01((k - taperFrom) / (SEGMENTS.length - taperFrom));
  return width * lerp(1, 0.25, t);
}

/** A compartment's region at segment k, or null where it does not exist. */
export function discAt(render: RenderKb, c: Compartment, side: Side, k: number): Disc | null {
  if (c === 'intermediolateral') {
    const [a, b] = render.lateralHorn.span;
    if (k < index(a) || k > index(b)) return null;
  }
  const d = render.layout.discs[c];
  return { x: side === 'L' ? d.x : -d.x, z: d.z, r: d.r };
}

/** A fixed pattern of 37 points filling a disc, kept just inside its edge. */
export function samples(d: Disc): Point2[] {
  const out: Point2[] = [{ x: d.x, z: d.z }];
  for (const [ring, count] of [[0.33, 6], [0.66, 12], [0.95, 18]] as const) {
    for (let i = 0; i < count; i++) {
      const a = (2 * Math.PI * i) / count;
      out.push({ x: d.x + Math.cos(a) * d.r * ring, z: d.z + Math.sin(a) * d.r * ring });
    }
  }
  return out;
}

/** Deterministic value in [0, 1) for a fibre, so it keeps its place along the cord. */
function hash(n: number, salt: number): number {
  let h = (n * 374761393 + salt * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const toPlane = (d: Disc, p: TractPoint): Point2 => {
  const outward = Math.sign(d.x) || 1;
  return { x: d.x + outward * p.lateral * d.r * 0.85, z: d.z + p.dorsal * d.r * 0.85 };
};

function profilePoint(profile: LaminationProfile, render: RenderKb, k: number, s: number): TractPoint {
  const e = enlargementSpans(render);
  const body = clamp01((s - e.cervical[0]) / (e.lumbar[1] - e.cervical[0]));
  const level = clamp01((k - e.cervical[0]) / (e.lumbar[1] - e.cervical[0]));
  const at = (region: LaminationProfile['upperLimb']): TractPoint => ({
    lateral: lerp(region.cervical.lateral, region.lumbar.lateral, level),
    dorsal: lerp(region.cervical.dorsal, region.lumbar.dorsal, level),
  });
  const up = at(profile.upperLimb);
  const low = at(profile.lowerLimb);
  const ordered = { lateral: lerp(up.lateral, low.lateral, body), dorsal: lerp(up.dorsal, low.dorsal, body) };
  const a = 2 * Math.PI * hash(s, 1);
  const r = Math.sqrt(hash(s, 2));
  const random = { lateral: Math.cos(a) * r, dorsal: Math.sin(a) * r };
  return {
    lateral: lerp(ordered.lateral, random.lateral, profile.scatter),
    dorsal: lerp(ordered.dorsal, random.dorsal, profile.scatter),
  };
}

/**
 * Where the fibre carrying input from segment s sits within compartment c at segment k.
 * Only the posterior columns and the two long tracts have an internal arrangement.
 */
export function fibrePoint(
  render: RenderKb,
  c: Compartment,
  side: Side,
  k: number,
  s: number,
  model: LaminationModel,
): Point2 | null {
  const d = discAt(render, c, side, k);
  if (!d) return null;
  if (c === 'dorsal_column') {
    // Gracilis medial, cuneatus lateral; within each, lower inputs lie more medially (S27).
    const boundary = index(render.posteriorColumn.cuneatusCarriesRostralTo);
    const lateral =
      s >= boundary
        ? -1 + (SEGMENTS.length - 1 - s) / (SEGMENTS.length - 1 - boundary)
        : (boundary - s) / Math.max(1, boundary);
    return toPlane(d, { lateral, dorsal: 0 });
  }
  if (c === 'anterolateral') return toPlane(d, profilePoint(render.lamination.spinothalamic.models[model], render, k, s));
  if (c === 'lateral_cst') return toPlane(d, profilePoint(render.lamination.corticospinal.models[model], render, k, s));
  return { x: d.x, z: d.z };
}
