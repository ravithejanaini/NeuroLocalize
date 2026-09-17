// The pathways a lesion exercises, read from what it does rather than from where it is.
// Review is scheduled by these (D48): a student who misreads crossed pain loss should see
// it again whether it comes from the cord, the medulla or the thalamus.
import type { Findings } from '../engine/forward.ts';
import type { Hypothesis } from '../engine/hypotheses.ts';
import { MUSCLES, SEGMENTS, SIDES } from '../kb/vocab.ts';

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
  'cerebellar_vestibular',
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
  cranial_nuclei: { name: 'Cranial nerve nuclei', what: 'third nerve, abduction, gaze, tongue, palate and the whole face' },
  cerebellar_vestibular: { name: 'Ataxia and vertigo', what: 'the cerebellar peduncles and vestibular nuclei' },
};

const PERIPHERAL = new Set(['plexus_left', 'plexus_right', 'nerve_left', 'nerve_right']);

export function pathwaysOf(f: Findings, h: Hypothesis): Pathway[] {
  const out = new Set<Pathway>();
  const any = (test: (side: 'L' | 'R', seg: (typeof SEGMENTS)[number]) => boolean): boolean =>
    SIDES.some((x) => SEGMENTS.some((s) => test(x, s)));
  const hurt = (s: string): boolean => s === 'lost' || s === 'impaired';

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
    if (f.faceWeakness[x] === 'whole' || c.oculomotor_palsy === 'present' || c.abduction_weakness === 'present' || c.gaze_palsy === 'present' || c.palate_weakness === 'present') {
      out.add('cranial_nuclei');
    }
    // A weak tongue beside a lower-face weakness is supranuclear; alone, it is the nucleus.
    if (c.tongue_weakness === 'present') out.add(f.faceWeakness[x] === 'lower' ? 'corticobulbar' : 'cranial_nuclei');
    if (f.ataxia[x] === 'present') out.add('cerebellar_vestibular');
  }
  if (f.vertigo === 'present') out.add('cerebellar_vestibular');
  return PATHWAYS.filter((p) => out.has(p));
}
