# P29 — The cranial nerves after they leave the brainstem

Written on 2026-09-26 before any P29 code. Sources were read in full in the browser
(NCBI Bookshelf and PMC) or from Europe PMC's full text; every quotation below is verbatim.

## Why

Every eye-movement, face and tongue lesion the model has so far is inside the brainstem, so an
isolated palsy can only be explained there. The commonest lesions in practice are outside it:
S62 says "most ischemic cranial nerve III palsies arise from peripheral nerve involvement", and
the most common cause of a facial palsy is Bell palsy (S163). The teaching point is the one the
sources make: a nerve lesion gives its own sign **alone**, while a brainstem lesion brings its
neighbours — the long tracts, a gaze palsy, the other eye.

## What each source states

**Oculomotor nerve** (S62, S70). S62: "From the midbrain, nerve fibers traverse the
interpeduncular fossa and course between the posterior cerebral artery and the superior
cerebellar artery to reach the cavernous sinus." "Along this segment, the oculomotor nerve lies
lateral to the posterior communicating artery." "Within the orbit, the smaller superior division
innervates the superior rectus and the levator palpebrae superioris." S70: "The third nerve passes
by the posterior communicating artery, edge of the tentorium, and uncus before entering the upper
lateral wall of the cavernous sinus." S70 contrasts the nucleus: "Nuclear lesions in the third
nerve will produce either bilateral ptosis or no ptosis" — the nerve carries one side's levator
and superior rectus only.

**Trochlear nerve** (S120, S70). S120: the nerves are "decussating before their exit in the dorsal
midbrain. The two nerves run on contralateral sides, extend laterally and then anteriorly around
the pons", enter the cavernous sinus and continue "to the superior oblique muscle"; "a unilateral
trochlear nuclear lesion affects the contralateral nerve and superior oblique muscle, while a
fascicular lesion affects the ipsilateral nerve and muscle." S70: "The nerve then runs around the
cerebral peduncle and enters the lateral wall of the cavernous sinus just below the third nerve,
entering the orbit through the superior orbital fissure and innervating the superior oblique
muscle." "Isolated nuclear lesions of the fourth nerve are rare and give rise to contralateral
palsies caused by the decussation."

**Abducens nerve** (S61, S70). S61: "The abducens nerve fibers then course rostrally along the
surface of the clivus within the subarachnoid space anterior to the basilar pons, pass under the
petroclival ligament through the Dorello canal, and enter the cavernous sinus." "Paresis of the
abducens nerve produces an isolated ipsilateral abduction deficit." "lesions that damage the
abducens nucleus produce a conjugate gaze palsy toward the side of the lesion rather than just an
ipsilateral abduction weakness that would occur from isolated damage to the abducens nerve." S70:
"A fascicular lesion produces an isolated abduction deficit." "The sixth nerve enters the orbit
through the superior orbital fissure and innervates the lateral rectus muscle."

**Facial nerve** (S51, S163). S51: "Lesions that involve the facial motor nucleus or the
infranuclear portion of the facial nerve result in complete paralysis of all the facial muscles on
the ipsilateral side." Past the chorda tympani the only finding it lists is "Ipsilateral facial
plegia". S163: "Like Bell palsy though, a brainstem stroke will cause hemifacial weakness that does
not preserve forehead movement"; "In contrast, a cortical stroke will typically leave forehead
movement intact on the affected side due to bilateral upper motor neuron contributions to the
facial nucleus." "The mastoid segment courses downwards to the stylomastoid foramen, where the
nerve exits the temporal bone".

**Hypoglossal nerve** (S63, S164). S63: "The nerve splits into 2 before exiting the medulla and
passes through the hypoglossal canal"; "When 1 of the 2 nerves is damaged, the tongue, when
protruded, deviates towards the damaged nerve"; "Infranuclear and nuclear lesions cause weakness of
the tongue but additionally cause ipsilateral atrophy." S164: "In supranuclear stroke, tongue
deviation typically occurs contralateral to the cerebral lesion, whereas ICAD-related hypoglossal
neuropathy produces an ipsilateral lower motor neuron deficit."

## Design

- Five new parts, one per nerve, each placed at the level it leaves: the oculomotor and trochlear
  nerves at the midbrain, the abducens and facial nerves at the pons, the hypoglossal nerve at the
  medulla. Each is also a lesion place of its own.
- Each is added to the routes its nucleus already feeds: the third nerve to the oculomotor, lid,
  elevation and adduction routes; the sixth to abduction; the seventh to the facial nucleus route;
  the twelfth to the hypoglossal route. None is added to a gaze route or a crossed route, which is
  exactly what the sources contrast.
- The fourth nerve needs a route of its own: past the decussation it serves **its own** eye, where
  the nucleus serves the other. The superior oblique sign reads both routes.
- The places rank in the nerve families (`nerve_left`, `nerve_right`), beside the limb nerves.

## Expected consequences for existing cases

- An isolated superior oblique palsy fits the other side's nucleus and the same side's nerve
  equally; nothing the model examines separates them (head tilt is not modelled; S70's nuclear
  companions — an internuclear ophthalmoplegia, Horner syndrome — are absent in an isolated
  palsy). The frozen `reverse-trochlear-nucleus` expectation, written when the model had no nerve,
  must be amended to say both lead. S70 says the nuclear lesion is the rare one; the model has no
  frequencies and does not rank by them.
- Every other earlier examination is expected to keep its leader; `scripts/top-snapshot.ts` is
  diffed to prove it.

## Conflicts and limits

- **C74 — The pupil.** A compressive third nerve palsy involves the pupil and an ischaemic one often
  spares it (S62, S70). The model has no pupil sign for the third nerve (C45); still not modelled.
- **C75 — The facial nerve's branches.** S51 lists taste, tears, hyperacusis and saliva by segment
  of the facial canal. The model has face strength only, so the facial nerve place is the lesion
  at the stylomastoid foramen, where S51 lists "Ipsilateral facial plegia" alone.
- **C76 — The cavernous sinus.** S70: "Cavernous sinus lesions can produce third nerve palsies in
  combination with fourth, fifth (trigeminal) (V1, V2), and/or sixth nerve palsies", and "The
  combination of a unilateral Horner syndrome and sixth nerve palsy also localizes to the cavernous
  sinus". Drawing it needs sensation by trigeminal division and the third-order sympathetic fibres,
  neither of which the model has. Deferred to P30.
- **C44 (the trochlear fascicle)** is answered for the nerve: past the decussation both S120 and S70
  send it to the superior oblique of its own side.
