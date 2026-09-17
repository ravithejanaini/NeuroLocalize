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

## A4 — 2026-09-17 — the upper limb (P4)

- **Changed:** additions only; no existing assertion was altered.
  - `types.ts` gains `PlexusRegion` (a lesion at a trunk, a cord or a named place on a
    nerve), `LimbAssertion` (`muscle` and `skin`), `LimbEvaluation` and `LimbCase`. The
    existing `Case`, `Assertion` and `LesionRegion` are untouched.
  - `plexus.ts` adds twenty forward cases: both trunks that have named palsies, two root
    avulsions, three single roots, two cords, nine nerve lesions, and a cervical hemicord
    examined at the arm.
  - `reverse-plexus.ts` adds five examinations: a C8 root, a lower trunk, an ulnar nerve
    at the elbow, a radial nerve at the spiral groove, and an undifferentiated ulnar-type
    hand in which the tool must name the separating test.
- **Why:** P4 adds the brachial plexus. Its specification is written and committed before
  any plexus code exists, as in P0 and P3.
- **Sources:** S33–S46, read on 2026-09-17, with S12, S16, S19, S21 and S31. Every
  assertion names its sources and says whether they state it of this lesion or whether it
  is composed from where they place a root or a branch.
- **Where the sources disagree, the expectation allows both positions** — the long
  thoracic nerve's C7 (C10), the musculocutaneous nerve's C7 (C11) — rather than picking one.
- **Deliberately left open,** each recorded in its case's `unasserted`: the interossei
  after a C8 root lesion (R12), the triceps reflex after C8 loss, the little finger in
  Guyon's canal, and the roots of the superficial radial territory.
- **Two expectations rest on modelling a reviewer must confirm,** and say so in their
  notes: no Horner syndrome from a lower trunk lesion (R13), and a thumb abductor weakened
  by a C8 root lesion alone (R15).

## A5 — 2026-09-17 — plexus boundaries, from mutation testing

- **Changed:** additions only; no assertion was altered or removed.
  - `plexus.ts` adds four cases — the C6 and T1 roots alone, the dorsal scapular nerve and
    the suprascapular nerve — adds assertions to the C5, C7 and C8 root cases, and adds
    the thumb to what a posterior interosseous lesion leaves intact (S39).
  - `reverse-plexus.ts` adds one examination: a numb little finger with the medial forearm
    spared, which only the landmark-as-territory rule (D30) can place.
- **Why:** the first mutation run over the plexus rows scored 73.9% on sourced rows. Among
  the survivors were roots and branches no case examined alone: the C6 and T1 roots, the
  two nerves that leave above the cords, and muscles whose roots were never probed from
  the neighbouring segment. The same situation as A2: a weak specification, not a missing
  fact.
- **How circularity was avoided:** as in A2. Each value was written from the cited source
  before the new cases were run. Where the sources do not settle a value — the roots of the
  dorsal web space, the brachioradialis at C5 (C3) — the expectation allows every position
  the sources leave open rather than the one the engine happens to give.
- **Knowledge-base and engine changes from the same run** are recorded in `DECISIONS.md`
  (D34), not here: they changed no expectation.

## A6 — 2026-09-17 — deformities, before any deformity code

- **Changed:** additions only.
  - `types.ts` adds a `deformity` assertion to `LimbAssertion`.
  - `plexus.ts` adds deformity assertions to eighteen cases: winged scapula, waiter's tip,
    wrist drop, claw hand and ape hand, present or absent as the sources describe them.
- **Why:** the P4 exit criterion is that these deformities *derive* from where the lesion is
  placed. The engine gave muscle strength but not the deformity, so the criterion had
  nothing to test. As with A4, the expectations are committed before the code.
- **Sources:** S33 (waiter's tip; claw and ape signs in Klumpke paralysis), S35 (Erb
  posture; winging points beyond the upper trunk), S36 (claw hand), S38 (claw hand in ulnar
  injury; median thenar sparing), S39 and S40 (wrist drop), S41 (ape hand in low median
  lesions), S44 (medial winging from serratus weakness).
- **Deliberately left open,** in each case's `unasserted`: wrist drop after a posterior
  interosseous lesion (S39 and S40 disagree, C14); any deformity after upper-motor-neuron
  weakness, which no source read describes; winging from rhomboid weakness.

### Files amended since the tag, and the entry that covers each

| File | Entry |
|---|---|
| `cases.ts` | A1, A2 |
| `boundaries.ts` | A2 |
| `index.ts` | A2 (exports the boundary cases) |
| `reverse.ts` | A3 |
| `types.ts` | A4, A6 |
| `plexus.ts` | A4, A5, A6 |
| `reverse-plexus.ts` | A4, A5 |

`npm run check:freeze` requires every changed file to appear in this file by name.
