// The examinations the instrument offers, built from the sourced landmarks and myotomes,
// so reverse mode asks only about places the body map can show.
import type { Slot } from '../engine/reverse.ts';
import type { RenderKb } from '../kb/types.ts';
import { REFLEXES, SENSORY_MODALITIES, SIDES } from '../kb/vocab.ts';

export function examSlots(render: RenderKb): Slot[] {
  const out: Slot[] = [];
  for (const side of SIDES) {
    for (const modality of SENSORY_MODALITIES) {
      for (const l of render.dermatomeLandmarks.landmarks) {
        out.push({ kind: 'sensory', side, modality, span: [l.segment, l.segment] });
      }
      out.push({ kind: 'sensory', side, modality, span: render.saddle.span });
    }
    for (const row of render.myotomes.rows) out.push({ kind: 'strength', side, span: row.span });
    for (const reflex of REFLEXES) out.push({ kind: 'reflex', side, reflex });
    out.push({ kind: 'babinski', side }, { kind: 'horner', side });
  }
  out.push({ kind: 'romberg' }, { kind: 'bladder' });
  return out;
}
