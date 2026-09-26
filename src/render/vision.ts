// The visual fields as HTML strings: a chart of both eyes, sector by sector, and the pupils.
// Every sector takes its state from the engine; nothing here decides a finding. No DOM, so
// it is tested under Node.
import type { Findings } from '../engine/forward.ts';
import { slotKey, type Slot } from '../engine/reverse.ts';
import { FIELD_CELLS, FIELD_SECTORS, SIDES, cellsOf, type FieldCell, type FieldRegion, type FieldState, type Side, type SignState } from '../kb/vocab.ts';
import { SECTOR_NAME } from './examine.ts';

const STATE_WORD: Record<FieldState, string> = { normal: 'seen', lost: 'lost', indeterminate: 'uncertain' };
const SIGN_WORD: Record<SignState, string> = { absent: 'absent', present: 'present', indeterminate: 'not settled' };
const EYE_WORD: Record<Side, string> = { L: 'Left eye', R: 'Right eye' };

/** True when any sector of either field, or either pupil, is not normal. */
export const visionAffected = (f: Findings): boolean =>
  SIDES.some((eye) => FIELD_CELLS.some((s) => f.fields[eye][s] !== 'normal') || f.rapd[eye] !== 'absent');

// One eye's chart: four peripheral quadrants, each split at 45° into a cell beside the horizontal
// meridian and one beside the vertical (P28), with the centre split at fixation.
const R = 46;
const C = 50;
const wedge = (from: number, to: number): string => {
  const p = (deg: number): string => {
    const a = (deg * Math.PI) / 180;
    return `${(C + R * Math.cos(a)).toFixed(2)} ${(C + R * Math.sin(a)).toFixed(2)}`;
  };
  return `M ${C} ${C} L ${p(from)} A ${R} ${R} 0 0 1 ${p(to)} Z`;
};

/** Where each cell sits on the chart of one eye. The temporal side is away from the nose. */
function sectorPath(eye: Side, sector: FieldCell): string {
  const temporalLeft = eye === 'L';
  const outer = sector.startsWith('temporal') === temporalLeft; // drawn on the viewer's left
  if (sector.startsWith('central')) {
    const leftHalf = sector === 'central_left';
    return leftHalf ? `M ${C} ${C - 16} A 16 16 0 0 0 ${C} ${C + 16} Z` : `M ${C} ${C - 16} A 16 16 0 0 1 ${C} ${C + 16} Z`;
  }
  const upper = sector.includes('_superior');
  const horizontal = sector.endsWith('_horizontal');
  // Angles run clockwise from the positive x axis; the chart's y grows downward. Each quadrant
  // spans 90°; its horizontal cell is the 45° next to the horizontal meridian (0° or 180°).
  const [from, to] = outer ? (upper ? [180, 270] : [90, 180]) : upper ? [270, 360] : [0, 90];
  const nearHorizontal = from === 180 || to === 180 || from === 0 || to === 360 ? (from === 180 || from === 0 ? 'start' : 'end') : 'start';
  const mid = from + 45;
  return horizontal ? (nearHorizontal === 'start' ? wedge(from, mid) : wedge(mid, to)) : nearHorizontal === 'start' ? wedge(mid, to) : wedge(from, mid);
}

// P28: the 45° lines that split each quadrant into its two cells, drawn from the central circle
// to the rim only — the centre itself is split at fixation, not in four.
const DIAGONALS = [45, 135, 225, 315]
  .map((deg) => {
    const a = (deg * Math.PI) / 180;
    const x1 = (C + 16 * Math.cos(a)).toFixed(2);
    const y1 = (C + 16 * Math.sin(a)).toFixed(2);
    const x2 = (C + R * Math.cos(a)).toFixed(2);
    const y2 = (C + R * Math.sin(a)).toFixed(2);
    return `<line class="fs-edge fs-fine" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  })
  .join('');

/** One eye's field. `entered` makes it a pressable examination control instead of a drawing. */
export function fieldChart(eye: Side, state: (sector: FieldCell) => FieldState, entered?: ReadonlyMap<string, string>): string {
  const sectors = FIELD_CELLS.map((sector) => {
    const key = slotKey({ kind: 'field', eye, sector } as Slot);
    const value = entered?.get(key);
    const cls = entered ? `ex-${value === undefined ? 'untested' : value === 'abnormal' ? 'abnormal' : 'normal'}` : `fs-${state(sector)}`;
    const title = `${EYE_WORD[eye]} · ${SECTOR_NAME[sector]}: ${entered ? (value ?? 'not tested') : STATE_WORD[state(sector)]}`;
    const press = entered ? ` data-slot="${key}" tabindex="0" role="button"` : '';
    return `<path class="fsec ${cls}"${press} d="${sectorPath(eye, sector)}"><title>${title}</title></path>`;
  }).join('');
  // Below the circle on the nasal side, so it never sits over a cell (P28).
  const nose = eye === 'L' ? `<text class="fs-lbl" x="98" y="102" text-anchor="end">nose →</text>` : `<text class="fs-lbl" x="2" y="102">← nose</text>`;
  return `<svg viewBox="0 0 100 104" role="img" aria-label="${EYE_WORD[eye]} visual field">
    ${sectors}<circle class="fs-edge" cx="${C}" cy="${C}" r="${R}"/><circle class="fs-edge" cx="${C}" cy="${C}" r="16"/>
    <line class="fs-edge" x1="4" y1="${C}" x2="96" y2="${C}"/><line class="fs-edge" x1="${C}" y1="4" x2="${C}" y2="96"/>
    ${DIAGONALS}
    ${nose}<text class="fs-lbl" x="${C}" y="102" text-anchor="middle">${EYE_WORD[eye]}</text></svg>`;
}

/** Both fields and the pupils, for the findings panel. */
export function visionPanel(f: Findings): string {
  const charts = SIDES.map((eye) => `<div class="fchart">${fieldChart(eye, (s) => f.fields[eye][s])}</div>`).join('');
  // A quadrant whose two cells agree in both eyes is one row; otherwise its cells are shown (P28).
  const regions = FIELD_SECTORS.flatMap((s): FieldRegion[] => {
    const cells = cellsOf(s);
    const agree = SIDES.every((eye) => cells.every((c) => f.fields[eye][c] === f.fields[eye][cells[0] ?? c]));
    return agree ? [s] : [...cells];
  });
  const rows = regions.filter((s) => SIDES.some((eye) => f.fields[eye][s] !== 'normal'))
    .map((s) => `<tr><th>${SECTOR_NAME[s]}</th>${SIDES.map((eye) => `<td class="st st-field-${f.fields[eye][s]}">${STATE_WORD[f.fields[eye][s]]}</td>`).join('')}</tr>`)
    .join('');
  const pupils = `<tr><th>afferent pupillary defect</th>${SIDES.map((eye) => `<td class="st st-sign-${f.rapd[eye]}">${SIGN_WORD[f.rapd[eye]]}</td>`).join('')}</tr>`;
  return `<div class="fcharts">${charts}</div>
    <table class="arm"><thead><tr><th>What is lost</th><th>Left eye</th><th>Right eye</th></tr></thead>
    <tbody>${rows || '<tr class="calm"><th>nothing</th><td>—</td><td>—</td></tr>'}${pupils}</tbody></table>`;
}
