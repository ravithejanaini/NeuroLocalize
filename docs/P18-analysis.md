# P18 — Both occipital lobes: analysis before building

Written before any P18 code or expectation. Every fact below was read, verbatim, on 2026-09-24:
S137 through the NCBI Bookshelf, S136 as open full text through Europe PMC, and S135's abstract
only, through Europe PMC. Search-engine summaries were used only to find the pages.

| Id | Source |
|---|---|
| S135 | Caplan — "Top of the basilar" syndrome (Neurology, 1980) — **abstract only** |
| S136 | Lieschke et al. — Symptoms, Imaging Features, Treatment Decisions, and Outcomes of Patients with Top of the Basilar Artery Syndrome (Neurocritical Care, 2025, PMC12321678) |
| S137 | StatPearls — Cortical Blindness (Sarkar, Tripathy; 2023-08-25) |
| S134 | cited since P17: the basilar artery and its top-of-the-basilar syndrome |

## 1. Why this phase, and why it was cut

The plan named the **top of the basilar** as the next place. Read against the sources, it is
not one place:

- S135: infarction "of rostral brainstem and cerebral hemispheral regions fed by the distal
  basilar artery", with "visual, oculomotor, and behavioral abnormalities, often without
  significant motor dysfunction".
- S136, 96 patients: "Symptoms vary depending on the length and position of the clot";
  hemiparesis in 54%; "46 patients (49%) did not show any infarcts in the initial imaging";
  "13 patients (13.7%) had unilateral occipital infarcts, and 2 (2.1%) had bioccipital
  infarcts".
- Its defining features — "somnolence, vivid hallucinations and dreamlike behavior" (S135),
  "sudden loss of consciousness" (S136), memory loss and the pupils — are findings this model
  does not have.

A top-of-the-basilar place would need a fixed set of parts that no source gives, and it would
show mostly what the syndrome is *not* defined by. So P18 builds the one piece of it that the
sources describe as a lesion with stated findings: **both occipital lobes**, the territory of
both posterior cerebral arteries. It is not taught as the top of the basilar. S136's figure of
2 in 95 is why (C55).

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Definition | "loss of vision without any ophthalmological causes and with normal pupillary light reflexes due to bilateral lesions of the striate cortex in the occipital lobes" | S137 |
| Pupils | "There is no relative afferent pupil defect (RAPD) in cortical blindness." | S137 |
| Eyes | "pupillary light reflex remains intact in cortical blindness, so do the extraocular movements" | S137 |
| Usually incomplete | "Incomplete cortical blindness is much more common than a complete one." | S137 |
| The centre | "In the majority of cases, the central vision, including the foveal representation, remains intact. This is secondary to the blood supply of the occipital pole." | S137 |
| Complete loss rare | "This dual blood supply protects V1 making stroke causing the complete destruction of V1 is extremely rare." | S137 |
| PCA stroke | "contralateral congruous homonymous hemianopia with macular sparing (because the tip of the occipital cortex responsible for the macular vision is supplied by MCA which is spared in PCA stroke)" | S137 |
| Cause | stroke and "Cardiac embolism" are listed; the top-of-the-basilar syndrome is "most often due to an embolus" | S137, S135 |
| Anton | "a person cannot see but always denies the blindness" | S137 |

## 3. Design

**One new place in the visual pathway: both posterior cerebral arteries.** It holds the same
parts as the one-sided PCA place of P8 — both calcarine banks, with the occipital pole spared —
and it is **midline**: one candidate that takes both sides, as the chiasm is. Its findings come
from what already exists:

- the peripheral field lost in both eyes, on both sides;
- the centre kept on both sides, because the pole is spared (S137: "in the majority of cases");
- no afferent pupillary defect, and no eye-movement sign (S137).

What the model shows is incomplete cortical blindness — the common kind — with the centre kept.
It does not add a both-sides version of the whole occipital cortex, pole included, because S137
calls complete destruction "extremely rare".

**One engine change.** A visual part counted as midline — lesioned on both sides from either
side — when *any* midline place contained it. That was true only of the chiasm. Once a midline
place holds the calcarine banks, the old rule would make every one-sided occipital lesion
two-sided. The rule becomes: a part is midline when every place that holds it is midline. The
chiasm still is; the calcarine banks are not.

## 4. Conflicts and limits, recorded rather than resolved

- **C55 — The top of the basilar is not a place.** S135 and S136 describe a syndrome whose
  parts vary with the clot, and only 2 of 95 patients in S136 had both occipital lobes
  infarcted. The model does not offer it as a place; the new place is named for the posterior
  cerebral arteries, not the basilar.
- **C56 — "Loss of vision" with the centre kept.** S137 defines cortical blindness as loss of
  vision, yet says the centre is usually kept. The model shows the common incomplete form. A
  patient with no vision at all is not produced.

## 5. Deliberately not modelled in P18

Consciousness, hallucinations, memory, behaviour and the pupils' size (S135, S136). Anton
syndrome, blindsight and the Riddoch phenomenon (S137). The thalami and the midbrain of the top
of the basilar. Complete cortical blindness with the pole destroyed.

## 6. How P18 is accepted

1. A frozen case for both posterior cerebral arteries, run against the P17 engine before any
   P18 code.
2. An examination: the peripheral field lost in both eyes on both sides, the centre and the
   pupils normal — the answer is both occipital lobes, not the chiasm or the optic nerves.
3. Every earlier frozen case still passes; in particular a one-sided occipital lesion stays
   one-sided.
4. `npm run verify` passes; the mutation run leaves no P18 row with a survivor.
5. A browser check.
