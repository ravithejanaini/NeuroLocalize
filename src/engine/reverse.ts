// reverse(): from examination findings to ranked candidate lesions, the one test that best
// separates the leaders, and the working behind every ranking. The constants below are
// modelling choices, not clinical facts (D24); no finding depends on them, only the order.
import { KB } from '../kb/kb.ts';
import type { Kb } from '../kb/types.ts';
import {
  SEGMENTS,
  type BladderObservation,
  type LesionFamily,
  type Reflex,
  type ReflexObservation,
  type Segment,
  type SensoryModality,
  type SensoryObservation,
  type Side,
  type SignObservation,
  type StrengthObservation,
  type Timepoint,
} from '../kb/vocab.ts';
import { forward, isSacral, type Findings } from './forward.ts';
import { hypotheses, type Hypothesis } from './hypotheses.ts';
import { mapLesion, type LesionMap } from './lesion.ts';
import { crossingOffsets, damageAlong, motorRoute, sensoryRoute, type Element } from './routes.ts';

export type Span = readonly [Segment, Segment];

export type Observation =
  | { readonly kind: 'sensory'; readonly side: Side; readonly modality: SensoryModality; readonly span: Span; readonly value: SensoryObservation }
  | { readonly kind: 'strength'; readonly side: Side; readonly span: Span; readonly value: StrengthObservation }
  | { readonly kind: 'reflex'; readonly side: Side; readonly reflex: Reflex; readonly value: ReflexObservation }
  | { readonly kind: 'babinski' | 'horner'; readonly side: Side; readonly value: SignObservation }
  | { readonly kind: 'romberg'; readonly value: SignObservation }
  | { readonly kind: 'bladder'; readonly value: BladderObservation };

/** An observation not yet made: everything but its value. */
export type Slot = Observation extends infer O ? (O extends Observation ? Omit<O, 'value'> : never) : never;
type Value = Observation['value'];

/** Probability that an examination reports something other than the truth (D24). */
export const NOISE = 0.05;
/** Prior penalty per extra segment of lesion length: shorter explanations first (D24). */
export const LENGTH_PENALTY = 0.15;
/** A test expected to teach less than this is not worth suggesting (D26). */
export const MIN_BITS = 0.05;

const DOMAIN: Record<Observation['kind'], readonly string[]> = {
  sensory: ['normal', 'abnormal'],
  strength: ['normal', 'weak'],
  reflex: ['normal', 'reduced', 'brisk'],
  babinski: ['present', 'absent'],
  horner: ['present', 'absent'],
  romberg: ['present', 'absent'],
  bladder: ['normal', 'overactive', 'retention'],
};

const idx = (s: Segment): number => SEGMENTS.indexOf(s);
const segsOf = ([a, b]: Span): Segment[] => SEGMENTS.slice(idx(a), idx(b) + 1);

export const slotKey = (s: Slot): string => {
  switch (s.kind) {
    case 'sensory':
      return `sensory|${s.side}|${s.modality}|${s.span.join('-')}`;
    case 'strength':
      return `strength|${s.side}|${s.span.join('-')}`;
    case 'reflex':
      return `reflex|${s.side}|${s.reflex}`;
    case 'babinski':
    case 'horner':
      return `${s.kind}|${s.side}`;
    default:
      return s.kind;
  }
};

/** What a candidate predicts for a slot; 'unknown' where the engine leaves it open. */
export function predict(f: Findings, s: Slot): Value | 'unknown' {
  switch (s.kind) {
    case 'sensory': {
      const states = segsOf(s.span).map((k) => f.sensory[s.side][s.modality][k]);
      if (states.some((x) => x === 'lost' || x === 'impaired')) return 'abnormal';
      if (states.some((x) => x === 'indeterminate')) return 'unknown';
      return 'normal';
    }
    case 'strength':
      return segsOf(s.span).some((k) => f.motor[s.side][k].lesion !== 'none') ? 'weak' : 'normal';
    case 'reflex': {
      const r = f.reflexes[s.side][s.reflex];
      return r === 'indeterminate' ? 'unknown' : r === 'absent' ? 'reduced' : r;
    }
    case 'babinski':
    case 'horner': {
      const v = f[s.kind][s.side];
      return v === 'indeterminate' ? 'unknown' : v;
    }
    case 'romberg':
      return f.romberg === 'indeterminate' ? 'unknown' : f.romberg;
    case 'bladder':
      return f.bladder === 'suprasacral'
        ? 'overactive'
        : f.bladder === 'sacral'
          ? 'retention'
          : f.bladder === 'normal'
            ? 'normal'
            : 'unknown';
  }
}

function likelihood(kind: Observation['kind'], predicted: Value | 'unknown', value: Value): number {
  const n = DOMAIN[kind].length;
  if (predicted === 'unknown') return 1 / n;
  return predicted === value ? 1 - NOISE : NOISE / (n - 1);
}

// ── preparation: run the engine once per candidate, cached per timepoint ──

type Prepared = { readonly h: Hypothesis; readonly findings: Findings; readonly prior: number };
const prepared = new Map<string, Prepared[]>();

function priorsFor(hs: readonly Hypothesis[]): Map<string, number> {
  const families = new Map<LesionFamily, Hypothesis[]>();
  for (const h of hs) families.set(h.family, [...(families.get(h.family) ?? []), h]);
  const raw = new Map<string, number>();
  for (const members of families.values()) {
    const weights = members.map((h) => Math.exp(-LENGTH_PENALTY * (h.caudal - h.rostral)));
    const total = weights.reduce((a, b) => a + b, 0);
    members.forEach((h, i) => raw.set(h.id, (weights[i] ?? 0) / total / families.size));
  }
  return raw;
}

const cacheKey = (t: Timepoint, kb: Kb): string => `${t}|${kb === KB ? 'kb' : 'custom'}`;

/** Runs the engine for every candidate. Yields to the caller between batches if asked. */
export async function prepare(
  timepoint: Timepoint,
  options: { kb?: Kb; onProgress?: (done: number, total: number) => void; batch?: number } = {},
): Promise<void> {
  const kb = options.kb ?? KB;
  const key = cacheKey(timepoint, kb);
  if (prepared.has(key)) return;
  const hs = hypotheses();
  const priors = priorsFor(hs);
  const out: Prepared[] = [];
  const batch = options.batch ?? 60;
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i];
    if (!h) continue;
    out.push({ h, findings: forward(h.regions, timepoint, { kb }), prior: priors.get(h.id) ?? 0 });
    if (options.onProgress && (i + 1) % batch === 0) {
      options.onProgress(i + 1, hs.length);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  prepared.set(key, out);
  options.onProgress?.(hs.length, hs.length);
}

export const isPrepared = (timepoint: Timepoint, kb: Kb = KB): boolean => prepared.has(cacheKey(timepoint, kb));

function preparedOrThrow(timepoint: Timepoint, kb: Kb): Prepared[] {
  const p = prepared.get(cacheKey(timepoint, kb));
  if (!p) throw new Error(`Call prepare('${timepoint}') before reverse().`);
  return p;
}

/** Synchronous preparation, for tests and scripts. */
export function prepareSync(timepoint: Timepoint, kb: Kb = KB): void {
  const key = cacheKey(timepoint, kb);
  if (prepared.has(key)) return;
  const hs = hypotheses();
  const priors = priorsFor(hs);
  prepared.set(key, hs.map((h) => ({ h, findings: forward(h.regions, timepoint, { kb }), prior: priors.get(h.id) ?? 0 })));
}

// ── ranking ──────────────────────────────────────────────────────────────

export type Group = {
  readonly family: LesionFamily;
  readonly rostral: readonly [Segment, Segment];
  readonly caudal: readonly [Segment, Segment];
  readonly members: readonly Hypothesis[];
  readonly posterior: number;
  readonly mismatches: number;
  readonly fits: number;
  readonly open: number;
};

export type Outcome = { readonly value: Value; readonly probability: number; readonly leader: string };

export type Suggestion = {
  readonly slot: Slot;
  readonly informationBits: number;
  readonly separatesTopTwo: boolean;
  readonly outcomes: readonly Outcome[];
};

export type ReverseResult = {
  readonly groups: readonly Group[];
  /** No single candidate explains every finding. */
  readonly unexplained: boolean;
  readonly suggestion: Suggestion | null;
};

type Scored = Prepared & { logPost: number; mismatches: number; fits: number; open: number; signature: string };

function score(ps: readonly Prepared[], observations: readonly Observation[]): Scored[] {
  return ps.map((p) => {
    let log = Math.log(p.prior || Number.MIN_VALUE);
    let mismatches = 0;
    let fits = 0;
    let open = 0;
    const sig: string[] = [];
    for (const o of observations) {
      const pr = predict(p.findings, o);
      sig.push(pr);
      log += Math.log(likelihood(o.kind, pr, o.value));
      if (pr === 'unknown') open++;
      else if (pr === o.value) fits++;
      else mismatches++;
    }
    return { ...p, logPost: log, mismatches, fits, open, signature: `${p.h.family}|${sig.join(',')}` };
  });
}

function normalise(scored: readonly Scored[]): number[] {
  const max = Math.max(...scored.map((s) => s.logPost));
  const w = scored.map((s) => Math.exp(s.logPost - max));
  const total = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / total);
}

const segName = (k: number): Segment => SEGMENTS[k] ?? 'C1';

function groupsOf(scored: readonly Scored[], post: readonly number[]): Group[] {
  const bySig = new Map<string, { items: Scored[]; mass: number }>();
  scored.forEach((s, i) => {
    const g = bySig.get(s.signature) ?? { items: [], mass: 0 };
    g.items.push(s);
    g.mass += post[i] ?? 0;
    bySig.set(s.signature, g);
  });
  return [...bySig.values()]
    .map(({ items, mass }): Group => {
      const first = items[0];
      if (!first) throw new Error('empty group');
      const rs = items.map((s) => s.h.rostral);
      const cs = items.map((s) => s.h.caudal);
      return {
        family: first.h.family,
        rostral: [segName(Math.min(...rs)), segName(Math.max(...rs))],
        caudal: [segName(Math.min(...cs)), segName(Math.max(...cs))],
        members: items.map((s) => s.h),
        posterior: mass,
        mismatches: first.mismatches,
        fits: first.fits,
        open: first.open,
      };
    })
    .sort((a, b) => b.posterior - a.posterior);
}

const entropy = (ps: readonly number[]): number => -ps.reduce((a, p) => (p > 0 ? a + p * Math.log2(p) : a), 0);

export function describeGroup(g: Pick<Group, 'family' | 'rostral'>): string {
  const [a, b] = g.rostral;
  return `${g.family.replace(/_/g, ' ')} from ${a === b ? a : `${a}–${b}`}`;
}

export function reverse(
  observations: readonly Observation[],
  timepoint: Timepoint,
  slots: readonly Slot[],
  options: { kb?: Kb } = {},
): ReverseResult {
  const kb = options.kb ?? KB;
  const scored = score(preparedOrThrow(timepoint, kb), observations);
  const post = normalise(scored);
  const groups = groupsOf(scored, post);
  const unexplained = Math.min(...scored.map((s) => s.mismatches)) > 0;

  const observed = new Set(observations.map((o) => slotKey(o)));
  const top = groups.slice(0, 2).map((g) => scored.find((s) => s.h.id === g.members[0]?.id));
  const h0 = entropy(post);
  let best: Suggestion | null = null;

  for (const slot of slots) {
    if (observed.has(slotKey(slot))) continue;
    const preds = scored.map((s) => predict(s.findings, slot));
    const values = DOMAIN[slot.kind] as readonly Value[];
    let expected = 0;
    const outcomes: Outcome[] = [];
    for (const v of values) {
      const joint = preds.map((p, i) => (post[i] ?? 0) * likelihood(slot.kind, p, v));
      const pv = joint.reduce((a, b) => a + b, 0);
      if (pv <= 0) continue;
      const cond = joint.map((x) => x / pv);
      expected += pv * entropy(cond);
      let lead = 0;
      cond.forEach((x, i) => {
        if (x > (cond[lead] ?? 0)) lead = i;
      });
      const leader = scored[lead];
      outcomes.push({
        value: v,
        probability: pv,
        leader: leader ? describeGroup({ family: leader.h.family, rostral: [segName(leader.h.rostral), segName(leader.h.rostral)] }) : '',
      });
    }
    const gain = h0 - expected;
    if (gain < MIN_BITS) continue;
    const [a, b] = top;
    const pa = a ? predict(a.findings, slot) : 'unknown';
    const pb = b ? predict(b.findings, slot) : 'unknown';
    const separates = pa !== 'unknown' && pb !== 'unknown' && pa !== pb;
    const better =
      !best ||
      (separates && !best.separatesTopTwo) ||
      (separates === best.separatesTopTwo && gain > best.informationBits + 1e-12);
    if (better) best = { slot, informationBits: gain, separatesTopTwo: separates, outcomes };
  }

  return { groups, unexplained, suggestion: best };
}

// ── the working ──────────────────────────────────────────────────────────

export type Verdict = {
  readonly observation: Observation;
  readonly predicted: Value | 'unknown';
  readonly verdict: 'fits' | 'conflicts' | 'open';
  readonly because: string;
};

const PLACE: Partial<Record<string, string>> = {
  dorsal_column: 'posterior column',
  anterolateral: 'spinothalamic tract',
  lateral_cst: 'corticospinal tract',
  anterior_horn: 'anterior horn',
  dorsal_horn: 'dorsal horn',
  commissure: 'anterior white commissure',
  dorsal_root: 'dorsal root',
  ventral_root: 'ventral root',
  descending_autonomic: 'descending autonomic pathway',
  intermediolateral: 'lateral horn',
};
const SIDE: Record<Side, string> = { L: 'left', R: 'right' };
const where = (e: Element): string => `${SIDE[e.side]} ${PLACE[e.compartment] ?? e.compartment} at ${segName(e.segment)}`;

function firstCut(map: LesionMap, kb: Kb, elements: readonly Element[], sacral: boolean): Element | null {
  return elements.find((e) => damageAlong(map, kb, e, sacral) > 0) ?? null;
}

function reason(map: LesionMap, kb: Kb, h: Hypothesis, o: Observation, f: Findings): string {
  switch (o.kind) {
    case 'sensory': {
      const causes = new Set<string>();
      for (const k of segsOf(o.span).map(idx)) {
        const offsets = o.modality === 'posterior_column' ? [0] : crossingOffsets(kb);
        const cuts = offsets.map((off) => firstCut(map, kb, sensoryRoute(kb, o.side, o.modality, k, off).elements, isSacral(kb, k)));
        const hit = cuts.find((c) => c !== null);
        if (hit && cuts.some((c) => c === null)) causes.add(`depends on where the fibre crosses (1–3 segments): ${where(hit)}`);
        else if (hit) causes.add(`the ${o.modality === 'posterior_column' ? 'posterior-column' : 'pain'} route is cut at the ${where(hit)}`);
      }
      return causes.size ? [...causes].join('; ') : 'every route from here reaches the brain intact';
    }
    case 'strength': {
      const causes = new Set<string>();
      for (const k of segsOf(o.span).map(idx)) {
        const cut = firstCut(map, kb, motorRoute(kb, o.side, k).elements, false);
        if (cut) causes.add(`the motor route is cut at the ${where(cut)}`);
      }
      return causes.size ? [...causes].join('; ') : 'the motor route is intact';
    }
    case 'reflex': {
      const r = f.reflexes[o.side][o.reflex];
      const [from, to] = kb.reflexes[o.reflex].span;
      const arc = `${o.reflex} arc (${from === to ? from : `${from}–${to}`})`;
      if (r === 'absent' && map.transectionAt >= 0 && map.transectionAt < idx(from)) {
        return `spinal shock below a complete lesion at ${segName(map.transectionAt)}`;
      }
      if (r === 'absent' || r === 'reduced') return `the ${arc} is damaged`;
      if (r === 'brisk') return `the corticospinal tract above the ${arc} is cut, so the reflex is released`;
      if (r === 'indeterminate') return `not settled at this time after injury`;
      return `the ${arc} and the tract above it are intact`;
    }
    case 'babinski':
      return f.babinski[o.side] === 'present'
        ? 'corticospinal fibres to the lumbosacral cord are cut'
        : f.babinski[o.side] === 'indeterminate'
          ? 'may or may not have appeared yet'
          : map.transectionAt >= 0
            ? 'spinal shock, or no corticospinal interruption above the lumbosacral cord'
            : 'no corticospinal interruption above the lumbosacral cord';
    case 'horner':
      return f.horner[o.side] === 'present'
        ? 'the oculosympathetic pathway is interrupted at or above the ciliospinal centre'
        : 'the oculosympathetic pathway is intact';
    case 'romberg':
      return f.romberg === 'present'
        ? 'proprioception from the legs is lost'
        : f.romberg === 'indeterminate'
          ? 'cannot be tested with weak legs'
          : 'proprioception from the legs is intact';
    case 'bladder':
      return f.bladder === 'sacral'
        ? 'the sacral micturition arc (S2–S4) is damaged'
        : f.bladder === 'suprasacral'
          ? 'descending bladder control is cut on both sides above the sacral centre'
          : f.bladder === 'normal'
            ? `the sacral arc and descending control are intact${h.family.startsWith('hemicord') ? ' — one side is not enough' : ''}`
            : 'impaired during spinal shock';
  }
}

export function explain(h: Hypothesis, observations: readonly Observation[], timepoint: Timepoint, kb: Kb = KB): Verdict[] {
  const map = mapLesion(h.regions, kb);
  const f = forward(h.regions, timepoint, { kb });
  return observations.map((o) => {
    const predicted = predict(f, o);
    return {
      observation: o,
      predicted,
      verdict: predicted === 'unknown' ? 'open' : predicted === o.value ? 'fits' : 'conflicts',
      because: reason(map, kb, h, o, f),
    };
  });
}
