// The clinical review as data: what a reviewer is asked, what comes back, and how the
// answers are sorted into work. Pure, so the tests can hold it without a file system.

export type Source = { readonly id: string; readonly url: string };

export type Finding = { readonly id: string; readonly text: string; readonly sources: readonly Source[]; readonly note?: string };

export type ReviewItem = {
  readonly id: string;
  readonly section: 'claim' | 'fact' | 'question' | 'case';
  readonly n: number;
  readonly title: string;
  /** For a case: the clinical pattern it reproduces. */
  readonly subtitle?: string;
  readonly tags: readonly string[];
  readonly sources: readonly Source[];
  readonly definitional?: boolean;
  /** Printed when no source read supports the whole claim. */
  readonly warning?: string;
  readonly findings?: readonly Finding[];
};

export type Mechanism = {
  readonly claim: string;
  readonly tier: string;
  readonly positions: readonly { readonly account: string; readonly sources: readonly Source[] }[];
};

export type Worksheet = {
  /** Changes whenever anything a reviewer is shown changes. */
  readonly version: string;
  readonly score: string;
  readonly items: readonly ReviewItem[];
  readonly mechanisms: readonly Mechanism[];
};

export type Verdict = 'right' | 'wrong' | 'unsure';
export type Answer = {
  readonly verdict?: Verdict;
  readonly correction?: string;
  readonly source?: string;
  /** Finding ids within a case the reviewer marked as wrong. */
  readonly flagged?: readonly string[];
};
export type ReviewResponse = {
  readonly kind: 'neurolocalize-review';
  readonly format: 1;
  readonly worksheet: string;
  readonly reviewer: { readonly name: string; readonly role: string };
  readonly savedAt: string;
  readonly answers: Readonly<Record<string, Answer>>;
};

const VERDICTS: readonly string[] = ['right', 'wrong', 'unsure'];
const MAX_TEXT = 4000;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.length <= MAX_TEXT;

/** Reads a returned review strictly; anything malformed is refused with the reason. */
export function parseResponse(raw: string): { ok: true; value: ReviewResponse } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'not JSON' };
  }
  if (!isRecord(data) || data.kind !== 'neurolocalize-review') return { ok: false, error: 'not a NeuroLocalize review file' };
  if (data.format !== 1) return { ok: false, error: `unknown format ${String(data.format)}` };
  if (!text(data.worksheet) || !text(data.savedAt)) return { ok: false, error: 'missing worksheet version or date' };
  const r = data.reviewer;
  if (!isRecord(r) || !text(r.name) || !text(r.role)) return { ok: false, error: 'missing reviewer' };
  if (!isRecord(data.answers)) return { ok: false, error: 'missing answers' };
  const answers: Record<string, Answer> = {};
  for (const [id, a] of Object.entries(data.answers)) {
    if (!isRecord(a)) return { ok: false, error: `answer ${id} is not an object` };
    if (a.verdict !== undefined && !(typeof a.verdict === 'string' && VERDICTS.includes(a.verdict))) {
      return { ok: false, error: `answer ${id} has verdict ${String(a.verdict)}` };
    }
    for (const k of ['correction', 'source'] as const) {
      if (a[k] !== undefined && !text(a[k])) return { ok: false, error: `answer ${id} has a bad ${k}` };
    }
    if (a.flagged !== undefined && !(Array.isArray(a.flagged) && a.flagged.every(text))) {
      return { ok: false, error: `answer ${id} has bad flags` };
    }
    answers[id] = {
      ...(a.verdict !== undefined ? { verdict: a.verdict as Verdict } : {}),
      ...(typeof a.correction === 'string' && a.correction.trim() ? { correction: a.correction.trim() } : {}),
      ...(typeof a.source === 'string' && a.source.trim() ? { source: a.source.trim() } : {}),
      ...(Array.isArray(a.flagged) && a.flagged.length ? { flagged: a.flagged as string[] } : {}),
    };
  }
  return {
    ok: true,
    value: {
      kind: 'neurolocalize-review',
      format: 1,
      worksheet: data.worksheet,
      reviewer: { name: r.name.trim(), role: r.role.trim() },
      savedAt: data.savedAt,
      answers,
    },
  };
}

const SECTION_NAME: Record<ReviewItem['section'], string> = {
  claim: 'Claim',
  fact: 'Displayed fact',
  question: 'Open question',
  case: 'Case',
};

const quote = (s: string): string => s.replace(/\n+/g, ' ').trim();

/**
 * Sorts every returned review into work: what a reviewer called wrong, what they were
 * unsure of, and what they answered about something this worksheet no longer asks.
 */
export function triage(ws: Worksheet, responses: readonly ReviewResponse[]): string {
  const byId = new Map(ws.items.map((i) => [i.id, i]));
  const findingText = new Map(ws.items.flatMap((i) => (i.findings ?? []).map((f) => [f.id, f.text] as const)));
  const out: string[] = ['# Clinical review triage', '', '_Generated by `npm run review:ingest`. Do not edit by hand._', ''];

  if (responses.length === 0) {
    out.push('No reviews have been returned yet.', '');
    return out.join('\n');
  }

  out.push('| Reviewer | Role | Saved | Worksheet | Answered | Wrong | Unsure |', '|---|---|---|---|---|---|---|');
  for (const r of responses) {
    // Only items this worksheet still asks; the rest are listed at the end.
    const current = Object.entries(r.answers).filter(([id]) => byId.has(id)).map(([, a]) => a);
    const answered = current.filter((a) => a.verdict).length;
    const count = (v: Verdict): number => current.filter((a) => a.verdict === v).length;
    const sheet = r.worksheet === ws.version ? 'current' : `${r.worksheet} (older)`;
    out.push(`| ${r.reviewer.name || '_unnamed_'} | ${r.reviewer.role || '—'} | ${r.savedAt.slice(0, 10)} | ${sheet} | ${answered} of ${ws.items.length} | ${count('wrong')} | ${count('unsure')} |`);
  }
  out.push('');

  type Entry = { item: ReviewItem; who: string; a: Answer };
  const entries = (pick: (a: Answer) => boolean): Entry[] =>
    responses
      .flatMap((r) =>
        Object.entries(r.answers).flatMap(([id, a]) => {
          const item = byId.get(id);
          return item && pick(a) ? [{ item, who: r.reviewer.name || 'unnamed', a }] : [];
        }),
      )
      .sort((x, y) => ws.items.indexOf(x.item) - ws.items.indexOf(y.item));

  const block = (title: string, list: Entry[], why: string): void => {
    out.push(`## ${title} (${list.length})`, '', why, '');
    if (list.length === 0) out.push('None.', '');
    for (const { item, who, a } of list) {
      out.push(`### ${SECTION_NAME[item.section]} ${item.n} · \`${item.id}\``, '', `> ${quote(item.title)}`, '');
      out.push(`- **${who}:** ${a.verdict ?? 'no verdict'}`);
      for (const f of a.flagged ?? []) out.push(`  - flagged: ${findingText.get(f) ?? `\`${f}\` (no longer in the worksheet)`}`);
      if (a.correction) out.push(`  - correction: ${quote(a.correction)}`);
      if (a.source) out.push(`  - source: ${quote(a.source)}`);
      out.push('');
    }
  };

  block(
    'Marked wrong',
    entries((a) => a.verdict === 'wrong' || (a.flagged?.length ?? 0) > 0),
    'Each needs a decision: correct the knowledge base (with the source given, once read) or record why not in `docs/DECISIONS.md`. A frozen expectation changes only by amendment.',
  );
  block('Not sure', entries((a) => a.verdict === 'unsure'), 'Worth a second reviewer or a textbook check.');
  block(
    'Notes on items marked right',
    entries((a) => a.verdict === 'right' && Boolean(a.correction || a.source)),
    'Agreed, with a comment or a book reference worth keeping.',
  );

  const stale = responses.flatMap((r) => Object.keys(r.answers).filter((id) => !byId.has(id)).map((id) => `- ${r.reviewer.name || 'unnamed'}: \`${id}\``));
  out.push(`## Answers to items no longer asked (${stale.length})`, '', 'The worksheet changed after this review was given. Read these by hand.', '');
  out.push(...(stale.length ? stale : ['None.']), '');
  return out.join('\n');
}
