// The arm, as HTML strings: the deformities a lesion produces, muscle by muscle strength,
// and the nerve territories. No DOM, so it is tested under Node.
import type { Findings } from '../engine/forward.ts';
import { SITE_NAME } from '../engine/reverse.ts';
import {
  DEFORMITIES,
  MUSCLES,
  SIDES,
  SKIN_AREAS,
  type Deformity,
  type MuscleState,
  type PlexusSite,
  type SensoryState,
  type SignState,
  type Side,
} from '../kb/vocab.ts';
import { AREA_NAME, MUSCLE_NAME } from './examine.ts';

export const DEFORMITY_NAME: Record<Deformity, { readonly name: string; readonly what: string }> = {
  winged_scapula: { name: 'Winged scapula', what: 'the scapula lifts off the chest wall' },
  waiters_tip: { name: 'Waiter’s tip', what: 'arm adducted and internally rotated, elbow extended, forearm pronated' },
  wrist_drop: { name: 'Wrist drop', what: 'the wrist cannot be held extended' },
  claw_hand: { name: 'Claw hand', what: 'intrinsic muscles lost; fingers hyperextend at the knuckles and flex beyond' },
  ape_hand: { name: 'Ape hand', what: 'the thenar eminence is flat and the thumb lies in the plane of the palm' },
};

const SIDE_WORD: Record<Side, string> = { L: 'left', R: 'right' };
const MUSCLE_WORD: Record<MuscleState, string> = { normal: 'strong', weak: 'weak', indeterminate: 'uncertain' };
const SKIN_WORD: Record<SensoryState, string> = { intact: 'intact', impaired: 'reduced', lost: 'lost', indeterminate: 'uncertain' };

/** True when anything at the arm differs from normal on either side. */
export function armAffected(f: Findings): boolean {
  return SIDES.some(
    (x) =>
      MUSCLES.some((m) => f.muscles[x][m] !== 'normal') ||
      SKIN_AREAS.some((a) => f.skin[x].pain_temperature[a] !== 'intact' || f.skin[x].posterior_column[a] !== 'intact'),
  );
}

export function deformityChips(f: Findings): string {
  const chips = SIDES.flatMap((x) =>
    DEFORMITIES.filter((d) => f.deformities[x][d] !== 'absent').map((d) => {
      const s: SignState = f.deformities[x][d];
      const n = DEFORMITY_NAME[d];
      return `<span class="deform deform-${s}" title="${n.what}">${n.name}<span class="deform-side">${SIDE_WORD[x]}${
        s === 'indeterminate' ? ' · not settled' : ''
      }</span></span>`;
    }),
  );
  return chips.length ? `<div class="deforms">${chips.join('')}</div>` : '<p class="quiet">No deformity follows from this lesion.</p>';
}

export function armMuscleTable(f: Findings): string {
  const rows = MUSCLES.map((m) => {
    const cells = SIDES.map((x) => {
      const s = f.muscles[x][m];
      return `<td class="st st-mus-${s}">${MUSCLE_WORD[s]}</td>`;
    }).join('');
    const n = MUSCLE_NAME[m];
    return `<tr${SIDES.every((x) => f.muscles[x][m] === 'normal') ? ' class="calm"' : ''}><th>${n.movement}<span class="mus-name">${n.muscle}</span></th>${cells}</tr>`;
  }).join('');
  return `<table class="arm"><thead><tr><th>Muscle</th><th>Left</th><th>Right</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function armSkinTable(f: Findings): string {
  const cell = (x: Side, a: (typeof SKIN_AREAS)[number]): string => {
    const p = f.skin[x].pain_temperature[a];
    const v = f.skin[x].posterior_column[a];
    return p === v
      ? `<td class="st st-${p}">${SKIN_WORD[p]}</td>`
      : `<td class="st st-${p === 'intact' ? v : p}">pain ${SKIN_WORD[p]} · vib ${SKIN_WORD[v]}</td>`;
  };
  const rows = SKIN_AREAS.map((a) => {
    const quiet = SIDES.every((x) => f.skin[x].pain_temperature[a] === 'intact' && f.skin[x].posterior_column[a] === 'intact');
    return `<tr${quiet ? ' class="calm"' : ''}><th>${AREA_NAME[a]}</th>${SIDES.map((x) => cell(x, a)).join('')}</tr>`;
  }).join('');
  return `<table class="arm"><thead><tr><th>Skin</th><th>Left</th><th>Right</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export const siteWord = (s: PlexusSite): string => SITE_NAME[s];
