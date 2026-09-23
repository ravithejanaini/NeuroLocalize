# P13 — Vertical gaze and the pupils: the dorsal midbrain — analysis before building

Written before any P13 code or expectation. Every fact below was read, verbatim, from the
source named beside it on 2026-09-23, through NCBI's `/sites/books/` path. One further claim —
that the midbrain centre for the near reflex lies ventral to the pretectal nucleus — appeared
only in a search-engine summary and in none of the pages read, so it is not used.

| Id | Source |
|---|---|
| S116 | StatPearls — Parinaud Syndrome (Feroze, Patel; 2023-07-31) |
| S117 | StatPearls — Pupillary Light Reflex (Belliveau, Somani, Dossani; 2023-07-25) |
| S118 | StatPearls — Neuroanatomy, Pupillary Light Reflexes and Pathway (Akova, Yoo, Launico; 2025-09-15) |
| S119 | StatPearls — Neuroanatomy, Mesencephalon Midbrain (Caminero, Cascella; 2024-09-10) |

## 1. Why this phase

P9 gave the model horizontal gaze and left vertical gaze and the dorsal midbrain out, saying so.
Parinaud syndrome is the classic lesion that localises by the eyes alone — a pineal tumour or
hydrocephalus pressing on the top of the midbrain — and it is the one place in the model where
the pupils localise without the visual pathway.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Triad | "the triad of upgaze palsy, convergence retraction nystagmus, and pupillary hyporeflexia" | S116 |
| Site | "compression of the rostral midbrain and pretectum at the level of the superior colliculus" | S116 |
| Vertical gaze centres | "the interstitial nuclei of Cajal and the rostral interstitial nucleus of the Medial Longitudinal Fasciculus (riMLF)" | S116 |
| Upgaze | "The characteristic symptom of Parinaud syndrome is limited conjugate upgaze." | S116 |
| Downgaze | "Downgaze is classically preserved, but the reason for this is not entirely explained." | S116 |
| Pupils | "There is poor pupillary constriction to light but preserved constriction with convergence." | S116 |
| Nystagmus | "an irregular, jerky nystagmus, associated with convergence and retraction of both eyes, especially on attempted upgaze" | S116 |
| Lid | "lid retraction in the primary position, which is called the Collier sign" — "in approximately 40% of patients" | S116 |
| Diplopia | "may be caused either by skew deviation or associated fourth nerve palsy" | S116 |
| Pretectum | "Each pretectal area sends bilateral signals to the preganglionic parasympathetic nuclei in the midbrain called Edinger-Westphal nuclei." | S117 |
| Pretectum | the light-reflex fibres of the optic tract "terminate in the pretectal nucleus of the midbrain rather than the LGN of the thalamus" | S118 |
| Light-near dissociation | damage "in the pretectal nucleus produces the Argyll Robertson pupil, characterized by absent or markedly reduced light reflex with preserved constriction to near stimulus, a phenomenon known as light-near dissociation" | S118 |
| Causes | "ischemic lesions, neoplasms of the corpora quadrigemina, pinealomas, hydrocephalus" | S119 |
| Distinguishing sign | "Its distinguishing symptom is a decreased or absent gaze upwards." | S119 |

## 3. Design

**One new part**, `pretectum`, in the midbrain: the pretectal area with the vertical gaze
centres beside it at the level of the superior colliculus (S116). Each side holds half; the
dorsal midbrain is compressed from the midline, so the place takes both, as the vermis does.

**Three new findings, each about both eyes together** (the patient, not a side):

| Finding | From | Source |
|---|---|---|
| `upgaze_palsy` — conjugate upgaze limited | the pretectum, either half | S116, S119 |
| `light_near_dissociation` — poor to light, preserved to near | the pretectum, either half | S116, S118 |
| `convergence_retraction_nystagmus` — on attempted upgaze | the pretectum, either half | S116 |

**One new place**, `dorsal_midbrain`, midline, taking both halves of the pretectum, in a new
family `brainstem_midline`. Nothing else in the midbrain is taken: the third nerve fascicles,
the MLF and the peduncle are not in it.

## 4. Conflicts and limits, recorded rather than resolved

- **C41 — The lid.** S116: Collier sign in about 40%. Not modelled; the case asserts nothing.
- **C42 — Downgaze.** S116: "classically preserved", and the reason "not entirely explained".
  The model has no downgaze finding, so it teaches the preservation in the panel note rather
  than as a computed finding.
- **C43 — One side.** Every source describes compression of the dorsal midbrain, not a one-sided
  lesion. The model reads either half as enough, and offers only the midline place, so no case
  depends on what one half alone would give.

## 5. Deliberately not modelled in P13

Downgaze palsy and the riMLF as a separate place; the Collier sign; skew deviation and the
fourth nerve; the Argyll Robertson pupil as a place (neurosyphilis, not a focal lesion); pupil
size; the third nerve's pupil (P9 left it out and still does); hydrocephalus and the pineal
region as causes.

## 6. How P13 is accepted

1. A frozen case for the dorsal midbrain, run red against the P12 engine before any P13 engine
   code.
2. An examination that separates the dorsal midbrain from the horizontal-gaze places of P9.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P13 row with a survivor.
5. A browser check of the preset, the three examination controls and the findings panel.
