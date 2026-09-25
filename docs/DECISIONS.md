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
overlap, S21) than as absent sensation? The engine reports `impaired` for an isolated root. **Answered from sources, 2026-09-25 (D135).**

**R3** — Confirm C5: are UMN signs in conus syndrome explained by involvement above S2?

**R4** — The bulbocavernosus reflex is modelled on S2–S4 from the pudendal nerve's origin
(S22). No source read states the reflex's level directly. Please supply one. **Answered from sources, 2026-09-25 (D132).**

**R5** — Limb regions (upper limb C5–T1, lower limb L2–S2) and the saddle (S3–S5) are
modelling conventions with no source read. Please confirm or correct.

**R6** — The Babinski rule treats any corticospinal interruption rostral to L5 as
sufficient. No source read gives the plantar reflex's segments. **Answered from sources, 2026-09-25 (D134).**

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

## P3

**D24 — Reverse inference has two modelling constants, and neither is a clinical fact.**
An examination is taken to misreport with probability 0.05, and each extra segment of
lesion length costs a factor of e^−0.15 in the prior. Each family of candidate starts with
equal prior weight, so the 141 placements of a focal family do not drown the single
motor-neuron pattern. These constants order the candidates; they never change a computed
finding, and the frozen reverse expectations assert only orderings that follow from the
sources, never a probability.

**D25 — Candidates are the forward cases, moved and stretched.** Every focal family uses
the compartments of a frozen forward case, placed at every level with lengths of 1, 2, 3, 5
and 8 segments; roots are single segments on either side, or a bilateral cauda equina from
L1 or below (S09); the three system degenerations keep their fixed distributions. 1,059
candidates in all. Candidates whose predictions agree on every finding entered are shown as
one group with a level range, because the examination cannot tell them apart.

**D26 — The next test is chosen for what it would teach.** Among tests not yet done, the
tool prefers one on which the two leading groups disagree, and among those the one with the
greatest expected information gain over all candidates. It shows what each result would
make most likely. A test expected to teach less than 0.05 bits is never suggested: the
first version proposed a 0.00-bit test for a radiculopathy already ranked at 99.9%, which
is advice that cannot change anything. When nothing clears the bar, the tool says the
findings already settle the question.

**D11 — `conflict` forces T3.** The spinothalamic row carries C1 and is now T3. The triceps
row no longer carries C2: that is a single source against unread common teaching, not a
disagreement between sources read.

## P4

### Source conflicts

**C10 — Where the long thoracic nerve arises, and whether it carries C7.** S34 gives the
C5–C7 rami; S37 lists it as "C5 to C6 ± C7" under root-level localisation; S44 says both
that it arises from the upper superior trunk and that it forms from the C5–C6 and C7 roots.
**Modelled** as a branch of the roots (two of three sources, and S44's own second
sentence), with C5–C6 certain and C7 disputed: a lesion reaching it only through C7 leaves
the serratus `indeterminate`.

**C11 — Musculocutaneous roots.** S33: C5–C6. S43 and S46: C5–C7. The lateral forearm
territory therefore has C7 as a disputed root. The biceps takes its roots from the myotome
sources instead (D29), so this conflict changes no muscle.

**C12 — Median roots.** S33 and S41: C5–T1. S34 and S46: C6–T1. Recorded and drawn; it
changes no finding, because every median-supplied muscle and patch of skin carries its own
root values.

**C13 — The medial forearm: T1 or C8?** S21 places the T1 landmark on the anteromedial
forearm and arm; S45 calls the medial forearm part of the C8 dermatome and gives its
nerve C8 and T1 ganglia. **Modelled** with both roots, which is S45's statement and does
not contradict S21's.

**C14 — What the posterior interosseous nerve takes from the wrist.** S39: finger and thumb
extension, no sensory loss. S40: finger extension *and wrist extension*, and it lists the
radial wrist extensors under the radial nerve proper and only the ulnar wrist extensor
under the posterior interosseous. Read together, the radial wrist extensors are spared and
the wrist deviates radially. The model tests wrist extension through the radial extensors,
so a posterior interosseous lesion spares it.

### Decisions

**D27 — The plexus extends the routes; it is not a second engine.** A root is the existing
root compartment. Beyond it a fibre runs through the trunk its root forms (S33, S34), the
division that takes it to its nerve's cord (S34, S37), the cord, and then the named places
along its nerve in proximal-to-distal order. A muscle or a patch of skin records *after how
many of those places* its branch leaves, which is exactly what the level-by-level
descriptions state (S39 for the radial nerve, S41 for the median, S38 for the ulnar). A
lesion at a place damages everything that branches after it. Divisions are drawn and
routed through but are not offered as lesion sites: no source read describes an isolated
division lesion.

**D28 — A disputed root makes a finding indeterminate, never normal or abnormal.** Where
the sources disagree about a root (C10, C11), a lesion reaching a muscle or patch only
through that root reports `indeterminate`, as the 1–3 segment crossing offset does in the
cord (D2).

**D29 — A muscle's roots come from the myotome sources, not from its nerve.** S19, S31 and
S32 give the roots of the movement a muscle is tested by; nerve root values (S33, S34, S42,
S43) are wider and describe everything the nerve carries. Taking a muscle's roots from its
nerve would, for example, make a C6 root lesion weaken the deltoid (the axillary nerve is
C5–C6) — contradicting S19 and the frozen C6 radiculopathy examination. Nerve roots are
drawn, and a test checks each muscle's roots lie within its nerve's, but they decide
nothing. Where only a nerve's roots are known (a single-muscle nerve such as the dorsal
scapular), those are used.

**D30 — The arm's dermatome landmarks are nerve territories too.** The thumb (C6), middle
finger (C7), little finger (C8) and anteromedial forearm (T1) are where S21 puts the
landmarks and also where the median, ulnar and medial antebrachial cutaneous nerves are
tested. One mark on the body map therefore answers both questions: a finding there is
predicted from the cord and roots *and* from the nerves that supply it. The thumb has two
suppliers — median on the palm (S41), radial on its radial side (S46) — so losing one
leaves it `impaired`. Three patches without a landmark (the regimental badge, the lateral
forearm and the dorsal web space) are examined separately.

**D31 — A single strength test at C5–T1 is answered by its muscles as well.** Each arm
row of the myotome table names the muscles that perform its movement: C5 the deltoid; C6
the biceps and the radial wrist extensors; C7 the triceps; C8 the ulnar wrist flexor and
the thumb extensor; T1 the interossei. The row is weak when the cord model says so or when
any of those muscles is weak.

**D32 — Four new candidate families.** Each trunk and cord on either side (plexus) and each
named nerve place on either side (nerve), complete, 36 candidates, so 1,095 in all. Each
family keeps the equal prior share of D24, and within a plexus or nerve family every
place is equally likely.

**D33 — The sympathetic outflow is the T1 root.** S16 says the second-order neurons leave
the cord at T1 and enter the cervical sympathetic chain; S36 attributes the Horner
syndrome of lower plexus injury to the T1 root. A lesion of the T1 ventral root therefore
causes an ipsilateral Horner syndrome; a lesion of the lower trunk, beyond the root, does
not (R13).

### Reviewer questions

**R12** — S19 and S31 give the interossei to T1 alone. Does a C8 root lesion weaken them?
The model says no, which is what lets it separate a C8 root lesion from a lower trunk
lesion. **Answered from sources, 2026-09-25 (D137).**

**R13** — Confirm D33: a lower trunk lesion, distal to where the T1 sympathetic fibres
leave for the chain, spares the oculosympathetic pathway.

**R14** — The triceps is modelled on C7 alone (S19, S31, S32). Its C6 and C8 contributions
are not given by any source read. **Answered from sources, 2026-09-25 (D137).**

**R15** — Abductor pollicis brevis is modelled on C8 and T1, each alone sufficient to weaken
it. The sources say only that C8–T1 injury produces an ape sign (S33) and that the median
nerve supplies the muscle (S38, S41).

**R16** — Guyon's canal is one lesion site that takes both the deep motor branch and the
little finger's sensation (S38's zone 1). Zones 2 and 3 are not modelled.

**R17** — The ulnar wrist flexor is modelled as supplied below the elbow site, so a cubital
tunnel lesion weakens it. It is widely taught that the FCU branch can arise above the
tunnel and be spared; no source read says so either way.

**R18** — The brachioradialis takes its roots from its reflex (C6 certain, C5 disputed, C3):
no source read gives the muscle's roots directly. **Answered from sources, 2026-09-25 (D137).**

**D34 — What the first plexus mutation run changed, besides the expectations (A5).**
It scored 73.9% on sourced rows. Beyond the untested roots and branches that A5 covers:
- *Fields the engine never read.* Nerve root values and cord divisions decided nothing
  (D29), so every corruption of them survived. They moved to the render knowledge base as
  `render.nerve-roots` and `render.plexus-divisions`, where they are drawn; a row the engine
  reads now holds only what the engine reads.
- *Structural invariants nothing enforced.* A branch placed after a nerve's last named place,
  or trunks that did not divide C5–T1 exactly between them, silently gave the same answers.
  The engine now refuses both.
- *A fact no source states.* That the sympathetic fibres leave in the *ventral* root is
  anatomy no source read names. It is now its own row, `pendingSource` (R19), instead of
  hiding inside a cited one.
- *Facts only reverse mode reads.* The landmark and myotome mappings (D30, D31) change no
  forward finding. Mutants that survive the forward cases are now also run against every
  frozen reverse examination.
- *A defect found while wiring that in, before it ran.* Reverse preparation was cached under
  the key `custom` for any knowledge base other than the real one, so every corrupted copy
  after the first would have reused the first one's results and been reported as killed or
  survived on another mutant's evidence. The cache is now keyed by the knowledge-base object.

**R19** — Do the second-order sympathetic fibres leave in the T1 ventral root? S16 says only
that they leave the cord at T1.

**D35 — The second plexus mutation run: 94.1% on sourced rows, and what survives.**
With A5 and the reverse pass the sourced score is 94.1% (554 of 589; 13 mutants were killed
only by a reverse examination). The 13 survivors from P0 are unchanged. The 22 new ones are:
- *Allowed by the expectations on purpose:* the long thoracic C7, the brachioradialis C5 and
  the lateral forearm C7. Each mutant moves a finding between two values the sources leave
  open (C3, C10, C11), and the expectations allow both.
- *Equivalent:* the medial forearm's nerve changed to the ulnar or median. With no named
  place before the branch, all three run the same medial-cord path.
- *Intended:* the little finger's branch moved above Guyon's canal (R16).
- *Pinned outside the harness:* the myotome and landmark mappings (D30, D31). No frozen
  examination is sharp enough to separate a moved mapping from the true one, so unit tests
  hold them: each mapped muscle must perform the movement its sourced myotome row names, and
  named landmarks must read through named nerves.
- *Open:* the superficial flexor's roots extended to C7 — no C7 case asserts it.

**D36 — A deformity is derived, not stored.** Each of the five (winged scapula, waiter's
tip, wrist drop, claw hand, ape hand) names the muscles its sources tie it to. It is
*present* when every one of them is weak from a lower-motor-neuron lesion — a cut on its
nerve route, or anterior horn or ventral root loss — *absent* when any is strong, and
*indeterminate* otherwise. Weakness of the upper motor neuron alone leaves it
indeterminate: the sources describe these postures after nerve injury, and none read
describes them after a cord or brain lesion. Claw hand is represented by the interossei and
ape hand by abductor pollicis brevis, the intrinsic muscles the sources name (S38, S41).
Amendment A6 froze the expected deformities before this rule was written.

**D37 — P4 closes at 93.8% on sourced rows.** The third run (596 mutants, 559 killed) adds
the deformity rows. Its only new survivors are the waiter's tip losing one of its three
muscles: no frozen case weakens exactly two of the deltoid, supraspinatus and biceps, and
writing one would mean asserting a posture no source describes for that lesion. The rule is
recorded as partly pinned rather than tested with an invented expectation.

**D38 — The arm is examined from the front.** The arm camera looks from in front of the
patient, as the body map is drawn, so the patient's left arm is on the viewer's right; the
cord views keep their original dorsal angle. Arm labels appear only when the camera is near
the arm, and the arm is drawn shortened, which the stage says.

## P5

### Source conflicts

**C15 — The crossing offset, a third account.** S58 has spinothalamic fibres crossing "two
segments above" entry. That lies inside the 1–3 of S01 and S11 (C1), so the range stands.

**C16 — Does facial pain reach the thalamus crossed?** S60 says the spinal trigeminal nucleus
projects to VPM on both sides. S55 describes a thalamic stroke numbing the *contralateral*
face. **Modelled** crossed above the medulla, which is what the only lesion evidence read
supports; the ipsilateral projection is recorded, not drawn.

**C17 — The abducens in Millard-Gubler syndrome.** S49 says an abducens palsy "may be
present" and was absent from the original cases. The frozen case puts the fascicle inside
the lesion and asserts the palsy from S61, noting S49.

**C18 — The face in Weber syndrome.** S50 never mentions it; S65 says contralateral
hemiplegia. The face is composed from S54 (corticobulbar fibres run in the peduncle) and S51
(an upper-motor-neuron lesion weakens the contralateral lower face).

### Decisions

**D39 — The brain is levels and parts, like the cord is segments and compartments.** A brain
lesion names a level (cortex, capsule, thalamus, midbrain, pons, medulla), a side and the
parts it takes. The long tracts continue above C1 as ordered lists of parts in the knowledge
base; the engine judges a finding by the worst damage along the cord route *and* its
continuation, so nothing about the cord's own model changed.

**D40 — Above the pyramidal decussation every long tract serves the other side of the body.**
The corticospinal tract crosses at the medullary–spinal junction (S54), the medial lemniscus
in the caudal medulla (S57), and the spinothalamic tract in the cord (S58). A brain lesion on
one side therefore weakens and numbs the other side of the body.

**D41 — Cortex, capsule and thalamus are somatotopic by body region.** Face, neck, arm, trunk
and leg. Arm is C5–T1 and leg L2–Co1, the genitals and perineum going with the leg (S66);
neck (C1–C4) and trunk (T2–L1) are conventions (R20). A lesion that names no regions takes
them all, as a lacune does (S55).

**D42 — The face has its own findings.** Facial sensation is the spinal trigeminal nucleus
below and VPM above (S60, C16). Facial weakness is *lower* when the corticobulbar route to
the facial nucleus is cut on one side — the forehead is served by both hemispheres (S51) —
and *whole* when the nucleus or nerve is (S51) or both routes are.

**D43 — Five cranial signs, each with its laterality.** Oculomotor palsy (ipsilateral, S62),
abduction weakness (nucleus or fascicle, ipsilateral, S61), gaze palsy (nucleus only, S61),
tongue weakness (ipsilateral from the nucleus, contralateral from above because control is
mostly crossed, S63), palate weakness (ipsilateral from the nucleus; after a one-sided
supranuclear lesion only milder, so reported indeterminate on both sides, S64).

**D44 — Nine territories, eighteen candidates.** The lateral and medial medulla, the ventral
and dorsal pons, the peduncle, the capsule (genu and motor posterior limb), the thalamus, and
the MCA and ACA cortex, each on either side, grouped as brainstem or hemisphere families.
Each keeps the equal family prior of D24.

### Reviewer questions

**R20** — Neck (C1–C4) and trunk (T2–L1) are placed between arm and leg on the homunculus
(S54, S66) but assigned to neither artery. Is that right, or does the MCA take the neck?

**R21** — Facial touch is not modelled separately from facial pain; S60 has the spinal
nucleus relaying both. Should the principal sensory nucleus be added?

**R22** — The trigeminothalamic fibres are not placed in the pons or midbrain, so a lesion
there does not change facial sensation in this model. Where do they run?

**R23** — Limb ataxia is taken only from the cerebellar peduncles; ataxic hemiparesis (S55)
is not modelled.

**R24** — A unilateral supranuclear lesion is modelled as leaving *both* sides of the palate
indeterminate (S64 says "milder" without a side).

**R25** — The corticobulbar fibres to the hypoglossal nucleus are drawn running with the
pyramid to the medulla. No source read says where they leave the corticospinal tract.

**D45 — Pulses run the whole neuraxis.** Motor pulses now start in the motor cortex at their
segment's homunculus region and descend through the capsule, peduncle, basis and pyramid,
crossing at the decussation before entering the cord; sensory pulses leave the cord through
the medial lemniscus (after the internal arcuate crossing) or the spinothalamic tract to VPL,
the capsule and the sensory cortex. Facial pulses follow the trigeminal and corticobulbar
routes. `fate()` meets cord and brain damage in the order the pulse travels, and a test holds
every drawn pulse to the engine's verdict for all ten A7 lesions. The brain is drawn from the
front at its own camera station, schematic and not to scale, which the stage says.

**D46 — What the first brain mutation run changed.** It scored 82.1% on sourced rows.
- *The harness swapped brain parts for cord compartments,* names no brain route can hold,
  so those mutants measured nothing. Brain steps are now mutated within the brain's own
  vocabulary and levels.
- *Nothing enforced where a part lives.* A new row lists the parts at each level (S54, S56–S59,
  S16, S47, S48); the engine refuses a route or territory naming a part its level does not
  hold, and body regions that overlap or leave a segment out.
- *Territories were read only by reverse mode.* Each is now checked against the frozen case
  its sources describe, in the test suite and the mutation run alike.
- *VPL is no longer listed as somatotopic.* No source read states its layout, and no lesion
  in the model takes part of it.
- *Levels no case had lesioned* — the lemnisci, sympathetic fibres, cerebellar peduncle and
  vestibular nuclei above the medulla, the basis alone, the capsule by region — are covered
  by amendment A8.

**D47 — P5 closes at 94.9% on sourced rows.** 1,889 sourced mutants, 1,792 killed — 1,314
of them by the engine refusing a part its level does not hold, which tests the structure
rather than the clinical facts. The brain survivors are swaps between parts that every
sourced lesion takes together: the six parts of the lateral medulla, the motor and sensory
cortex, the genu and the posterior limb. Telling them apart would need lesions of one part
alone that no source read describes, so the swaps stay recorded rather than tested with
invented expectations.

## P6

P6 adds no knowledge-base rows and no expectations. Everything a practice case says comes
from the engine that the frozen cases already test.

### Decisions

**D48 — Practice cases are generated from the model, and review is scheduled by pathway.**
A case is a real candidate lesion, some of the chronic findings the engine derives for it,
and up to four options. It starts from six abnormal and three normal findings chosen at
random, then adds the finding that best separates the true lesion from its strongest rival,
up to eighteen. It is kept only if reverse mode, given just those findings, ranks the true
lesion first with nothing against it and no other candidate unrefuted; every wrong option
must be contradicted by at least one finding shown. The explanation after answering is the
engine's own working: why each abnormal finding fits, and which findings contradict the
option chosen.
- *Pathways, not places.* A case is filed under the pathways its **shown** abnormal findings
  depend on (ten: pain and temperature, vibration and position, upper and lower motor
  neuron, autonomic, plexus and nerves, facial sensation, face from above, cranial nerve
  nuclei, ataxia and vertigo). A student who misreads crossed pain loss sees it again whether
  it comes from the cord, the medulla or the thalamus. A pathway the lesion has but the case
  does not show is never marked wrong; the first browser check found exactly that (a case
  filed under "autonomic" with no bladder finding shown), and `pathwaysShown` replaced it.
- *The schedule* is a Leitner box: a miss returns a pathway to box 0 (due at once); each
  right answer moves it up one box, due after 1, 3, 7, 14, then 30 days. The next case is
  built for the weakest pathway that is due, then an untried one, then the soonest due.
- *Generated, not written.* No case is authored by hand, so no case can say something the
  engine does not. The cost is that a case is only as good as the model; what the model
  leaves out (R-entries above) cannot be practised.
- Every case is chronic, so reflex and tone findings are settled rather than in shock.

**D49 — Progress stays in the browser, with a file to carry it.** Decided with the user:
the claude.ai page must stay shareable by public link, which rules out server-side storage.
Progress is kept in the viewer's browser under one key, every read and write guarded, and
the page works when storage is refused (a private window), saying so. "Save progress to a
file" and "Load from a file" move it between devices; a file this page did not write is
refused and changes nothing.

**D50 — Offline use comes from the standalone build.** `npm run build` writes a service
worker whose version is a hash of every built file, and a web manifest. The worker caches the
app and the pinned Three.js build, answers from the cache first, and drops old caches when a
new version activates; the page says a newer version is saved and opens next time. It is
registered only outside claude.ai, where the host serves the page. Verified in the browser:
a rebuilt page installs a new cache, deletes the old one and shows the notice.

**D51 — Presentation is phone-first.** "Present" strips the page to one case in large type
for teaching from a phone at the bedside: no tabs, no model until the answer is out, then the
lesion drawn above the case. Keys and taps choose, R reveals without choosing, N moves on,
Esc leaves. Answers given while presenting are the room's, so they are never recorded. A
second device driving the first would need shared state on claude.ai, which D49 rules out.

## Clinical review

**D52 — The review is a page to fill in and a file to send back.** Nobody with clinical
training has checked the knowledge base, and checking it cannot be done by the tool's author.
`npm run worksheet` now writes the same review two ways from one list
(`scripts/review-data.ts`): `review/worksheet.md` to read or print, and `review/review.html`,
where a reviewer marks each claim right, wrong or unsure, flags single lines of a composed
case, and adds a correction with a source. Answers stay in the reviewer's browser until
saved to a file; inside claude.ai the host offers the file, and where it cannot, the review is
shown as text to copy into a message. Nothing is stored on a server, so the page can be shared
by public link. `npm run review:ingest -- <file>` refuses malformed files, keeps each review in
`review/responses/`, and rebuilds `review/triage.md`: what was marked wrong, in worksheet order,
then what was unsure, then answers to items the worksheet no longer asks. Every item has a
stable id (the row id, the question's R-number, or the case id with the finding's text), and
each review records the worksheet version it was given on.
- A correction is not applied because a reviewer gave it. It is a lead: the source is read,
  and then the knowledge base changes (or a frozen expectation, by amendment), or the reason
  it does not is recorded here. Rule 1 still holds.


**D53 — A clinical audit, and what it changed.** The worksheet was audited item by item
against standard neurology and neuroanatomy teaching and the cited sources. The audit was
done by Claude, not by a licensed clinician; it finds errors, but it is not the sign-off D52
waits for. Where it proposed a change, the source was read first (S67–S70), and only sourced
changes touched the model (A9):
- *Spinal shock is flaccid* (S02). Tone below a transection is `reduced` while the tendon
  reflexes are absent; it was `indeterminate` (R8, resolved).
- *The bulbocavernosus reflex returns early* (S02: within phase 1). It is no longer reported
  absent in shock; it was.
- *Neurogenic shock may last four to five weeks* (S03). It is `possible` in the subacute
  phase above T6; it was `not_applicable` (R9, resolved).
- *The Romberg test is not read beside vertigo or ataxia* (S67). Examination mode had counted
  a positive Romberg against Wallenberg syndrome.
- *The interossei take C8 as well as T1, T1 primary* (S68). A C8 root lesion leaves them
  `indeterminate` (R12, resolved: the model had said strong).
- *Sympathetic fibres leave in the ventral root* (S69). The row is now sourced (R19,
  resolved).
- *An oculomotor nucleus lesion is not a fascicle lesion* (S70). The claim now names only the
  fascicles the model lesions, and says what a nuclear lesion does instead.

Audit opinions not applied, because no source read settles them — each is a question for
the clinician (D52):
- R11: the anterior horn probably should not be in the detrusor arc; Onuf's nucleus there
  serves the external sphincter (S20 names it), not the detrusor.
- R17: the flexor carpi ulnaris is often spared in cubital tunnel syndrome; `indeterminate`
  would be safer than `weak`.
- R24: a one-sided supranuclear lesion usually leaves no detectable palatal weakness.
- T1 root: a claw hand from T1 alone, and strong long finger flexors (which also take T1),
  are both stated more firmly than the clinic supports.
- C7 root: thumb extension (C7–C8) is asserted strong; `indeterminate` would be safer.
  C6 root: the deltoid (C5–C6) is asserted strong; the same applies.
- The S1 landmark is the lateral heel in the international standard (ISNCSCI); the model
  draws the lateral malleolus.

## P7 — the lower limb

The analysis written before any P7 code is `docs/P7-analysis.md`; every row below is a line
of it, and S71–S90 were read for it.

### Source conflicts

**C19 — Sacral plexus roots.** S72: S1–S4 form the sacral plexus and the lumbosacral trunk
joins the sciatic nerve; S80 calls L4, L5 and S1 roots of the sacral plexus; S75 and S79
give the sciatic and tibial nerves L4–S3. Modelled as L4–S4, which satisfies all three, with
L4 also in the lumbar plexus (L1–L4, S72).

**C20 — Tibialis anterior.** S31 gives ankle dorsiflexion to L4; S82 gives tibialis anterior
to L5. Both roots are kept, because each source names a root whose loss weakens it. A
consequence worth a reviewer's eye: an L4 root lesion is modelled with foot drop.

**C21 — Quadriceps.** S31 gives knee extension to L3; S82 gives the quadriceps to L4; S88
describes a broad L2–L4 overlap. L3–L4 are kept and L2 is open.

**C22 — Medial thigh.** S73 gives it to the obturator nerve; S89 to the femoral nerve's
medial cutaneous branch. Both supply it, so losing one leaves it uncertain rather than lost.

**C23 — The lateral foot in a fibular palsy.** The sural nerve takes a branch from each of
the tibial and common fibular nerves (S87), so the model reports the lateral foot reduced
after either; S77 and S78 do not list it among the losses of a fibular palsy. The frozen
expectation allows reduced or intact.

**C24 — Where a femoral lesion sits.** S89 puts the nerve to the iliacus above the inguinal
ligament and says femoral neuropathy weakens hip flexion "to a lesser extent". The lesion
place is therefore the femoral nerve in the pelvis, above that branch; a lesion at the
inguinal ligament, which would spare the iliacus, is not modelled.

**C25 — The hamstrings' roots.** S31 gives knee flexion to S2; S82's medial hamstring reflex
is L5; S90 says S1 contributes and that hamstring weakness is a possible, rare sign of S1
radiculopathy. S2 is kept; L5 and S1 are open.

### Decisions

**D54 — The leg reuses the arm's engine, with two additions anatomy requires.** A nerve may
leave a part of the lumbosacral plexus, and parts may share a root (L4, C19); a nerve may
leave another nerve, so a sciatic lesion cuts the tibial and common fibular nerves below it.
The brachial rules — trunks that divide their roots exactly, cords formed from trunks — are
unchanged, and every frozen arm case still passes.

**D55 — A muscle may have several nerves, or no sourced roots.** Hip flexion is the psoas
(lumbar plexus) and the iliacus (femoral nerve, S85, S89): cutting one leaves hip flexion
uncertain, which is how the model says "weak to a lesser extent". Hip adduction and hip
extension have nerves but no myotome source (D29), so, like a patch of skin with no roots
(D30), they are weak only when every root that could serve them is lost, and uncertain when
some are.

**D56 — Six leg muscles answer the strength rows.** Hip flexion (L2), knee extension (L3),
ankle dorsiflexion (L4), great toe extension (L5), plantar flexion (S1) and knee flexion (S2)
are the movements S31 names, so those rows are now read through the muscles (D31) as the
arm's are. A root lesion therefore weakens the row of every muscle it serves: an L5 root
weakens ankle dorsiflexion, which S82 says it does.

**D57 — Where bedside findings cannot separate two lesions, the expectation says so.** S88
describes the L2–L4 overlap; S72 separates plexus from roots by paraspinal denervation, which
a bedside examination cannot show. The femoral, meralgia and sacral plexus examinations ask
only that the right family rank near the top and the excluded family not lead.

**D58 — What the leg leaves out.** A femoral lesion at the inguinal ligament; the pudendal,
posterior femoral cutaneous, iliohypogastric, ilioinguinal and genitofemoral nerves; deep and
superficial fibular lesions apart; the tarsal tunnel; piriformis; the short head of biceps
femoris; pectineus and sartorius; the medial hamstring reflex; the foot's intrinsic muscles.
The leg panel says so.

### Reviewer questions

**R26** — C20: should an isolated L4 root lesion be taught with foot drop? S31 puts ankle
dorsiflexion at L4, S82 puts tibialis anterior at L5.

**R27** — C23: is the lateral foot spared in a common fibular palsy at the fibular neck? It
depends on where the lateral sural cutaneous branch leaves, which no source read gives.

**R28** — The hip adductors are modelled with no sourced roots, so an L3 or L4 root lesion
leaves adduction uncertain. Which roots should be given, and from which source? *Partly answered (D137): S154 confirms L2–L4 as the obturator nerve’s roots; which one carries adduction is still unsourced.*

## P8 — the visual pathway

The analysis written before any P8 code is `docs/P8-analysis.md`; S91–S97 were read for it.

### Source conflicts

**C26 — Congruity.** A congruous homonymous defect is taught as a sign of a lesion behind the
lateral geniculate nucleus. S97 reports that about 60% of optic radiation lesions and 50% of
optic tract lesions are congruous, which is too weak to localise by. Not modelled; the
pupil, not congruity, separates tract from cortex here (S92, S97).

**C27 — The pupil in a chiasmal lesion.** S95 says a chiasmal lesion may give a relative
afferent pupillary defect when one eye loses more fibres than the other. The model therefore
leaves the pupils unsettled for a chiasmal lesion rather than calling them normal.

**C28 — How much of the centre macular sparing keeps.** S97 gives 5° to 25°. The model has
one central sector on each side of fixation and does not grade it.

The analysis written before any P9 code is `docs/P9-analysis.md`; S98 and S99 were read for
it, beside S61, S62, S49 and S70 already in the registry.

**C29 — Ptosis in a nuclear third nerve lesion.** S70 says a lesion of the oculomotor nucleus
gives either bilateral ptosis or no ptosis at all, because one central caudal nucleus raises
both lids. The two outcomes are opposite and the source picks neither, so the model reports
the lid **unsettled on both sides** for a nuclear lesion rather than choosing (the same shape
as the palate, C15). A fascicular third nerve palsy is not affected: the lid droops on its own
side (S62), and that is what separates the two lesions in the app.

**C30 — Convergence in an internuclear ophthalmoplegia.** S98 says convergence may be
preserved, which is the classical bedside distinction between an INO and a medial rectus palsy
of the third nerve. **Convergence is not examined in this model**, so nothing is asserted about
it; the INO case says so in its `unasserted` list. The model separates the two by the lid and
the superior rectus instead, both of which the sources state.

### Decisions

**D59 — The ranked list puts conflicts before probability.** Until P8 the candidates were
ranked by posterior alone. A family with one candidate (the chiasm) holds the whole family's
prior, which is 20 times a nerve candidate's share, and that is exactly the cost of one
contradicted finding under the 5% noise model (log 20 ≈ −log 0.05). A numb lateral thigh
therefore ranked a chiasmal lesion above the lateral femoral cutaneous nerve. Groups are now
ordered by how many findings they contradict, then by posterior. Candidates that conflict are
still listed, with their conflicts counted, so a mis-recorded finding is recoverable.

**D60 — The field is examined in sectors, not degrees.** Each eye has four peripheral
quadrants and the centre either side of fixation: enough for monocular loss, bitemporal
hemianopia, homonymous hemianopia, both quadrantanopias and macular sparing, and no more
(C28). A part that carries only half of the centre — Meyer loop, the parietal radiation, one
calcarine bank — leaves the central sector unsettled rather than lost.

**D61 — The pupil is the sign that crosses the geniculate.** *(Its last sentence is corrected by D131.)* An optic nerve lesion gives a
defect on its own side, an optic tract lesion on the opposite side, and nothing behind the
lateral geniculate nucleus gives one (S95, S97). When both sides are equally affected the
model reports the pupils unsettled, because a relative defect compares the two eyes; no
source read states this, so the row is marked pending.

### Reviewer questions

**R29** — C27: should a chiasmal lesion be taught as giving no pupillary defect, rather than
leaving it unsettled?

**R30** — D61: with both optic nerves equally damaged, is "no relative defect" the better
teaching than "unsettled"? **Answered from sources, 2026-09-25 (D131).**

**R31** — The posterior cerebral artery also supplies the thalamus and midbrain (S94). Should
the occipital place be offered as a whole-territory lesion, with the thalamic and midbrain
findings the brain model already has?

**D62 — What the P7 and P8 mutation runs left standing.** The run after A12 kills 94.2% of
sourced mutants (2,663 of 2,828), above the 94% P7 set itself; the first P7 run reached 93.4%
with 88 leg survivors, which A12 cut to 57. What still survives, and why:
- *The ends of the plexus spans* (6): the lumbar plexus is L1–L4 and the sacral L4–S4 (S72,
  S80), but no modelled nerve carries L1 or S3–S4, so moving those ends changes nothing a
  case can see. Naming a nerve that uses them would be inventing one.
- *Muscles and patches whose roots no source gives* (about 30): the adductors, gluteus
  maximus, the thigh patches, the sole and the anterolateral leg. Their open spans can be
  widened without changing a verdict, because every root in them already leaves the finding
  uncertain. R28 asks a reviewer for the roots.
- *The sural nerve's two contributors* (5): C23 leaves the lateral foot open in a fibular
  palsy, so a mutant that moves that branch survives by design.
- *The relative pupillary defect when both sides are equal* (1): D61's convention, marked
  pending and put to a reviewer as R30.
- *Places of the visual pathway* were checked only by reverse mode, as brain territories once
  were (D46); each is now held to the frozen case that describes it, in the test suite and in
  the mutation run alike.

**D63 — Adduction has three causes, and the model keeps them apart.** One eye failing to
adduct means the MLF on that side (S98), the third nerve on that side — the medial rectus is
III, so the eye rests down and out (S62) — or the abducens nucleus or PPRF on the **other**
side, whose interneurons drive that medial rectus so the gaze palsy is conjugate (S61, S99).
The engine takes the worst of an ipsilateral route and a contralateral one. This is what lets
the app derive one-and-a-half syndrome rather than name it: an abducens nucleus and an MLF on
one side leave only the other eye's abduction, and the frozen case asserts exactly that.

**D64 — A sixth nerve palsy is only examined inside the ventral pons.** The model has no place
for an abducens fascicle standing alone: the ventral pontine territory carries the basis and
the facial fascicle with it (S49, Millard–Gubler). The examination that separates a fascicle
from a nucleus is therefore a full ventral pontine syndrome, and it still makes the point the
phase is for — one eye fails to abduct, the other still adducts, so the gaze is not conjugate
and the nucleus is spared (S61). Inventing a fascicle-only territory would assert a lesion no
source read describes.

**D65 — Conjugate gaze is its own practice pathway.** Gaze palsy, failed adduction and
abducting nystagmus are read across **both** eyes: which eye fails, and in which direction,
is the whole question. They now schedule review under `eye_movements` rather than
`cranial_nuclei`, which keeps the single-nerve signs — the third nerve, abduction, the lid,
the superior rectus, the tongue, the palate, the whole face — where they were. A student who
misreads an INO sees a gaze palsy again, not a palatal weakness.

**D66 — The MLF is one tract, and only the pons is a place.** The frozen cases lesion the MLF
twice, in the pons and in the midbrain, because the tract runs between them and a rule that
only held at one end would be untested at the other — the first P9 mutation run left 61
mutants of the midbrain step standing for exactly that reason. Only the pontine one is offered
as a place to localise to: the two produce identical findings in this model, so a second
candidate would be a choice the examination can never settle rather than a lesion the student
can find.

**D67 — What the P9 mutation run left standing.** 95.6% of sourced mutants are killed (3,316
of 3,467), 94.8% of all mutants — the highest of any phase, against 94.2% after A12. **No P9
row has a survivor.** Getting there took three runs and two real corrections, both recorded in
A13: the midbrain end of the MLF was never lesioned by a case (61 survivors, fixed by
`mlf-midbrain-left`), and the oculomotor fascicles were never lesioned without the peduncle
beside them (3 survivors, fixed by `midbrain-peduncle-only-left`). The second run also showed
that `validateBrain` had never been given the seven P9 routes, so nothing held them to the
parts-at table — a gap in the engine that no test had asked about, found by a mutant of the
data rather than by review.

What still survives is what earlier phases already recorded: the ends of tract and plexus
spans that no modelled finding distinguishes (`brain.spinothalamic`, `brain.lemniscal`,
`plexus.leg-parts`), rows whose parts are always examined together (`brain.ataxia`,
`brain.vertigo`, `brain.sympathetic`), and the unsourced rows that stay pinned until a
reviewer supplies a source. None of them is an eye-movement row.


## P10 — language and the dominant hemisphere

The analysis written before any P10 code is `docs/P10-analysis.md`; S100–S108 were read for it
on 2026-09-18. This time the frozen cases were run red against the P9 engine before any P10
engine code existed: 46 findings came back `undefined` across nine cases, and the territory
check failed because the superior-division case now named Broca area and the knowledge base
did not.

### Source conflicts

**C31 — The field of an inferior-division stroke.** S105: "Contralateral homonymous
hemianopia is frequently observed". A lesion confined to the temporal lobe takes Meyer loop
alone and gives a superior quadrantanopia (S97, P8). *Frequently* is not always. The model
gives the inferior division both radiations — the hemianopia S105 describes — and leaves the
smaller temporal lesion to the Wernicke-area and Meyer-loop places, which carry no field defect
and a quadrantanopia respectively. The centre of the field is not asserted: S105 does not say
whether the macula is spared.

**C32 — Neglect after a left-hemisphere lesion.** S106 gives neglect persisting at twelve
weeks in about 17% after right and 5% after left lesions. Rarer is not never, so a left
inferior parietal lesion leaves right-sided neglect **unsettled**, not absent. The row carries
the answer as data (`brain.neglect.afterDominant`), so a reviewer can change it without code.

**C33 — Neglect outside the parietal lobe.** S106 says neglect *most often* involves the right
posterior parietal cortex, which admits other sites. The model places neglect in the inferior
parietal lobule only; no frozen case asserts that a frontal or temporal lesion spares it, and
the superior-division and Broca-area cases list neglect as unasserted.

**C34 — The superior temporal gyrus: Wernicke or conduction?** S101 localises Wernicke aphasia
to the posterior superior temporal gyrus; S102 says a lesion of the left superior temporal
gyrus *may* cause conduction aphasia. The model follows S101 for that gyrus and places
conduction aphasia in the inferior parietal lobule, which S102 also names. Found while auditing
the P10 analysis, before any code — the first draft had not noticed that S102 names the gyrus
too.

### Decisions

**D68 — One dominant hemisphere, stated rather than modelled.** Language is read from the left
hemisphere (S107). S108 gives how often that is wrong — about 4% of strong right-handers, 15%
of the ambidextrous and 27% of strong left-handers are right-dominant — and the model does not
take handedness as an input. The findings panel says so beside every language finding, and the
working names the dominant hemisphere whenever it explains one. S108 was read as an abstract
only; its full text is paywalled, and the registry says so.

**D69 — The engine derives the facets; the panel names the aphasia.** The engine computes
three findings — non-fluent speech, impaired comprehension, impaired repetition — each from
the parts the sources put it in. It never names an aphasia. The findings panel reads the three
back against S103's classification (Broca, Wernicke, conduction, global) and gives a
combination the model cannot produce no name at all, rather than a guess. Global aphasia is
therefore Broca area with Wernicke area, derived, exactly as one-and-a-half syndrome was in P9.

**D70 — The superior-division place gained Broca area.** `mca_cortex` was sourced in P5 as the
superior MCA division; S104 puts Broca area in that division's precentral branch. Leaving it
out would make a left superior-division stroke speak normally. The frozen case gained its
language findings under A14, and the P5 examination for that place now records the patient as
understanding — the finding that separates it from the whole MCA, which the P5 examination was
never asked to tell apart.

**D71 — A territory may take part of the visual pathway.** The inferior division supplies the
optic radiation as well as cortex, so a brain territory now carries an optional list of visual
parts, lesioned on its own side. `territoryFailures` checks those parts against the frozen case
exactly as it checks the brain parts, and `validateBrain` refuses a part the visual knowledge
base does not hold.

### Reviewer questions

**R32** — C31: should the inferior-division place carry the whole hemianopia, or only Meyer
loop's superior quadrantanopia, as the commoner finding in teaching?

**R33** — C32: should right-sided neglect after a left parietal lesion be taught as unsettled,
or as absent for practical purposes?

**R34** — D68: is it worth adding handedness as an input, so a left-handed patient's language
can be unsettled rather than left-hemisphere by assumption?

**D72 — What the P10 mutation run showed.** 96.1% of sourced mutants are killed (3,737 of
3,890), 95.3% of all — the highest yet, against 95.6% after P9 — and **no P10 row has a
survivor**. The first run hid a gap in the mutator rather than the model: it had no pool for a
side, so `brain.dominance` was never mutated at all, and it mutated the neglect row's answer
after a dominant lesion with tone words (`reduced`, `increased`) that no sign can take. Both
now have their own pools. The rerun flips the dominant hemisphere to the right and 22 frozen
findings fail; no side-flip survives anywhere in the knowledge base. The same browser check
caught the working calling "the language cortex of the dominant hemisphere" intact while the
inferior parietal lobule — part of it — was damaged; it now names the part a spared facet
depends on, and a test holds that wording.

## P11 — the cerebellum

The analysis written before any P11 code is `docs/P11-analysis.md`; S109–S112 were read for it
on 2026-09-18. The two frozen cases were run red against the P10 engine first: limb ataxia
from the hemisphere came back absent, truncal ataxia undefined, and the Romberg test readable.

### Source conflicts

**C35 — Truncal ataxia from a hemisphere lesion.** S111: midline lesions give imbalance while
hemispheric lesions "result mainly in incoordination" — mainly, not only. S109 gives truncal
ataxia to the vermis. The model reports truncal ataxia **unsettled** after a hemisphere lesion,
never absent; the answer is data (`brain.truncal-after-hemisphere`), not code.

**C36 — Nystagmus from the cerebellum.** S110 calls dysarthria and nystagmus common after a
hemisphere lesion. The model's "vertigo and nystagmus" finding comes from the vestibular nuclei
(P5) and was not extended, so no frozen case asserts it either way for a cerebellar lesion.
Dysarthria is not modelled.

### Decisions

**D73 — The cerebellum is a level beside the stack, not in it.** It lies behind the pons and
medulla, so it has its own level, its own families (`cerebellum_left`, `cerebellum_right`,
`cerebellum_midline`) and is drawn dorsally rather than as a ring of the brainstem lathe.

**D74 — A midline territory is one candidate.** The vermis is midline, so the place takes both
halves and is offered once, as the chiasm is in P8; the side picker does not change it. The
territory row says so (`midline: true`), and `territoryRegions` lesions both sides.

**D75 — Truncal ataxia makes the Romberg test unreadable.** The model already withheld the test
with limb ataxia or vertigo (S67, A9). A patient unsteady sitting or standing with the eyes open
(S111) cannot show what closing them adds, and a positive test points to the sensory pathway
rather than the cerebellum (S111) — which one of the three new examinations teaches.

### Reviewer questions

**R35** — C35: should a hemisphere lesion be taught as leaving truncal balance intact, or is
"unsettled" the better teaching?

**R36** — PICA supplies the inferior vermis and the undersurface of the hemisphere (S110). Should
the lateral medullary place take the cerebellum too?

**D76 — What the P11 mutation run showed.** 96.4% of sourced mutants are killed (4,076 of
4,229), 95.6% of all — up from 96.1% after P10 — and **no P11 mutant survives**: the new
hemisphere step of the ataxia route, both truncal rows, both places and the vermis's `midline`
flag. Two gaps were closed before the run rather than found by it. The P10 lesson said the new
`state: 'indeterminate'` would be mutated with tone words, so it got the sign pool; and nothing
compared a territory's `midline` flag with its frozen case, so `territoryFailures` now does. The
six ataxia survivors are P5's peduncle steps, unchanged since P10 (the same six in both runs):
the only lesion that takes the medullary peduncle takes its neighbours with it.

## P12 — the posterior circulation

The analysis written before any P12 code is `docs/P12-analysis.md`; S113–S115 were read for it
on 2026-09-23, and S65 was re-read for the lateral pontine syndrome. NCBI's first path returned
a CAPTCHA page; the chapters were read through NCBI's own `/sites/books/` path instead. The
three frozen cases were run red against the P11 engine first: hearing came back undefined in
all three.

### Source conflicts

**C37 — Weakness and position sense in the lateral pons.** S65's Marie-Foix syndrome gives
contralateral hemiparesis and loss of proprioception and vibration, from the basilar perforators
as well as the AICA. S113 and S114, describing the AICA territory, name neither. The AICA place
takes the lateral structures only, and its case asserts neither strength nor vibration.

**C38 — PICA without the medulla, or without the cerebellum.** S113: PICA occlusion only
*sometimes* gives the full Wallenberg syndrome, so it may be cerebellar alone; and the lateral
medulla can be lost without the cerebellum (S47: "PICA or vertebral artery"). The model offers
the whole PICA territory and keeps P5's lateral medullary place beside it.

**C39 — Facial sensation in the AICA syndrome.** S113: "facial paralysis or anesthesia". The
model's trigeminal nucleus is medullary (P5), so the AICA place does not take it and nothing is
asserted about facial sensation.

**C40 — Vertigo from the SCA.** S113 says vertigo is *less frequent* with the SCA, not absent.
The SCA place does not take the vestibular nuclei, and its case asserts nothing about vertigo.

### Decisions

**D77 — A territory may span levels.** PICA supplies the lateral medulla and the inferior
cerebellum, so a territory gains `also`: further parts at other levels on its own side.
`validateBrain` checks them against the parts-at table, and `territoryFailures` checks them
against the frozen case — falsified on purpose by dropping the vermis from PICA, which the check
names exactly.

**D78 — Hearing is one sign, from the cochlear nuclei.** The AICA supplies the cochlear nuclei
and, through the labyrinthine artery, the inner ear (S114). The model has one part, `cochlear`,
standing for both; the labyrinth as a separate structure and tinnitus are not modelled.

**D79 — Two earlier examinations gained a steady trunk.** The whole PICA territory fits every
finding of the P5 lateral medullary examination, and the SCA every finding of the P11
cerebellar-hemisphere examination; neither examination had looked at the trunk. Each gained
one observation — truncal ataxia absent — and kept its expected answer (A16), as A14 did.

### Reviewer questions

**R37** — C37: should the lateral pontine place take the corticospinal tract and lemniscus, as
S65's Marie-Foix syndrome does, rather than the AICA territory alone?

**R38** — C39: should the model add a pontine trigeminal nucleus, so the AICA place can take
facial sensation?

R36 (PICA and the cerebellum) is answered by D77 and C38.

**D80 — The lateral medulla preset no longer says "PICA".** Its P5 label read "Wallenberg
(PICA)". With a PICA place beside it that also takes the cerebellum, that label made the two
presets indistinguishable — the browser check selected the wrong one by it. It now reads
"Wallenberg, medulla only"; S47 gives the medullary lesion to "PICA or vertebral artery" (C38).

**D81 — What the P12 mutation runs showed.** The final run kills 96.6% of sourced mutants
(4,226 of 4,377) and 95.8% of all — up from 96.4% after P11 — and **no P12 row has a survivor**.
The first run left five mutants of the new hearing route standing: each moved it onto a
neighbour inside the AICA territory (the facial nucleus, the spinothalamic tract, the
sympathetic fibres, the cerebellar peduncle, the vestibular nuclei), and no case lesioned those
without the cochlear nuclei and asked about hearing. Four P5 cases that lesion exactly those
parts now say hearing is spared (A16), and the rerun kills all 38 hearing mutants. The six P5
ataxia survivors are unchanged from P10 and P11.

**D82 — Two stale things the published review page showed.** Reading the live review page
before republishing it turned up `brain.oculomotor` still claiming "a lesion of the nucleus
itself is not modelled" — true until P9, false since, and contradicted by the route directly
below the claim. A reviewer would have been asked to judge a sentence the app no longer
follows. It now says what the model does. The same pass found the findings panel's head group
still citing only the P5 rows, so the sources behind gaze, the MLF, the lid, truncal ataxia and
hearing were never shown as chips; they are now, and `test/panel-drivers.test.ts` fails if the
panel ever names a row that does not exist (falsified with a misspelt id). Nothing checks that
a claim's prose still matches its data; that remains the reviewer's job, and the reason the
review page exists.

## P13 — vertical gaze and the pupils: the dorsal midbrain

The analysis written before any P13 code is `docs/P13-analysis.md`; S116–S119 were read for it
on 2026-09-23. One claim met on the way — that the near-reflex centre lies ventral to the
pretectal nucleus — was seen only in a search summary and in no page read, so it is not used.
The frozen case was run red against the P12 engine first: the three new findings came back
undefined, and nothing else in the case failed.

### Source conflicts and limits

**C41 — The lid.** S116: lid retraction in primary position, the Collier sign, in about 40% of
patients. Not modelled; the case asserts nothing about the lid.

**C42 — Downgaze.** S116: "classically preserved, but the reason for this is not entirely
explained". The model has no downgaze finding, so the preservation is taught in words, not
computed; no case depends on it.

**C43 — One side.** Every source read describes compression of the dorsal midbrain, not a
one-sided lesion. The model's place takes both halves of the pretectum and reads either half as
enough; no case depends on what one half alone would do.

### Decisions

**D83 — Three signs of both eyes together.** Upgaze palsy, light–near dissociation and
convergence–retraction nystagmus belong to the patient, not to a side (S116 describes them for
both eyes), and are examined as one control each. They schedule practice under conjugate gaze.

**D84 — A midline brainstem place has its own family.** Until P13 a midline territory was always
the vermis, and the candidate code said so. The dorsal midbrain is the first midline place in
the brainstem, so it gets `brainstem_midline` rather than borrowing the cerebellum's family.

**D85 — A stale note in a P9 case.** `mlf-midbrain-left` listed "vertical gaze and the dorsal
midbrain syndrome are not modelled". After P13 the dorsal midbrain is modelled, so the note now
says the dorsal midbrain is not in that lesion and no source read says what a rostral MLF lesion
alone does to vertical gaze (A17).

### Reviewer questions

**R39** — C43: is it right to teach Parinaud syndrome as a midline lesion only, or should a
one-sided pretectal lesion be a place of its own?

**R40** — Should the Argyll Robertson pupil (bilateral pretectal damage in neurosyphilis, S117,
S118) be offered as a teaching preset, given that it is not a focal lesion?

**D86 — What the P13 mutation run showed.** 96.7% of sourced mutants are killed (4,418 of
4,569), 96.0% of all — up from 96.6% after P12 — and **no P13 row has a survivor on the first
run**: all 38 mutants of each of the three sign rows, all 8 of the place, and the pretectum's
entry in the parts-at table. The dorsal midbrain case lesions only the pretectum, so any mutant
that moves a sign to another part leaves the case without it.

**D87 — A test that cannot move the leader is kept, and says so.** With upgaze palsy and
light–near dissociation recorded, the dorsal midbrain leads at 93.0% and the runner-up (a
peripheral nerve group) already has two conflicts. The engine suggested convergence–retraction
nystagmus as a test the "two leading candidates" disagree on, and both of its results left the
dorsal midbrain first. It is **kept**, not suppressed under D26, because D26's bar is expected
information over every candidate, not a change of leader, and this test clears it at 0.22 bits:
present takes the leader to 99.6%, absent drops it to 41.3% with a conflict. Saying the
findings "already settle it" at 93%, or at 41% after the other result, would be the false
statement. Suppressing it would also not have found a better test: none of the 73 slots that
clear the bar here can change the leader, and 12 of the 55 frozen reverse expectations have a
suggestion of this kind, none of them among the three that require one. So the suggestion now
carries `confirmsLeader` — true only when every result leaves one and the same candidate most
likely, and that candidate is in the first group — and the panel says "this would confirm, not
change, the leading place" instead of claiming the leaders predict different results. The
choice of test is unchanged; the three frozen cases that require a separating test are
unaffected.

## P14 — the fourth and fifth nerves, and the third nerve's pupil

The analysis written before any P14 code is `docs/P14-analysis.md`; S120–S124 were read for it
on 2026-09-23, and S62 was re-read for the pupil. NCBI's `/books/` path and PMC returned CAPTCHA
pages and the Europe PMC copies of S70 refused the request; none was worked around. The two
frozen cases were run red against the P13 engine first: the two new signs came back undefined
and facial sensation intact.

### Source conflicts and limits

**C44 — The trochlear fascicle.** S120: "a fascicular lesion affects the ipsilateral nerve and
muscle". The fibres cross inside the midbrain before they exit, so "fascicle" can name either
side of the crossing. The model has the nucleus only.

**C45 — The third nerve's pupil.** S62: a compressive palsy gives "a fixed and dilated pupil";
"ischemic processes typically spare pupillary function"; the pupillary fibres lie "superficially
within the nerve trunk". The pupil follows the cause in the nerve trunk, which the model does not
have, and no source read says what a midbrain lesion of the fascicles or nucleus does to it. P9
left the pupil out with a promise to look; it stays out, now for a stated reason.

**C46 — One source for the trochlear crossing.** *(Resolved by S150; D133.)* Only S120 states that the nucleus serves the
opposite eye. S124 describes the sign but not the nucleus, and S70's text could not be read. The
row is T2, and R41 asks a reviewer for a second source.

### Decisions

**D88 — A cranial nerve whose nucleus serves the other side.** The trochlear route is the first
cranial route whose nucleus serves the contralateral eye; the examination teaches it the way it
is asked — a right superior oblique palsy from the brainstem is the *left* nucleus.

**D89 — Facial sensation gains the pons.** The principal sensory nucleus joins the spinal
trigeminal nucleus on the ipsilateral route (S122, S115). No earlier place takes it, so no
earlier finding moved. C39 (facial sensation in the AICA syndrome) is unchanged: the AICA place
does not take the principal nucleus.

### Reviewer questions

**R41** — C46: can a reviewer give a second source for a trochlear nucleus lesion weakening the
contralateral superior oblique? **Answered from sources, 2026-09-25 (D133).**

**R42** — C45: should the model add a peripheral third nerve, so that a compressive palsy can
show the pupil and an ischaemic one spare it?

**D90 — The last reviewer question was never asked.** The worksheet read each question up to
the next blank line, so a question ending the file — no blank line after it — was dropped. No
file had ended on a question until P14, when R42 did, and the P14 worksheet check caught it
(41 questions where 42 were written). Questions now end at a blank line or the end of the file,
and `test/review.test.ts` fails unless every R-number in this file reaches the page (falsified
by restoring the old pattern: the test names R42).

## P15 — the basal ganglia

The analysis written before any P15 code is `docs/P15-analysis.md`; S125–S127 were read for it
on 2026-09-24. The frozen case was run red against the P14 engine first: hemiballismus came back
undefined, nothing else failed.

### Source conflicts and limits

**C47 — Hemiballismus from elsewhere.** S125: "lesions within the basal ganglia that do not
involve the subthalamic nucleus can still produce hemiballismus". The model places it in the
subthalamic nucleus only, so the examination teaches the classic site; the row is T3 and the
examination's note says the nucleus is not the only cause.

**C48 — Parkinsonism and chorea are not places.** S126 and S127 describe parkinsonism as
"neurodegeneration of the SNpc dopaminergic neurons" and chorea as neuronal death in the caudate
and putamen; S127 names vascular parkinsonism after stroke without its site or side. A place
would need a side no source read gives, so neither is modelled.

### Decisions

**D91 — P15 is one sign, on purpose.** The phase was planned as the basal ganglia entire. Read
against the sources, only hemiballismus is a focal sign with a stated side; building the other
two would have meant inventing their laterality. The phase was cut to what the sources support
rather than widened to what the plan named.

**D92 — The subthalamic nucleus sits at the model's `thalamus` level.** That level holds the
diencephalon between the midbrain and the capsule; S125 puts the nucleus at the junction of the
midbrain and diencephalon, below the thalamus and medial to the capsule. No new level was made
for one part.

**D93 — What the P15 mutation run showed.** 97.0% of sourced mutants are killed (4,907 of
5,057), 96.3% of all, and no P15 row has a survivor on the first run: all 43 mutants of the
hemiballismus route and all 7 of the place.

### Reviewer questions

**R43** — C48: is there a focal lesion of the substantia nigra or striatum with a side stated
well enough to be taught as a place?

## P16 — gaze deviation and Gerstmann syndrome

The analysis written before any P16 code is `docs/P16-analysis.md`; S128–S131 were read for it
on 2026-09-24. The frozen cases were run red against the P15 engine first: eleven failing tests,
ten evaluations each failing on a new claim and the whole-MCA place no longer matching its case.

### Source conflicts and limits

**C49 — "May cause".** S129: frontal eye field damage "may cause eye deviation towards the side
of the lesion", and S131's figures are for patients who had the deviation. The model gives it as
present on the first day — the sign the lesion is taught by — and the row is T2, not T1.

**C50 — The prolonged exception.** S131: after earlier damage to the other frontal lobe the
deviation was "remarkably prolonged, lasting from 13 to more than 43 days". The model has no
history, so it says absent after a month and records the exception here and in the
month-later examination's note.

**C51 — The tetrad is rare.** S128: patients "commonly present with 2 to 3 symptoms", the
complete tetrad rare. The finding means "Gerstmann signs, some or all" and never claims four.

### Decisions

**D94 — A brain sign with a course.** Every earlier brain sign was the same at every timepoint.
The frontal eye field's gaze palsy is a data row with a state per timepoint, read from S131:
present on the first day, unsettled from one day to a month (57% gone by 48 hours, 90% by five
days, so neither present nor absent can be stated for a patient), absent after it. The pontine
palsy keeps no course and wins when both are damaged: present from the pons is present.

**D95 — The frontal eye field's gaze palsy is the existing sign.** A new sign "gaze deviation"
would have been the same finding named from the other end: eyes deviated toward the left are
eyes that cannot look to the right. The cortical route adds to "gaze palsy toward this side",
serving the opposite side, so the examination table and the reverse engine needed no new slot.

**D96 — The whole MCA takes the frontal eye field; the superior division does not.** S104 names
forced gaze deviation for the large MCA stroke. No source read places it in a superior-division
stroke, so that place is unchanged (P16-analysis §5).

**D97 — What the P16 mutation run showed.** 97.1% of sourced mutants are killed (5,087 of
5,237), 96.4% of all, and no P16 row has a survivor on the first run: all 52 mutants of the
frontal eye field's gaze route and its course, all 43 of the Gerstmann route, all 7 of the new
place and all 16 of the whole-MCA place that gained it.

### Reviewer questions

**R44** — C49: is "present on the first day" right to teach for a frontal eye field lesion, or
should the first day also be unsettled?

**R45** — D94: should the gaze palsy be unsettled rather than absent after a month, given C50's
exception?

## P17 — locked-in syndrome

The analysis written before any P17 code is `docs/P17-analysis.md`; S132–S134 were read for it
on 2026-09-24. Run against the P16 engine first, the frozen forward case **passed**. Every
finding in it comes from routes that already existed, and only the place was new. The
examination failed (`top is posterolateral … (4 conflicts)`, `unexplained is true`), because the
engine had no candidate that takes both sides of the pons.

### Source conflicts and limits

**C52 — Sensation in locked-in syndrome.** S132 gives "whole-body sensory loss" and says the
spinothalamic tract is in the ventral pons; S134 says the basilar occlusion spares the pontine
tegmentum, where the model — like every earlier brainstem phase — puts the medial lemniscus and
the spinothalamic tract. The model follows its anatomy and leaves sensation intact; the frozen
case asserts nothing about it, and the place is T3.

**C53 — Horizontal gaze in locked-in syndrome.** S133: "medial and lateral gaze palsies are
typical". The model gives only the lateral half, from the abducens fascicles in the lesion; the
gaze centre and the medial longitudinal fasciculus are in the spared tegmentum. Neither
adduction nor the horizontal gaze palsy is asserted.

**C54 — A second site.** S133: "extensive bilateral destruction of corticobulbar and
corticospinal tracts in the cerebral peduncles may also be responsible". The model offers the
pons only; the examination's note names the peduncles.

### Decisions

**D98 — Locked-in syndrome is a place, not new anatomy.** Both ventral halves of the pons hold
the same parts as the one-sided ventral pons of P5. The new place is those parts, marked
midline, so it is one candidate that takes both sides. No part, sign or route was added.

**D99 — Midline brain places no longer read as one side.** The lesion readout said "Left
dorsal midbrain" and "Left vermis", and showed the side picker, although both places take both
sides (P11, P13). It now says "The …" and hides the picker for every midline brain place, as the
chiasm already did for the visual pathway (P8). This was found while adding the ventral pons on
both sides, which would otherwise have read "Left ventral pons, both sides".

**D100 — "Speech fluent" was wrong for a patient who cannot speak.** The language panel's
line for no aphasia read "Speech fluent, comprehension and repetition intact". Found in the P17
browser check: the locked-in patient, who is anarthric, was shown as fluent. The three facets
are about language, not articulation. The line now reads "No aphasia", and when the tongue and
palate are weak on both sides the panel adds that speech is limited by that weakness —
dysarthria or anarthria, not aphasia (S133). `test/head.test.ts` checks both; one side of the
pons does not trigger it.

**D101 — What the P17 mutation run showed.** 97.1% of sourced mutants are killed (5,097 of
5,247), 96.7% of all, and the new place has no survivor: all 10 of its mutants are killed.

### Reviewer questions

**R46** — C52: in locked-in syndrome from a basilar occlusion, should the model show sensation
as lost, intact, or unsettled?

**R47** — C53: should the model's locked-in place take the medial longitudinal fasciculus or the
gaze centre, so that medial gaze is lost too?

## P18 — both occipital lobes

The analysis written before any P18 code is `docs/P18-analysis.md`; S135–S137 were read for it
on 2026-09-24. Run against the P17 engine first, the frozen forward case **passed**: it lesions
the calcarine banks of both sides by name, and those parts already existed. The examination
failed (`top is visual_left … (4 conflicts)`, `unexplained is true`): no candidate took both
occipital lobes.

### Source conflicts and limits

**C55 — The top of the basilar is not a place.** The phase was planned as the top-of-the-basilar
syndrome. S135 describes infarction of the rostral brainstem and the hemispheres fed by the
distal basilar artery; S136, in 96 patients, says the symptoms "vary depending on the length and
position of the clot", found no infarct on first imaging in 49%, and both occipital lobes
infarcted in 2. Its defining findings — reduced consciousness, hallucinations, memory, the
pupils — are not in this model. No fixed set of parts could be sourced, so the model offers only
both occipital lobes, named for the posterior cerebral arteries and not taught as the basilar.

**C56 — Cortical blindness with the centre kept.** S137 defines cortical blindness as loss of
vision, then says central vision "remains intact" in the majority of cases because the occipital
pole has a second supply, and that complete destruction of V1 by stroke is "extremely rare". The
model shows the common, incomplete form: the periphery lost on both sides, the centre kept. The
place is T3.

### Decisions

**D102 — P18 is both occipital lobes, on purpose.** As in P15 (D91), the phase was cut to what
the sources support rather than widened to what the plan named.

**D103 — A visual part is midline only when every place holding it is.** The engine counted a
part as midline — lesioned on both sides from either — when any midline place held it. That was
safe while the chiasm was the only midline place. The calcarine banks now sit in a midline place
(both PCAs) and in one-sided ones, and the old rule would have made every one-sided occipital
lesion two-sided. `placeRegions` now takes both sides itself for a midline place, as
`territoryRegions` already did for the brain (P11). The one-sided occipital cases and
examinations of P8 pass unchanged.

**D104 — A family for both visual pathways.** A midline visual place was always the chiasm, so
its family was `visual_chiasm`. Both PCAs get their own family, `visual_both`, so the ranking
never calls them the chiasm.

**D105 — What the P18 mutation run showed.** 97.1% of sourced mutants are killed (5,100 of
5,250), 96.7% of all, and the new place has no survivor: all 3 of its mutants are killed.

### Reviewer questions

**R48** — C56: should the model also offer complete cortical blindness, the poles included, even
though S137 calls it extremely rare after stroke?

**R49** — C55: is there a source that gives the top-of-the-basilar syndrome a fixed set of
findings firm enough to teach as a place?

## P19 — the deep and superficial fibular nerves

The analysis written before any P19 code is `docs/P19-analysis.md`; S138–S139 were read for it
on 2026-09-24. The three frozen cases and both examinations were run against the P18 engine
first and all failed: each case on its new claims (the deep branch's foot drop, weak tibialis
anterior and toe extensor and numb first web; the superficial branch's weak eversion and numb
dorsum and lateral leg; the tunnel's numb first web), and each examination found no place at
the branch. For the tunnel's picture the P18 engine ranked a small central cord lesion first
with no conflict; the new place now ranks above it.

### Source conflicts and limits

**C57 — The common fibular nerve's roots.** S138: "The common peroneal nerve comprises fibers
from spinal nerves L4 through S1". S139, and S76 since P7: L4 to S2. The model keeps L4–S2 and
draws both branches with it; no finding in the leg depends on S2.

**C58 — Toe extension in the anterior tarsal tunnel.** S139 gives "in some cases, weakness of
toe extension". That is the short extensors on the foot, supplied below the ankle, which the
model does not test. Its great-toe extensor is extensor hallucis longus, supplied in the leg, so
it stays strong in the tunnel. The examination tests the first web alone.

### Decisions

**D106 — The branches carry the muscles and the skin.** Tibialis anterior, the great-toe
extensor and the first web moved from the common fibular nerve to the deep branch; fibularis,
the lateral leg and the dorsum of the foot to the superficial. A common fibular lesion reaches
them through the branches, as a sciatic lesion reaches the tibial muscles. The P7 common
fibular case and examination pass unchanged. The sural share of the lateral foot stays on the
common fibular nerve.

**D107 — The first web is past the tunnel.** Its supply is the deep branch after both of its
places (`after: 2`), so a lesion high in the leg and one in the tunnel both take it. The
anterior-compartment muscles are after the first place only.

**D108 — Two tests changed because the anatomy did.** The drawn pulse to tibialis anterior now
passes the deep fibular place as well (`test/plexus-geometry.test.ts`), and the leg has 13
places a side instead of 10 (`test/reverse.test.ts`). Both were recomputed, not loosened.

**D109 — What the P19 mutation runs showed.** The first run killed 97.2% of sourced mutants
(5,239 of 5,391) and left two P19 survivors: moving the sural share of the lateral foot from the
common fibular nerve onto either branch changed nothing any case looked at. The three branch
cases now assert the lateral foot intact (the sural nerve forms from the tibial and common
fibular nerves above the branches, S138, S87). Applied directly, each of the two mutants now
fails two assertions. The second run killed 5,241 of 5,391 (97.2%). The survivors in the rows
P19 touched are exactly those left after P18, all pre-dating this phase. All mutants of the two
new nerves are killed (24 and 23).

### Reviewer questions

**R50** — C58: should the model add the short toe extensors on the foot, so that the anterior
tarsal tunnel can show weakness as well as numbness?

## P20 — the tarsal tunnel

The analysis written before any P20 code is `docs/P20-analysis.md`; S140–S141 were read for it
on 2026-09-24. The frozen case and the examination were run against the P19 engine first and
both failed: the sole came back intact, and the examination found no place at the ankle.

### Source conflicts and limits

**C59 — The heel.** S141: "the sparing of sensation over the heel", because the calcaneal branch
leaves above the tunnel. S140: in about 25% the heel's nerve comes from the lateral plantar nerve
or runs outside the retinaculum. The model has one plantar patch and no heel, so it shows
neither.

**C60 — Weakness in the tunnel.** S140 gives weakness of the intrinsic foot muscles as a late
finding. They are not in the model, which shows the tunnel as purely sensory.

**C61 — The sole has no roots.** No source read gives the sole's roots (P7), so a root lesion
from L4 to S3 never conflicts with a numb sole. For a numb sole alone, several root and cord
candidates stay without conflict, and the ranking among them rests on the prior and the pattern
of what else is normal, not on a finding that rules them out.

### Decisions

**D110 — The tibial nerve gets a second place.** The tarsal tunnel is below the branches to the
calf and to the sural nerve and above the plantar nerves, so the sole moved to after both places
(`after: 2`), and the gastrocnemius, tibialis posterior and the sural share stay after the first.
The P7 tibial case passes unchanged.

**D111 — The examination was amended after its first run, and why.** As first written, the
tarsal-tunnel examination looked at the left foot only. Against the P20 engine it ranked both S2
roots first and the tunnel second, both with no conflict (C61). "The right sole normal" was then
added — the comparison a bedside examination makes — and the tunnel now ranks first, narrowly:
posterior 0.039 against 0.029 for both S2 roots, with no conflict for either. This is recorded as
a change made after seeing the engine's answer. The examination still fails against the P19
engine, which has no place at the ankle.

**D112 — What the P20 mutation run showed.** 97.2% of sourced mutants are killed (5,242 of
5,392). All 24 mutants of the tibial nerve row, which now holds both places, are killed. The
limb rows' survivors are exactly those left after P19; the three in the sole's row are
mutations of its unsourced roots (C61, R51) and predate this phase.

### Reviewer questions

**R51** — C61: is there a source that gives the sole of the foot its roots (S1, or S1–S2), so that
a root lesion can be told from the tarsal tunnel by the sole alone?

## P21 — the transcortical aphasias

The analysis written before any P21 code is `docs/P21-analysis.md`; S142 was read for it, and
S103 re-read, on 2026-09-24. Run against the P20 engine first, the two left-sided cases failed
on their one new claim each (non-fluent speech; impaired comprehension), and both examinations
failed: no candidate explained a language deficit with repetition kept. The two right-sided
cases **passed** against P20, because the nondominant border zones produce nothing either way;
they are guards against a border zone ever being read outside the dominant hemisphere.

### Source conflicts and limits

**C62 — The course of border-zone aphasia.** S142: patients "initially presented with mixed
TCA", which then evolved toward the motor or sensory form by the site of the infarct. Its
abstract gives no times, so the model shows the settled form at every timepoint and the frozen
cases assert it only after a month.

**C63 — Mixed transcortical aphasia is not a place.** S103 describes it; no source read gives it
a site of its own. The panel names it when both border zones are damaged, and the reverse engine
offers no candidate for it.

### Decisions

**D113 — Two border zones join fluency and comprehension, never repetition.** The anterior
border zone is a second part on the fluency facet and the posterior border zone a second part on
the comprehension facet. The repetition facet still lists Broca area, Wernicke area and the
inferior parietal lobule alone. This is the transcortical aphasias' definition in the model's
own terms: the lesion isolates the language loop and leaves it working (S103).

**D114 — The panel names three more aphasias.** Non-fluent with repetition kept is transcortical
motor; fluent, not understanding, repeating is transcortical sensory; both, repeating, is mixed
(S103). Anomic aphasia keeps all three facets, so the model cannot tell it from no aphasia and
still gives it no name.

**D115 — One explanation's wording changed, and the test with it.** The working for a spared
language facet names every part it depends on. Fluency now depends on Broca area and the
anterior border zone, so it reads "the left inferior frontal gyrus and anterior border zone,
which this depends on, are intact". `test/reverse.test.ts` pinned the one-part wording and was
updated to the two-part wording; it asserts the same thing.

**D116 — What the P21 mutation run showed.** 97.3% of sourced mutants are killed (5,504 of
5,654), 96.9% of all, and no P21 row has a survivor: all 90 mutants each of the fluency and
comprehension rows, all 135 of the repetition row (among them every mutant that would put a
border zone into repetition), and all 7 of each new place.

### Reviewer questions

**R52** — C62: how long does border-zone aphasia usually stay mixed before it settles into the
motor or the sensory form?

## P22 — anosognosia and apraxia, audited and not built

The analysis is `docs/P22-analysis.md`; S143–S146 were read for it on 2026-09-25. No engine row,
frozen case or examination changed.

### Source conflicts and limits

**C64 — Anosognosia is not a right-parietal sign.** S143 says it most often follows right
parietal damage. S144, pooling the literature, finds it "equally frequent" after frontal,
parietal or temporal damage and after subcortical lesions. S145 finds the insula decisive early,
and the sign itself transient: 32% at three days, 18% at a week and 5% at six months, in
right-hemisphere strokes with hemiplegia.

**C65 — Apraxia is not one place.** S146: ideomotor apraxia after left premotor, supplementary
motor, inferior parietal or callosal injury — three of the four not parts of this model — and
limb apraxia in about 51% of left-hemisphere strokes.

### Decisions

**D117 — Neither is given a place.** A place in this model predicts its findings. For both signs
the sources give several sites and an occurrence of a half or less, so a place would either say
"uncertain" (and localize nothing) or say "present" (and be wrong most of the time). As in P15
(D91) and P18 (D102), the phase is cut to what the sources support: the language panel now
explains why the two are not localized, with the numbers and S144–S146, in place of "not
modelled".

**D118 — Panel notes cite only registered sources.** A note cites sources by id in its text, and
nothing checked them. `test/panel-drivers.test.ts` now fails on a note citing an unregistered id,
and checks that the language note carries P22's explanation. It was falsified by citing an
unregistered id in a note (the test names it) before being kept.

### Reviewer questions

**R53** — C64: is there a lesion site after which anosognosia for hemiplegia is common enough, and
lasting enough, to teach as a localizing sign?

## P23 — the saddle and the pudendal nerve

The analysis written before any P23 code is `docs/P23-analysis.md`; S22, S09 and S21 were re-read
for it on 2026-09-25. Chosen by the user over three other options. Run against the P22 engine
first, the frozen case failed (the perineum did not exist) and so did the examination (no nerve
among the leaders).

### Source conflicts and limits

**C66 — The saddle's segments.** No source read gives the saddle segments (R5). S22 gives the
skin under it a nerve, the pudendal, from S2–S4, and the anal verge the S5 dermatome. The drawn
span stays S3–S5, because six frozen cases and examinations name it; the test now also reads the
perineum patch, so S2 reaches it through the nerve. The patch is T3.

**C67 — The sphincters.** S22 gives pudendal injury fecal and urinary incontinence. The model's
bladder finding is the reflex bladder of a cord lesion, with no sphincter, so a pudendal lesion
leaves it normal; nothing asserts it.

**C68 — The pudendal nerve against one sacral root.** With the tests this model has, a lesion of
one left sacral root also numbs the left saddle and leaves the leg normal. The examination
expects both among the two leading groups, not the nerve alone.

### Decisions

**D119 — The saddle reads its span and the perineum.** A skin patch can name a multi-segment
test it answers to (`landmarkSpan`); the saddle's sensory test is abnormal when its S3–S5 span or
the perineum is. The perineum has no test of its own, as the dorsum of the foot has none apart from
L5 (D30). `test/panel-drivers.test.ts` checks that the drawn saddle span and the patch agree.

**D120 — Every ranking the redesign could move was checked.** Before any P23 code,
`scripts/top-snapshot.ts` recorded the best-ranked group of every frozen examination at each of
its timepoints (68 lines). The same script after P23 is compared line by line below (D121).

**D121 — No earlier ranking moved.** After P23, and again after D123, the best-ranked group of
every one of the 68 earlier examination-timepoints is the same as before any P23 code. For the new
examination the leader is a left S4–S5 root (posterior 0.059) and the pudendal nerve is second
(0.037), both with no conflict — what C68 expected.

**D123 — The bulbocavernosus reflex is left unsettled after a pudendal lesion.** *(Replaced by D132 once R4 was answered.)* The first P23
engine's suggested next test for the pudendal examination was the bulbocavernosus reflex, as if it
would separate a sacral root (reflex lost) from the pudendal nerve (reflex kept). That was false
teaching: the model routed the reflex through the cord only, while S22 gives the pudendal nerve
both the sensation and the bulbospongiosus muscle its arc uses. No source read names the reflex
(R4), so a new row, `plexus.reflex-nerves`, sends the reflex through the pudendal nerve and a cut
there leaves a normal reflex unsettled rather than lost. The engine no longer offers the reflex as
a test that separates the two, and no ranking moved (D121).

**D124 — The drawn saddle read the old way; found in the browser.** The body map drew the saddle
dot from its S3–S5 span alone, so for a pudendal lesion it showed "intact" while the examination
read "abnormal". The dot now reads the span and the perineum, as the test does. A new test in
`test/svg.test.ts` checks the pudendal lesion's two saddle dots (left lost, right intact); it fails
with the drawing fix stashed and passes with it.

**D122 — Two counts recomputed.** The pudendal nerve adds three drawn fibre paths (S2, S3, S4)
to the perineum (`test/plexus-geometry.test.ts`) and one place a side
(`test/reverse.test.ts`).

**D125 — What the P23 mutation run showed.** 97.4% of sourced mutants are killed (5,593 of
5,745), 96.6% of all; the pudendal nerve's 7 mutants are all killed. Four mutants of the
perineum's roots (S2–S4) survived, because no case cut a single sacral root and looked at the
perineum; three single-root cases were added (S2 and S4 reduce it, S1 spares it), and each of the
four, applied directly, now fails two to four assertions. The full run, which took about an hour
with P23's examinations, was not repeated for them. The 20 mutants of `plexus.reflex-nerves`
survive and are left: the row is unsourced (R4), and freezing its behaviour as an expectation
would pin a claim no source makes. Two mutants of the sacral plexus's roots that survived P21's run
are now killed by the pudendal nerve's cases.

### Reviewer questions

**R54** — C66: which segments should the saddle be taught as — S3–S5, or S2–S5 as the pudendal
nerve's roots and the anal verge together suggest?

## P24 — the lateral geniculate nucleus

The analysis written before any P24 code is `docs/P24-analysis.md`; S147 was read for it, and S91
and S137 re-read, on 2026-09-25. Run against the P23 engine first, the frozen case failed (the
engine refused `lgn` as an unknown part). The examination **passed** against P23, because it
accepts the whole occipital cortex in the lead (C70); it guards "not the optic tract" rather than
testing new behaviour.

### Source conflicts and limits

**C69 — Partial lesions of the nucleus.** S147 gives quadrantanopias as well as hemianopias, and
cites sector-shaped and incongruous defects from one choroidal artery or the other. The field
here has four quadrants and a centre per eye; the model shows only the whole nucleus.

**C70 — The nucleus and the whole occipital cortex look alike here.** Both give a complete
homonymous hemianopia, centre included, with no pupillary defect. Congruity would separate them,
and the model does not show congruity (C26).

### Decisions

**D126 — The nucleus is a part with no pupillary defect.** Each visual part already declares its
field and its pupil effect (P8), so the nucleus is data only: the opposite half-field with the
centre, and `rapd: 'none'`, because the pupil's fibres leave the tract just before it (S137) for
the pretectal nuclei (S91).

**D127 — One P8 expectation was true only because the nucleus was missing.** The
`reverse-occipital-cortex` examination expected the whole occipital cortex alone in the lead for
a complete hemianopia with normal pupils. Its reasoning — normal pupils exclude the tract, a lost
centre excludes a spared pole — never excluded the nucleus, which gives the same (S147, S137). It
now expects the occipital cortex or the nucleus. The snapshot of every examination's leader
(`scripts/top-snapshot.ts`) shows this is the only one of the 69 earlier leaders that moved.

**D128 — One count recomputed.** The nucleus is a seventh one-sided visual place
(`test/vision.test.ts`).

**D129 — The visual parts' fields had never been mutated.** P24's first mutation run gave the
lateral geniculate part no mutants at all: the mutator had no pools for a visual part's `eye`,
`field`, `quadrants`, `centre` and `rapd`, so since P8 none of them — including the nucleus's "no
pupillary defect", the fact this phase rests on — had been tested. Pools were added. Of the 108
visual-part mutants, 94 fail the forward cases at once; the nucleus's pupil mutants among them.
Of the 14 that did not:

- **equivalent by construction (8):** a centre of `with` and of `only` behave alike (the
  difference lies in `quadrants`), for five parts; the chiasm is always lesioned on both sides, so
  its `eye` makes no difference; and its `rapd` of `same` or `opposite` ends unsettled through the
  both-sides rule, as `open` does;
- **real, now pinned (3):** a calcarine bank's quadrant (each bank alone had no case) and the
  chiasm's pupil when set to `none`. Three cases were added to `geniculate.ts`: below the fissure
  a superior quadrantanopia, above it an inferior one (S93), and at the chiasm a defect possible
  but not certain (S95, re-read, 2026-04-30). Applied directly, each mutant now fails two
  assertions;
- **real, left open (3):** the occipital pole's own `quadrants`. No case lesions the pole alone,
  and S137's wording for a pole lesion — a hemianopia "involving the contralateral half of
  macular vision" — does not settle the periphery, so no case was invented.

The full run afterwards: 97.3% of sourced mutants killed (5,687 of 5,846), 96.5% of all, with the
visual parts now counted. Their survivors are exactly the eight equivalent and the three pole
mutants listed above; every mutant of the nucleus's pupil and field is killed.

S95, re-read, also states the fact P24 rests on — "just before fibers reach the lateral
geniculate body …, a few fibers (pupillary reflex) branch off to the pretectum" — and is now a
source of the nucleus's row.

### Reviewer questions

**R55** — C69: should the field chart be refined enough to show the nucleus's sector-shaped
defects, from the anterior and the lateral posterior choroidal arteries?

## Reviewer questions answered from sources

Asked on 2026-09-25 which of the 55 open questions could be answered, the questions were split in
two. Most ask a clinician for a teaching judgement — "should the model…", "is it better taught
as…" — and are left for one. The rest ask for a source the model lacked; five of those were
answered, each by a source stating the answer verbatim, read that day (S82 and S95 re-read,
S148–S151 new). Where the answer agreed with the model the row only gained its source; where it
did not, the model changed, with the new expectation run red against the committed code first.
The best-ranked group of every one of the 70 examination-timepoints is the same before and after.

**D130 — What was not answered, and why.** A question is closed here only by a source that states
the answer. Judgement questions (R1, R3, R29, R31–R40, R42–R50, R53–R55 among them) stay with a
clinician. Source questions searched for without a verbatim answer stay open: the saddle's
segments (R5, R54), the bladder pathway's place (R7), the neck and trunk boundaries (R20), the
tongue's corticobulbar fibres (R25), the sole's roots (R51) and others.

**D131 — R30: equal damage to both sides gives no relative defect.** S95, re-read (2026-04-30),
calls the defect "a hallmark sign of unilateral or asymmetric visual pathway dysfunction" and says
in glaucoma it "is observed only when glaucomatous damage is asymmetrically severe". The model had
left both pupils unsettled when both optic nerves are equally cut (D61, `vision.rapd-symmetry`,
pending); it now reports no defect, and the row is sourced. The unit test that pinned the old
answer (`test/vision.test.ts`) failed against the committed code before it was changed. The
chiasm, whose defect S95 says "may" follow, stays unsettled (C27); two of D129's "equivalent"
chiasm mutants now differ and should be killed.

**D132 — R4: the bulbocavernosus reflex is the pudendal nerve and S2–S4.** S148: the reflex
evaluates "the integrity of the S2-S4 sacral segment of the spinal cord, including afferent input
from the penis or clitoris and efferent output to the bulbocavernosus muscle or anal sphincter".
S149: it "reflects the conduction function of pudendal afferent nerve, pudendal efferent nerve and
S2-4 reflex arc". Both reflex rows are now sourced and T1, and a pudendal lesion abolishes the
reflex, as a nerve lesion abolishes a tendon reflex through its muscle. This replaces P23's D123,
which left the reflex unsettled only because no source had been read. The pudendal case now
asserts the reflex lost on its side and normal on the other (A28); against the committed code it
came back unsettled. A sacral root abolishes it too, so it still does not separate the nerve from
the root (C68), and the engine does not offer it as if it did.

**D133 — R41: a second source for the trochlear crossing.** S150, a 2025 systematic review: the
nerve "is unique among cranial nerves (CNs) in that it completely decussates and exits dorsally",
and "innervates the contralateral superior oblique muscle". With S120 the row is T1, and C46 — one
source for the crossing — is resolved. No behaviour changed.

**D134 — R6: the plantar reflex's segments.** S151: the stimulus reaches "the S1 region of the
spine"; with corticospinal damage "nociceptive input spreads beyond S1 anterior horn cells. This
leads to the L5/L4 anterior horn cells firing". The model's rule — corticospinal interruption
rostral to L5, the S1 arc intact — is what that describes, so the row is sourced and unchanged.

**D136 — What the mutation run showed.** 97.2% of sourced mutants killed (5,714 of 5,879) — the
denominator grew because five rows now count as sourced. Among them, six survivors nothing had
pinned while the rows were unsourced: the pupils' symmetry (2) and the bulbocavernosus reflex's
segments (4). Four cases in `answered.ts` pin them (A29); applied directly, each of the six now
fails. Two more — the Babinski threshold moved to L4 or to S1 — are left: S151 names "the L5/L4
anterior horn cells" and does not settle the exact level, so no case was invented. The two chiasm
pupil mutants D131 said would change are now killed. All 20 mutants of the pudendal reflex row are
killed.

**D135 — R2: one root reduces sensation.** S82 (now archived by StatPearls): after one root
"decreased sensation is often noted along specific dermatomes". With S21's overlap, the row that
reports a single root as reduced, not lost, is sourced and unchanged.

## P25 — muscle roots from their own anatomy articles

The analysis is `docs/P25-analysis.md`; S152–S154 were read for it on 2026-09-25. The three new
frozen cases (`answered.ts`, A30) failed against the committed code first, each on its one new
claim.

### Decisions

**D137 — The triceps and brachioradialis take their roots from their own articles.** The
triceps keeps C7 certain and gains C6 and C8 as disputed (S152: "root C6, C7, and C8"); the
brachioradialis becomes C5–C6 certain with C7 disputed (S153: most of its input "from C5 and C6",
contributions "from the C5 to C7 spinal roots"). This answers R14 and R18. R12 was already answered
by A9, which made C8 a disputed root of the interossei. R28 is partly answered: S154 confirms the
adductors' supply as the obturator nerve's L2–L4, which the model already uses; no source read
says which root carries adduction, so the adductors keep no certain root. S152 also gives the
triceps reflex as "C6 and C7, predominately C7" — the teaching C2 said no source gave; C2 now has
a source on each side and stays open on the reflex's row.

**D138 — A disputed root that is also certain is one root.** The triceps is the first row whose
disputed span (C6–C8) contains its certain root (C7). Four places read a row's roots by joining
its two spans, which would have counted C7 twice — and the working would have said "the sources
disagree whether C6–C7–C8 serves it". A shared helper, `disputedSegments`, reads a disputed span
less its certain roots, and every such place uses it. The drawing already de-duplicated.

**D139 — Seven composed assertions amended, none stated.** See `docs/P25-analysis.md` §4 and A30.
The drawn fibre paths rise from 91 to 94 (the triceps +2, the brachioradialis +1;
`test/plexus-geometry.test.ts`). The best-ranked group of all 70 examination-timepoints is unchanged.

**D140 — What the P25 mutation run showed.** 97.3% of sourced mutants killed (5,730 of 5,887).
In the rows P25 touched, three survivors of the previous run are gone (the brachioradialis's old
C5 and C6 spans) and one is new — the brachioradialis's disputed C7 widened to C6–C7 — which is
equivalent by construction: C6 is already certain, and D138 counts a certain root once. The
triceps's myotome mutants and the reflex-span mutants survived before P25 as well.
