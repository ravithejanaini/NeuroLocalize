// Flat diagrams as SVG strings: the axial slice, the body map and the myotome grid.
// No DOM and no Three.js here, so every builder is tested under Node.
import type { Findings } from '../engine/forward.ts';
import type { Shape } from '../geometry/lesion3d.ts';
import { outline } from '../geometry/outline.ts';
import { CORD_COMPARTMENTS, discAt, fibrePoint } from '../geometry/section.ts';
import type { LaminationModel, RenderKb, Span } from '../kb/types.ts';
import {
  SEGMENTS,
  SIDES,
  type MotorLesion,
  type Segment,
  type SensoryModality,
  type SensoryState,
  type Side,
} from '../kb/vocab.ts';

const idx = (s: Segment): number => SEGMENTS.indexOf(s);
const f3 = (n: number): string => n.toFixed(3);
const segs = ([a, b]: Span): Segment[] => SEGMENTS.slice(idx(a), idx(b) + 1);

const RANK: Record<SensoryState, number> = { intact: 0, indeterminate: 1, impaired: 2, lost: 3 };
export const worstSensory = (states: readonly SensoryState[]): SensoryState =>
  states.reduce<SensoryState>((w, s) => (RANK[s] > RANK[w] ? s : w), 'intact');

// ── axial slice ──────────────────────────────────────────────────────────

/** Fibres drawn in the slice: one input from each body region. */
export const SAMPLE_INPUTS: readonly { readonly segment: Segment; readonly mark: string; readonly region: string }[] = [
  { segment: 'C6', mark: 'A', region: 'arm' },
  { segment: 'T6', mark: 'T', region: 'trunk' },
  { segment: 'L4', mark: 'L', region: 'leg' },
  { segment: 'S3', mark: 'S', region: 'sacral' },
];

/**
 * Cross-section at segment k, dorsal side up, patient's left on the left. A fibre is drawn
 * only where it still runs: an ascending fibre enters at its own segment, and a descending
 * one ends there, so either is present at k only if its segment lies caudal to k.
 */
export function sliceSvg(render: RenderKb, k: number, model: LaminationModel, lesion: Shape | null): string {
  const discs = SIDES.flatMap((side) =>
    CORD_COMPARTMENTS.map((c) => {
      const d = discAt(render, c, side, k);
      return d ? `<circle class="cmp cmp-${c}" cx="${f3(d.x)}" cy="${f3(-d.z)}" r="${f3(d.r)}"/>` : '';
    }),
  ).join('');

  const fibres = SIDES.flatMap((side) =>
    (['dorsal_column', 'anterolateral', 'lateral_cst'] as const).flatMap((c) =>
      SAMPLE_INPUTS.filter((f) => idx(f.segment) > k).map((f) => {
        const p = fibrePoint(render, c, side, k, idx(f.segment), model);
        return p
          ? `<text class="fib" x="${f3(p.x)}" y="${f3(-p.z)}" data-tract="${c}" data-region="${f.region}">${f.mark}</text>`
          : '';
      }),
    ),
  ).join('');

  const hatch = lesion
    ? `<polygon class="lesion" points="${outline(lesion)
        .map((p) => `${f3(p.x)},${f3(-p.z)}`)
        .join(' ')}"/>`
    : '';

  return `<svg viewBox="-1.3 -1.3 2.6 2.6" role="img" aria-label="Cross-section at ${SEGMENTS[k] ?? ''}">
    <defs><pattern id="hatch" width="0.06" height="0.06" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="0.06" class="hatch"/></pattern></defs>
    <circle class="cord" cx="0" cy="0" r="1"/>${discs}${hatch}${fibres}
    <text class="ori" x="-1.24" y="0.05">L</text><text class="ori" x="1.12" y="0.05">R</text>
    <text class="ori" x="-0.22" y="-1.12">dorsal</text>
  </svg>`;
}

// ── body map ─────────────────────────────────────────────────────────────

const mirror = (x: number): number => 200 - x;

// Front view in anatomical position; drawn once for the patient's left and mirrored.
const HALF = `
  <path d="M100 52 L134 58 Q140 60 140 70 L128 168 L124 186 L100 188 Z"/>
  <path d="M136 62 Q148 62 151 74 L154 140 L140 142 L136 90 Z"/>
  <path d="M140 142 L154 140 L161 206 L146 208 Z"/>
  <ellipse cx="153" cy="226" rx="9" ry="17"/>
  <ellipse cx="161" cy="222" rx="3" ry="8"/>
  <path d="M100 188 L124 186 L122 250 L103 252 Z"/>
  <path d="M103 252 L122 250 L120 330 L108 330 Z"/>
  <ellipse cx="116" cy="342" rx="11" ry="6"/>`;

export type BodyDot = { side: Side; segment: string; place: string; state: SensoryState; x: number; y: number; convention: boolean };

export function bodyDots(render: RenderKb, f: Findings, modality: SensoryModality): BodyDot[] {
  const out: BodyDot[] = [];
  for (const side of SIDES) {
    // The patient's left is drawn on the viewer's right.
    const x = (v: number): number => (side === 'L' ? v : mirror(v));
    for (const l of render.dermatomeLandmarks.landmarks) {
      for (const p of l.at) {
        out.push({ side, segment: l.segment, place: l.place, state: f.sensory[side][modality][l.segment], x: x(p.x), y: p.y, convention: false });
      }
    }
    const s = render.saddle;
    out.push({
      side,
      segment: `${s.span[0]}–${s.span[1]}`,
      place: s.place,
      state: worstSensory(segs(s.span).map((seg) => f.sensory[side][modality][seg])),
      x: x(s.at.x),
      y: s.at.y,
      convention: true,
    });
  }
  return out;
}

export function bodyMapSvg(render: RenderKb, f: Findings, modality: SensoryModality): string {
  const dots = bodyDots(render, f, modality)
    .map((d) => {
      const title = `${d.side === 'L' ? 'Left' : 'Right'} ${d.segment} — ${d.place}: ${d.state}${d.convention ? ' (segment assignment is a convention)' : ''}`;
      return d.convention
        ? `<rect class="dot st-${d.state}" x="${d.x - 4}" y="${d.y - 4}" width="8" height="8" transform="rotate(45 ${d.x} ${d.y})"><title>${title}</title></rect>`
        : `<circle class="dot st-${d.state}" cx="${d.x}" cy="${d.y}" r="4.5"><title>${title}</title></circle>`;
    })
    .join('');
  return `<svg viewBox="0 0 200 364" role="img" aria-label="Body map of ${modality === 'pain_temperature' ? 'pain and temperature' : 'posterior-column sensation'}">
    <g class="body"><circle cx="100" cy="26" r="17"/><rect x="93" y="41" width="14" height="13"/>${HALF}
      <g transform="translate(200 0) scale(-1 1)">${HALF}</g></g>
    ${dots}
    <text class="side-lbl" x="4" y="12">patient’s right</text>
    <text class="side-lbl" x="196" y="12" text-anchor="end">patient’s left</text>
  </svg>`;
}

/** The first affected segment, placed against the sourced landmarks. */
export function sensoryLevelText(render: RenderKb, f: Findings, side: Side, modality: SensoryModality): string {
  const column = f.sensory[side][modality];
  const affected = SEGMENTS.filter((s) => column[s] !== 'intact');
  const first = affected[0];
  if (!first) return 'intact at every segment';
  const k = idx(first);
  const marks = render.dermatomeLandmarks.landmarks;
  const above = [...marks].reverse().find((m) => idx(m.segment) <= k);
  const below = marks.find((m) => idx(m.segment) > k);
  const at = above && idx(above.segment) === k ? `at the ${above.place} (${above.segment})` : '';
  const between = at || [above ? `below the ${above.place} (${above.segment})` : '', below ? `above the ${below.place} (${below.segment})` : ''].filter(Boolean).join(', ');
  const last = affected[affected.length - 1];
  const suspended = last && idx(last) < SEGMENTS.length - 1 && column.S5 === 'intact' ? `; intact again below ${last}` : '';
  return `first affected at ${first}${between ? ` — ${between}` : ''}${suspended}`;
}

// ── myotomes ─────────────────────────────────────────────────────────────

const LESION_WORD: Record<MotorLesion, string> = { none: '—', umn: 'UMN', lmn: 'LMN', umn_lmn: 'UMN+LMN' };
const LESION_RANK: Record<MotorLesion, number> = { none: 0, umn: 1, lmn: 2, umn_lmn: 3 };

export function myotomeState(f: Findings, side: Side, span: Span): MotorLesion {
  return segs(span)
    .map((s) => f.motor[side][s].lesion)
    .reduce<MotorLesion>((w, l) => (LESION_RANK[l] > LESION_RANK[w] ? l : w), 'none');
}

export function myotomeTable(render: RenderKb, f: Findings): string {
  const rows = render.myotomes.rows
    .map((r) => {
      const name = r.span[0] === r.span[1] ? r.span[0] : `${r.span[0]}–${r.span[1]}`;
      const cells = SIDES.map((side) => {
        const s = myotomeState(f, side, r.span);
        return `<td class="st st-${s}">${LESION_WORD[s]}</td>`;
      }).join('');
      const other = r.otherAccount ? `<span class="other">${r.otherAccount}</span>` : '';
      return `<tr${r.otherAccount ? ' class="contested"' : ''}><th>${name}</th><td class="mv">${r.movement}${other}</td>${cells}</tr>`;
    })
    .join('');
  return `<table class="myotomes"><thead><tr><th></th><th>Movement</th><th>Left</th><th>Right</th></tr></thead><tbody>${rows}</tbody></table>`;
}
