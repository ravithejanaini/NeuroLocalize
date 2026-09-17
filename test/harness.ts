// Judges engine output against frozen expectations. Shared by the test suite and the
// mutation harness, so both apply exactly the same rules.
import type { Assertion, BrainAssertion, BrainCase, Case, LimbAssertion, LimbCase, Span, VisionAssertion, VisionCase } from '../spec/expectations/types.ts';
import type { ReverseCase } from '../spec/expectations/reverse.ts';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { VISION_CASES } from '../spec/expectations/vision.ts';
import type { BrainReverseCase } from '../spec/expectations/reverse-brain.ts';
import type { LimbReverseCase } from '../spec/expectations/reverse-plexus.ts';
import type { VisionReverseCase } from '../spec/expectations/reverse-vision.ts';
import { forward, type Findings } from '../src/engine/forward.ts';
import { predict, prepareSync, reverse, slotKey, type Observation, type Slot } from '../src/engine/reverse.ts';
import type { Kb } from '../src/kb/types.ts';
import { SEGMENTS, SENSORY_MODALITIES, type Segment, type Side, type Timepoint } from '../src/kb/vocab.ts';

export type Failure = { readonly caseId: string; readonly timepoint: Timepoint; readonly message: string };

const expand = ([from, to]: Span): Segment[] => SEGMENTS.slice(SEGMENTS.indexOf(from), SEGMENTS.indexOf(to) + 1);
const sidesOf = (s: Side | 'both'): Side[] => (s === 'both' ? ['L', 'R'] : [s]);
const miss = <T>(got: T, allowed: readonly T[]): boolean => !allowed.includes(got);
const show = (xs: readonly unknown[]): string => `[${xs.join(', ')}]`;

export function check(a: Assertion | LimbAssertion | BrainAssertion | VisionAssertion, f: Findings): string[] {
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
    case 'field':
      for (const x of a.eye === 'both' ? (['L', 'R'] as const) : [a.eye])
        for (const sector of a.sectors) {
          const got = f.fields[x][sector];
          if (miss(got, a.oneOf)) out.push(`field ${x} ${sector}: got ${got}, expected ${show(a.oneOf)}`);
        }
      break;
    case 'rapd':
      for (const x of sidesOf(a.side)) {
        const got = f.rapd[x];
        if (miss(got, a.oneOf)) out.push(`rapd ${x}: got ${got}, expected ${show(a.oneOf)}`);
      }
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

export function runCase(kase: Case | LimbCase | BrainCase | VisionCase, kb?: Kb): Failure[] {
  const failures: Failure[] = [];
  for (const ev of kase.evaluations) {
    const findings = forward(kase.lesion, ev.timepoint, kb ? { kb } : {});
    for (const a of ev.assertions) {
      for (const message of check(a, findings)) failures.push({ caseId: kase.id, timepoint: ev.timepoint, message });
    }
  }
  return failures;
}

export const runAll = (cases: readonly (Case | LimbCase | BrainCase | VisionCase)[], kb?: Kb): Failure[] => cases.flatMap((c) => runCase(c, kb));

// ── reverse ──────────────────────────────────────────────────────────────

/** Every way a ranking breaks a frozen reverse expectation, one message each. */
export function reverseFailures(kase: ReverseCase | LimbReverseCase | BrainReverseCase | VisionReverseCase, slots: readonly Slot[], kb?: Kb): Failure[] {
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

// ── territories ──────────────────────────────────────────────────────────

/** Each named territory is the lesion of the frozen case its sources describe. */
export const TERRITORY_CASE: Readonly<Record<string, string>> = {
  lateral_medullary: 'lateral-medullary-left',
  medial_medullary: 'medial-medullary-left',
  ventral_pons: 'ventral-pons-left',
  dorsal_pons: 'dorsal-pons-left',
  midbrain_peduncle: 'midbrain-peduncle-left',
  internal_capsule: 'internal-capsule-left',
  thalamus: 'thalamus-left',
  mca_cortex: 'mca-cortex-left',
  aca_cortex: 'aca-cortex-left',
};

/** P8: the frozen case that describes each place of the visual pathway. */
export const VISION_PLACE_CASE: Readonly<Record<string, string>> = {
  optic_nerve: 'optic-nerve-left',
  chiasm: 'chiasm',
  optic_tract: 'optic-tract-left',
  meyer_loop: 'meyer-loop-left',
  parietal_radiation: 'parietal-radiation-left',
  pca_occipital: 'pca-occipital-left',
  occipital_cortex: 'occipital-cortex-left',
};

/** Every visual place must take exactly the parts its frozen case lesions (D46, for P8). */
export function visionPlaceFailures(kb: Kb): Failure[] {
  const out: Failure[] = [];
  for (const [place, row] of Object.entries(kb.vision.places)) {
    const id = VISION_PLACE_CASE[place];
    const kase = VISION_CASES.find((c) => c.id === id);
    const fail = (message: string): void => {
      out.push({ caseId: id ?? place, timepoint: 'chronic', message });
    };
    if (!kase) {
      fail(`visual place ${place} has no frozen case`);
      continue;
    }
    const lesioned = kase.lesion.flatMap((l) => ('vision' in l ? [l.vision] : []));
    const same = [...lesioned].sort().join(',') === [...row.parts].sort().join(',');
    if (!same) fail(`visual place ${place} takes ${row.parts.join(', ')}; its case ${lesioned.join(', ')}`);
    // The chiasm is the one midline place: its case lesions it from both sides at once.
    const midline = kase.lesion.every((l) => 'vision' in l && l.sides.length === 2);
    if ((row.midline === true) !== midline) fail(`visual place ${place} is ${row.midline ? '' : 'not '}midline, its case ${midline ? '' : 'not '}so`);
  }
  return out;
}

export function territoryFailures(kb: Kb): Failure[] {
  const out: Failure[] = [];
  const same = (a: readonly string[] | undefined, b: readonly string[] | undefined): boolean =>
    [...(a ?? [])].sort().join(',') === [...(b ?? [])].sort().join(',');
  for (const [territory, row] of Object.entries(kb.brain.territories)) {
    const id = TERRITORY_CASE[territory];
    const kase = BRAIN_CASES.find((c) => c.id === id);
    const lesion = kase?.lesion[0];
    const fail = (message: string): void => {
      out.push({ caseId: id ?? territory, timepoint: 'chronic', message });
    };
    if (!lesion || !('brain' in lesion)) {
      fail(`territory ${territory} has no frozen case`);
      continue;
    }
    if (lesion.brain !== row.level) fail(`territory ${territory} is in the ${row.level}, its case in the ${lesion.brain}`);
    if (!same(lesion.compartments, row.compartments)) fail(`territory ${territory} takes ${row.compartments.join(', ')}; its case ${lesion.compartments.join(', ')}`);
    if (!same(lesion.regions, row.regions)) fail(`territory ${territory} regions differ from its case`);
  }
  return out;
}
