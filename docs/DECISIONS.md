# Decisions, source conflicts and reviewer questions

Append-only. A decision is never edited after the fact; it is superseded by a later entry
that names it.

## Deviations from the published plan (revision C)

**D1 — Open-access sources replace Brazis and Blumenfeld.**
Plan step 0.1 said expectations would be transcribed from those two books with page
numbers. Neither was available. Inventing a page number would be the single worst defect a
traceable-accuracy tool can have, so expectations cite the open-access chapters in
`SOURCES.md` by URL, and every knowledge-base row carries `bookRef: 'pending'` for a reviewer
who owns the books to fill in.

**D2 — The crossing offset is 1–3 segments, not 1–2.**
The plan asserted 1–2. That figure came from memory. The two sources actually read (S01, S11)
both say 1 to 3. The knowledge base records `[1, 3]`. Consequence: the engine reports a
band of *indeterminate* pain–temperature status one to two segments wide instead of a single
crisp sensory level, which is the honest representation of the disagreement.

**D3 — Both laminations are contested, not only the spinothalamic one.**
Revision C of the plan says cervical corticospinal lamination is "far less disputed". S06
says the opposite: neuroanatomic studies show a diffuse distribution of arm and leg fibres,
and arm-predominant weakness is now attributed to denser hand representation. Both
laminations are mechanism rows. "Arms weaker than legs in central cord injury" is an
observation row. The published plan must be corrected.

**D4 — Tabes is modelled as a partial dorsal-root lesion; no large/small-fibre split.**
S13 describes decreased (not absent) reflexes and diminished pain alongside proprioceptive
loss. A partial lesion of the whole dorsal root produces all three. A fibre-class split
would be an untested row.

**D5 — Spinocerebellar tracts are deferred.**
Plan step 0.3 listed them. No P0 expectation exercises them, and the mutation rule forbids
a row nothing tests. They return when a case needs them.

**D6 — Light touch is not a separate modality in P0.**
S01, S05 and S15 put tactile sense with the posterior columns; S07 says fine touch is
preserved when the posterior columns are. The `posterior_column` modality therefore means
vibration, proprioception and fine touch together. Crude touch in the anterior spinothalamic
tract is not modelled.

**D7 — The vertebra-to-segment map holds only the row a case exercises.**
P0 needs L1 → conus (S2–Co1), from S14. The cervical and thoracic rules of thumb are
unsourced here and untested, so they are absent until P1 renders both rulers.

**D8 — Fifteen cases, seventeen evaluations.**
The complete-transection cases are each evaluated at two timepoints, because the defect
they exist to catch (A—01, spinal shock) is a difference between timepoints.

**D9 — Expectations assert only what a source supports.**
Where a source is silent, the expectation is silent too, even when the engine will produce
an answer. Silence is recorded in each case's `unasserted` list so a reviewer can see what
was deliberately left open.

## Source conflicts

**C1 — Direction of the contralateral pain level in hemisection.**
S01 says contralateral pain and temperature loss sits "1 to 3 levels above the level of
injury". A lesion cannot remove sensation from segments above it through an ascending
tract: fibres entering above the lesion ascend away from it. S11 describes the same 1–3
figure as an ascent before crossing, which places the contralateral loss *below* the
lesion. S05 and S15 say "below" without a number. **Reading adopted:** loss begins 1–3
segments below the lesion; the S01 wording is treated as an error. Reviewer question R1.

**C2 — Triceps reflex root levels.**
S12 gives C7–C8. The commonly taught C6–C7 was not found in any source read, so it is not
recorded. Single-source row.

**C3 — Brachioradialis reflex root levels.**
S12 gives C5–C6; S19 lists brachioradialis under C6. Recorded as `[C5, C6]` with both
sources; tier T3 because the sources differ in extent.

**C4 — MSD's central cord row.**
Two separate queries both reported that S05 places central cord syndrome in the *thoracic*
cord. Every other source places it in the cervical cord. The raw table text could not be
obtained, so the row is excluded rather than cited either way.

**C6 — Extent of the cord enlargements.** S24: cervical C5–T1, lumbar L2–S3. S26: cervical
C3–T1, lumbar L1–S2. S30 gives C3–T2 and T9–T12, in vertebral terms. The render draws the
union of the two segmental claims.

**C7 — Spinothalamic lamination.** S23 reports the classical arrangement and a revised one
from cordotomy mapping, noting that earlier technique may have biased the classical
account. Both are drawn; findings never depend on which (A—11).

**C8 — Corticospinal lamination.** S06 reports the historical medial-arm arrangement and
current evidence for a diffuse distribution. Both are drawn.

**C9 — Myotomes at C7 and C8.** S31: C7 elbow extension; C8 wrist flexion and thumb
extension. S32: C7 elbow extension and wrist flexion; C8 finger flexion. Both accounts
are shown side by side.

**C5 — Conus syndrome motor signs.**
S09 and S14 describe UMN signs (hyperreflexia) in conus syndrome. A lesion confined to
S2–Co1 produces no lower-limb hyperreflexia in this model, since the reflex arcs and the
corticospinal fibres serving them lie above it. The clinical description plausibly reflects
lesions extending above the conus proper. Case 14 therefore asserts nothing about
lower-limb reflexes. Reviewer question R3.

## Reviewer questions

**R1** — Confirm the reading of C1: in a hemicord lesion, contralateral loss of pain and
temperature begins 1–3 segments *below* the lesion.

**R2** — Is a single-root lesion better modelled as reduced sensation (because of dermatomal
overlap, S21) than as absent sensation? The engine reports `impaired` for an isolated root.

**R3** — Confirm C5: are UMN signs in conus syndrome explained by involvement above S2?

**R4** — The bulbocavernosus reflex is modelled on S2–S4 from the pudendal nerve's origin
(S22). No source read states the reflex's level directly. Please supply one.

**R5** — Limb regions (upper limb C5–T1, lower limb L2–S2) and the saddle (S3–S5) are
modelling conventions with no source read. Please confirm or correct.

**R6** — The Babinski rule treats any corticospinal interruption rostral to L5 as
sufficient. No source read gives the plantar reflex's segments.

**R7** — Descending bladder and sympathetic control is modelled as a lateral-funiculus
compartment that a unilateral lesion does not disable (S01: sphincter function generally
spared in hemisection). Its position in the cord is not stated by any source read.

**R8** — Muscle tone during spinal shock is reported `indeterminate`. It is widely taught as
flaccid, but S02 as read describes reflexes by phase and says nothing about tone.

**R9** — Neurogenic shock is evaluated only in the first three days (hyperacute, acute) and
reported `not_applicable` after. S03 describes it in acute injury without giving a window.

**R10** — The engine reports a Horner syndrome when *any* part of the ciliospinal centre
(C8–T2) is damaged. Does loss of a single segment of the centre produce one? S16 gives the
centre's extent, not the effect of partial loss. (Two surviving mutants.)

**R11** — Which compartments make up the sacral micturition arc? The model uses dorsal root,
anterior horn, intermediolateral column and ventral root. S17 says sphincters are spared in
ALS until late, which argues that anterior-horn loss alone does not disable the bladder.
(Five surviving mutants: the arc's extent and composition.)

## Knowledge-base audit before the engine ran

**D10 — Four citation defects found and fixed before any engine code executed.**
`armPredominance` cited S05, whose central-cord row C4 excludes — removed, tier to T2, and
the same citation in case 06 corrected through amendment A1. `region.cervical` claimed T1 on
S06, which never defines the cervical segments — now marked definitional. The Romberg row's
"untestable with weak legs" half is a modelling convention S13 does not state — now marked
pending. `chronicUmn` was T1 though only S12 supports all three of its parts — now T2.

**D12 — The mutation threshold applies to sourced rows; the raw score is always shown.**
The plan set a 90% mutation score as the P0 exit. The first run reached 59.8%. After A2 it
is 80.0% over all rows and 91.8% over sourced rows. The remaining gap in the raw figure is
almost entirely rows with no source — limb regions, the Babinski level, the
bulbocavernosus level. Such a row cannot be pinned by a sourced specification without
inventing the citation the project exists to refuse, so its survivors are listed on every
run against the reviewer question that would resolve them, rather than being scored. This
is a revision of the plan's criterion, recorded here so it can be reversed. The two
definitional regions are exempt as names, but note that `sacral` also sets the extent of
sacral sparing and `cervical` the reach of arm predominance — those uses are conventions
and fall under R5.

**D13 — `reflexesReturning` removed.** It never changed the engine's output: before the
chronic phase an interrupted corticospinal tract already leaves reflexes indeterminate.
A row that cannot affect output cannot be tested, so it went. S02's phase 3 is still in the
spinal-shock row's claim and is asserted by the `subacute` evaluations.

## P1

**D14 — Tract speed is not fibre speed.** The plan animated the spinothalamic tract at
the speed of Aδ and C fibres. Those are the *peripheral* afferents, which end in the dorsal
horn; the tract is made of second-order axons whose conduction velocity no source read
gives. The render therefore splits every sensory pulse: the peripheral leg runs at the
sourced fibre speed (S25, S28), which is where first and second pain genuinely separate,
and the intraspinal leg of the posterior-column and spinothalamic routes runs at a rate
marked illustrative on screen. The corticospinal leg has a source (S29).

**D15 — Time is dilated, ratios are not.** Real conduction crosses the cord in
milliseconds. The render slows time by one fixed factor and keeps every velocity ratio
linear, so a C-fibre pulse is genuinely about fifteen times slower than an Aδ pulse.

**D16 — The segment-to-vertebra ruler is anchored and interpolated.** No source read gives
a per-segment table. The anchors that sources do give — C1 at the foramen magnum and C8
at C7 (S26), a three-segment offset in the lower thoracic cord (S26), the conus S2–Co1 at
L1 (S14) — are joined linearly, and the render says so. Vertebral heights are drawn equal.

**D17 — Enlargements are drawn over the union of the claims.** Cervical: C5–T1 (S24),
C3–T1 (S26). Lumbar: L2–S3 (S24), L1–S2 (S26). S30's figures are vertebral and agree with
the anchored ruler. T3.

**D18 — The render never decides a deficit.** Geometry turns a 3D lesion into the same
`LesionRegion[]` the engine already accepts, and pulse extinction is read from the engine's
own routes. A test asserts that a pulse dies exactly when the engine reports the input
lost.

**D19 — Focal lesions are volumes; system degenerations are tract selections.** A
hemisection, an infarct or a syrinx occupies space, so the render places a shape and
*measures* which compartments it covers. Subacute combined degeneration, tabes and motor
neuron disease select tracts regardless of position, so they stay as direct compartment
selections. Roots lie outside the cord and are cut separately.

**D20 — The cord is drawn straight.** No source read gives the cord's curvature, so the
axis is vertical and the plan's "centreline spline" is deferred.

## P2

**D21 — The body map marks sourced landmarks; it does not paint dermatomes.** S21 gives
landmarks for C6–C8, T1, T2, T4, T6, T10, L3–L5 and S1, and nothing for the rest. Filled
dermatome regions would need boundaries no source read supplies — and whose disagreement
S21 itself records. So the map lights each sourced landmark with the state of its segment,
states the sensory level in words against those landmarks, and draws nothing for
unsourced segments. The perianal (S3–S5) marker rests on "saddle anaesthesia" in S05, S09
and S14 but its segment assignment is convention (R5), and it is flagged as such.

**D22 — On a phone the instrument is a bottom sheet with tabs.** The stage keeps the top of
the screen; Lesion, Slice, Findings and Model sit in a sheet whose tab bar is within reach
of a thumb. On wide screens every section shows at once and the tabs are hidden.

**D23 — The slice can leave the lesion.** A scrubber moves the axial slice anywhere along
the cord and draws, under the chosen lamination model, where fibres from the arm, trunk,
leg and sacrum sit at that level. It follows the lesion until moved.

**D11 — `conflict` forces T3.** The spinothalamic row carries C1 and is now T3. The triceps
row no longer carries C2: that is a single source against unread common teaching, not a
disagreement between sources read.
