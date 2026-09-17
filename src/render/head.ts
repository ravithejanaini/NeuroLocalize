// The head and brainstem findings, as HTML strings. No DOM, so it is tested under Node.
import type { Findings } from '../engine/forward.ts';
import { CRANIAL_SIGNS, SEGMENTS, SIDES, type FaceWeakness, type SensoryState, type Side, type SignState } from '../kb/vocab.ts';
import { CRANIAL_NAME } from './examine.ts';

const FACE_WORD: Record<FaceWeakness, string> = {
  none: 'strong',
  lower: 'lower face weak, forehead spared',
  whole: 'whole face weak, forehead too',
  indeterminate: 'uncertain',
};
const SENSE_WORD: Record<SensoryState, string> = { intact: 'intact', impaired: 'reduced', lost: 'lost', indeterminate: 'uncertain' };
const SIGN_WORD: Record<SignState, string> = { present: 'present', absent: 'absent', indeterminate: 'uncertain' };
const other = (s: Side): Side => (s === 'L' ? 'R' : 'L');
const SIDE_WORD: Record<Side, string> = { L: 'left', R: 'right' };

/** A head sign on one side and a body deficit on the other: the crossed pattern (S65). */
export function crossedSide(f: Findings): Side | null {
  for (const x of SIDES) {
    // An upper-motor-neuron tongue sits with the weak body, so the side checks below exclude it.
    const head =
      f.faceWeakness[x] === 'whole' ||
      f.faceSensation[x] === 'lost' ||
      f.ataxia[x] === 'present' ||
      CRANIAL_SIGNS.some((s) => f.cranial[x][s] === 'present');
    const body = SEGMENTS.some(
      (seg) =>
        f.motor[other(x)][seg].lesion !== 'none' ||
        f.sensory[other(x)].pain_temperature[seg] === 'lost' ||
        f.sensory[other(x)].posterior_column[seg] === 'lost',
    );
    const bodySame = SEGMENTS.some((seg) => f.motor[x][seg].lesion !== 'none' || f.sensory[x].pain_temperature[seg] === 'lost');
    if (head && body && !bodySame) return x;
  }
  return null;
}

export function headAffected(f: Findings): boolean {
  return SIDES.some(
    (x) =>
      f.faceWeakness[x] !== 'none' ||
      f.faceSensation[x] !== 'intact' ||
      f.ataxia[x] !== 'absent' ||
      CRANIAL_SIGNS.some((s) => f.cranial[x][s] !== 'absent'),
  ) || f.vertigo !== 'absent';
}

export function headHtml(f: Findings): string {
  if (!headAffected(f)) return '<p class="quiet">Face, eyes, tongue and palate normal; no ataxia or vertigo.</p>';
  const crossed = crossedSide(f);
  const lead = crossed
    ? `<p class="crossed">Crossed: signs in the ${SIDE_WORD[crossed]} head with a deficit in the ${SIDE_WORD[other(crossed)]} body — the mark of a brainstem lesion.</p>`
    : '';
  const row = (name: string, cells: (x: Side) => { word: string; quiet: boolean }): string => {
    const cs = SIDES.map(cells);
    return `<tr${cs.every((c) => c.quiet) ? ' class="calm"' : ''}><th>${name}</th>${cs.map((c) => `<td class="${c.quiet ? 'quiet' : 'st st-lost'}">${c.word}</td>`).join('')}</tr>`;
  };
  const rows = [
    row('Face, sensation', (x) => ({ word: SENSE_WORD[f.faceSensation[x]], quiet: f.faceSensation[x] === 'intact' })),
    row('Face, strength', (x) => ({ word: FACE_WORD[f.faceWeakness[x]], quiet: f.faceWeakness[x] === 'none' })),
    ...CRANIAL_SIGNS.map((s) => row(CRANIAL_NAME[s], (x) => ({ word: SIGN_WORD[f.cranial[x][s]], quiet: f.cranial[x][s] === 'absent' }))),
    row('Limb ataxia', (x) => ({ word: SIGN_WORD[f.ataxia[x]], quiet: f.ataxia[x] === 'absent' })),
  ].join('');
  return `${lead}<table class="head"><thead><tr><th></th><th>Left</th><th>Right</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="kv"><span class="k">Vertigo</span><span class="v">${SIGN_WORD[f.vertigo]}</span></div>`;
}
