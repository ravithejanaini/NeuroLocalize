# NeuroLocalize — agent instructions

A lesion-localization engine for teaching neuroanatomy, with a 3D front end to come.
**Education only. Not clinical decision support. No patient data, ever.**

Plan: `docs/plan.html` (published revision C). Sources: `docs/SOURCES.md`.
Deviations, conflicts and open reviewer questions: `docs/DECISIONS.md`.

## Commands

```bash
npm run verify      # typecheck + boundaries + freeze + tests. Must exit 0.
npm test            # node --test, zero dependencies
npm run mutate      # corrupts each knowledge-base row; every mutant must be killed
npm run worksheet   # regenerates review/worksheet.md for a clinical reviewer
```

Node 24 runs the TypeScript directly. `typescript` and `@types/node` are the only
dependencies, both dev-only and type-only. Do not add another without asking.

## Layers

| Path | Is | May import |
|---|---|---|
| `src/kb/` | declarative data — no functions, no classes | `src/kb/` only |
| `src/engine/` | pure functions over the knowledge base | `src/kb/`, `src/engine/` |
| `spec/expectations/` | frozen expected outputs, written before the engine | `src/kb/vocab.ts` only |
| `test/`, `scripts/` | anything | anything |

`scripts/check-boundaries.ts` enforces this by parsing imports, not by grepping text,
so prose in comments cannot trip or satisfy it. Everything under `src/` must stay
browser-portable: no `node:` imports.

## Rules

1. **Never invent a citation.** A source id is cited only if that source was read. A
   book page nobody has read is `bookRef: 'pending'`. A fact with no read source is
   `pendingSource: '<reason>'` and is printed on every test run.
2. **Expectations are frozen.** `spec/expectations/` changed after the
   `expectations-frozen` tag fails the build unless `spec/expectations/AMENDMENTS.md`
   changes in the same diff with the reason and the source. Fix the knowledge base,
   not the expectation.
3. **The engine never reads mechanism rows.** `src/kb/mechanisms.ts` explains
   observations; it cannot drive output. A test asserts identical output under every
   lamination model.
4. **Two sources, or say so.** A row with one source is T2 at best. Sources that
   disagree make the row T3 and both positions are recorded — never resolved by typing.
5. **No row without a test.** `npm run mutate` corrupts each row; a surviving mutant is
   an untested row and a defect.
6. **Evidence, not assertion.** A claim that a command passed carries its output.
7. **Before naming a cause, run the observation that would refute it.**
