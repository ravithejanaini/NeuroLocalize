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

## A7 — 2026-09-17 — above the cord (P5), before any brain code

- **Changed:** additions only.
  - `types.ts` adds `BrainRegion` (a level, a side, the parts a lesion takes and, for cortex,
    capsule and thalamus, the body regions they serve), `BrainAssertion` (facial sensation,
    facial weakness, five cranial signs, limb ataxia, vertigo), `BrainEvaluation` and
    `BrainCase`.
  - `brain.ts` adds ten cases: lateral and medial medulla, ventral and dorsal pons, the
    cerebral peduncle, the internal capsule (motor and sensory parts), the thalamus, and the
    lateral and medial cortex.
  - `reverse-brain.ts` adds six examinations that full-neuraxis ranking must place: the
    lateral medulla, the internal capsule, the MCA cortex, the peduncle, the medial medulla
    and the thalamus.
- **Why:** P5 carries the long tracts above C1. The exit criterion is that a lateral
  medullary syndrome derives correctly, crossed findings and all, from the P0 engine.
- **Sources:** S47–S66, read on 2026-09-17, with S12 and S16. Each lesion is the set of
  structures its source names.
- **Deliberately left open,** each in its case's `unasserted`: the far-side face and tongue
  in pontine and medullary lesions, the palate after a pyramid lesion, sensation in Weber
  syndrome, the face after a capsular sensory lesion, neck and trunk after cortical strokes,
  the Babinski sign after an MCA cortex lesion, and every cortical sign beyond strength and
  sensation (aphasia, neglect, gaze, fields, abulia).

## A8 — 2026-09-17 — brain boundaries, from mutation testing

- **Changed:** additions only.
  - `brain.ts` adds seven cases — the medial lemniscus and spinothalamic tract in the pons
    and in the midbrain, the sympathetic fibres in the pons and in the midbrain, the pontine
    cerebellar peduncle with the vestibular nuclei, a pure motor lacune of the basis pontis,
    and the leg fibres of the posterior limb — and adds the palate to the MCA case.
- **Why:** the first mutation run over the brain rows scored 82.1% on sourced rows. Every
  route had parts at levels no case lesioned, so dropping them changed nothing: a weak
  specification again, as in A2 and A5.
- **How circularity was avoided:** as before. Each value comes from the cited source — S57
  and S58 for the lemnisci throughout the brainstem, S16 for uncrossed sympathetic fibres
  through midbrain and pons, S55 for the pontine pure motor lacune, S56 for the capsule's
  somatotopy — written before these cases were run.
- **Knowledge-base and engine changes from the same run** are in `DECISIONS.md` (D46).

## A9 — Corrections from the clinical audit (2026-09-17)

- **Changed:** strengthened, and one case given a value it previously left open.
  - `cases.ts`, complete transection at T4: tone is `reduced` in the first three days, the
    bulbocavernosus reflex is not asserted absent in shock, and neurogenic shock is
    `possible` in the subacute phase. At T12 it stays `not_expected` in that phase.
  - `brain.ts`, lateral medulla: the Romberg test is `indeterminate`.
  - `plexus.ts`, C8 root: the interossei are `indeterminate` (was unasserted, R12).
  - `vocab.ts` gains the `possible` neurogenic-shock value these cases need.
- **Why:** an audit read the worksheet against the sources and found values the model gave
  that its own sources contradict. S02 says spinal shock is flaccid and that the
  bulbocavernosus reflex returns within the first day; the engine had tone `indeterminate`
  and the reflex `absent`. S03 says neurogenic shock can persist for four to five weeks; the
  engine stopped it at three days. S67 says vestibular and cerebellar disease both disturb
  the Romberg test; the engine called it absent in Wallenberg syndrome, so examination mode
  counted a positive Romberg against the right answer. S68 gives the interossei C8 as well
  as T1.
- **How circularity was avoided:** each value is quoted from the source before the engine
  was changed, and every new assertion failed against the unchanged engine (recorded in the
  commit). S67 and S68 were read for this amendment.

## A10 — The lower limb (P7, 2026-09-17)

- **Changed:** additions only. `leg.ts` holds thirteen forward cases: the common fibular,
  tibial, sciatic, femoral, obturator, lateral femoral cutaneous, superior and inferior
  gluteal nerves, both plexuses, and the L4, L5 and S1 roots examined at the leg.
  `reverse-leg.ts` holds seven examinations, including the foot-drop and weak-knee
  differentials.
- **Why:** P7 adds the lower limb (`docs/P7-analysis.md`).
- **How circularity was avoided:** every value comes from the analysis tables, which quote
  S71–S90 and were written before these files; both files were run against the P6 engine
  and failed before any lower-limb code was written. Where a source says two lesions cannot
  be separated at the bedside (S72, S88), the expectation asks only that the right family
  rank near the top.

## A11 — The visual pathway (P8, 2026-09-17)

- **Changed:** additions only. `vision.ts` holds seven forward cases: the optic nerve, the
  chiasm, the optic tract, Meyer loop, the parietal radiation, the occipital cortex in the
  posterior cerebral artery territory, and the whole occipital cortex. `reverse-vision.ts`
  holds eight examinations, including tract against cortex by the pupil and macular sparing.
  `types.ts` gains the visual region and its assertions.
- **Why:** P8 adds the visual pathway (`docs/P8-analysis.md`).
- **How circularity was avoided:** every value comes from the analysis tables, which quote
  S91–S97 and were written before these files; both files were run against the P7 engine and
  failed before any visual code was written.

## A12 — Leg cases the first mutation run showed were missing (2026-09-18)

- **Changed:** additions only. `leg.ts` gains one case for each of the L1, L2, L3, S2 and S3
  roots examined at the leg, and the L5 case gains the sole and the anterolateral leg.
  `reverse-leg.ts` gains two examinations that test a dermatome landmark through its nerve
  territory: the medial malleolus (L4) and the lateral foot (S1).
- **Why:** the first mutation run over the leg rows killed 93.4% of sourced mutants, below
  the 94% P7 set itself. 88 leg mutants survived, most of them the ends of root spans that no
  case observed: which roots serve hip flexion, knee extension, knee flexion, the saphenous
  and sural territories, the thigh patches and the sole. A row no expectation pins is an
  untested row (rule 5), exactly as in A2, A5 and A8.
- **How circularity was avoided:** every new assertion is a root-to-movement or
  root-to-territory claim quoted from S31, S79, S81, S82, S86, S87 or S88, not read off the
  engine; the sources were read for P7 before any leg code existed.

## A13 — The eye movements (P9, 2026-09-18)

- **Changed:** `brain.ts` gains four cases — the MLF (internuclear ophthalmoplegia), the PPRF
  (a horizontal gaze palsy), the pontine tegmentum (one-and-a-half syndrome) and the
  oculomotor nucleus (a nuclear third nerve palsy). Two existing cases gain assertions rather
  than losing any: the dorsal pons now states that the far eye loses adduction with the gaze
  palsy, and Weber states the lid, the medial and the superior rectus part by part.
  `quietCranial` now covers the four new signs, so every earlier case says the eye movements
  it does not name are normal. `reverse-brain.ts` gains five examinations: a sixth nerve palsy
  against a gaze palsy, a gaze palsy against one-and-a-half, an INO, one-and-a-half, and a
  nuclear third nerve palsy.
- **Why:** P9 adds four signs and three parts, and a sign no frozen case observes is an
  untested sign (rule 5). The four cases and five examinations are what hold the new rows.
- **How circularity was avoided:** every assertion is quoted from S98 (StatPearls,
  Internuclear Ophthalmoplegia), S99 (Xue et al. on one-and-a-half syndrome), S70 (Cornblath)
  or S61/S62/S49, all read and written into `docs/P9-analysis.md` before any P9 code existed.
  The conflict the sources leave open — bilateral ptosis or none in a nuclear lesion — is
  asserted as unsettled on both sides (C29), not resolved.
- **Added after the first P9 mutation run:** a fifth case, `mlf-midbrain-left`. 61 mutants of
  the midbrain end of the MLF survived, because every case lesioned the tract in the pons
  only (D66).
- **Added after the second P9 mutation run:** `midbrain-peduncle-only-left`. Three mutants
  that redirected the oculomotor fascicles to the cerebral peduncle survived, because the only
  case lesioning the fascicles takes the peduncle with them (Weber). A case that takes the
  peduncle alone and states that no third nerve sign follows kills all three, and says what
  makes Weber crossed. The same run found `validateBrain` had never been given the P9 routes,
  so nothing held them to the parts-at table — fixed in `src/engine/brain.ts`, not here.
- **Honest note on order:** the four forward cases were written after the engine rows in this
  phase, not before them, so their first run was green. They were then falsified deliberately:
  flipping the conjugate-gaze rule from contralateral to ipsilateral fails three of them, and
  the mutation run over the new rows is the standing evidence that they bite.

## A14 — Language and the dominant hemisphere (P10, 2026-09-18)

- **Changed:** two new files. `language.ts` holds eight cases: the inferior division of the MCA
  on each side, the whole MCA cortex, the inferior frontal gyrus on each side, the superior
  temporal gyrus, and the inferior parietal lobule on each side. `reverse-language.ts` holds
  five examinations: Broca aphasia with a hemiparesis, conduction aphasia, Wernicke aphasia with
  a hemianopia, global aphasia, and left neglect. `types.ts` gains the `language` and `neglect`
  assertions and admits them in a brain case; `reverse-brain.ts` gains the two observations.
- **Changed, not added:** `brain.ts`'s superior-division case now lesions the inferior frontal
  gyrus too — S104 puts Broca area in that division's precentral branch (D70) — and asserts
  Broca aphasia. Two earlier examinations each gain one observation, never lose one:
  `reverse-mca-cortex` (P5) and `reverse-occipital-cortex` (P8) now record that the patient
  understands speech. P10 added places that fit their original findings equally — the whole
  MCA, and a left inferior-division stroke cutting both radiations — and understanding is the
  bedside finding that separates them. The expected answers are unchanged; widening them to
  admit the new places was the alternative, and would have stopped testing the distinction.
- **Why:** P10 adds three language findings, neglect, three cortical parts and five places. A
  row no frozen case observes is an untested row (rule 5).
- **How circularity was avoided — and this time the order was kept.** Every assertion is
  quoted from S100–S108, read into `docs/P10-analysis.md` before any code. The cases were then
  **run red against the P9 engine** before a line of P10 engine code existed: nine cases
  failed with 46 findings `undefined`, and the territory check failed on the amended
  superior-division lesion. P9 wrote its cases after its engine (A13); P10 did not.

## A15 — The cerebellum (P11, 2026-09-18)

- **Changed:** two new files. `cerebellum.ts` holds two cases: the left cerebellar hemisphere
  and the vermis. `reverse-cerebellum.ts` holds three examinations: one-sided limb ataxia
  (hemisphere against brainstem), truncal ataxia with the limbs spared (vermis against
  hemisphere), and a positive Romberg test with vibration lost (sensory against cerebellar
  unsteadiness). `types.ts` gains the `truncal_ataxia` assertion and `reverse-brain.ts` the
  matching observation. No earlier case or examination changed.
- **Why:** P11 adds a level, two parts, one finding and two places; a row no frozen case
  observes is an untested row (rule 5).
- **How circularity was avoided:** every assertion is quoted from S109–S112, read into
  `docs/P11-analysis.md` before any code, and the two cases were **run red against the P10
  engine** before any P11 engine code existed: limb ataxia from the hemisphere came back
  absent, truncal ataxia undefined, the Romberg test readable. Reflexes are never asserted for
  a cerebellar lesion, because the model does not show hypotonia or pendular reflexes.

## A16 — The posterior circulation (P12, 2026-09-23)

- **Changed:** two new files. `posterior.ts` holds three cases — the AICA, the PICA and the SCA,
  each on the left. `reverse-posterior.ts` holds three examinations: the AICA against the other
  pontine places, the PICA against the lateral medulla alone, and the SCA against a cerebellar
  hemisphere alone.
- **Changed, not added:** two earlier examinations each gain one observation and keep their
  expected answers. `reverse-lateral-medullary` (P5, `reverse-brain.ts`) and
  `reverse-cerebellar-hemisphere` (P11, `reverse-cerebellum.ts`) now record a steady trunk. The
  new PICA and SCA places fit every one of their other findings, and truncal ataxia is the
  bedside finding that separates them (D79).
- **Added after the first P12 mutation run:** four P5 cases in `brain.ts` — the dorsal pons,
  and the pons lesions of the lemnisci, the sympathetic fibres and the cerebellar peduncle with
  the vestibular nuclei — each gain one assertion: hearing on the lesion's side is spared. Five
  mutants that moved the hearing route onto those neighbours survived, because no case lesioned
  them without the cochlear nuclei and asked about hearing.
- **Why:** P12 adds a part, a sign and three places; a row no frozen case observes is an
  untested row (rule 5).
- **How circularity was avoided:** every assertion is quoted from S65, S110 or S113–S115, read
  into `docs/P12-analysis.md` before any code; the three cases were **run red against the P11
  engine** first. What the sources dispute is left unasserted and named (C37, C39, C40).

### Files amended since the tag, and the entry that covers each

| File | Entry |
|---|---|
| `cases.ts` | A1, A2, A9 |
| `boundaries.ts` | A2 |
| `index.ts` | A2 (exports the boundary cases) |
| `reverse.ts` | A3 |
| `types.ts` | A4, A6, A7, A11, A14, A15 |
| `plexus.ts` | A4, A5, A6, A9 |
| `reverse-plexus.ts` | A4, A5 |
| `brain.ts` | A7, A8, A9, A13, A14, A16 |
| `reverse-brain.ts` | A7, A13, A14, A15, A16 |
| `leg.ts` | A10 |
| `reverse-leg.ts` | A10 |
| `vision.ts` | A11 |
| `reverse-vision.ts` | A11, A14 |
| `language.ts` | A14 |
| `reverse-language.ts` | A14 |
| `cerebellum.ts` | A15 |
| `reverse-cerebellum.ts` | A15, A16 |
| `posterior.ts` | A16 |
| `reverse-posterior.ts` | A16 |

`npm run check:freeze` requires every changed file to appear in this file by name.
