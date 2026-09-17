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
lesion.

**R13** — Confirm D33: a lower trunk lesion, distal to where the T1 sympathetic fibres
leave for the chain, spares the oculosympathetic pathway.

**R14** — The triceps is modelled on C7 alone (S19, S31, S32). Its C6 and C8 contributions
are not given by any source read.

**R15** — Abductor pollicis brevis is modelled on C8 and T1, each alone sufficient to weaken
it. The sources say only that C8–T1 injury produces an ape sign (S33) and that the median
nerve supplies the muscle (S38, S41).

**R16** — Guyon's canal is one lesion site that takes both the deep motor branch and the
little finger's sensation (S38's zone 1). Zones 2 and 3 are not modelled.

**R17** — The ulnar wrist flexor is modelled as supplied below the elbow site, so a cubital
tunnel lesion weakens it. It is widely taught that the FCU branch can arise above the
tunnel and be spared; no source read says so either way.

**R18** — The brachioradialis takes its roots from its reflex (C6 certain, C5 disputed, C3):
no source read gives the muscle's roots directly.

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
leaves adduction uncertain. Which roots should be given, and from which source?

