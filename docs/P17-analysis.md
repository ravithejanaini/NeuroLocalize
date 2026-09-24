# P17 — Locked-in syndrome: analysis before building

Written before any P17 code or expectation. Every fact below was read, verbatim, on 2026-09-24,
from the source itself: S132 and S134 through the NCBI Bookshelf, S133 on PubMed Central.
Search-engine summaries were used only to find the pages.

| Id | Source |
|---|---|
| S132 | StatPearls — Locked-in Syndrome (Das, Anosike, Asuncion; 2023-07-24) |
| S133 | Smith, Delargy — Locked-in syndrome (BMJ 2005;330:406, PMC549115) |
| S134 | StatPearls — Anatomy, Head and Neck: Basilar Artery (Adigun, Reddy, Sevensma; 2023-08-08) |
| S49, S51, S54, S61 | cited since P5 for the ventral pons, the facial nerve, the plantar response and the abducens |

## 1. Why this phase

The basilar artery was the first candidate left after P16. Its classic syndrome is a lesion of
**both** sides of the ventral pons: the patient is awake but cannot move or speak, and answers
with vertical eye movements. Until now the model had the ventral pons on one side only
(Millard-Gubler, P5). The syndrome teaches three things at once: a bilateral brainstem lesion,
a patient who has no aphasia even though they cannot speak, and the eye movements that are left.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Definition | "quadriplegia and anarthria with preservation of consciousness" | S133 |
| Site | "caused by an insult to the ventral pons, most commonly an infarct, haemorrhage, or trauma" | S133 |
| Artery | "occlusion at the proximal and middle part of the basilar artery, sparing the tegmentum of the pons" | S134 |
| What is left | "These patients cannot move or talk, but consciousness is evident because of vertical eye movement" | S134 |
| Eyes | "Although medial and lateral gaze palsies are typical, patients usually retain upper eyelid control and vertical eye movement because of sparing of the mid-brain tectum" | S133 |
| Eyes | "impairment of the horizontal eye movement and sparing of the vertical eye movements" | S132 |
| Sixth nerve | "Cranial nerves 4 and cranial nerve 6 … may be affected in a ventral pons lesion." | S132 |
| Face, tongue, palate | "bilateral sensory deficit to the face, bilateral peripheral facial palsy, absent gag reflex, weak tongue movement, and neck weakness" | S132 |
| Anarthria | "due to bilateral facio-glosso-pharyngo-laryngeal paralysis" | S133 |
| Limbs | "Complete quadriplegia is reported in almost all patients" | S132 |
| Plantar | "A positive Babinski reflex indicates corticospinal damage, usually located in ventral structures of the brainstem." | S132 |
| Retained | "Retention of consciousness, language comprehension, orientation"; "Retention of hearing" | S132 |
| Sensation | "whole-body sensory loss"; "proprioception, light touch, temperature, pain sensation is greatly decreased if not completely diminished" | S132 |
| Sensation, against | the one-sided ventral pons syndrome leaves sensation unaffected — as the P5 case cites S49; **paraphrase, not re-read for P17** | S49 (P5) |
| Elsewhere | "extensive bilateral destruction of corticobulbar and corticospinal tracts in the cerebral peduncles may also be responsible" | S133 |

## 3. Design

**One new place: the ventral pons on both sides.** It holds the same parts as the one-sided
ventral pons of P5 — the basis with its corticospinal and corticobulbar fibres, and the facial
and abducens fascicles — and it is **midline**: one candidate that takes both sides, as the
dorsal midbrain (P13) and the vermis (P11) are. No new part, sign or route is needed. Every
finding comes from routes that already exist:

- quadriplegia with a Babinski sign on both sides (the corticospinal tract in each basis);
- the whole face weak on both sides (both facial fascicles — S132's "bilateral peripheral
  facial palsy");
- the tongue and palate weak on both sides (the corticobulbar fibres in each basis — the
  anarthria and dysphagia of S132, S133);
- neither eye abducts (both abducens fascicles);
- upgaze intact and hearing intact (the midbrain tectum and the cochlear nuclei are not in the
  lesion — S133, S132);
- comprehension intact and no aphasia: anarthria is not aphasia (S132).

The place is T3, because the sources disagree about sensation (C52).

## 4. Conflicts and limits, recorded rather than resolved

- **C52 — Sensation.** S132 gives "whole-body sensory loss". S134 says the lesion spares the
  pontine tegmentum, where the model — and S49 for the one-sided syndrome — has the medial
  lemniscus and spinothalamic tract. The model follows its anatomy and leaves sensation intact.
  The frozen case asserts nothing about sensation, and the panel says why.
- **C53 — Horizontal gaze.** S133 says medial and lateral gaze palsies are typical. The model
  gives only the lateral half: both abducens fascicles are in the lesion, but the gaze centre
  and the medial longitudinal fasciculus are in the tegmentum that S134 says is spared.
  Adduction and the horizontal gaze palsy are not asserted.
- **C54 — Two places, one syndrome.** S133: bilateral damage to the cerebral peduncles can also
  cause it. The model offers only the pons, and the examination's note says so.

## 5. Deliberately not modelled in P17

Consciousness, blinking and breathing. The incomplete and total forms (S132, S133). Facial
sensation on both sides, which S132 names but which is the same tegmentum conflict (C52). The
neck. The top-of-the-basilar syndrome (S134): it needs both thalami and both occipital lobes, and
is left for its own phase.

## 6. How P17 is accepted

1. A frozen case for the ventral pons on both sides, run red against the P16 engine before any
   P17 code.
2. An examination: quadriplegia, the whole face weak on both sides, tongue weak, upgaze and
   comprehension intact — the answer is the midline ventral pons, and one lesion explains it all.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P17 row with a survivor.
5. A browser check.
