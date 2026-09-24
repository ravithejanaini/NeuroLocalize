# P14 — The fourth and fifth nerves, and the third nerve's pupil: analysis before building

Written before any P14 code or expectation. Every fact below was read, verbatim, on
2026-09-23 through NCBI's `/sites/books/` path. NCBI's `/books/` path and PMC returned CAPTCHA
pages, and the Europe PMC copies of S70 refused the request; none of those was worked around,
and nothing was taken from a search-engine summary.

| Id | Source |
|---|---|
| S115 | StatPearls — Pontine Infarction (Malla, Jillella) — cited since P12, for the mid-pontine tegmentum |
| S62 | StatPearls — Cranial Nerve III Palsy (Modi, Singh; 2026-02-22) — cited since P5, re-read for the pupil |
| S117 | StatPearls — Pupillary Light Reflex — cited since P13 |
| S120 | StatPearls — Neuroanatomy, Cranial Nerve 4 (Trochlear) (Kim, Motlagh, Naqvi; 2023-07-15) |
| S121 | StatPearls — Neuroanatomy, Trigeminal Reflexes (Ogino, Tadi; 2023-06-05) |
| S122 | StatPearls — Neuroanatomy, Cranial Nerve 5 (Trigeminal) (Huff, Weisbrod, Daly; 2024-04-20) |
| S123 | Walker — Cranial Nerve V: The Trigeminal Nerve, in *Clinical Methods*, 3rd edition (1990) |
| S124 | StatPearls — Trochlear Nerve Palsy (Khanam, Sood; 2024-09-08) |

## 1. Why this phase

The model moves the third and sixth nerves but not the fourth, and it feels the face but does
not open the jaw. The fourth nerve holds the one crossing an examiner always asks about: its
nucleus serves the *other* eye. The jaw is the only motor sign of the fifth nerve a student
checks at the bedside. And the third nerve's pupil was left out of P9 with a promise to look.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Trochlear nucleus | "near the midline along the medial longitudinal fasciculus", at the level of the inferior colliculus | S120 |
| Crossing | "The left and right nerves then travel dorsally surrounded by the periaqueductal gray matter, decussating before their exit in the dorsal midbrain." | S120 |
| Which eye | "A unilateral trochlear nuclear lesion affects the contralateral nerve and superior oblique muscle, while a fascicular lesion affects the ipsilateral nerve and muscle." | S120 |
| The sign | "the eyes will display hypertropia with the affected eye being slightly elevated"; diplopia "vertical or diagonal", "worse with a downward gaze" | S120 |
| The sign | "the hypertropia of the paretic eye increases on the opposite gaze and on tilting the head to the same side" | S124 |
| Motor nucleus | "medial and anterior to the major trigeminal sensory nuclei within the pontine tegmentum's lateral surface"; it supplies "the mastication muscles (masseter, temporalis, pterygoids)" | S122 |
| Motor nucleus | "deep to the lateral rhomboid fossa in the upper division of the pontine tegmentum" | S121 |
| Jaw | "Unintentional jaw deviation toward one side indicates a lesion to the trigeminal nerve nuclei innervating the pterygoid muscle on the affected side." | S121 |
| Jaw | "The mandible upon opening deviates toward the paralyzed side when there is unilateral paralysis of the masticatory muscles." | S123 |
| Principal sensory nucleus | "located lateral to the motor nucleus within the pontine tegmentum's posterolateral surface" | S122 |
| Mid-pontine tegmentum | "ipsilateral facial sensory disturbance and masticator paralysis (trigeminal nuclei) … contralateral hemisensory loss (lateral spinothalamic tract and medial lemniscus); and ipsilateral hemiataxia (superior cerebellar peduncle)" | S115 |
| The pupil | "In compressive cranial nerve III palsy, pupillary involvement manifests as a fixed and dilated pupil" | S62 |
| The pupil | "ischemic processes typically spare pupillary function" | S62 |
| The pupil | the pupillary fibres "are located superficially within the nerve trunk" | S62 |
| The pupil | lesions of "the preganglionic fibers of the oculomotor nerve, can cause ipsilateral mydriasis" | S117 |

## 3. Design

**Three new parts.** `trochlear_nucleus` in the midbrain; `trigeminal_motor` and
`trigeminal_sensory` (the principal sensory nucleus) in the pons.

**Two new signs**, each on one side:

| Sign | Means | From | Side | Source |
|---|---|---|---|---|
| `superior_oblique_weakness` | that eye's superior oblique is weak: it rides high, worse looking down | the trochlear nucleus | the **other** side | S120, S124 |
| `jaw_deviation` | the jaw deviates to this side on opening | the trigeminal motor nucleus | the lesion's side | S121, S122, S123 |

**Facial sensation gains a pontine step.** The principal sensory nucleus joins the spinal
trigeminal nucleus on the ipsilateral route (S122, S115).

**Two new places**, each with a frozen case, each on either side:

| Place | Takes | Gives |
|---|---|---|
| `trochlear_nucleus` | the trochlear nucleus | the opposite superior oblique weak; nothing else |
| `midpontine_tegmentum` | trigeminal motor and principal sensory nuclei, spinothalamic tract, medial lemniscus, cerebellar peduncle | jaw deviating to the lesion's side, facial sensation lost on that side, limb ataxia on that side, pain and position sense lost on the other |

## 4. Conflicts and limits, recorded rather than resolved

- **C44 — The trochlear fascicle.** S120 says a fascicular lesion affects the ipsilateral nerve,
  but the fibres cross inside the midbrain before they exit, so "fascicle" can name either side
  of the crossing. The model has the nucleus only; no case depends on the fascicle.
- **C45 — The third nerve's pupil.** The sources tie the pupil to the *cause* in the nerve
  trunk — dilated when compressed, spared by ischaemia (S62) — and the model has no nerve trunk,
  only midbrain fascicles and nucleus, for which no source read says what the pupil does. The
  pupil stays unmodelled, now for a stated reason rather than a promise (P9).
- **C46 — One source for the crossing.** Only S120 states that the nucleus serves the opposite
  eye; S124 describes the sign but not the nucleus, and S70's copy could not be read. The row is
  T2, and a reviewer question asks for a second source.

## 5. Deliberately not modelled in P14

The trochlear fascicle and nerve outside the brainstem; head tilt as a finding; skew deviation;
bilateral fourth nerve palsy from one dorsal midbrain lesion (S120 says it can happen; the
dorsal midbrain place of P13 is at the superior colliculus and does not take the nucleus); the
jaw jerk; supranuclear control of the trigeminal motor nucleus; the mesencephalic trigeminal
nucleus; the third nerve's pupil (C45).

## 6. How P14 is accepted

1. Frozen cases for both places, run red against the P13 engine before any P14 engine code.
2. Examinations that separate the trochlear nucleus from the oculomotor places, and the
   mid-pontine tegmentum from the AICA and the lateral medulla.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P14 row with a survivor.
5. A browser check of the presets, the two new controls and the findings panel.
