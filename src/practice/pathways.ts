// The pathways a lesion exercises, read from what it does rather than from where it is.
// Review is scheduled by these (D48): a student who misreads crossed pain loss should see
// it again whether it comes from the cord, the medulla or the thalamus.
import type { Findings } from '../engine/forward.ts';
import type { Hypothesis } from '../engine/hypotheses.ts';
import type { Observation } from '../engine/reverse.ts';
import { KB } from '../kb/kb.ts';
import { DORSAL_MIDBRAIN_SIGNS, FIELD_CELLS, LANGUAGE_SIGNS, MUSCLES, SEGMENTS, SIDES, type Segment, type Side } from '../kb/vocab.ts';

export const PATHWAYS = [
  'spinothalamic',
  'dorsal_column',
  'corticospinal',
  'lower_motor_neuron',
  'autonomic',
  'peripheral_nerve',
  'trigeminal',
  'corticobulbar',
  'cranial_nuclei',
  'eye_movements',
  'cerebellar_vestibular',
  'visual',
  'language',
  'movement',
] as const;
export type Pathway = (typeof PATHWAYS)[number];

export const PATHWAY_NAME: Record<Pathway, { readonly name: string; readonly what: string }> = {
  spinothalamic: { name: 'Pain and temperature', what: 'where the spinothalamic fibres cross, and which side loses what' },
  dorsal_column: { name: 'Vibration and position', what: 'the uncrossed posterior columns and the medial lemniscus' },
  corticospinal: { name: 'Upper motor neuron', what: 'weakness with brisk reflexes and a Babinski sign, and where the tract crosses' },
  lower_motor_neuron: { name: 'Lower motor neuron', what: 'weakness with reduced reflexes: the horn, the root, the nerve' },
  autonomic: { name: 'Autonomic', what: 'Horner syndrome and the bladder' },
  peripheral_nerve: { name: 'Plexus and nerves', what: 'root against trunk against cord against nerve' },
  trigeminal: { name: 'Facial sensation', what: 'the ipsilateral trigeminal nucleus and the crossed route above it' },
  corticobulbar: { name: 'Face from above', what: 'lower-face weakness with the forehead spared' },
  cranial_nuclei: { name: 'Cranial nerve nuclei', what: 'third, fourth and sixth nerves, the jaw, tongue, palate, the whole face and hearing' },
  eye_movements: { name: 'Conjugate gaze', what: 'gaze palsy, internuclear ophthalmoplegia and one-and-a-half, and the dorsal midbrain: which eye fails to move, which way, and how the pupils react' },
  cerebellar_vestibular: { name: 'Ataxia and vertigo', what: 'the cerebellar hemispheres, vermis and peduncles, and the vestibular nuclei' },
  visual: { name: 'Visual fields', what: 'the optic nerve, chiasm, tract, radiations and occipital cortex, and the pupil' },
  language: { name: 'Language and attention', what: 'fluency, comprehension and repetition in the dominant hemisphere; neglect in the other' },
  movement: { name: 'Involuntary movements', what: 'hemiballismus: the subthalamic nucleus of the opposite side' },
};

const hurt = (s: string): boolean => s === 'lost' || s === 'impaired';
/** The signs that are read across both eyes rather than nerve by nerve (D65). */
const GAZE_SIGNS: ReadonlySet<string> = new Set(['gaze_palsy', 'adduction_weakness', 'abducting_nystagmus']);
const PERIPHERAL = new Set(['plexus_left', 'plexus_right', 'nerve_left', 'nerve_right']);

export function pathwaysOf(f: Findings, h: Hypothesis): Pathway[] {
  const out = new Set<Pathway>();
  const any = (test: (side: 'L' | 'R', seg: (typeof SEGMENTS)[number]) => boolean): boolean =>
    SIDES.some((x) => SEGMENTS.some((s) => test(x, s)));

  if (any((x, s) => hurt(f.sensory[x].pain_temperature[s]))) out.add('spinothalamic');
  if (any((x, s) => hurt(f.sensory[x].posterior_column[s]))) out.add('dorsal_column');
  const reflexes = SIDES.flatMap((x) => Object.values(f.reflexes[x]));
  if (
    any((x, s) => f.motor[x][s].lesion === 'umn' || f.motor[x][s].lesion === 'umn_lmn') ||
    SIDES.some((x) => f.babinski[x] === 'present') ||
    reflexes.includes('brisk')
  ) {
    out.add('corticospinal');
  }
  const peripheral = PERIPHERAL.has(h.family);
  if (
    any((x, s) => f.motor[x][s].lesion === 'lmn' || f.motor[x][s].lesion === 'umn_lmn') ||
    reflexes.some((r) => r === 'reduced' || r === 'absent') ||
    (peripheral && SIDES.some((x) => MUSCLES.some((m) => f.muscles[x][m] === 'weak')))
  ) {
    out.add('lower_motor_neuron');
  }
  if (SIDES.some((x) => f.horner[x] === 'present') || f.bladder !== 'normal') out.add('autonomic');
  if (peripheral) out.add('peripheral_nerve');
  if (SIDES.some((x) => hurt(f.faceSensation[x]))) out.add('trigeminal');
  for (const x of SIDES) {
    if (f.faceWeakness[x] === 'lower') out.add('corticobulbar');
    const c = f.cranial[x];
    if (
      f.faceWeakness[x] === 'whole' ||
      c.oculomotor_palsy === 'present' ||
      c.abduction_weakness === 'present' ||
      c.palate_weakness === 'present' ||
      c.ptosis === 'present' ||
      c.elevation_weakness === 'present' ||
      c.hearing_loss === 'present' ||
      c.superior_oblique_weakness === 'present' ||
      c.jaw_deviation === 'present'
    ) {
      out.add('cranial_nuclei');
    }
    if (c.gaze_palsy === 'present' || c.adduction_weakness === 'present' || c.abducting_nystagmus === 'present') out.add('eye_movements');
    // A weak tongue beside a lower-face weakness is supranuclear; alone, it is the nucleus.
    if (c.tongue_weakness === 'present') out.add(f.faceWeakness[x] === 'lower' ? 'corticobulbar' : 'cranial_nuclei');
    if (f.ataxia[x] === 'present') out.add('cerebellar_vestibular');
  }
  if (f.vertigo === 'present' || f.truncalAtaxia === 'present') out.add('cerebellar_vestibular');
  if (SIDES.some((x) => FIELD_CELLS.some((s) => f.fields[x][s] === 'lost')) || SIDES.some((x) => f.rapd[x] === 'present')) out.add('visual');
  if (SIDES.some((x) => f.hemiballismus[x] === 'present')) out.add('movement');
  // P13: the dorsal midbrain's signs are read across both eyes, as conjugate gaze is.
  if (DORSAL_MIDBRAIN_SIGNS.some((s) => f.eyes[s] === 'present')) out.add('eye_movements');
  if (LANGUAGE_SIGNS.some((s) => f.language[s] === 'present') || SIDES.some((x) => f.neglect[x] === 'present')) out.add('language');
  return PATHWAYS.filter((p) => out.has(p));
}

/** Weakness is upper or lower motor neuron by what the lesion does at those segments. */
function weakness(f: Findings, side: Side, segs: readonly Segment[], peripheral: boolean): Pathway[] {
  const kinds = new Set(segs.map((k) => f.motor[side][k].lesion));
  const out: Pathway[] = [];
  if (kinds.has('umn') || kinds.has('umn_lmn')) out.push('corticospinal');
  if (peripheral || kinds.has('lmn') || kinds.has('umn_lmn') || out.length === 0) out.push('lower_motor_neuron');
  return out;
}

/**
 * The pathways a case actually shows: those of its lesion that at least one abnormal
 * finding on the page depends on. A miss is scheduled against these and nothing else,
 * so a pathway the student never saw is never marked wrong.
 */
export function pathwaysShown(observations: readonly Observation[], f: Findings, h: Hypothesis): Pathway[] {
  const peripheral = PERIPHERAL.has(h.family);
  const out = new Set<Pathway>();
  if (peripheral) out.add('peripheral_nerve');
  const span = (a: Segment, b: Segment): Segment[] => SEGMENTS.slice(SEGMENTS.indexOf(a), SEGMENTS.indexOf(b) + 1);
  for (const o of observations) {
    switch (o.kind) {
      case 'sensory':
        if (o.value === 'abnormal') out.add(o.modality === 'pain_temperature' ? 'spinothalamic' : 'dorsal_column');
        break;
      case 'skin':
        // A patch without a dermatome landmark: read by which modality the lesion takes there.
        if (o.value === 'abnormal') {
          if (hurt(f.skin[o.side].pain_temperature[o.area])) out.add('spinothalamic');
          if (hurt(f.skin[o.side].posterior_column[o.area])) out.add('dorsal_column');
        }
        break;
      case 'strength':
        if (o.value === 'weak') for (const p of weakness(f, o.side, span(o.span[0], o.span[1]), peripheral)) out.add(p);
        break;
      case 'muscle': {
        const at = KB.plexus.muscles[o.muscle].myotome;
        if (o.value === 'weak') for (const p of weakness(f, o.side, at ? [at] : [], true)) out.add(p);
        break;
      }
      case 'reflex':
        if (o.value === 'brisk') out.add('corticospinal');
        if (o.value === 'reduced') out.add('lower_motor_neuron');
        break;
      case 'babinski':
        if (o.value === 'present') out.add('corticospinal');
        break;
      case 'romberg':
        if (o.value === 'present') out.add('dorsal_column');
        break;
      case 'horner':
        if (o.value === 'present') out.add('autonomic');
        break;
      case 'bladder':
        if (o.value !== 'normal') out.add('autonomic');
        break;
      case 'face_sensation':
        if (o.value === 'abnormal') out.add('trigeminal');
        break;
      case 'face_weakness':
        if (o.value === 'lower') out.add('corticobulbar');
        if (o.value === 'whole') out.add('cranial_nuclei');
        break;
      case 'cranial':
        if (o.value === 'present') {
          out.add(
            GAZE_SIGNS.has(o.sign)
              ? 'eye_movements'
              : o.sign === 'tongue_weakness' && f.faceWeakness[o.side] === 'lower'
                ? 'corticobulbar'
                : 'cranial_nuclei',
          );
        }
        break;
      case 'ataxia':
      case 'vertigo':
      case 'truncal_ataxia':
        if (o.value === 'present') out.add('cerebellar_vestibular');
        break;
      case 'field':
        if (o.value === 'abnormal') out.add('visual');
        break;
      case 'rapd':
        if (o.value === 'present') out.add('visual');
        break;
      case 'eyes':
        if (o.value === 'present') out.add('eye_movements');
        break;
      case 'hemiballismus':
        if (o.value === 'present') out.add('movement');
        break;
      case 'language':
      case 'neglect':
        if (o.value === 'present') out.add('language');
        break;
    }
  }
  const possible = new Set(pathwaysOf(f, h));
  return PATHWAYS.filter((p) => out.has(p) && possible.has(p));
}
