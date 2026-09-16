// Judges engine output against frozen expectations. Shared by the test suite and the
// mutation harness, so both apply exactly the same rules.
import type { Assertion, Case, Span } from '../spec/expectations/types.ts';
import { forward, type Findings } from '../src/engine/forward.ts';
import type { Kb } from '../src/kb/types.ts';
import { SEGMENTS, SENSORY_MODALITIES, type Segment, type Side, type Timepoint } from '../src/kb/vocab.ts';

export type Failure = { readonly caseId: string; readonly timepoint: Timepoint; readonly message: string };

const expand = ([from, to]: Span): Segment[] => SEGMENTS.slice(SEGMENTS.indexOf(from), SEGMENTS.indexOf(to) + 1);
const sidesOf = (s: Side | 'both'): Side[] => (s === 'both' ? ['L', 'R'] : [s]);
const miss = <T>(got: T, allowed: readonly T[]): boolean => !allowed.includes(got);
const show = (xs: readonly unknown[]): string => `[${xs.join(', ')}]`;

export function check(a: Assertion, f: Findings): string[] {
  const out: string[] = [];
  switch (a.kind) {
    case 'sensory':
      for (const x of sidesOf(a.side))
        for (const m of a.modality === 'all' ? SENSORY_MODALITIES : [a.modality])
          for (const seg of expand(a.span)) {
            const got = f.sensory[x][m][seg];
            if (miss(got, a.oneOf)) out.push(`sensory ${x} ${m} ${seg}: got ${got}, expected ${show(a.oneOf)}`);
          }
      break;
    case 'motor':
      for (const x of sidesOf(a.side))
        for (const seg of expand(a.span)) {
          const got = f.motor[x][seg];
          if (miss(got.lesion, a.lesion)) out.push(`motor ${x} ${seg}: got ${got.lesion}, expected ${show(a.lesion)}`);
          if (a.tone && miss(got.tone, a.tone)) out.push(`tone ${x} ${seg}: got ${got.tone}, expected ${show(a.tone)}`);
        }
      break;
    case 'reflex':
      for (const x of sidesOf(a.side)) {
        const got = f.reflexes[x][a.reflex];
        if (miss(got, a.oneOf)) out.push(`reflex ${x} ${a.reflex}: got ${got}, expected ${show(a.oneOf)}`);
      }
      break;
    case 'babinski':
    case 'horner':
      for (const x of sidesOf(a.side)) {
        const got = f[a.kind][x];
        if (miss(got, a.oneOf)) out.push(`${a.kind} ${x}: got ${got}, expected ${show(a.oneOf)}`);
      }
      break;
    case 'romberg':
    case 'bladder':
    case 'neurogenicShock':
    case 'dysreflexia': {
      const got = f[a.kind];
      if (!(a.oneOf as readonly string[]).includes(got)) out.push(`${a.kind}: got ${got}, expected ${show(a.oneOf)}`);
      break;
    }
    case 'qualifier': {
      const got = f.qualifiers[a.qualifier];
      if (got !== a.present) out.push(`qualifier ${a.qualifier}: got ${got}, expected ${a.present}`);
      break;
    }
    case 'resolvedSegments': {
      const want = expand(a.span).join(',');
      const got = f.resolvedSegments.join(',');
      if (got !== want) out.push(`resolved segments: got ${got}, expected ${want}`);
      break;
    }
  }
  return out;
}

export function runCase(kase: Case, kb?: Kb): Failure[] {
  const failures: Failure[] = [];
  for (const ev of kase.evaluations) {
    const findings = forward(kase.lesion, ev.timepoint, kb ? { kb } : {});
    for (const a of ev.assertions) {
      for (const message of check(a, findings)) failures.push({ caseId: kase.id, timepoint: ev.timepoint, message });
    }
  }
  return failures;
}

export const runAll = (cases: readonly Case[], kb?: Kb): Failure[] => cases.flatMap((c) => runCase(c, kb));
