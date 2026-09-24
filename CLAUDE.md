# NeuroLocalize — agent instructions

A lesion-localization engine for teaching neuroanatomy — cortex, capsule, thalamus,
cerebellum, brainstem, spinal cord, roots, brachial and lumbosacral plexuses, the nerves of the arm and
leg, the visual pathway, eye movements and language — with a 3D instrument and a
practice mode in front of it.
**Education only. Not clinical decision support. No patient data, ever.**

Plan: `docs/plan.html` (published revision C); later phases are analysed before they are
built (`docs/P7-analysis.md`, `docs/P8-analysis.md`, `docs/P9-analysis.md`, `docs/P10-analysis.md`, `docs/P11-analysis.md`, `docs/P12-analysis.md`, `docs/P13-analysis.md`, `docs/P14-analysis.md`, `docs/P15-analysis.md`, `docs/P16-analysis.md`, `docs/P17-analysis.md`). Sources: `docs/SOURCES.md`.
Deviations, conflicts and open reviewer questions: `docs/DECISIONS.md`.

## Commands

```bash
npm run verify      # typecheck + boundaries + freeze + tests. Must exit 0.
npm test            # node --test, zero dependencies
npm run mutate      # corrupts each knowledge-base row; every mutant must be killed
npm run worksheet   # regenerates review/worksheet.md and review/review.html for a clinical reviewer
npm run review:ingest -- <file>   # keeps a returned review, rebuilds review/triage.md
npm run build       # compiles src/ to dist/ for the browser
npm run serve       # serves dist/ on :5178 (preview config: .claude/launch.json)
```

Three.js is loaded at runtime from a pinned CDN URL through the page's import map; only
`src/render/` may import it.

Node 24 runs the TypeScript directly. `typescript` and `@types/node` are the only
dependencies, both dev-only and type-only. Do not add another without asking.

## Layers

| Path | Is | May import |
|---|---|---|
| `src/kb/` | declarative data — no functions, no classes | `src/kb/` only |
| `src/engine/` | pure functions over the knowledge base; never `kb/render.ts` or `kb/mechanisms.ts` | `src/kb/`, `src/engine/` |
| `src/geometry/` | pure geometry, testable under Node | `src/kb/`, `src/engine/`, `src/geometry/` |
| `src/practice/` | case generation and the review schedule; pure, never `kb/mechanisms.ts` | `src/kb/`, `src/engine/`, `src/practice/` |
| `src/render/` | Three.js scene and panel; decides nothing | anything in `src/`, plus `three` |
| `spec/expectations/` | frozen expected outputs, written before the engine | `src/kb/vocab.ts` only |
| `test/`, `scripts/` | anything | anything |

`scripts/check-boundaries.ts` enforces this by parsing imports, not by grepping text,
so prose in comments cannot trip or satisfy it. Everything under `src/` must stay
browser-portable: no `node:` imports.

`app/` holds the page shell, the web manifest, the icon and the service-worker template;
`npm run build` fills the worker's file list and version. The worker registers only outside
claude.ai. Practice progress is per-browser storage and every access is guarded (D49).

## Rules

1. **Never invent a citation.** A source id is cited only if that source was read. A
   book page nobody has read is `bookRef: 'pending'`. A fact with no read source is
   `pendingSource: '<reason>'` and is printed on every test run.
2. **Expectations are frozen** — forward cases in `cases.ts`, `boundaries.ts`,
   `plexus.ts`, `leg.ts`, `brain.ts`, `vision.ts`, `language.ts`, `cerebellum.ts`, `posterior.ts`, `midbrain.ts`, `nerves.ts` and `basal.ts`; reverse cases in `reverse.ts`,
   `reverse-plexus.ts`, `reverse-leg.ts`, `reverse-brain.ts`, `reverse-vision.ts`, `reverse-language.ts`, `reverse-cerebellum.ts`, `reverse-posterior.ts`, `reverse-midbrain.ts`, `reverse-nerves.ts` and `reverse-basal.ts`. A file in
   `spec/expectations/` changed after the `expectations-frozen` tag fails the build unless
   `spec/expectations/AMENDMENTS.md` names it and gives the reason and the source. Fix the
   knowledge base, not the expectation.
3. **The engine never reads mechanism rows.** `src/kb/mechanisms.ts` explains
   observations; it cannot drive output. A test asserts identical output under every
   lamination model.
4. **Two sources, or say so.** A row with one source is T2 at best. Sources that
   disagree make the row T3 and both positions are recorded — never resolved by typing.
5. **No row without a test.** `npm run mutate` corrupts each row; a surviving mutant is
   an untested row and a defect.
6. **Evidence, not assertion.** A claim that a command passed carries its output.
7. **Before naming a cause, run the observation that would refute it.**
