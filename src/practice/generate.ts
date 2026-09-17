// Practice cases generated from the model (D48). A case is a real candidate lesion, a
// subset of the findings the engine derives for it, and a question: where is the lesion?
// A case is kept only when the engine, shown just those findings, ranks the true lesion
// first with no conflict, and every wrong option conflicts with at least one finding shown.
import type { Findings } from '../engine/forward.ts';
import { hypotheses, type Hypothesis } from '../engine/hypotheses.ts';
import { FAMILY_NAME, levelText } from '../engine/names.ts';
import {
  predict,
  preparedFindings,
  reverse,
  slotKey,
  type Group,
  type Observation,
  type Slot,
} from '../engine/reverse.ts';
import type { LesionFamily, Place, Segment, Timepoint } from '../kb/vocab.ts';
import { pathwaysOf, pathwaysShown, type Pathway } from './pathways.ts';
import { rng, shuffle } from './rng.ts';

export type Choice = {
  readonly family: LesionFamily;
  readonly rostral: readonly [Segment, Segment];
  readonly caudal: readonly [Segment, Segment];
  readonly sites: readonly Place[];
  /** Candidate ids in the group; the first stands for all of them. */
  readonly memberIds: readonly string[];
};

export type PracticeCase = {
  readonly seed: number;
  readonly target: Pathway;
  readonly timepoint: Timepoint;
  readonly hypothesisId: string;
  readonly observations: readonly Observation[];
  readonly answer: Choice;
  readonly options: readonly Choice[];
  readonly pathways: readonly Pathway[];
};

const TIMEPOINT: Timepoint = 'chronic';
const MAX_SHOWN = 18;
const START_ABNORMAL = 6;
const START_NORMAL = 3;
const OPTIONS = 4;
const ATTEMPTS = 60;

const NORMAL = new Set(['normal', 'absent']);

const choiceOf = (g: Group): Choice => ({
  family: g.family,
  rostral: g.rostral,
  caudal: g.caudal,
  sites: g.sites,
  memberIds: g.members.map((m) => m.id),
});

export const choiceLabel = (c: Choice): string =>
  `${FAMILY_NAME[c.family]} — ${levelText({ ...c, size: c.memberIds.length })}`;

export const sameChoice = (a: Choice, b: Choice): boolean =>
  a.family === b.family && a.memberIds.join('|') === b.memberIds.join('|');

export const isCorrect = (c: PracticeCase, index: number): boolean => {
  const o = c.options[index];
  return o !== undefined && sameChoice(o, c.answer);
};

// Candidates that exercise each pathway, computed once per session of findings.
let byPathway: { findings: ReadonlyMap<string, Findings>; pools: Map<Pathway, Hypothesis[]> } | null = null;
function poolFor(target: Pathway): { pool: Hypothesis[]; findings: ReadonlyMap<string, Findings> } {
  const findings = preparedFindings(TIMEPOINT);
  if (!byPathway || byPathway.findings.size !== findings.size) {
    const pools = new Map<Pathway, Hypothesis[]>();
    for (const h of hypotheses()) {
      const f = findings.get(h.id);
      if (!f) continue;
      for (const p of pathwaysOf(f, h)) pools.set(p, [...(pools.get(p) ?? []), h]);
    }
    byPathway = { findings, pools };
  }
  return { pool: byPathway.pools.get(target) ?? [], findings };
}

/** Candidates that show at least one abnormal finding for this pathway, so the case is about it. */
export const hasPathway = (target: Pathway): boolean => poolFor(target).pool.length > 0;

function attempt(random: () => number, h: Hypothesis, f: Findings, slots: readonly Slot[]): { observations: Observation[]; groups: readonly Group[] } | null {
  const known = slots.flatMap((s): Observation[] => {
    const v = predict(f, s);
    return v === 'unknown' ? [] : [{ ...s, value: v } as Observation];
  });
  const abnormal = shuffle(known.filter((o) => !NORMAL.has(o.value)), random);
  const normal = shuffle(known.filter((o) => NORMAL.has(o.value)), random);
  if (abnormal.length === 0) return null;
  const shown = new Map<string, Observation>();
  for (const o of [...abnormal.slice(0, START_ABNORMAL), ...normal.slice(0, START_NORMAL)]) shown.set(slotKey(o), o);

  // Add the finding that best refutes the strongest rival, until only the truth fits.
  for (;;) {
    const observations = [...shown.values()];
    const r = reverse(observations, TIMEPOINT, slots, { suggest: false });
    const top = r.groups[0];
    const mine = r.groups.find((g) => g.members.some((m) => m.id === h.id));
    const rival = r.groups.find((g) => g !== mine && g.mismatches === 0);
    if (mine && top === mine && mine.mismatches === 0 && !rival) return { observations, groups: r.groups };
    if (shown.size >= MAX_SHOWN || !mine || mine.mismatches > 0) return null;
    const against = rival ?? top;
    const rep = against?.members[0];
    const rf = rep ? preparedFindings(TIMEPOINT).get(rep.id) : undefined;
    if (!rf) return null;
    const unseen = known.filter((o) => !shown.has(slotKey(o)));
    const separating = unseen.filter((o) => {
      const theirs = predict(rf, o);
      return theirs !== 'unknown' && theirs !== o.value;
    });
    // Prefer an abnormal finding: it teaches more than a normal one.
    const pick = separating.find((o) => !NORMAL.has(o.value)) ?? separating[0];
    if (!pick) return null;
    shown.set(slotKey(pick), pick);
  }
}

export function generateCase(seed: number, target: Pathway, slots: readonly Slot[]): PracticeCase {
  const random = rng(seed);
  const { pool, findings } = poolFor(target);
  if (pool.length === 0) throw new Error(`no candidate exercises ${target}`);
  const order = new Map(slots.map((s, i) => [slotKey(s), i]));
  for (let i = 0; i < ATTEMPTS; i++) {
    const h = pool[Math.floor(random() * pool.length)];
    const f = h ? findings.get(h.id) : undefined;
    if (!h || !f) continue;
    const made = attempt(random, h, f, slots);
    if (!made) continue;
    const mine = made.groups[0];
    if (!mine) continue;
    // The case must show the pathway it was built for, not merely come from a lesion that has it.
    const pathways = pathwaysShown(made.observations, f, h);
    if (!pathways.includes(target)) continue;
    const answer = choiceOf(mine);
    const labels = new Set([choiceLabel(answer)]);
    const distractors: Choice[] = [];
    for (const g of made.groups.slice(1)) {
      if (distractors.length >= OPTIONS - 1) break;
      if (g.mismatches === 0) continue;
      const c = choiceOf(g);
      const label = choiceLabel(c);
      if (labels.has(label)) continue;
      labels.add(label);
      distractors.push(c);
    }
    if (distractors.length === 0) continue;
    const observations = [...made.observations].sort((a, b) => (order.get(slotKey(a)) ?? 0) - (order.get(slotKey(b)) ?? 0));
    return {
      seed,
      target,
      timepoint: TIMEPOINT,
      hypothesisId: h.id,
      observations,
      answer,
      options: shuffle([answer, ...distractors], random),
      pathways,
    };
  }
  throw new Error(`no solvable case for ${target} from seed ${seed}`);
}
