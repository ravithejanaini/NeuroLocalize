// Judges engine output against frozen expectations. Shared by the test suite and the
// mutation harness, so both apply exactly the same rules.
import type { Assertion, BrainAssertion, BrainCase, Case, LimbAssertion, LimbCase, Span } from '../spec/expectations/types.ts';
import type { ReverseCase } from '../spec/expectations/reverse.ts';
import type { BrainReverseCase } from '../spec/expectations/reverse-brain.ts';
import type { LimbReverseCase } from '../spec/expectations/reverse-plexus.ts';
import { forward, type Findings } from '../src/engine/forward.ts';
import { predict, prepareSync, reverse, slotKey, type Observation, type Slot } from '../src/engine/reverse.ts';
import type { Kb } from '../src/kb/types.ts';
import { SEGMENTS, SENSORY_MODALITIES, type Segment, type Side, type Timepoint } from '../src/kb/vocab.ts';

export type Failure = { readonly caseId: string; readonly timepoint: Timepoint; readonly message: string };

const expand = ([from, to]: Span): Segment[] => SEGMENTS.slice(SEGMENTS.indexOf(from), SEGMENTS.indexOf(to) + 1);
const sidesOf = (s: Side | 'both'): Side[] => (s === 'both' ? ['L', 'R'] : [s]);
const miss = <T>(got: T, allowed: readonly T[]): boolean => !allowed.includes(got);
const show = (xs: readonly unknown[]): string => `[${xs.join(', ')}]`;

export function check(a: Assertion | LimbAssertion | BrainAssertion, f: Findings): string[] {
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
    case 'muscle':
      for (const x of sidesOf(a.side))
        for (const m of a.muscles) {
          const got = f.muscles[x][m];
          if (miss(got, a.oneOf)) out.push(`muscle ${x} ${m}: got ${got}, expected ${show(a.oneOf)}`);
        }
      break;
    case 'face_sensation':
    case 'face_weakness':
    case 'ataxia':
      for (const x of sidesOf(a.side)) {
        const got = a.kind === 'face_sensation' ? f.faceSensation[x] : a.kind === 'face_weakness' ? f.faceWeakness[x] : f.ataxia[x];
        if (!(a.oneOf as readonly string[]).includes(got)) out.push(`${a.kind} ${x}: got ${got}, expected ${show(a.oneOf)}`);
      }
      break;
    case 'cranial':
      for (const x of sidesOf(a.side)) {
        const got = f.cranial[x][a.sign];
        if (miss(got, a.oneOf)) out.push(`${a.sign} ${x}: got ${got}, expected ${show(a.oneOf)}`);
      }
      break;
    case 'vertigo':
      if (miss(f.vertigo, a.oneOf)) out.push(`vertigo: got ${f.vertigo}, expected ${show(a.oneOf)}`);
      break;
    case 'deformity':
      for (const x of sidesOf(a.side)) {
        const got = f.deformities[x][a.deformity];
        if (miss(got, a.oneOf)) out.push(`deformity ${x} ${a.deformity}: got ${got}, expected ${show(a.oneOf)}`);
      }
      break;
    case 'skin':
      for (const x of sidesOf(a.side))
        for (const m of a.modality === 'all' ? SENSORY_MODALITIES : [a.modality])
          for (const area of a.areas) {
            const got = f.skin[x][m][area];
            if (miss(got, a.oneOf)) out.push(`skin ${x} ${m} ${area}: got ${got}, expected ${show(a.oneOf)}`);
          }
      break;
    case 'resolvedSegments': {
      const want = expand(a.span).join(',');
      const got = f.resolvedSegments.join(',');
      if (got !== want) out.push(`resolved segments: got ${got}, expected ${want}`);
      break;
    }
    default:
      // An assertion the harness cannot judge must fail, never pass unexamined.
      out.push(`no judge for assertion kind '${(a as { kind: string }).kind}'`);
  }
  return out;
}

export function runCase(kase: Case | LimbCase | BrainCase, kb?: Kb): Failure[] {
  const failures: Failure[] = [];
  for (const ev of kase.evaluations) {
    const findings = forward(kase.lesion, ev.timepoint, kb ? { kb } : {});
    for (const a of ev.assertions) {
      for (const message of check(a, findings)) failures.push({ caseId: kase.id, timepoint: ev.timepoint, message });
    }
  }
  return failures;
}

export const runAll = (cases: readonly (Case | LimbCase | BrainCase)[], kb?: Kb): Failure[] => cases.flatMap((c) => runCase(c, kb));

// ── reverse ──────────────────────────────────────────────────────────────

/** Every way a ranking breaks a frozen reverse expectation, one message each. */
export function reverseFailures(kase: ReverseCase | LimbReverseCase | BrainReverseCase, slots: readonly Slot[], kb?: Kb): Failure[] {
  const out: Failure[] = [];
  const idx = (s: Segment): number => SEGMENTS.indexOf(s);
  const observations: readonly Observation[] = kase.observations;
  for (const ex of kase.expectations) {
    const fail = (message: string): void => {
      out.push({ caseId: kase.id, timepoint: ex.timepoint, message });
    };
    prepareSync(ex.timepoint, kb);
    const r = reverse(observations, ex.timepoint, slots, kb ? { kb } : {});
    const top = r.groups[0];
    if (!top) {
      fail('no candidate ranked');
      continue;
    }
    const summary = r.groups
      .slice(0, 4)
      .map((g) => `${g.family} ${g.sites.length ? g.sites.join('/') : g.rostral.join('–')} (${g.mismatches} conflicts)`)
      .join(' | ');
    if (ex.topFamily && top.family !== ex.topFamily) fail(`top is ${top.family}, expected ${ex.topFamily}: ${summary}`);
    if (ex.topFamilyNot?.includes(top.family)) fail(`top is ${top.family}, which is excluded: ${summary}`);
    if (ex.rostralEndWithin) {
      const [a, b] = ex.rostralEndWithin;
      for (const h of top.members) {
        if (h.rostral < idx(a) || h.rostral > idx(b)) fail(`${h.id} starts outside ${a}–${b}: ${summary}`);
      }
    }
    const places: readonly string[] | undefined =
      'topSites' in ex ? ex.topSites : 'topPlaces' in ex ? ex.topPlaces : undefined;
    if (places) {
      for (const h of top.members) {
        if (!h.site || !places.includes(h.site)) fail(`${h.id} is not at ${places.join('/')}: ${summary}`);
      }
    }
    if (ex.unexplained !== undefined && r.unexplained !== ex.unexplained) fail(`unexplained is ${r.unexplained}: ${summary}`);
    if (ex.amongTop) {
      const leaders = r.groups.slice(0, ex.amongTop.k).map((g) => g.family);
      for (const set of ex.amongTop.families) {
        if (!leaders.some((f) => set.includes(f))) fail(`none of ${set.join('/')} in the top ${ex.amongTop.k}: ${summary}`);
      }
    }
    if (ex.nextTestSeparatesTopTwo) {
      const s = r.suggestion;
      if (!s) {
        fail('no test suggested');
        continue;
      }
      if (observations.some((o) => slotKey(o) === slotKey(s.slot))) fail('suggested a test already done');
      if (!s.separatesTopTwo) fail(`suggested ${slotKey(s.slot)} does not separate ${summary}`);
      const [h0, h1] = r.groups.slice(0, 2).map((g) => g.members[0]);
      if (!h0 || !h1) fail('fewer than two groups');
      else {
        const opts = kb ? { kb } : {};
        const p0 = predict(forward(h0.regions, ex.timepoint, opts), s.slot, kb);
        const p1 = predict(forward(h1.regions, ex.timepoint, opts), s.slot, kb);
        if (p0 === p1) fail(`both leaders predict ${p0} for ${slotKey(s.slot)}`);
      }
    }
  }
  return out;
}
