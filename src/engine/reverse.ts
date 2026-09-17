// reverse(): from examination findings to ranked candidate lesions, the one test that best
// separates the leaders, and the working behind every ranking. The constants below are
// modelling choices, not clinical facts (D24); no finding depends on them, only the order.
import { KB } from '../kb/kb.ts';
import type { Kb, Supply } from '../kb/types.ts';
import {
  MUSCLES,
  PLACES,
  PLEXUS_SITES,
  SEGMENTS,
  SKIN_AREAS,
  type BladderObservation,
  type BodyRegion,
  type BrainCompartment,
  type BrainLevel,
  type CranialSign,
  type FaceWeaknessObservation,
  type LesionFamily,
  type Muscle,
  type Place,
  type Reflex,
  type ReflexObservation,
  type Segment,
  type SensoryModality,
  type SensoryObservation,
  type Side,
  type SignObservation,
  type SkinArea,
  type StrengthObservation,
  type Timepoint,
} from '../kb/vocab.ts';
import { mapBrain, regionOf, type BrainMap } from './brain.ts';
import { forward, isBrain, isCord, isPlexus, isSacral, type Findings } from './forward.ts';
import { hypotheses, type Hypothesis } from './hypotheses.ts';
import { mapLesion, type LesionMap } from './lesion.ts';
import { limbRoute, mapPlexus, routeSites, type PlexusMap } from './limb.ts';
import { crossingOffsets, damageAlong, motorRoute, sensoryRoute, type Element } from './routes.ts';

export type Span = readonly [Segment, Segment];

export type Observation =
  | { readonly kind: 'sensory'; readonly side: Side; readonly modality: SensoryModality; readonly span: Span; readonly value: SensoryObservation }
  | { readonly kind: 'strength'; readonly side: Side; readonly span: Span; readonly value: StrengthObservation }
  | { readonly kind: 'reflex'; readonly side: Side; readonly reflex: Reflex; readonly value: ReflexObservation }
  | { readonly kind: 'babinski' | 'horner'; readonly side: Side; readonly value: SignObservation }
  | { readonly kind: 'romberg'; readonly value: SignObservation }
  | { readonly kind: 'bladder'; readonly value: BladderObservation }
  | { readonly kind: 'muscle'; readonly side: Side; readonly muscle: Muscle; readonly value: StrengthObservation }
  /** Any modality at a patch without a dermatome landmark (D30). */
  | { readonly kind: 'skin'; readonly side: Side; readonly area: SkinArea; readonly value: SensoryObservation }
  | { readonly kind: 'face_sensation'; readonly side: Side; readonly value: SensoryObservation }
  | { readonly kind: 'face_weakness'; readonly side: Side; readonly value: FaceWeaknessObservation }
  | { readonly kind: 'cranial'; readonly side: Side; readonly sign: CranialSign; readonly value: SignObservation }
  | { readonly kind: 'ataxia'; readonly side: Side; readonly value: SignObservation }
  | { readonly kind: 'vertigo'; readonly value: SignObservation };

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
  muscle: ['normal', 'weak'],
  skin: ['normal', 'abnormal'],
  face_sensation: ['normal', 'abnormal'],
  face_weakness: ['normal', 'lower', 'whole'],
  cranial: ['present', 'absent'],
  ataxia: ['present', 'absent'],
  vertigo: ['present', 'absent'],
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
    case 'muscle':
      return `muscle|${s.side}|${s.muscle}`;
    case 'skin':
      return `skin|${s.side}|${s.area}`;
    case 'face_sensation':
    case 'face_weakness':
    case 'ataxia':
      return `${s.kind}|${s.side}`;
    case 'cranial':
      return `cranial|${s.side}|${s.sign}`;
    default:
      return s.kind;
  }
};

/** The patch of skin a dermatome landmark also tests (D30). */
export const landmarkArea = (kb: Kb, s: Segment): SkinArea | undefined =>
  SKIN_AREAS.find((a) => kb.plexus.skin[a].landmark === s);
/** The muscles a single-segment strength test also asks about (D31). */
export const myotomeMuscles = (kb: Kb, s: Segment): Muscle[] => MUSCLES.filter((m) => kb.plexus.muscles[m].myotome === s);

const sensed = (states: readonly string[]): Value | 'unknown' =>
  states.some((x) => x === 'lost' || x === 'impaired') ? 'abnormal' : states.includes('indeterminate') ? 'unknown' : 'normal';
const strengthOf = (states: readonly string[]): Value | 'unknown' =>
  states.includes('weak') ? 'weak' : states.includes('indeterminate') ? 'unknown' : 'normal';

/** What a candidate predicts for a slot; 'unknown' where the engine leaves it open. */
export function predict(f: Findings, s: Slot, kb: Kb = KB): Value | 'unknown' {
  switch (s.kind) {
    case 'sensory': {
      const segs = segsOf(s.span);
      const [only] = segs;
      const area = segs.length === 1 && only ? landmarkArea(kb, only) : undefined;
      return sensed(area ? [f.skin[s.side][s.modality][area]] : segs.map((k) => f.sensory[s.side][s.modality][k]));
    }
    case 'strength': {
      const segs = segsOf(s.span);
      if (segs.some((k) => f.motor[s.side][k].lesion !== 'none')) return 'weak';
      const [only] = segs;
      const muscles = segs.length === 1 && only ? myotomeMuscles(kb, only) : [];
      return strengthOf(muscles.map((m) => f.muscles[s.side][m]));
    }
    case 'muscle':
      return strengthOf([f.muscles[s.side][s.muscle]]);
    case 'skin':
      return sensed([f.skin[s.side].pain_temperature[s.area], f.skin[s.side].posterior_column[s.area]]);
    case 'face_sensation':
      return sensed([f.faceSensation[s.side]]);
    case 'face_weakness': {
      const w = f.faceWeakness[s.side];
      return w === 'indeterminate' ? 'unknown' : w === 'none' ? 'normal' : w;
    }
    case 'cranial': {
      const v = f.cranial[s.side][s.sign];
      return v === 'indeterminate' ? 'unknown' : v;
    }
    case 'ataxia': {
      const v = f.ataxia[s.side];
      return v === 'indeterminate' ? 'unknown' : v;
    }
    case 'vertigo':
      return f.vertigo === 'indeterminate' ? 'unknown' : f.vertigo;
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
// Keyed by the knowledge base itself, so a corrupted copy never reuses another's results.
const prepared = new WeakMap<Kb, Map<Timepoint, Prepared[]>>();
const cached = (t: Timepoint, kb: Kb): Prepared[] | undefined => prepared.get(kb)?.get(t);
function store(t: Timepoint, kb: Kb, ps: Prepared[]): void {
  const byTime = prepared.get(kb) ?? new Map<Timepoint, Prepared[]>();
  byTime.set(t, ps);
  prepared.set(kb, byTime);
}

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

/** Runs the engine for every candidate. Yields to the caller between batches if asked. */
export async function prepare(
  timepoint: Timepoint,
  options: { kb?: Kb; onProgress?: (done: number, total: number) => void; batch?: number } = {},
): Promise<void> {
  const kb = options.kb ?? KB;
  if (cached(timepoint, kb)) return;
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
  store(timepoint, kb, out);
  options.onProgress?.(hs.length, hs.length);
}

export const isPrepared = (timepoint: Timepoint, kb: Kb = KB): boolean => cached(timepoint, kb) !== undefined;

function preparedOrThrow(timepoint: Timepoint, kb: Kb): Prepared[] {
  const p = cached(timepoint, kb);
  if (!p) throw new Error(`Call prepare('${timepoint}') before reverse().`);
  return p;
}

/** Synchronous preparation, for tests and scripts. */
export function prepareSync(timepoint: Timepoint, kb: Kb = KB): void {
  if (cached(timepoint, kb)) return;
  const hs = hypotheses();
  const priors = priorsFor(hs);
  store(timepoint, kb, hs.map((h) => ({ h, findings: forward(h.regions, timepoint, { kb }), prior: priors.get(h.id) ?? 0 })));
}

// ── ranking ──────────────────────────────────────────────────────────────

export type Group = {
  readonly family: LesionFamily;
  /** For plexus and nerve groups, the places its members sit, in anatomical order. */
  readonly sites: readonly Place[];
  readonly rostral: readonly [Segment, Segment];
  readonly caudal: readonly [Segment, Segment];
  readonly members: readonly Hypothesis[];
  readonly posterior: number;
  readonly mismatches: number;
  readonly fits: number;
  readonly open: number;
};

export type Outcome = {
  readonly value: Value;
  readonly probability: number;
  /** The single most likely candidate if this result were seen. */
  readonly leader: { readonly family: LesionFamily; readonly rostral: Segment; readonly site?: Place } | null;
};

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

function score(ps: readonly Prepared[], observations: readonly Observation[], kb: Kb): Scored[] {
  return ps.map((p) => {
    let log = Math.log(p.prior || Number.MIN_VALUE);
    let mismatches = 0;
    let fits = 0;
    let open = 0;
    const sig: string[] = [];
    for (const o of observations) {
      const pr = predict(p.findings, o, kb);
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
      const sites = new Set(items.map((s) => s.h.site).filter((x) => x !== undefined));
      return {
        family: first.h.family,
        sites: PLACES.filter((x) => sites.has(x)),
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
  const scored = score(preparedOrThrow(timepoint, kb), observations, kb);
  const post = normalise(scored);
  const groups = groupsOf(scored, post);
  const unexplained = Math.min(...scored.map((s) => s.mismatches)) > 0;

  const observed = new Set(observations.map((o) => slotKey(o)));
  const top = groups.slice(0, 2).map((g) => scored.find((s) => s.h.id === g.members[0]?.id));
  const h0 = entropy(post);
  let best: Suggestion | null = null;

  for (const slot of slots) {
    if (observed.has(slotKey(slot))) continue;
    const preds = scored.map((s) => predict(s.findings, slot, kb));
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
        leader: leader
          ? { family: leader.h.family, rostral: segName(leader.h.rostral), ...(leader.h.site ? { site: leader.h.site } : {}) }
          : null,
      });
    }
    const gain = h0 - expected;
    if (gain < MIN_BITS) continue;
    const [a, b] = top;
    const pa = a ? predict(a.findings, slot, kb) : 'unknown';
    const pb = b ? predict(b.findings, slot, kb) : 'unknown';
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
const PLEXUS_SITE_SET: ReadonlySet<string> = new Set<string>(PLEXUS_SITES);

/** Plain names for the places beyond the cord and roots, as the working speaks of them. */
export const SITE_NAME: Record<Place, string> = {
  lateral_medullary: 'lateral medulla',
  medial_medullary: 'medial medulla',
  ventral_pons: 'ventral pons',
  dorsal_pons: 'dorsal pons',
  midbrain_peduncle: 'cerebral peduncle',
  internal_capsule: 'internal capsule',
  thalamus: 'lateral thalamus',
  mca_cortex: 'lateral cortex (MCA)',
  aca_cortex: 'medial cortex (ACA)',
  upper_trunk: 'upper trunk',
  middle_trunk: 'middle trunk',
  lower_trunk: 'lower trunk',
  lateral_cord: 'lateral cord',
  posterior_cord: 'posterior cord',
  medial_cord: 'medial cord',
  dorsal_scapular: 'dorsal scapular nerve',
  long_thoracic: 'long thoracic nerve',
  suprascapular: 'suprascapular nerve',
  axillary: 'axillary nerve',
  musculocutaneous: 'musculocutaneous nerve',
  radial_axilla: 'radial nerve in the axilla',
  radial_spiral_groove: 'radial nerve at the spiral groove',
  posterior_interosseous: 'posterior interosseous nerve',
  median_elbow: 'median nerve at the elbow',
  median_wrist: 'median nerve at the wrist',
  ulnar_elbow: 'ulnar nerve at the elbow',
  ulnar_wrist: 'ulnar nerve at the wrist',
};
const where = (e: Element): string => `${SIDE[e.side]} ${PLACE[e.compartment] ?? e.compartment} at ${segName(e.segment)}`;

function firstCut(map: LesionMap, kb: Kb, elements: readonly Element[], sacral: boolean): Element | null {
  return elements.find((e) => damageAlong(map, kb, e, sacral) > 0) ?? null;
}

/** The first cut place beyond the roots on any route from these roots to these branches. */
function limbCuts(kb: Kb, pmap: PlexusMap, side: Side, supplies: readonly Supply[], roots: readonly Segment[]): string[] {
  const out = new Set<string>();
  for (const supply of supplies) {
    for (const r of roots) {
      const route = limbRoute(kb, supply, r);
      const cut = route ? routeSites(route).find((site) => pmap.damage(site, side) > 0) : undefined;
      if (cut) out.add(`the ${SIDE[side]} ${SITE_NAME[cut]} is cut`);
    }
  }
  return [...out];
}

const rootsOf = (span: Span | null | undefined): Segment[] => (span ? segsOf(span) : []);

const PART_NAME: Record<BrainCompartment, string> = {
  motor_cortex: 'motor cortex',
  sensory_cortex: 'sensory cortex',
  capsule_genu: 'genu of the internal capsule',
  capsule_posterior_motor: 'posterior limb of the internal capsule',
  capsule_posterior_sensory: 'sensory fibres of the posterior limb',
  vpl: 'VPL nucleus of the thalamus',
  vpm: 'VPM nucleus of the thalamus',
  peduncle: 'cerebral peduncle',
  oculomotor: 'oculomotor fascicles',
  basis: 'basis pontis',
  facial: 'facial nucleus and fascicle',
  abducens_nucleus: 'abducens nucleus',
  abducens_fascicle: 'abducens fascicle',
  pyramid: 'pyramid',
  hypoglossal: 'hypoglossal nucleus',
  medial_lemniscus: 'medial lemniscus',
  spinothalamic: 'spinothalamic tract',
  spinal_trigeminal: 'spinal trigeminal nucleus',
  sympathetic: 'descending sympathetic fibres',
  ambiguus: 'nucleus ambiguus',
  cerebellar_peduncle: 'cerebellar peduncle',
  vestibular: 'vestibular nuclei',
};
const LEVEL_NAME: Record<BrainLevel, string> = {
  cortex: 'cortex',
  capsule: 'capsule',
  thalamus: 'thalamus',
  midbrain: 'midbrain',
  pons: 'pons',
  medulla: 'medulla',
};

/** The first damaged part along a brain route, in words. */
function brainCut(bmap: BrainMap, steps: readonly { level: BrainLevel; compartment: BrainCompartment }[], side: Side, region: BodyRegion): string | null {
  const s = steps.find((x) => bmap.damage(x.level, x.compartment, side, region) > 0);
  if (!s) return null;
  const at = ['cortex', 'capsule', 'thalamus'].includes(s.level) ? '' : ` in the ${LEVEL_NAME[s.level]}`;
  return `the ${SIDE[side]} ${PART_NAME[s.compartment]}${at}`;
}
const opp = (s: Side): Side => (s === 'L' ? 'R' : 'L');
const partSideOf = (x: Side, serves: 'ipsilateral' | 'contralateral'): Side => (serves === 'ipsilateral' ? x : opp(x));

function muscleReason(map: LesionMap, kb: Kb, pmap: PlexusMap, side: Side, muscle: Muscle): string[] {
  const row = kb.plexus.muscles[muscle];
  const roots = [...rootsOf(row.roots), ...rootsOf(row.disputedRoots)];
  const causes = new Set<string>();
  for (const r of roots) {
    const cut = firstCut(map, kb, motorRoute(kb, side, idx(r)).elements, false);
    if (cut) causes.add(`the motor route to ${r} is cut at the ${where(cut)}`);
  }
  for (const c of limbCuts(kb, pmap, side, [row.supply], roots)) causes.add(c);
  const disputed = rootsOf(row.disputedRoots);
  if (causes.size && disputed.length && !rootsOf(row.roots).some((r) => [...causes].some((c) => c.includes(r)))) {
    causes.add(`the sources disagree whether ${disputed.join('–')} serves it`);
  }
  return [...causes];
}

function reason(map: LesionMap, pmap: PlexusMap, bmap: BrainMap, kb: Kb, h: Hypothesis, o: Observation, f: Findings): string {
  const b = kb.brain;
  const bodyCut = (kind: 'motor' | 'posterior_column' | 'pain_temperature', x: Side, k: number): string | null => {
    if (bmap.empty) return null;
    const route = kind === 'motor' ? b.corticospinal : kind === 'posterior_column' ? b.lemniscal : b.spinothalamic;
    const cut = brainCut(bmap, route.steps, partSideOf(x, route.serves), regionOf(kb, k));
    return cut ? `${cut} is damaged, above the ${kind === 'motor' ? 'decussation' : 'crossing'}` : null;
  };
  const faceCuts = (routes: readonly { steps: readonly { level: BrainLevel; compartment: BrainCompartment }[]; serves: 'ipsilateral' | 'contralateral' }[], x: Side): string[] =>
    routes.flatMap((r) => {
      const c = brainCut(bmap, r.steps, partSideOf(x, r.serves), 'face');
      return c ? [`${c} is damaged`] : [];
    });
  switch (o.kind) {
    case 'face_sensation': {
      const c = faceCuts([b.faceNucleus, b.faceAscending], o.side);
      return c.length ? c.join('; ') : 'the trigeminal routes are intact';
    }
    case 'face_weakness': {
      const w = f.faceWeakness[o.side];
      if (w === 'whole' && faceCuts([b.facialNucleus], o.side).length) return `${faceCuts([b.facialNucleus], o.side).join('; ')}: the whole face on that side`;
      const c = faceCuts([b.corticobulbarFace], o.side);
      if (w === 'lower') return `${c.join('; ')}; the forehead keeps its supply from the other hemisphere`;
      if (w === 'whole') return 'corticobulbar fibres to both facial nuclei are cut';
      return 'the facial nucleus and its supranuclear supply are intact';
    }
    case 'cranial': {
      const routes =
        o.sign === 'oculomotor_palsy' ? [b.oculomotor]
        : o.sign === 'abduction_weakness' ? [b.abduction]
        : o.sign === 'gaze_palsy' ? [b.gaze]
        : o.sign === 'tongue_weakness' ? [b.hypoglossal, b.corticobulbarTongue]
        : [b.ambiguus];
      const c = faceCuts(routes, o.side);
      if (o.sign === 'palate_weakness' && !c.length && f.cranial[o.side].palate_weakness === 'indeterminate') {
        return 'one hemisphere\'s supply is cut, and the palate has both: at most a milder weakness';
      }
      return c.length ? c.join('; ') : 'its nucleus, fascicle and supranuclear supply are intact';
    }
    case 'ataxia': {
      const c = faceCuts([b.ataxia], o.side);
      return c.length ? c.join('; ') : 'the cerebellar peduncles on that side are intact';
    }
    case 'vertigo': {
      const c = (['L', 'R'] as const).map((s) => brainCut(bmap, b.vertigo.steps, s, 'face')).filter((x): x is string => x !== null);
      return c.length ? `${c.join('; ')} ${c.length > 1 ? 'are' : 'is'} damaged` : 'the vestibular nuclei are intact';
    }
    case 'muscle': {
      const causes = muscleReason(map, kb, pmap, o.side, o.muscle);
      return causes.length ? causes.join('; ') : 'every route from its roots to the muscle is intact';
    }
    case 'skin': {
      const row = kb.plexus.skin[o.area];
      const causes = limbCuts(kb, pmap, o.side, row.supply, [...rootsOf(row.roots), ...rootsOf(row.disputedRoots)]);
      return causes.length ? causes.join('; ') : 'the nerves to this patch are intact beyond the roots';
    }
    case 'sensory': {
      const causes = new Set<string>();
      for (const k of segsOf(o.span).map(idx)) {
        const c = bodyCut(o.modality, o.side, k);
        if (c) causes.add(c);
      }
      const [only] = segsOf(o.span);
      const area = segsOf(o.span).length === 1 && only ? landmarkArea(kb, only) : undefined;
      if (area) {
        const row = kb.plexus.skin[area];
        for (const c of limbCuts(kb, pmap, o.side, row.supply, rootsOf(row.roots))) causes.add(c);
      }
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
        const above = bodyCut('motor', o.side, k);
        if (above) causes.add(above);
      }
      const [only] = segsOf(o.span);
      for (const m of segsOf(o.span).length === 1 && only ? myotomeMuscles(kb, only) : []) {
        for (const c of muscleReason(map, kb, pmap, o.side, m)) causes.add(c);
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
      const muscle = kb.plexus.reflexMuscles.muscles[o.reflex];
      const peripheral = muscle ? limbCuts(kb, pmap, o.side, [kb.plexus.muscles[muscle].supply], segsOf([from, to])) : [];
      if ((r === 'absent' || r === 'reduced') && peripheral.length) return `its arc runs through the cut: ${peripheral.join('; ')}`;
      if (r === 'absent' || r === 'reduced') return `the ${arc} is damaged`;
      const above = bodyCut('motor', o.side, idx(from));
      if (r === 'brisk') return `${above ? `${above}` : `the corticospinal tract above the ${arc} is cut`}, so the reflex is released`;
      if (r === 'indeterminate') return `not settled at this time after injury`;
      return `the ${arc} and the tract above it are intact`;
    }
    case 'babinski':
      return f.babinski[o.side] === 'present'
        ? (bodyCut('motor', o.side, idx(kb.observations.babinski.corticospinalRostralTo)) ?? 'corticospinal fibres to the lumbosacral cord are cut')
        : f.babinski[o.side] === 'indeterminate'
          ? 'may or may not have appeared yet'
          : map.transectionAt >= 0
            ? 'spinal shock, or no corticospinal interruption above the lumbosacral cord'
            : 'no corticospinal interruption above the lumbosacral cord';
    case 'horner':
      return f.horner[o.side] === 'present'
        ? map.damage(kb.autonomic.sympatheticRootCompartment.compartment, o.side, idx(kb.autonomic.sympatheticOutflow.root)) > 0
          ? `the ${kb.autonomic.sympatheticOutflow.root} root, which carries the sympathetic outflow to the eye, is damaged`
          : (faceCuts([b.sympathetic], o.side)[0] ?? 'the oculosympathetic pathway is interrupted at or above the ciliospinal centre')
        : h.site && PLEXUS_SITE_SET.has(h.site)
          ? 'the sympathetic fibres leave with the T1 root, before this point'
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
  const map = mapLesion(h.regions.filter(isCord), kb);
  const pmap = mapPlexus(h.regions.filter(isPlexus));
  const bmap = mapBrain(kb, h.regions.filter(isBrain));
  const f = forward(h.regions, timepoint, { kb });
  return observations.map((o) => {
    const predicted = predict(f, o, kb);
    return {
      observation: o,
      predicted,
      verdict: predicted === 'unknown' ? 'open' : predicted === o.value ? 'fits' : 'conflicts',
      because: reason(map, pmap, bmap, kb, h, o, f),
    };
  });
}
