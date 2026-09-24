// Everything a clinical reviewer is asked, as data: knowledge-base claims ordered by how much
// of the engine rests on them, the facts the tool draws, the open questions, and the
// composed expectations. The worksheet, the review page and the ingest script all read this.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_CASES as CORD_CASES } from '../spec/expectations/index.ts';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { PLEXUS_CASES } from '../spec/expectations/plexus.ts';
import { LEG_CASES } from '../spec/expectations/leg.ts';
import { VISION_CASES } from '../spec/expectations/vision.ts';
import { LANGUAGE_CASES } from '../spec/expectations/language.ts';
import { CEREBELLUM_CASES } from '../spec/expectations/cerebellum.ts';
import { POSTERIOR_CASES } from '../spec/expectations/posterior.ts';
import { MIDBRAIN_CASES } from '../spec/expectations/midbrain.ts';
import { NERVE_CASES } from '../spec/expectations/nerves.ts';
import type { Assertion, BrainAssertion, LanguageAssertion, LimbAssertion, VisionAssertion } from '../spec/expectations/types.ts';
import { KB } from '../src/kb/kb.ts';
import { MECHANISMS } from '../src/kb/mechanisms.ts';
import { RENDER } from '../src/kb/render.ts';
import type { Meta } from '../src/kb/types.ts';
import { metaRows } from '../test/rows.ts';
import type { Finding, ReviewItem, Source, Worksheet } from './review-lib.ts';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string): string => readFileSync(resolve(ROOT, p), 'utf8');

const SIDE = { L: 'left', R: 'right', both: 'both sides' } as const;
const span = (s: readonly [string, string]): string => (s[0] === s[1] ? s[0] : `${s[0]}–${s[1]}`);
const any = (xs: readonly string[]): string => xs.join(' or ');
const words = (xs: readonly string[]): string => xs.map((x) => x.replace(/_/g, ' ')).join(', ');

export function describe(a: Assertion | LimbAssertion | BrainAssertion | VisionAssertion | LanguageAssertion): string {
  switch (a.kind) {
    case 'sensory':
      return `${SIDE[a.side]} · ${a.modality === 'all' ? 'all sensation' : a.modality.replace('_', ' ')} · ${span(a.span)} → ${any(a.oneOf)}`;
    case 'motor':
      return `${SIDE[a.side]} · motor · ${span(a.span)} → ${any(a.lesion)}${a.tone ? `, tone ${any(a.tone)}` : ''}`;
    case 'reflex':
      return `${SIDE[a.side]} · ${a.reflex} reflex → ${any(a.oneOf)}`;
    case 'babinski':
    case 'horner':
      return `${SIDE[a.side]} · ${a.kind} → ${any(a.oneOf)}`;
    case 'qualifier':
      return `${a.qualifier.replace(/_/g, ' ')} → ${a.present ? 'yes' : 'no'}`;
    case 'resolvedSegments':
      return `lesion resolves to segments ${span(a.span)}`;
    case 'muscle':
      return `${SIDE[a.side]} · ${words(a.muscles)} → ${any(a.oneOf)}`;
    case 'face_sensation':
    case 'face_weakness':
    case 'ataxia':
      return `${SIDE[a.side]} · ${a.kind.replace('_', ' ')} → ${any(a.oneOf)}`;
    case 'cranial':
      return `${SIDE[a.side]} · ${a.sign.replace(/_/g, ' ')} → ${any(a.oneOf)}`;
    case 'vertigo':
      return `vertigo → ${any(a.oneOf)}`;
    case 'truncal_ataxia':
      return `truncal ataxia → ${any(a.oneOf)}`;
    case 'eyes':
      return `both eyes · ${a.sign.replace(/_/g, ' ')} → ${any(a.oneOf)}`;
    case 'language':
      return `language · ${a.sign.replace(/_/g, ' ')} → ${any(a.oneOf)}`;
    case 'neglect':
      return `neglect of the ${SIDE[a.side].toLowerCase()} side of space → ${any(a.oneOf)}`;
    case 'field':
      return `${a.eye === 'both' ? 'both eyes' : `${SIDE[a.eye]} eye`} · field · ${words(a.sectors)} → ${any(a.oneOf)}`;
    case 'rapd':
      return `${SIDE[a.side]} · afferent pupillary defect → ${any(a.oneOf)}`;
    case 'deformity':
      return `${SIDE[a.side]} · ${a.deformity.replace(/_/g, ' ')} → ${any(a.oneOf)}`;
    case 'skin':
      return `${SIDE[a.side]} · ${a.modality === 'all' ? 'all sensation' : a.modality.replace('_', ' ')} · ${words(a.areas)} → ${any(a.oneOf)}`;
    default:
      return `${a.kind} → ${any(a.oneOf)}`;
  }
}

export function buildWorksheet(): Worksheet {
  const urls = new Map([...read('docs/SOURCES.md').matchAll(/^\| (S\d{2,3}) \| \[[^\]]+\]\(([^)]+)\)/gm)].map((m) => [m[1] ?? '', m[2] ?? '#']));
  const sources = (ids: readonly string[]): Source[] => ids.map((id) => ({ id, url: urls.get(id) ?? '#' }));

  const weight = new Map<string, number>();
  let score = 'Mutation report not found; run `npm run mutate` for load-bearing order.';
  const reportPath = resolve(ROOT, '.mutation', 'report.json');
  if (existsSync(reportPath)) {
    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rawScore: number; score: number; byRow: Record<string, { failures: number }> };
    for (const [id, r] of Object.entries(report.byRow)) weight.set(id, r.failures);
    score = `Mutation score ${(report.score * 100).toFixed(1)}% over sourced rows, ${(report.rawScore * 100).toFixed(1)}% over all rows.`;
  }

  const items: ReviewItem[] = [];
  const row = (m: Meta, section: 'claim' | 'fact', withWeight: boolean): void => {
    const tags = [`tier ${m.tier}`];
    if (withWeight) tags.push(`weight ${weight.get(m.id) ?? 0}`);
    if (m.conflict) tags.push(`conflict ${m.conflict}`);
    items.push({
      id: m.id,
      section,
      n: items.length + 1,
      title: m.claim,
      tags,
      sources: m.definitional ? [] : sources(m.sources),
      ...(m.definitional ? { definitional: true } : {}),
      ...(m.pendingSource ? { warning: m.pendingSource } : {}),
    });
  };
  for (const m of metaRows(KB).sort((a, b) => (weight.get(b.id) ?? 0) - (weight.get(a.id) ?? 0))) row(m, 'claim', true);
  for (const m of metaRows(RENDER)) row(m, 'fact', false);

  let q = 0;
  for (const m of read('docs/DECISIONS.md').matchAll(/^\*\*(R\d+)\*\* — ([\s\S]*?)(?=\n\n)/gm)) {
    const id = m[1] ?? '';
    const cited = [...new Set((m[2] ?? '').match(/\bS\d{2,3}\b/g) ?? [])];
    items.push({ id, section: 'question', n: ++q, title: (m[2] ?? '').replace(/\n/g, ' '), tags: [id], sources: sources(cited) });
  }

  let k = 0;
  for (const c of [...CORD_CASES, ...PLEXUS_CASES, ...LEG_CASES, ...BRAIN_CASES, ...VISION_CASES, ...LANGUAGE_CASES, ...CEREBELLUM_CASES, ...POSTERIOR_CASES, ...MIDBRAIN_CASES, ...NERVE_CASES]) {
    const findings: Finding[] = c.evaluations.flatMap((e) =>
      e.assertions
        .filter((a) => a.basis === 'composed')
        .map((a) => {
          const text = `${e.timepoint} · ${describe(a)}`;
          return { id: `${c.id}|${text}`, text, sources: sources(a.cite), ...(a.note ? { note: a.note } : {}) };
        }),
    );
    if (findings.length === 0) continue;
    items.push({ id: `case:${c.id}`, section: 'case', n: ++k, title: c.title, subtitle: c.pattern, tags: [], sources: [], findings });
  }

  const mechanisms = MECHANISMS.map((m) => ({
    claim: m.meta.claim,
    tier: m.meta.tier,
    positions: m.positions.map((p) => ({ account: p.account, sources: sources(p.sources) })),
  }));
  const version = createHash('sha256').update(JSON.stringify({ items, mechanisms })).digest('hex').slice(0, 12);
  return { version, score, items, mechanisms };
}
