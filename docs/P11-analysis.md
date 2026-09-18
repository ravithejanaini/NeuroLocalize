# P11 — The cerebellum: analysis before building

Written before any P11 code or expectation. Every fact below was read, verbatim, from the
source named beside it on 2026-09-18. Nothing here is from memory or a search summary.

| Id | Source |
|---|---|
| S109 | StatPearls — Ataxia (Hafiz, De Jesus; 2023-08-23) |
| S110 | StatPearls — Neuroanatomy, Cerebellum (Jimsheleishvili, Dididze; 2023-07-24) |
| S111 | StatPearls — Cerebellar Dysfunction (Ataullah, Singla, Naqvi; 2024-05-06) |
| S112 | StatPearls — Neuroanatomy, Cerebellar Dysfunction (Unverdi, Alsayouri; 2023-07-25) |

## 1. Why this phase

Until now ataxia came only from the cerebellar peduncles in the brainstem (S47, S65). The
cerebellum itself was not in the model, so it could not teach the bedside distinction every
student is examined on: a hemisphere lesion makes the limbs on its own side clumsy, while a
midline lesion makes the trunk unsteady and spares the limbs. The same distinction sharpens
the one the model already teaches about the Romberg test.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Vermis | "Lesions in the vermis cause truncal, gait ataxia with sparing of the limbs." | S109 |
| Vermis | "In vermis syndrome, muscle incoordination involves the head and trunk. Patients cannot maintain a straight posture and may fall." | S110 |
| Vermis controls | "The cortex of the vermis coordinates the movements of the trunk, including the neck, shoulders, thorax, abdomen, and hips." | S110 |
| Hemisphere | "Lesions in the cerebellar hemisphere cause limb ataxia." | S109 |
| Same side | "Each cerebellar hemisphere controls the same side of the body, thus if damaged the symptoms will occur ipsilaterally." | S110 |
| Hemisphere | "incoordination of muscles of the limbs unilateral to the hemisphere lesion. Dysarthria and nystagmus are also common findings." | S110 |
| Midline against hemisphere | "any midline cerebellar lesions manifest as imbalance, while hemispheric cerebellar lesions result mainly in incoordination." | S111 |
| Truncal ataxia | "demonstrable in sitting or standing" | S111 |
| Romberg | "A positive Romberg test or pseudoathetosis … are consistent with an impaired sensory pathway rather than cerebellar dysfunction." | S111 |
| Limb ataxia | "The degree and locations of ataxia depend on the somatotopic projection of the body parts of the involved cerebellar hemisphere." | S112 |
| Arteries | PICA supplies "the cerebellar nuclei, inferior surface of the vermis, and the undersurface area of the cerebellar hemisphere"; the SCA the superior vermis and superior cortex; the AICA the anterior inferior cerebellum, the flocculus and the middle peduncle | S110, S112 |

## 3. Design

**A new level, `cerebellum`**, behind the pons and medulla, with two parts on each side:
`cerebellar_hemisphere` and `vermis`. The vermis is a midline structure; the model keeps a
half on each side so that one lesion can take both, as the chiasm does in P8.

**Signs.**

| Sign | From | Side | Source |
|---|---|---|---|
| limb ataxia (exists since P5) | the cerebellar hemisphere, as well as the peduncles | the lesion's own side | S109, S110 |
| truncal ataxia (new) | the vermis, either half | the patient, not a side | S109, S110 |

**The Romberg test.** The model already reads it as unreadable when limb ataxia or vertigo is
present (S67, A9). Truncal ataxia joins them: a patient unsteady sitting or standing with the
eyes open cannot show what closing them adds (S111, S67).

**Places**, each with a frozen case:

| Place | Takes | Gives |
|---|---|---|
| `cerebellar_hemisphere` (either side) | that hemisphere | limb ataxia on the same side; strength, sensation and face normal |
| `vermis` (midline) | both halves of the vermis | truncal ataxia with the limbs spared |

New families, because neither place is brainstem or hemisphere of the cerebrum:
`cerebellum_left`, `cerebellum_right`, `cerebellum_midline`.

## 4. Conflicts and limits, recorded rather than resolved

- **C35 — Truncal ataxia from a hemisphere lesion.** S111: hemispheric lesions give *mainly*
  incoordination, which admits some imbalance; S109 gives truncal ataxia to the vermis. The
  model reports truncal ataxia **unsettled** after a hemisphere lesion, never absent.
- **C36 — Nystagmus from the cerebellum.** S110 calls dysarthria and nystagmus *common* after a
  hemisphere lesion. The model's existing "vertigo and nystagmus" finding comes from the
  vestibular nuclei (P5) and is not extended here, so no frozen case asserts it either way for
  a cerebellar lesion. Dysarthria is not modelled.

## 5. Deliberately not modelled in P11

The arterial territories as places (PICA, AICA, SCA) — S110 gives what each supplies but no
source read describes the syndrome of each, and the lateral medullary place (PICA) keeps its
P5 form; the flocculonodular lobe and vestibulocerebellum as a separate place; dysarthria;
intention tremor, dysmetria and dysdiadochokinesia as separate findings (they are what limb
ataxia means at the bedside); the deep nuclei; the superior cerebellar peduncle; hypotonia and pendular reflexes — the model leaves reflexes where the cord puts them, so no
frozen case asserts reflexes for a cerebellar lesion.

Found in the audit of this analysis, before any code: the first draft did not say what the
model shows for reflexes after a cerebellar lesion, which would have left a normal reflex on
screen with nothing saying it was a limit rather than a claim.

## 6. How P11 is accepted

1. Frozen cases for both places, written from §2 and run red against the P10 engine before
   any P11 engine code.
2. Examinations that separate a cerebellar hemisphere from the brainstem, the vermis from the
   hemisphere, and cerebellar from sensory unsteadiness.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P11 row with a survivor, and no pool is
   missing for a new kind of value.
5. A browser check of the presets, the examination control and the findings panel.
