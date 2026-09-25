// Corrupts one knowledge-base leaf at a time and requires the frozen expectations to fail.
// Forward cases run first; a mutant they miss is then tried against every frozen reverse
// examination, which is slower but is the only place some facts are read (D30, D31).
// A mutant that survives both is a fact nothing checks. Writes .mutation/report.json for the
// review worksheet, and exits 1 below the P0 threshold.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_CASES } from '../spec/expectations/index.ts';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { PLEXUS_CASES } from '../spec/expectations/plexus.ts';
import { LEG_CASES } from '../spec/expectations/leg.ts';
import { VISION_CASES } from '../spec/expectations/vision.ts';
import { OCCIPITAL_CASES } from '../spec/expectations/occipital.ts';
import { GENICULATE_CASES } from '../spec/expectations/geniculate.ts';
import { ANSWERED_LIMB_CASES, ANSWERED_VISION_CASES } from '../spec/expectations/answered.ts';
import { FIBULAR_CASES } from '../spec/expectations/fibular.ts';
import { TARSAL_CASES } from '../spec/expectations/tarsal.ts';
import { TRANSCORTICAL_CASES } from '../spec/expectations/transcortical.ts';
import { PUDENDAL_CASES } from '../spec/expectations/pudendal.ts';
import { LANGUAGE_CASES } from '../spec/expectations/language.ts';
import { CEREBELLUM_CASES } from '../spec/expectations/cerebellum.ts';
import { POSTERIOR_CASES } from '../spec/expectations/posterior.ts';
import { MIDBRAIN_CASES } from '../spec/expectations/midbrain.ts';
import { NERVE_CASES } from '../spec/expectations/nerves.ts';
import { BASAL_CASES } from '../spec/expectations/basal.ts';
import { BASILAR_CASES } from '../spec/expectations/basilar.ts';
import { CORTEX_CASES } from '../spec/expectations/cortex.ts';
import { KB } from '../src/kb/kb.ts';
import type { Kb } from '../src/kb/types.ts';
import {
  BRAIN_COMPARTMENTS,
  BRAIN_LEVELS,
  COMPARTMENTS,
  MUSCLES,
  NERVES,
  PLEXUS_CORDS,
  PLEXUS_SITES,
  SEGMENTS,
  SENSORY_MODALITIES,
  TIMEPOINTS,
  TRUNKS,
  VERTEBRAE,
} from '../src/kb/vocab.ts';
import { BRAIN_REVERSE_CASES } from '../spec/expectations/reverse-brain.ts';
import { LIMB_REVERSE_CASES } from '../spec/expectations/reverse-plexus.ts';
import { LEG_REVERSE_CASES } from '../spec/expectations/reverse-leg.ts';
import { VISION_REVERSE_CASES } from '../spec/expectations/reverse-vision.ts';
import { LANGUAGE_REVERSE_CASES } from '../spec/expectations/reverse-language.ts';
import { CEREBELLUM_REVERSE_CASES } from '../spec/expectations/reverse-cerebellum.ts';
import { POSTERIOR_REVERSE_CASES } from '../spec/expectations/reverse-posterior.ts';
import { MIDBRAIN_REVERSE_CASES } from '../spec/expectations/reverse-midbrain.ts';
import { NERVE_REVERSE_CASES } from '../spec/expectations/reverse-nerves.ts';
import { BASAL_REVERSE_CASES } from '../spec/expectations/reverse-basal.ts';
import { CORTEX_REVERSE_CASES } from '../spec/expectations/reverse-cortex.ts';
import { BASILAR_REVERSE_CASES } from '../spec/expectations/reverse-basilar.ts';
import { OCCIPITAL_REVERSE_CASES } from '../spec/expectations/reverse-occipital.ts';
import { FIBULAR_REVERSE_CASES } from '../spec/expectations/reverse-fibular.ts';
import { TARSAL_REVERSE_CASES } from '../spec/expectations/reverse-tarsal.ts';
import { TRANSCORTICAL_REVERSE_CASES } from '../spec/expectations/reverse-transcortical.ts';
import { PUDENDAL_REVERSE_CASES } from '../spec/expectations/reverse-pudendal.ts';
import { GENICULATE_REVERSE_CASES } from '../spec/expectations/reverse-geniculate.ts';
import { REVERSE_CASES } from '../spec/expectations/reverse.ts';
import { RENDER } from '../src/kb/render.ts';
import { examSlots } from '../src/render/slots.ts';
import { reverseFailures, runAll, territoryFailures, visionPlaceFailures } from '../test/harness.ts';
import { locateRows } from '../test/rows.ts';

const CASES = [...ALL_CASES, ...PLEXUS_CASES, ...LEG_CASES, ...BRAIN_CASES, ...VISION_CASES, ...LANGUAGE_CASES, ...CEREBELLUM_CASES, ...POSTERIOR_CASES, ...MIDBRAIN_CASES, ...NERVE_CASES, ...BASAL_CASES, ...CORTEX_CASES, ...BASILAR_CASES, ...OCCIPITAL_CASES, ...FIBULAR_CASES, ...TARSAL_CASES, ...TRANSCORTICAL_CASES, ...PUDENDAL_CASES, ...GENICULATE_CASES, ...ANSWERED_LIMB_CASES, ...ANSWERED_VISION_CASES];
const THRESHOLD = 0.9;
const ROOT = resolve(import.meta.dirname, '..');

type Path = readonly (string | number)[];
type Mutant = { readonly path: Path; readonly describe: string; readonly value: unknown };

const POOLS: Record<string, readonly string[]> = {
  laterality: ['ipsilateral', 'contralateral'],
  tone: ['normal', 'reduced', 'increased', 'indeterminate'],
  reflex: ['normal', 'reduced', 'absent', 'brisk', 'indeterminate'],
  sensory: ['intact', 'impaired', 'lost', 'indeterminate'],
  bladder: ['normal', 'suprasacral', 'sacral', 'impaired_in_spinal_shock'],
  compartment: COMPARTMENTS,
  region: ['cervical', 'lowerLimb', 'sacral'],
  vertebra: VERTEBRAE,
  modality: SENSORY_MODALITIES,
  timepoint: TIMEPOINTS,
  trunk: TRUNKS,
  cord: PLEXUS_CORDS,
  nerve: NERVES,
  muscle: MUSCLES,
  site: PLEXUS_SITES,
  division: ['anterior', 'posterior'],
  from: ['roots', 'trunk', 'cords'],
  brainLevel: BRAIN_LEVELS,
  brainPart: BRAIN_COMPARTMENTS,
  // P10: until these existed the dominant side was never mutated at all, and the neglect row's
  // answer after a dominant lesion was mutated with tone words.
  side: ['L', 'R'],
  sign: ['present', 'absent', 'indeterminate'],
  // P24: a visual part's field and pupil. Until these existed no visual part's pupil effect or
  // centre was ever mutated — including the lateral geniculate nucleus's 'no defect', the fact
  // P24 rests on (D129).
  eye: ['same', 'both'],
  field: ['whole', 'temporal', 'opposite'],
  quadrants: ['both', 'upper', 'lower', 'none'],
  centre: ['with', 'half', 'only', 'none'],
  rapd: ['same', 'opposite', 'none', 'open'],
};

const seg = (s: unknown): number => SEGMENTS.indexOf(s as (typeof SEGMENTS)[number]);
const isSeg = (s: unknown): boolean => typeof s === 'string' && seg(s) >= 0;

function poolFor(key: string, value: string): readonly string[] | undefined {
  if (key === 'vertebra') return POOLS.vertebra;
  if (key === 'region') return POOLS.region;
  if (key === 'compartment') {
    return (BRAIN_COMPARTMENTS as readonly string[]).includes(value) ? POOLS.brainPart : POOLS.compartment;
  }
  if (key === 'level') return POOLS.brainLevel;
  if (key === 'reflex' || key === 'partialReflex') return POOLS.reflex;
  if (key === 'tone') return POOLS.tone;
  if (key === 'nerve') return POOLS.nerve;
  if (key === 'trunk') return POOLS.trunk;
  if (key === 'division') return POOLS.division;
  if (key === 'from') return POOLS.from;
  // P24 (D129): the visual parts' own vocabularies, by key, so 'none' and 'both' are not read as other words.
  if (key === 'eye' || key === 'field' || key === 'quadrants' || key === 'centre' || key === 'rapd') return POOLS[key];
  // P10, P11: an answer the knowledge base gives as a sign state, never a tone word.
  if (key === 'afterDominant' || key === 'state' || key === 'whenEqual') return POOLS.sign;
  // P16: a course is keyed by timepoint, and its values are sign states, not reflexes.
  if ((POOLS.timepoint ?? []).includes(key)) return POOLS.sign;
  return Object.values(POOLS).find((p) => p.includes(value));
}

function mutantsOf(value: unknown, path: Path): Mutant[] {
  const key = String(path[path.length - 1]);
  const at = path.join('.');

  if (typeof value === 'boolean') return [{ path, value: !value, describe: `${at}: ${value} → ${!value}` }];

  // A count along a nerve (D27): the branch leaves one place earlier or later.
  if (typeof value === 'number' && key === 'after') {
    return [value - 1, value + 1]
      .filter((v) => v >= 0)
      .map((v) => ({ path, value: v, describe: `${at}: ${value} → ${v}` }));
  }

  if (typeof value === 'string') {
    if (isSeg(value) && key !== 'vertebra') {
      return [-1, 1]
        .map((d) => SEGMENTS[seg(value) + d])
        .filter((s): s is (typeof SEGMENTS)[number] => s !== undefined)
        .map((s) => ({ path, value: s, describe: `${at}: ${value} → ${s}` }));
    }
    const pool = poolFor(key, value) ?? [];
    return pool.filter((v) => v !== value).map((v) => ({ path, value: v, describe: `${at}: ${value} → ${v}` }));
  }

  if (Array.isArray(value)) {
    // A span: two segments, rostral first.
    if (value.length === 2 && value.every(isSeg)) {
      const [a, b] = value.map(seg) as [number, number];
      const spans: [number, number, string][] = [
        [a - 1, b - 1, 'shifted rostrally'],
        [a + 1, b + 1, 'shifted caudally'],
        [a, b + 1, 'extended caudally'],
        [a - 1, b, 'extended rostrally'],
        [a + 1, b, 'shrunk rostral end'],
        [a, b - 1, 'shrunk caudal end'],
      ];
      return spans
        .filter(([x, y]) => x >= 0 && y < SEGMENTS.length && x <= y)
        .map(([x, y, how]) => ({
          path,
          value: [SEGMENTS[x], SEGMENTS[y]],
          describe: `${at}: ${value.join('–')} ${how} → ${SEGMENTS[x]}–${SEGMENTS[y]}`,
        }));
    }
    // A numeric range: [fewest, most].
    if (value.length === 2 && value.every((v) => typeof v === 'number')) {
      const [lo, hi] = value as [number, number];
      const ranges: [number, number][] = [[lo - 1, hi], [lo + 1, hi], [lo, hi - 1], [lo, hi + 1]];
      return ranges
        .filter(([x, y]) => x >= 0 && x <= y)
        .map(([x, y]) => ({ path, value: [x, y], describe: `${at}: [${lo}, ${hi}] → [${x}, ${y}]` }));
    }
    // A list of names: drop each; for time lists, also add each missing phase.
    if (value.every((v) => typeof v === 'string')) {
      const dropped = value.map((v, i) => ({
        path,
        value: value.filter((_, j) => j !== i),
        describe: `${at}: drop ${v}`,
      }));
      const added = value.length > 0 && value.every((v) => POOLS.timepoint?.includes(v))
        ? TIMEPOINTS.filter((t) => !value.includes(t)).map((t) => ({
            path,
            value: [...value, t],
            describe: `${at}: add ${t}`,
          }))
        : [];
      return [...dropped, ...added];
    }
  }
  return [];
}

function collect(node: unknown, path: Path, out: Mutant[]): void {
  if (Array.isArray(node) && node.some((n) => n !== null && typeof n === 'object')) {
    node.forEach((child, i) => {
      out.push({ path, value: node.filter((_, j) => j !== i), describe: `${path.join('.')}: drop row ${i}` });
      collect(child, [...path, i], out);
    });
    return;
  }
  const own = mutantsOf(node, path);
  if (own.length > 0 || node === null || typeof node !== 'object') {
    out.push(...own);
    return;
  }
  for (const [k, v] of Object.entries(node)) if (k !== 'meta') collect(v, [...path, k], out);
}

function apply(kb: Kb, m: Mutant): Kb {
  const copy = structuredClone(kb) as unknown as Record<string | number, unknown>;
  let cursor = copy;
  for (const step of m.path.slice(0, -1)) cursor = cursor[step] as Record<string | number, unknown>;
  const last = m.path[m.path.length - 1];
  if (last === undefined) throw new Error('empty mutation path');
  cursor[last] = structuredClone(m.value);
  return copy as unknown as Kb;
}

const rows = locateRows(KB);
const rowOf = (path: Path): string => {
  const owner = rows
    .filter((r) => r.path.every((p, i) => path[i] === p))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return owner?.meta.id ?? '(no row)';
};
// A row with no source cannot be pinned by a sourced specification without inventing a
// citation (D12). Its survivors are reported against its reviewer question, not scored.
const unsourced = new Map(
  rows
    .filter((r) => r.meta.pendingSource || r.meta.definitional)
    .map((r) => [r.meta.id, r.meta.pendingSource ?? 'definitional: true by naming']),
);

const baseline = runAll(CASES);
if (baseline.length > 0) {
  console.error(`✗ the unmutated knowledge base already fails ${baseline.length} assertion(s); fix that first`);
  process.exit(1);
}

const mutants: Mutant[] = [];
collect(KB, [], mutants);

type Result = { row: string; describe: string; killed: boolean; failures: number; threw: boolean; byReverse: boolean };
const REVERSE = [...REVERSE_CASES, ...LIMB_REVERSE_CASES, ...LEG_REVERSE_CASES, ...BRAIN_REVERSE_CASES, ...VISION_REVERSE_CASES, ...LANGUAGE_REVERSE_CASES, ...CEREBELLUM_REVERSE_CASES, ...POSTERIOR_REVERSE_CASES, ...MIDBRAIN_REVERSE_CASES, ...NERVE_REVERSE_CASES, ...BASAL_REVERSE_CASES, ...CORTEX_REVERSE_CASES, ...BASILAR_REVERSE_CASES, ...OCCIPITAL_REVERSE_CASES, ...FIBULAR_REVERSE_CASES, ...TARSAL_REVERSE_CASES, ...TRANSCORTICAL_REVERSE_CASES, ...PUDENDAL_REVERSE_CASES, ...GENICULATE_REVERSE_CASES];
const SLOTS = examSlots(RENDER);
const results: Result[] = mutants.map((m) => {
  const base = { row: rowOf(m.path), describe: m.describe };
  let kb: Kb;
  try {
    kb = apply(KB, m);
    const failures = runAll(CASES, kb).length + territoryFailures(kb).length + visionPlaceFailures(kb).length;
    if (failures > 0) return { ...base, killed: true, failures, threw: false, byReverse: false };
  } catch {
    return { ...base, killed: true, failures: 0, threw: true, byReverse: false };
  }
  try {
    const failures = REVERSE.reduce((n, c) => n + reverseFailures(c, SLOTS, kb).length, 0);
    return { ...base, killed: failures > 0, failures, threw: false, byReverse: failures > 0 };
  } catch {
    return { ...base, killed: true, failures: 0, threw: true, byReverse: true };
  }
});

const killed = results.filter((r) => r.killed).length;
const rawScore = killed / results.length;
const scored = results.filter((r) => !unsourced.has(r.row));
const score = scored.filter((r) => r.killed).length / scored.length;
const survivors = results.filter((r) => !r.killed);

const byRow = new Map<string, { mutants: number; killed: number; failures: number }>();
for (const r of results) {
  const e = byRow.get(r.row) ?? { mutants: 0, killed: 0, failures: 0 };
  e.mutants++;
  if (r.killed) e.killed++;
  e.failures += r.failures;
  byRow.set(r.row, e);
}

mkdirSync(resolve(ROOT, '.mutation'), { recursive: true });
writeFileSync(
  resolve(ROOT, '.mutation', 'report.json'),
  JSON.stringify(
    { rawScore, score, mutants: results.length, killed, byRow: Object.fromEntries(byRow), survivors },
    null,
    2,
  ),
);

const pct = (x: number): string => `${(x * 100).toFixed(1)}%`;
console.log(`all rows      mutants ${results.length}  killed ${killed}  survived ${survivors.length}  raw score ${pct(rawScore)}`);
console.log(`sourced rows  mutants ${scored.length}  killed ${scored.filter((r) => r.killed).length}  score ${pct(score)}  (threshold applies here)`);
console.log(`(${results.filter((r) => r.threw).length} killed by the engine refusing the corrupted input; ${results.filter((r) => r.byReverse).length} only by a reverse examination)`);

const sourcedSurvivors = survivors.filter((s) => !unsourced.has(s.row));
if (sourcedSurvivors.length > 0) {
  console.log('\nsurvivors in sourced rows — a source states this and no expectation checks it:');
  for (const s of sourcedSurvivors) console.log(`  ${s.row.padEnd(34)} ${s.describe}`);
}
const waiting = survivors.filter((s) => unsourced.has(s.row));
if (waiting.length > 0) {
  console.log('\nsurvivors in unsourced rows — pinned only once a reviewer supplies a source:');
  for (const [row, reason] of unsourced) {
    const n = waiting.filter((s) => s.row === row).length;
    if (n > 0) console.log(`  ${row.padEnd(34)} ${n} survivor(s) — ${reason}`);
  }
}
if (score < THRESHOLD) {
  console.error(`\n✗ score below the P0 exit threshold of ${THRESHOLD * 100}%`);
  process.exit(1);
}
