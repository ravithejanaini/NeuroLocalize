// The candidate lesions reverse inference chooses between. Each family's compartments
// are the ones its frozen forward case already validates, so a candidate never describes
// a lesion the engine has not been checked against.
import {
  COMPARTMENTS,
  PLEXUS_SITES,
  VISION_PLACES,
  SEGMENTS,
  SIDES,
  TERRITORIES,
  type Compartment,
  type LesionFamily,
  type Place,
  type PlexusSite,
  type Segment,
} from '../kb/vocab.ts';
import { KB } from '../kb/kb.ts';
import { placeRegions } from './vision.ts';
import type { Kb } from '../kb/types.ts';
import type { AnyRegion } from './forward.ts';
import type { LesionRegion } from './lesion.ts';

export type Hypothesis = {
  readonly id: string;
  readonly family: LesionFamily;
  /** Segment indices of the lesion's rostral and caudal ends. */
  readonly rostral: number;
  readonly caudal: number;
  readonly regions: readonly AnyRegion[];
  /** Where a plexus or nerve candidate sits. Its rostral and caudal ends are then nominal. */
  readonly site?: Place;
};

/** Trunks, cords and the two parts of the lumbosacral plexus; every other place is on a named nerve (D32). */
export const PLEXUS_PROPER: readonly PlexusSite[] = [
  'upper_trunk',
  'middle_trunk',
  'lower_trunk',
  'lateral_cord',
  'posterior_cord',
  'medial_cord',
  'lumbar_plexus',
  'sacral_plexus',
];

const CORD = COMPARTMENTS.filter((c) => c !== 'dorsal_root' && c !== 'ventral_root');
const seg = (k: number): Segment => SEGMENTS[k] ?? 'C1';
const idx = (s: Segment): number => SEGMENTS.indexOf(s);
const whole = (from: number, to: number, sides: LesionRegion['sides'], compartments: readonly Compartment[]): LesionRegion => ({
  at: { segments: [seg(from), seg(to)] },
  sides,
  compartments,
  severity: 'complete',
  portion: 'whole',
});

type Focal = { family: LesionFamily; build: (from: number, to: number) => LesionRegion[] };

const FOCAL: readonly Focal[] = [
  { family: 'complete', build: (a, b) => [whole(a, b, ['L', 'R'], CORD)] }, // case complete-T4
  { family: 'hemicord_left', build: (a, b) => [whole(a, b, ['L'], CORD)] }, // case hemisection-T8-left
  { family: 'hemicord_right', build: (a, b) => [whole(a, b, ['R'], CORD)] },
  {
    family: 'anterior', // S07: the anterior two-thirds; case anterior-T6
    build: (a, b) => [
      whole(a, b, ['L', 'R'], ['lateral_cst', 'anterolateral', 'anterior_horn', 'commissure', 'intermediolateral', 'descending_autonomic']),
    ],
  },
  { family: 'posterior', build: (a, b) => [whole(a, b, ['L', 'R'], ['dorsal_column'])] }, // case posterior-columns-T6
  { family: 'central_small', build: (a, b) => [whole(a, b, ['L', 'R'], ['commissure'])] }, // case syrinx-C4-T1
  {
    family: 'central_cord', // S06; case central-cord-C4-C6
    build: (a, b) => [
      { ...whole(a, b, ['L', 'R'], ['lateral_cst']), severity: 'partial', portion: 'central' },
      { ...whole(a, b, ['L', 'R'], ['anterolateral']), severity: 'partial', portion: 'central' },
      whole(a, b, ['L', 'R'], ['commissure']),
    ],
  },
];

/** Lesion lengths tried for every focal family, in segments. */
export const EXTENTS = [1, 2, 3, 5, 8] as const;

/** S09: the cauda equina is the roots from L1 down (A3 fixes this constraint). */
const CAUDA_FROM = idx('L1');
const CAUDA_TO = idx('S2');

let cache: Hypothesis[] | null = null;

export function hypotheses(): readonly Hypothesis[] {
  if (cache) return cache;
  const out: Hypothesis[] = [];
  const last = SEGMENTS.length - 1;
  for (const f of FOCAL) {
    for (const n of EXTENTS) {
      for (let a = 0; a + n - 1 <= last; a++) {
        const b = a + n - 1;
        out.push({ id: `${f.family}:${seg(a)}-${seg(b)}`, family: f.family, rostral: a, caudal: b, regions: f.build(a, b) });
      }
    }
  }
  for (let k = 0; k <= last; k++) {
    for (const [family, side] of [['root_left', 'L'], ['root_right', 'R']] as const) {
      out.push({ id: `${family}:${seg(k)}`, family, rostral: k, caudal: k, regions: [whole(k, k, [side], ['dorsal_root', 'ventral_root'])] });
    }
  }
  for (let a = CAUDA_FROM; a <= CAUDA_TO; a++) {
    out.push({
      id: `roots_bilateral:${seg(a)}-Co1`,
      family: 'roots_bilateral',
      rostral: a,
      caudal: last,
      regions: [whole(a, last, ['L', 'R'], ['dorsal_root', 'ventral_root'])],
    });
  }
  // System degenerations select tracts over a fixed distribution (cases 09–11).
  out.push({
    id: 'posterolateral:C5-T10',
    family: 'posterolateral',
    rostral: idx('C5'),
    caudal: idx('T10'),
    regions: [{ ...whole(idx('C5'), idx('T10'), ['L', 'R'], ['dorsal_column', 'lateral_cst']), severity: 'partial' }],
  });
  out.push({
    id: 'dorsal_root_column:L2-S5',
    family: 'dorsal_root_column',
    rostral: idx('L2'),
    caudal: idx('S5'),
    regions: [{ ...whole(idx('L2'), idx('S5'), ['L', 'R'], ['dorsal_root', 'dorsal_column']), severity: 'partial' }],
  });
  out.push({
    id: 'motor_neuron:C1-S5',
    family: 'motor_neuron',
    rostral: 0,
    caudal: idx('S5'),
    regions: [
      { ...whole(idx('C5'), idx('T1'), ['L', 'R'], ['anterior_horn']), severity: 'partial' },
      { ...whole(idx('L2'), idx('S1'), ['L', 'R'], ['anterior_horn']), severity: 'partial' },
      { ...whole(0, idx('S5'), ['L', 'R'], ['lateral_cst']), severity: 'partial' },
    ],
  });
  // Beyond the roots (D32): every trunk, cord and named nerve place, complete, either side.
  // All share one nominal level so that the length prior treats them alike.
  const nominal = idx('C5');
  for (const site of PLEXUS_SITES) {
    for (const side of SIDES) {
      const proper = PLEXUS_PROPER.includes(site);
      const family: LesionFamily = proper ? (side === 'L' ? 'plexus_left' : 'plexus_right') : side === 'L' ? 'nerve_left' : 'nerve_right';
      out.push({
        id: `${family}:${site}`,
        family,
        rostral: nominal,
        caudal: nominal,
        regions: [{ plexus: site, sides: [side], severity: 'complete' }],
        site,
      });
    }
  }
  // Above the cord (D44): each named territory on either side.
  for (const territory of TERRITORIES) {
    const row = KB.brain.territories[territory];
    const hemisphere = ['cortex', 'capsule', 'thalamus'].includes(row.level);
    const cerebellum = row.level === 'cerebellum';
    // P11: a midline place is one candidate taking both sides, as the chiasm is in P8.
    for (const side of row.midline ? (['L'] as const) : SIDES) {
      const family: LesionFamily = row.midline
        ? 'cerebellum_midline'
        : cerebellum
          ? side === 'L' ? 'cerebellum_left' : 'cerebellum_right'
          : hemisphere
            ? side === 'L' ? 'hemisphere_left' : 'hemisphere_right'
            : side === 'L' ? 'brainstem_left' : 'brainstem_right';
      out.push({
        id: `${family}:${territory}`,
        family,
        rostral: nominal,
        caudal: nominal,
        regions: territoryRegions(KB, territory, side),
        site: territory,
      });
    }
  }
  // The visual pathway (P8): each named place, either side; the chiasm is midline.
  for (const place of VISION_PLACES) {
    const midline = KB.vision.places[place].midline === true;
    for (const side of midline ? (['L'] as const) : SIDES) {
      const family: LesionFamily = midline ? 'visual_chiasm' : side === 'L' ? 'visual_left' : 'visual_right';
      out.push({
        id: `${family}:${place}`,
        family,
        rostral: nominal,
        caudal: nominal,
        regions: placeRegions(KB, place, side),
        site: place,
      });
    }
  }
  cache = out;
  return out;
}

/** A territory as a lesion, read from the knowledge base passed in. */
export function territoryRegions(kb: Kb, territory: (typeof TERRITORIES)[number], side: 'L' | 'R'): AnyRegion[] {
  const row = kb.brain.territories[territory];
  return [
    {
      brain: row.level,
      sides: row.midline ? ['L', 'R'] : [side],
      compartments: row.compartments,
      severity: 'complete',
      ...(row.regions ? { regions: row.regions } : {}),
    },
    // P12: and parts at other levels on the same side — PICA takes medulla and cerebellum.
    ...(row.also ?? []).map((a) => ({
      brain: a.level,
      sides: row.midline ? (['L', 'R'] as const) : ([side] as const),
      compartments: a.compartments,
      severity: 'complete' as const,
    })),
    // P10: a territory may take part of the visual pathway too — the inferior MCA division
    // takes the optic radiation of its own side (C31).
    ...(row.vision ?? []).map((vision) => ({ vision, sides: [side], severity: 'complete' as const })),
  ];
}
