# P16 — Gaze deviation and Gerstmann syndrome: analysis before building

Written before any P16 code or expectation. Every fact below was read, verbatim, on
2026-09-24. PubMed returned only a cookie page for S131's abstract; the same abstract was read
from Europe PMC's open REST service. Nothing here is from a search-engine summary; one figure
met only in a summary — that gaze deviation occurs in 20–30% of hemispheric strokes — is not
used.

| Id | Source |
|---|---|
| S128 | StatPearls — Gerstmann Syndrome (Altabakhi, Sun; 2026-06-19) |
| S129 | StatPearls — Neuroanatomy, Cerebral Cortex (Javed, Reddy, Lui; 2023-07-25) |
| S130 | Olaciregui Dague et al. — Gaze Palsy as a Manifestation of Todd's Phenomenon (2020, PMC7287959) |
| S131 | Steiner, Melamed — Conjugate eye deviation after acute hemispheric stroke (Annals of Neurology, 1984) — **abstract only** |
| S104, S107 | cited since P10, for the large MCA stroke and the dominant parietal lobe |

## 1. Why this phase

Two classic hemisphere signs the model cannot show. The eyes deviate **toward** a destructive
hemisphere lesion — and that deviation fades within days, so a gaze palsy that lasts points to
the pons instead. And the dominant parietal lobe, which P10 gave only conduction aphasia, gives
Gerstmann syndrome.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Frontal eye field | "The frontal eye fields are the central saccadic eye movement control area, damage to this area may cause eye deviation towards the side of the lesion." | S129 |
| Seizure | a seizure arising from the frontal eye fields makes "the eyes to look away from the lesion" | S129 |
| Where | "The frontal eye fields (FEF) are located in Brodmann's area 8 in both hemispheres." | S130 |
| Against the brainstem | "Contrary to the impairments due to lesions of the frontal eye field (FEF), brainstem lesions that lead to horizontal gaze palsy cause deficits of eye movements ipsilateral to the lesion." | S130 |
| Stimulation | "Cortical electric stimulation of the FEF provokes contralateral conjugated eye movement" | S130 |
| Large MCA stroke | presents with "unilateral flaccidity, forced gaze deviation, visual field cuts, and, if in the dominant hemisphere, speech deficits" | S104 |
| Course | "conjugate eye deviation toward the lesioned side was usually of brief duration"; "It subsided within 48 hours in 24 patients (57%)"; it "lasted no longer than 5 days in 38 patients (90%)" | S131 |
| Course, the exception | "remarkably prolonged, lasting from 13 to more than 43 days" in patients with previous contralateral frontal lobe damage | S131 |
| Gerstmann | "Digit agnosia, acalculia, agraphia, and left-right disorientation"; "the inferior parietal lobule, in the dominant hemisphere … the angular gyrus" | S128 |
| Gerstmann | "Damage to the dominant parietal cortex (usually left) leads to Gerstmann's syndrome." | S129 |
| Gerstmann | "Damage to the dominant parietal lobe, usually the left hemisphere, present with agraphia, acalculia, finger agnosia, and left-right disorientation." | S107 |
| Incomplete | "Patients commonly present with 2 to 3 symptoms of Gerstmann syndrome; however, the complete tetrad is rare." | S128 |
| With aphasia | "Gerstmann syndrome often co-occurs with other signs and symptoms, such as apraxia, aphasia, and alexia." | S128 |

## 3. Design

**Gaze deviation is the existing gaze palsy, from a second source.** A frontal eye field
lesion impairs gaze to the **opposite** side (S130), which is the eyes deviating toward the
lesion (S129). The model already has "gaze palsy toward this side" from the pons; a new route
from `frontal_eye_field` (cortex) adds to it, serving the **contralateral** side.

**It depends on time — a first for a brain finding.** From S131: present in the first day;
unsettled at one to three days and at four days to a month (57% gone by 48 hours, 90% by five
days); absent after a month. The course is a data row, so a reviewer can change it without
code. The pontine gaze palsy keeps no course: it persists.

**Gerstmann syndrome is one finding about the patient**, like language: present when the
dominant inferior parietal lobule is damaged (S128, S129, S107). It means some or all of the
four signs — the complete tetrad is rare (S128). The inferior parietal lobule already gives
conduction aphasia (P10); S128 says the two often co-occur.

**Places.** A new `frontal_eye_field` place, either side. The whole-MCA place (P10) gains the
frontal eye field: S104 names forced gaze deviation in large MCA strokes.

## 4. Conflicts and limits, recorded rather than resolved

- **C49 — "May cause".** S129 says frontal eye field damage *may* cause deviation, and S131's
  figures are for patients who had it. The model gives it in the first day as present — the
  sign the lesion is taught by — and the row is T2.
- **C50 — The prolonged exception.** S131: deviation lasting 13 to over 43 days after earlier
  contralateral frontal damage. The model has no history, so it says absent after a month and
  records the exception here.
- **C51 — The tetrad.** Complete in few patients (S128). The finding means "Gerstmann signs,
  some or all", and never claims all four.

## 5. Deliberately not modelled in P16

The oculocephalic (doll's-eye) reflex, which S130 says the pontine palsy abolishes and which
overcomes a cortical one; the seizure (irritative) direction; the four Gerstmann signs as
separate findings; alexia, apraxia and anosognosia; the frontal eye field in the superior
division alone (only the whole MCA takes it).

## 6. How P16 is accepted

1. A frozen case for the frontal eye field, evaluated at four timepoints, and Gerstmann
   assertions on the P10 parietal cases — run red against the P15 engine before any P16 code.
2. Examinations: a first-day gaze palsy with a hemisphere's signs points to the hemisphere; a
   gaze palsy still present after a month points to the pons.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P16 row with a survivor.
5. A browser check at two timepoints.
