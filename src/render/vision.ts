// The visual fields as HTML strings: a chart of both eyes, sector by sector, and the pupils.
// Every sector takes its state from the engine; nothing here decides a finding. No DOM, so
// it is tested under Node.
import type { Findings } from '../engine/forward.ts';
import { slotKey, type Slot } from '../engine/reverse.ts';
import { FIELD_SECTORS, SIDES, type FieldSector, type FieldState, type Side, type SignState } from '../kb/vocab.ts';
import { SECTOR_NAME } from './examine.ts';

const STATE_WORD: Record<FieldState, string> = { normal: 'seen', lost: 'lost', indeterminate: 'uncertain' };
const SIGN_WORD: Record<SignState, string> = { absent: 'absent', present: 'present', indeterminate: 'not settled' };
const EYE_WORD: Record<Side, string> = { L: 'Left eye', R: 'Right eye' };

/** True when any sector of either field, or either pupil, is not normal. */
export const visionAffected = (f: Findings): boolean =>
  SIDES.some((eye) => FIELD_SECTORS.some((s) => f.fields[eye][s] !== 'normal') || f.rapd[eye] !== 'absent');

// One eye's chart: a circle of four peripheral quadrants with the centre split at fixation.
const R = 46;
const C = 50;
const wedge = (from: number, to: number): string => {
  const p = (deg: number): string => {
    const a = (deg * Math.PI) / 180;
    return `${(C + R * Math.cos(a)).toFixed(2)} ${(C + R * Math.sin(a)).toFixed(2)}`;
  };
  return `M ${C} ${C} L ${p(from)} A ${R} ${R} 0 0 1 ${p(to)} Z`;
};

/** Where each sector sits on the chart of one eye. The temporal side is away from the nose. */
function sectorPath(eye: Side, sector: FieldSector): string {
  const temporalLeft = eye === 'L';
  const outer = sector.startsWith('temporal') === temporalLeft; // drawn on the viewer's left
  if (sector.startsWith('central')) {
    const leftHalf = sector === 'central_left';
    return leftHalf ? `M ${C} ${C - 16} A 16 16 0 0 0 ${C} ${C + 16} Z` : `M ${C} ${C - 16} A 16 16 0 0 1 ${C} ${C + 16} Z`;
  }
  const upper = sector.endsWith('_superior');
  // Angles run clockwise from the positive x axis; the chart's y grows downward.
  return outer ? (upper ? wedge(180, 270) : wedge(90, 180)) : upper ? wedge(270, 360) : wedge(0, 90);
}

/** One eye's field. `entered` makes it a pressable examination control instead of a drawing. */
export function fieldChart(eye: Side, state: (sector: FieldSector) => FieldState, entered?: ReadonlyMap<string, string>): string {
  const sectors = FIELD_SECTORS.map((sector) => {
    const key = slotKey({ kind: 'field', eye, sector } as Slot);
    const value = entered?.get(key);
    const cls = entered ? `ex-${value === undefined ? 'untested' : value === 'abnormal' ? 'abnormal' : 'normal'}` : `fs-${state(sector)}`;
    const title = `${EYE_WORD[eye]} · ${SECTOR_NAME[sector]}: ${entered ? (value ?? 'not tested') : STATE_WORD[state(sector)]}`;
    const press = entered ? ` data-slot="${key}" tabindex="0" role="button"` : '';
    return `<path class="fsec ${cls}"${press} d="${sectorPath(eye, sector)}"><title>${title}</title></path>`;
  }).join('');
  const nose = eye === 'L' ? `<text class="fs-lbl" x="96" y="53" text-anchor="end">nose</text>` : `<text class="fs-lbl" x="4" y="53">nose</text>`;
  return `<svg viewBox="0 0 100 104" role="img" aria-label="${EYE_WORD[eye]} visual field">
    ${sectors}<circle class="fs-edge" cx="${C}" cy="${C}" r="${R}"/><circle class="fs-edge" cx="${C}" cy="${C}" r="16"/>
    <line class="fs-edge" x1="4" y1="${C}" x2="96" y2="${C}"/><line class="fs-edge" x1="${C}" y1="4" x2="${C}" y2="96"/>
    ${nose}<text class="fs-lbl" x="${C}" y="102" text-anchor="middle">${EYE_WORD[eye]}</text></svg>`;
}

/** Both fields and the pupils, for the findings panel. */
export function visionPanel(f: Findings): string {
  const charts = SIDES.map((eye) => `<div class="fchart">${fieldChart(eye, (s) => f.fields[eye][s])}</div>`).join('');
  const rows = FIELD_SECTORS.filter((s) => SIDES.some((eye) => f.fields[eye][s] !== 'normal'))
    .map((s) => `<tr><th>${SECTOR_NAME[s]}</th>${SIDES.map((eye) => `<td class="st st-field-${f.fields[eye][s]}">${STATE_WORD[f.fields[eye][s]]}</td>`).join('')}</tr>`)
    .join('');
  const pupils = `<tr><th>afferent pupillary defect</th>${SIDES.map((eye) => `<td class="st st-sign-${f.rapd[eye]}">${SIGN_WORD[f.rapd[eye]]}</td>`).join('')}</tr>`;
  return `<div class="fcharts">${charts}</div>
    <table class="arm"><thead><tr><th>What is lost</th><th>Left eye</th><th>Right eye</th></tr></thead>
    <tbody>${rows || '<tr class="calm"><th>nothing</th><td>—</td><td>—</td></tr>'}${pupils}</tbody></table>`;
}
