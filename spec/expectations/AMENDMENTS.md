# Amendments to frozen expectations

The expectations in this directory were written from `docs/SOURCES.md` and frozen at the
git tag `expectations-frozen`, before any engine code existed. That ordering is what makes
them a specification rather than a restatement of the engine.

Changing an expectation afterwards is permitted only by adding an entry here, in the same
diff. `npm run check:freeze` fails otherwise.

An amendment must say:

- which case and assertion changed, and from what to what;
- the **source** that justifies it — a source that was read, listed in `SOURCES.md`;
- why the knowledge base could not be corrected instead.

"The engine produces something different" is never on its own a reason. That is the
situation the freeze exists to catch.

---

## A1 — 2026-09-16 — case `central-cord-C4-C6`, qualifier `upper_limb_predominant_weakness`

- **Changed:** `cite: ['S06', 'S05']` → `cite: ['S06']`. The expected value (`present: true`)
  is unchanged.
- **Why:** conflict C4 in `DECISIONS.md` excludes S05's central-cord row, because two
  separate queries reported it placing the syndrome in the thoracic cord and its raw text
  could not be checked. Citing a row the project has declared unusable is a contradiction.
  Found while auditing knowledge-base citations, before any engine code ran.
- **Source still supporting the assertion:** S06, which states the upper-limb predominance
  directly.
- **Why the knowledge base could not be corrected instead:** the error was in the
  expectation's citation, not in any fact the engine uses.

## A2 — 2026-09-16 — boundary cases and missing phases, from mutation testing

- **Changed:** additions only; no existing assertion was altered.
  - `complete-T4` and `complete-T12` gain `acute` and `subacute` evaluations (S02 phases 2
    and 3; S04's first-month window; S03 for neurogenic shock at the acute phase).
  - `boundaries.ts` adds eighteen cases, each placed at a level a source states: autonomic
    thresholds at T5, T6, T7, T10 and T11 (S03, S04); single-root lesions at C4, C7, T1,
    L1, L4, L5 and S2, and a ventral-root lesion at S1 (S12, S19); a root lesion below the
    micturition centre (S20); a spinothalamic-only central lesion (S06); and the
    intermediolateral column inside, just above and just below the ciliospinal centre (S16).
- **Why:** the first mutation run scored 59.8%. Among the survivors, 33 were boundaries or
  phases that a source states exactly and no case probed — a weak specification, not a
  missing fact.
- **How circularity was avoided:** each lesion sits where the *source* puts a boundary,
  and each expected value was written from that source before these cases were run. The
  engine was not consulted for any value. Where a source is too soft to decide a boundary
  segment (neurogenic shock at T6; C8 or L2 alone), the case says so in `unasserted`
  instead of guessing.
- **Result:** all 51 evaluations passed on first run; sourced-row mutation score 91.8%.

## A3 — 2026-09-17 — reverse inference (P3)

- **Changed:** addition only. `reverse.ts` adds eight examinations, nine evaluations.
- **Why:** P3 adds inference from findings to lesion. As in P0, its specification is
  written and committed before any reverse code exists.
- **What is asserted:** properties of the ranking — which family ranks first, where the
  lesion's rostral end must lie, whether any single candidate explains the findings, and
  that the suggested next test separates the top two. No score, probability or rank
  number is asserted, because those depend on modelling constants (D24) rather than on
  a source.
- **Sources:** each case names them; the level constraints are composed from the posterior
  column and spinothalamic routes (S01, S15) and the dermatome landmarks (S21).
- **A constraint on the candidate set, stated here so it cannot drift:** bilateral root
  lesions start at L1 or lower, because S09 describes the cauda equina as the roots from
  L1 down. The spinal-shock case depends on it.
