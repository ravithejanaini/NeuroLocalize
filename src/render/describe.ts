// P39: what one drawn part is — its name, the knowledge base's own statements about the routes
// that pass through it, the places that take it, and what the engine reports when that part
// alone is lost. Nothing here states a fact of its own: every sentence is a row's claim with its
// sources, and every finding is the engine's.
import { forward, type AnyRegion } from '../engine/forward.ts';
import { territoryRegions } from '../engine/hypotheses.ts';
import { PART_NAME, predict, SITE_NAME, type Slot } from '../engine/reverse.ts';
import { carries } from '../engine/vision.ts';
import { KB } from '../kb/kb.ts';
import type { Kb, Meta as RowMeta, RenderKb } from '../kb/types.ts';
import {
  FIELD_CELLS,
  SIDES,
  TERRITORIES,
  VISION_PLACES,
  type BodyRegion,
  type BrainCompartment,
  type BrainLevel,
  type Side,
  type Timepoint,
  type VisualPart,
} from '../kb/vocab.ts';
import { slotLabel, valueWord } from './examine.ts';
import { examSlots } from './slots.ts';

export type PartRef =
  | { readonly kind: 'brain'; readonly level: BrainLevel; readonly compartment: BrainCompartment; readonly side: Side; readonly region?: BodyRegion }
  | { readonly kind: 'vision'; readonly part: VisualPart; readonly side: Side };

/** One statement from the knowledge base, with where it comes from. */
export type Statement = { readonly id: string; readonly claim: string; readonly tier: string; readonly sources: readonly string[] };

export type PartCard = {
  readonly name: string;
  /** The rows whose routes pass through this part. */
  readonly carries: readonly Statement[];
  /** Named places — arteries, syndromes, foramina — that take this part. */
  readonly takenBy: readonly string[];
  /** What the engine reports when this part alone is lost, in words; grouped where there are many. */
  readonly findings: readonly string[];
  /** How many examination slots change, before grouping. */
  readonly changed: number;
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

const SIDE_WORD: Record<Side, string> = { L: 'Left', R: 'Right' };
const LEVELS_NAMED: readonly BrainLevel[] = ['medulla', 'pons', 'midbrain'];
const statement = (m: RowMeta): Statement => ({ id: m.id, claim: m.claim, tier: m.tier, sources: m.sources });

type Stepped = { readonly meta: RowMeta; readonly steps: readonly { readonly level: BrainLevel; readonly compartment: BrainCompartment }[] };
const isStepped = (v: unknown): v is Stepped => typeof v === 'object' && v !== null && 'steps' in v && 'meta' in v;

/** Every row above the cord that has a list of steps: the routes the engine walks. */
export function steppedRows(kb: Kb): Stepped[] {
  const out: Stepped[] = [];
  for (const v of Object.values(kb.brain) as unknown[]) {
    for (const row of Array.isArray(v) ? v : [v]) if (isStepped(row)) out.push(row);
  }
  return out;
}

/** The lesion that takes this one part and nothing else. */
export function partLesion(ref: PartRef): AnyRegion[] {
  if (ref.kind === 'vision') return [{ vision: ref.part, sides: [ref.side], severity: 'complete' }];
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

const sameSlots = (a: Slot, b: Slot): boolean => {
  const side = (s: Slot): string => ('side' in s ? s.side : 'eye' in s ? s.eye : '');
  const modality = (s: Slot): string => ('modality' in s ? s.modality : '');
  return a.kind === b.kind && side(a) === side(b) && modality(a) === modality(b);
};

const GROUP_WORD: Partial<Record<Slot['kind'], string>> = {
  sensory: 'at dermatome landmarks',
  strength: 'movements by root',
  muscle: 'muscles',
  skin: 'patches of skin',
  reflex: 'reflexes',
  field: 'parts of the field',
};

/** The examination slots whose reading changes, grouped so a hemiplegia is one line and not forty. */
function findingsOf(render: RenderKb, regions: readonly AnyRegion[], timepoint: Timepoint, kb: Kb): { lines: string[]; changed: number } {
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
      const who = 'side' in s ? SIDE_WORD[s.side] : 'eye' in s ? `${SIDE_WORD[s.eye]} eye` : '';
      const what = s.kind === 'sensory' ? (s.modality === 'pain_temperature' ? 'pain ' : 'vibration ') : '';
      lines.push(`${who} · ${what}${word} — ${group.length} ${many}`);
    } else {
      for (const { x } of group) lines.push(`${slotLabel(render, x.slot)} — ${word}`);
    }
  });
  return { lines, changed: changed.length };
}

/** What a part is called, with its side — or without one, for a part on the midline. */
export function partName(ref: PartRef, kb: Kb = KB): string {
  if (ref.kind === 'vision') {
    // A midline part carries the same cells whichever side it is asked for.
    const midline = SIDES.every((eye) => FIELD_CELLS.every((cell) => carries(kb, ref.part, 'L', eye, cell) === carries(kb, ref.part, 'R', eye, cell)));
    return `${midline ? 'The' : SIDE_WORD[ref.side]} ${VISUAL_WORD[ref.part]}`;
  }
  const at = LEVELS_NAMED.includes(ref.level) && !PART_NAME[ref.compartment].includes('nerve') ? `, ${ref.level}` : '';
  const area = ref.region ? ` — ${ref.region} area` : '';
  return `${SIDE_WORD[ref.side]} ${PART_NAME[ref.compartment]}${at}${area}`;
}

/** The name, routes, places and findings of one drawn part. */
export function describePart(render: RenderKb, ref: PartRef, timepoint: Timepoint = 'chronic', kb: Kb = KB): PartCard {
  const regions = partLesion(ref);
  const { lines, changed } = findingsOf(render, regions, timepoint, kb);

  if (ref.kind === 'vision') {
    const row = kb.vision.parts[ref.part];
    const places = VISION_PLACES.filter((p) => kb.vision.places[p].parts.includes(ref.part)).map((p) => SITE_NAME[p]);
    const territories = TERRITORIES.filter((t) => kb.brain.territories[t].vision?.includes(ref.part)).map((t) => SITE_NAME[t]);
    return {
      name: partName(ref, kb),
      carries: [statement(row.meta)],
      takenBy: [...new Set([...places, ...territories])],
      findings: lines,
      changed,
    };
  }

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
  return {
    name: partName(ref, kb),
    carries: through.map((r) => statement(r.meta)),
    takenBy,
    findings: lines,
    changed,
  };
}

const escape = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The card as it is shown beside the stage. */
export function partCardHtml(card: PartCard): string {
  const list = (items: readonly string[], cap: number): string => {
    const shown = items.slice(0, cap).map((i) => `<li>${escape(i)}</li>`).join('');
    const rest = items.length - cap;
    return `<ul>${shown}${rest > 0 ? `<li class="quiet">and ${rest} more</li>` : ''}</ul>`;
  };
  const carries = card.carries.length
    ? card.carries
        .map((s) => `<li>${escape(s.claim)} <span class="pc-src">${escape(s.tier)} · ${s.sources.map(escape).join(', ')}</span></li>`)
        .join('')
    : '<li class="quiet">No route the model reads passes through this part.</li>';
  return `<h3>${escape(card.name)}</h3>
    <h4>Lost alone, the model reports</h4>${card.findings.length ? list(card.findings, 12) : '<p class="quiet">Nothing this model’s examination records.</p>'}
    ${card.takenBy.length ? `<h4>Places that take it</h4>${list(card.takenBy, 10)}` : ''}
    <h4>What the model holds about it</h4><ul class="pc-claims">${carries}</ul>`;
}
