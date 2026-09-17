// Review by pathway, Leitner-style (D48): a miss sends a pathway back to the first box, due
// now; each correct answer moves it up a box and further into the future.
import { PATHWAYS, type Pathway } from './pathways.ts';

/** Days until a pathway in each box is due again. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;
const TOP = INTERVAL_DAYS.length - 1;
const DAY = 86_400_000;
const HISTORY = 200;

export type PathwayStats = {
  readonly box: number;
  readonly due: number;
  readonly seen: number;
  readonly correct: number;
  readonly last: number;
};
export type Answer = { readonly at: number; readonly seed: number; readonly pathways: readonly Pathway[]; readonly correct: boolean };
export type Progress = {
  readonly version: 1;
  readonly pathways: Readonly<Partial<Record<Pathway, PathwayStats>>>;
  readonly history: readonly Answer[];
};

export const emptyProgress = (): Progress => ({ version: 1, pathways: {}, history: [] });

export function record(p: Progress, pathways: readonly Pathway[], correct: boolean, now: number, seed: number): Progress {
  const next: Partial<Record<Pathway, PathwayStats>> = { ...p.pathways };
  for (const pw of pathways) {
    const prev = p.pathways[pw] ?? { box: 0, due: now, seen: 0, correct: 0, last: now };
    const box = correct ? Math.min(TOP, prev.box + 1) : 0;
    next[pw] = {
      box,
      due: now + (INTERVAL_DAYS[box] ?? 0) * DAY,
      seen: prev.seen + 1,
      correct: prev.correct + (correct ? 1 : 0),
      last: now,
    };
  }
  const history = [...p.history, { at: now, seed, pathways: [...pathways], correct }].slice(-HISTORY);
  return { version: 1, pathways: next, history };
}

const accuracyOf = (s: PathwayStats | undefined): number => (s && s.seen > 0 ? s.correct / s.seen : 1);

export const dueCount = (p: Progress, now: number): number =>
  PATHWAYS.filter((pw) => {
    const s = p.pathways[pw];
    return s !== undefined && s.due <= now;
  }).length;

/** The pathway to practise next: the weakest one due, else one never seen, else the soonest due. */
export function nextPathway(p: Progress, now: number, random: () => number): Pathway {
  const seen = PATHWAYS.filter((pw) => p.pathways[pw] !== undefined);
  const due = seen
    .filter((pw) => (p.pathways[pw]?.due ?? Infinity) <= now)
    .sort((a, b) => {
      const sa = p.pathways[a];
      const sb = p.pathways[b];
      return (sa?.box ?? 0) - (sb?.box ?? 0) || accuracyOf(sa) - accuracyOf(sb) || (sa?.due ?? 0) - (sb?.due ?? 0);
    });
  const [first] = due;
  if (first) return first;
  const unseen = PATHWAYS.filter((pw) => p.pathways[pw] === undefined);
  if (unseen.length > 0) return unseen[Math.floor(random() * unseen.length)] ?? unseen[0] ?? 'spinothalamic';
  const soonest = [...seen].sort((a, b) => (p.pathways[a]?.due ?? 0) - (p.pathways[b]?.due ?? 0));
  return soonest[0] ?? 'spinothalamic';
}

export type Weakness = { readonly pathway: Pathway; readonly seen: number; readonly accuracy: number; readonly box: number; readonly due: number | null };

/** Every pathway, weakest first; a pathway not yet seen counts as sound until it is tried. */
export function weakest(p: Progress): Weakness[] {
  return PATHWAYS.map((pathway) => {
    const s = p.pathways[pathway];
    return { pathway, seen: s?.seen ?? 0, accuracy: accuracyOf(s), box: s?.box ?? 0, due: s?.due ?? null };
  }).sort((a, b) => a.accuracy - b.accuracy || b.seen - a.seen);
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Reads stored progress, or starts afresh if the text is anything this page did not write. */
export function parseProgress(text: string): Progress {
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyProgress();
    const o = raw as Record<string, unknown>;
    if (o.version !== 1 || !o.pathways || typeof o.pathways !== 'object' || !Array.isArray(o.history)) return emptyProgress();
    const pathways: Partial<Record<Pathway, PathwayStats>> = {};
    for (const [k, v] of Object.entries(o.pathways as Record<string, unknown>)) {
      if (!(PATHWAYS as readonly string[]).includes(k) || !v || typeof v !== 'object') return emptyProgress();
      const s = v as Record<string, unknown>;
      if (![s.box, s.due, s.seen, s.correct, s.last].every(isNum)) return emptyProgress();
      pathways[k as Pathway] = { box: s.box as number, due: s.due as number, seen: s.seen as number, correct: s.correct as number, last: s.last as number };
    }
    const history: Answer[] = [];
    for (const a of o.history as unknown[]) {
      if (!a || typeof a !== 'object') return emptyProgress();
      const r = a as Record<string, unknown>;
      if (!isNum(r.at) || !isNum(r.seed) || typeof r.correct !== 'boolean' || !Array.isArray(r.pathways)) return emptyProgress();
      if (!r.pathways.every((x) => (PATHWAYS as readonly unknown[]).includes(x))) return emptyProgress();
      history.push({ at: r.at, seed: r.seed, pathways: r.pathways as Pathway[], correct: r.correct });
    }
    return { version: 1, pathways, history: history.slice(-HISTORY) };
  } catch {
    return emptyProgress();
  }
}
