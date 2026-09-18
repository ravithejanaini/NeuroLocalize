// The examinations the instrument offers, built from the sourced landmarks and myotomes,
// so reverse mode asks only about places the body map can show.
import type { Slot } from '../engine/reverse.ts';
import { KB } from '../kb/kb.ts';
import type { RenderKb } from '../kb/types.ts';
import { CRANIAL_SIGNS, FIELD_SECTORS, LANGUAGE_SIGNS, MUSCLES, REFLEXES, SENSORY_MODALITIES, SIDES, SKIN_AREAS } from '../kb/vocab.ts';

/** Patches examined on their own: those that are not already a dermatome landmark (D30). */
export const OWN_AREAS = SKIN_AREAS.filter((a) => KB.plexus.skin[a].landmark === undefined);

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
    for (const muscle of MUSCLES) out.push({ kind: 'muscle', side, muscle });
    for (const area of OWN_AREAS) out.push({ kind: 'skin', side, area });
    out.push({ kind: 'face_sensation', side }, { kind: 'face_weakness', side }, { kind: 'ataxia', side });
    for (const sign of CRANIAL_SIGNS) out.push({ kind: 'cranial', side, sign });
    // P8: each eye's field, sector by sector, and its pupil.
    for (const sector of FIELD_SECTORS) out.push({ kind: 'field', eye: side, sector });
    out.push({ kind: 'rapd', side });
  }
  out.push({ kind: 'romberg' }, { kind: 'bladder' }, { kind: 'vertigo' }, { kind: 'truncal_ataxia' });
  // P10: the three facets of language, and neglect of each side of space.
  for (const sign of LANGUAGE_SIGNS) out.push({ kind: 'language', sign });
  for (const side of SIDES) out.push({ kind: 'neglect', side });
  return out;
}
