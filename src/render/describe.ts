// P39: what one drawn part is — its name, the knowledge base's own statements about it, the
// places that take it, and what the engine reports when that part alone is lost. Nothing here
// states a fact of its own: every sentence is a row's claim with its sources, and every finding
// is the engine's. P41 extends it from the brain to the cord, the roots, the plexus and nerves,
// and the end organs of the cranial nerves.
import { forward, type AnyRegion } from '../engine/forward.ts';
import { territoryRegions } from '../engine/hypotheses.ts';
import { CORD_SITE, PART_SITE, TRUNK_SITE } from '../engine/limb.ts';
import { PART_NAME, PLACE as CORD_NAME, predict, SITE_NAME, type Slot } from '../engine/reverse.ts';
import { carries } from '../engine/vision.ts';
import { cranialCourses, steppedRows } from '../geometry/brain.ts';
import { KB } from '../kb/kb.ts';
import type { Kb, Meta as RowMeta, RenderKb } from '../kb/types.ts';
import {
  FIELD_CELLS,
  NERVES,
  OUTSIDE_BRAINSTEM,
  REFLEXES,
  SEGMENTS,
  SIDES,
  TERRITORIES,
  VISION_PLACES,
  type BodyRegion,
  type BrainCompartment,
  type BrainLevel,
  type Compartment,
  type CranialTarget,
  type PlexusSite,
  type Side,
  type Timepoint,
  type VisualPart,
} from '../kb/vocab.ts';
import { CRANIAL_NAME, slotLabel, valueWord } from './examine.ts';
import { examSlots } from './slots.ts';

export type PartRef =
  | { readonly kind: 'brain'; readonly level: BrainLevel; readonly compartment: BrainCompartment; readonly side: Side; readonly region?: BodyRegion }
  | { readonly kind: 'vision'; readonly part: VisualPart; readonly side: Side }
  /** P41: one part of the cord's cross-section at segment k. */
  | { readonly kind: 'cord'; readonly compartment: Compartment; readonly side: Side; readonly k: number }
  /** P41: a spinal root, dorsal and ventral together. */
  | { readonly kind: 'root'; readonly side: Side; readonly k: number }
  /** P41: a place beyond the roots — a trunk, a cord of the plexus, a nerve at a named site. */
  | { readonly kind: 'plexus'; readonly site: PlexusSite; readonly side: Side }
  /** P41: an end organ of the cranial nerves. It cannot be lost; the card says what reaches it. */
  | { readonly kind: 'organ'; readonly target: CranialTarget; readonly side: Side };

/** A string that is the same for two references to the same part. */
export function refKey(r: PartRef): string {
  switch (r.kind) {
    case 'brain':
      return `brain|${r.level}|${r.compartment}|${r.side}|${r.region ?? ''}`;
    case 'vision':
      return `vision|${r.part}|${r.side}`;
    case 'cord':
      return `cord|${r.compartment}|${r.side}|${r.k}`;
    case 'root':
      return `root|${r.side}|${r.k}`;
    case 'plexus':
      return `plexus|${r.site}|${r.side}`;
    case 'organ':
      return `organ|${r.target}|${r.side}`;
  }
}

/** One statement from the knowledge base, with where it comes from. */
export type Statement = { readonly id: string; readonly claim: string; readonly tier: string; readonly sources: readonly string[] };

export type PartCard = {
  readonly name: string;
  /** The rows that speak of this part. */
  readonly carries: readonly Statement[];
  /** Named places — arteries, syndromes, foramina — that take this part. */
  readonly takenBy: readonly string[];
  /** What the engine reports when this part alone is lost, in words; grouped where there are many. */
  readonly findings: readonly string[];
  /** How many examination slots change, before grouping. */
  readonly changed: number;
  /** For an end organ, which has no lesion of its own: the nerves that reach it. */
  readonly reachedBy?: readonly string[];
};

/** P38: what each part of the visual pathway is called on the stage. */
export const VISUAL_WORD: Record<VisualPart, string> = {
  optic_nerve: 'optic nerve',
  chiasm: 'chiasm',
  optic_tract: 'optic tract',
  lgn: 'lateral geniculate',
  lgn_crest: 'LGN crest',
  lgn_horns: 'LGN horns',
  meyer_loop: 'Meyer loop',
  parietal_radiation: 'parietal radiation',
  calcarine_lower: 'calcarine, lower bank',
  calcarine_upper: 'calcarine, upper bank',
  occipital_pole: 'occipital pole',
};

/** P37: what each end organ is called on the stage. */
export const TARGET_WORD: Record<CranialTarget, string> = {
  eye: 'eye',
  lacrimal: 'tear gland',
  forehead: 'forehead · V1',
  cheek: 'cheek · V2',
  jaw_skin: 'jaw · V3',
  jaw_muscle: 'jaw muscles',
  ear: 'ear',
  tongue: 'tongue',
  tongue_front: 'taste, front',
  tongue_back: 'tongue, back',
  palate: 'palate',
  shoulder: 'shoulder',
};

const SIDE_WORD: Record<Side, string> = { L: 'Left', R: 'Right' };
const LEVELS_NAMED: readonly BrainLevel[] = ['medulla', 'pons', 'midbrain'];
const statement = (m: RowMeta): Statement => ({ id: m.id, claim: m.claim, tier: m.tier, sources: m.sources });

export { steppedRows };

/**
 * P41: the rows the engine reads for each part of the cord's cross-section — the route each
 * lies on (engine/routes.ts) and the autonomic rows that test it (engine/forward.ts).
 */
export function cordRows(kb: Kb, c: Compartment): RowMeta[] {
  const { pathways: p, compartments: m, autonomic: a, observations: o } = kb;
  const rows: Record<Compartment, RowMeta[]> = {
    dorsal_column: [p.posteriorColumn.meta],
    anterolateral: [p.spinothalamic.meta, o.sacralSparing.meta],
    lateral_cst: [p.corticospinal.meta, o.armPredominance.meta],
    anterior_horn: [m.motorNeuron.meta, m.reflexArc.meta],
    dorsal_horn: [p.spinothalamic.meta],
    commissure: [p.spinothalamic.meta],
    intermediolateral: [a.ciliospinal.meta, a.micturitionCentre.meta],
    descending_autonomic: [a.ciliospinal.meta, a.bladderControl.meta],
    dorsal_root: [m.dorsalRoot.meta, m.reflexArc.meta],
    ventral_root: [m.motorNeuron.meta, m.reflexArc.meta, a.sympatheticRootCompartment.meta],
  };
  return rows[c];
}

/** P41: the rows that speak of the root of segment k — what a root carries, and the reflexes and outflow at that segment. */
export function rootRows(kb: Kb, k: number): RowMeta[] {
  const within = (span: readonly [string, string]): boolean =>
    k >= (SEGMENTS as readonly string[]).indexOf(span[0]) && k <= (SEGMENTS as readonly string[]).indexOf(span[1]);
  return [
    kb.compartments.dorsalRoot.meta,
    kb.compartments.motorNeuron.meta,
    kb.compartments.reflexArc.meta,
    ...REFLEXES.filter((r) => within(kb.reflexes[r].span)).map((r) => kb.reflexes[r].meta),
    ...(SEGMENTS[k] === kb.autonomic.sympatheticOutflow.root ? [kb.autonomic.sympatheticOutflow.meta] : []),
  ];
}

/** P41: the rows that name a place beyond the roots: its trunk, cord or part of the plexus, or the nerve it lies on. */
export function plexusRows(kb: Kb, site: PlexusSite): RowMeta[] {
  const out: RowMeta[] = [];
  if (Object.values(TRUNK_SITE).includes(site)) out.push(kb.plexus.trunks.meta);
  if (Object.values(CORD_SITE).includes(site)) out.push(kb.plexus.cords.meta);
  if (Object.values(PART_SITE).includes(site)) out.push(kb.plexus.legParts.meta);
  for (const n of NERVES) if (kb.plexus.nerves[n].sites.includes(site)) out.push(kb.plexus.nerves[n].meta);
  return out;
}

/** The lesion that takes this one part and nothing else; none for an end organ. */
export function partLesion(ref: PartRef): AnyRegion[] {
  const seg = (k: number) => SEGMENTS[k] ?? 'C1';
  switch (ref.kind) {
    case 'vision':
      return [{ vision: ref.part, sides: [ref.side], severity: 'complete' }];
    case 'cord':
      return [{ at: { segments: [seg(ref.k), seg(ref.k)] }, sides: [ref.side], compartments: [ref.compartment], severity: 'complete', portion: 'whole' }];
    case 'root':
      return [{ at: { segments: [seg(ref.k), seg(ref.k)] }, sides: [ref.side], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }];
    case 'plexus':
      return [{ plexus: ref.site, sides: [ref.side], severity: 'complete' }];
    case 'organ':
      return [];
    case 'brain':
      return [
        {
          brain: ref.level,
          sides: [ref.side],
          compartments: [ref.compartment],
          ...(ref.region ? { regions: [ref.region] } : {}),
          severity: 'complete',
        },
      ];
  }
}

const sameSlots = (a: Slot, b: Slot): boolean => {
  const side = (s: Slot): string => ('side' in s ? s.side : 'eye' in s ? s.eye : '');
  const modality = (s: Slot): string => ('modality' in s ? s.modality : '');
  return a.kind === b.kind && side(a) === side(b) && modality(a) === modality(b);
};

/** How a group of like findings is counted: "12 movements weak". */
const GROUP_WORD: Partial<Record<Slot['kind'], (n: number, word: string, s: Slot) => string>> = {
  sensory: (n, word, s) => `${s.kind === 'sensory' && s.modality === 'pain_temperature' ? 'pain' : 'vibration'} ${word} at ${n} dermatome landmarks`,
  strength: (n, word) => `${n} movements ${word}, tested by root`,
  muscle: (n, word) => `${n} muscles ${word}`,
  skin: (n, word) => `sensation ${word} on ${n} patches of skin`,
  reflex: (n, word) => `${n} reflexes ${word}`,
  field: (n, word) => `${n} parts of the field ${word}`,
};

/** P41: one changed reading as a sentence, not a label and a value. */
export function findingSentence(render: RenderKb, slot: Slot, value: string): string {
  const word = value === 'unknown' ? 'not settled' : valueWord(value);
  const settled = value === 'present';
  if (slot.kind === 'cranial') {
    // The examination's label speaks to the examiner ("this eye"); the card names the side once.
    const what = CRANIAL_NAME[slot.sign]
      .replace(/^this (eye|shoulder)/, 'the $1')
      .replace(/ (on|in|of) this (side|eye|ear)/, '')
      .replace(/, (on )?this side/, '')
      .replace(/ in this (eye|ear)/, '');
    const on = `On the ${SIDE_WORD[slot.side].toLowerCase()}: ${what}`;
    return settled ? on : `${on} — ${word}`;
  }
  const label = slotLabel(render, slot);
  // A sign that is simply there needs no "present" after it.
  return settled ? label : `${label}: ${word}`;
}

/** The examination slots whose reading changes, grouped so a hemiplegia is one line and not forty. */
function findingsOf(render: RenderKb, regions: readonly AnyRegion[], timepoint: Timepoint, kb: Kb): { lines: string[]; changed: number } {
  if (regions.length === 0) return { lines: [], changed: 0 };
  const slots = examSlots(render);
  const before = forward([], timepoint, { kb });
  const after = forward(regions, timepoint, { kb });
  const changed: { slot: Slot; value: string }[] = [];
  for (const slot of slots) {
    const a = predict(before, slot, kb);
    const b = predict(after, slot, kb);
    if (a !== b) changed.push({ slot, value: b });
  }
  const lines: string[] = [];
  const done = new Set<number>();
  changed.forEach((c, i) => {
    if (done.has(i)) return;
    const group = changed.map((x, j) => ({ x, j })).filter(({ x }) => x.value === c.value && sameSlots(x.slot, c.slot));
    for (const { j } of group) done.add(j);
    const word = c.value === 'unknown' ? 'not settled' : valueWord(c.value);
    const many = GROUP_WORD[c.slot.kind];
    if (group.length > 2 && many) {
      const s = c.slot;
      const who = 'side' in s ? `${SIDE_WORD[s.side]} side` : 'eye' in s ? `${SIDE_WORD[s.eye]} eye` : '';
      lines.push(`${who}: ${many(group.length, word, s)}`);
    } else {
      for (const { x } of group) lines.push(findingSentence(render, x.slot, x.value));
    }
  });
  return { lines, changed: changed.length };
}

/** What a part is called, with its side — or without one, for a part on the midline. */
export function partName(ref: PartRef, kb: Kb = KB): string {
  switch (ref.kind) {
    case 'vision': {
      // A midline part carries the same cells whichever side it is asked for.
      const midline = SIDES.every((eye) => FIELD_CELLS.every((cell) => carries(kb, ref.part, 'L', eye, cell) === carries(kb, ref.part, 'R', eye, cell)));
      return `${midline ? 'The' : SIDE_WORD[ref.side]} ${VISUAL_WORD[ref.part]}`;
    }
    case 'cord':
      return `${SIDE_WORD[ref.side]} ${CORD_NAME[ref.compartment] ?? ref.compartment} at ${SEGMENTS[ref.k] ?? ''}`;
    case 'root':
      return `${SIDE_WORD[ref.side]} ${SEGMENTS[ref.k] ?? ''} root`;
    case 'plexus':
      return `${SIDE_WORD[ref.side]} ${SITE_NAME[ref.site]}`;
    case 'organ':
      return `${SIDE_WORD[ref.side]} ${TARGET_WORD[ref.target]}`;
    case 'brain': {
      // A part outside the brainstem is not "in" the level it is filed under (P29).
      const at = LEVELS_NAMED.includes(ref.level) && !OUTSIDE_BRAINSTEM.includes(ref.compartment) ? `, ${ref.level}` : '';
      const area = ref.region ? ` — ${ref.region} area` : '';
      return `${SIDE_WORD[ref.side]} ${PART_NAME[ref.compartment]}${at}${area}`;
    }
  }
}

/** The name, statements, places and findings of one drawn part. */
export function describePart(render: RenderKb, ref: PartRef, timepoint: Timepoint = 'chronic', kb: Kb = KB): PartCard {
  const { lines, changed } = findingsOf(render, partLesion(ref), timepoint, kb);
  const card = (carried: readonly RowMeta[], takenBy: readonly string[], reachedBy?: readonly string[]): PartCard => ({
    name: partName(ref, kb),
    carries: carried.map(statement),
    takenBy,
    findings: lines,
    changed,
    ...(reachedBy ? { reachedBy } : {}),
  });

  switch (ref.kind) {
    case 'vision': {
      const places = VISION_PLACES.filter((p) => kb.vision.places[p].parts.includes(ref.part)).map((p) => SITE_NAME[p]);
      const territories = TERRITORIES.filter((t) => kb.brain.territories[t].vision?.includes(ref.part)).map((t) => SITE_NAME[t]);
      return card([kb.vision.parts[ref.part].meta], [...new Set([...places, ...territories])]);
    }
    case 'cord':
      return card(cordRows(kb, ref.compartment), []);
    case 'root':
      return card(rootRows(kb, ref.k), []);
    case 'plexus':
      return card(
        plexusRows(kb, ref.site),
        TERRITORIES.filter((t) => kb.brain.territories[t].plexus?.includes(ref.site)).map((t) => SITE_NAME[t]),
      );
    case 'organ': {
      // The courses that end at this organ, and the rows each was built from.
      const courses = cranialCourses(kb, render, ref.side).filter((c) => c.target === ref.target);
      const ids = new Set(courses.flatMap((c) => c.rows));
      return card(
        steppedRows(kb)
          .filter((r) => ids.has(r.meta.id))
          .map((r) => r.meta),
        [],
        courses.map((c) => c.name),
      );
    }
    case 'brain': {
      const through = steppedRows(kb).filter((r) => r.steps.some((s) => s.level === ref.level && s.compartment === ref.compartment));
      const takenBy = TERRITORIES.filter((t) =>
        territoryRegions(kb, t, ref.side).some(
          (r) =>
            'brain' in r &&
            r.brain === ref.level &&
            r.compartments.includes(ref.compartment) &&
            (!ref.region || !r.regions || r.regions.includes(ref.region)),
        ),
      ).map((t) => SITE_NAME[t]);
      return card(
        through.map((r) => r.meta),
        takenBy,
      );
    }
  }
}

const escape = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The card as it is shown beside the stage. */
export function partCardHtml(card: PartCard): string {
  const list = (items: readonly string[], cap: number): string => {
    const shown = items
      .slice(0, cap)
      .map((i) => `<li>${escape(i)}</li>`)
      .join('');
    const rest = items.length - cap;
    return `<ul>${shown}${rest > 0 ? `<li class="quiet">and ${rest} more</li>` : ''}</ul>`;
  };
  const carried = card.carries.length
    ? card.carries
        .map((s) => `<li>${escape(s.claim)} <span class="pc-src">${escape(s.tier)} · ${s.sources.map(escape).join(', ')}</span></li>`)
        .join('')
    : '<li class="quiet">No row of the model speaks of this part.</li>';
  const first = card.reachedBy
    ? `<h4>Reached by</h4>${card.reachedBy.length ? list(card.reachedBy, 10) : '<p class="quiet">No nerve the model draws.</p>'}`
    : `<h4>Lost alone, the model reports</h4>${card.findings.length ? list(card.findings, 12) : '<p class="quiet">Nothing this model’s examination records.</p>'}`;
  return `<h3>${escape(card.name)}</h3>
    ${first}
    ${card.takenBy.length ? `<h4>Places that take it</h4>${list(card.takenBy, 10)}` : ''}
    <h4>What the model holds about it</h4><ul class="pc-claims">${carried}</ul>`;
}
