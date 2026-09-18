# P10 — Language and the dominant hemisphere: analysis before building

Written before any P10 code or expectation. Every fact below was read, verbatim, from the
source named beside it on 2026-09-18. Nothing here is from memory or from a search-engine
summary.

| Id | Source |
|---|---|
| S100 | StatPearls — Broca Aphasia (Acharya, Wroten; 2023-02-13) |
| S101 | StatPearls — Wernicke Aphasia (Lui, Wroten; 2025-11-08) |
| S102 | StatPearls — Conduction Aphasia (Acharya, Lui, Maani; 2024-02-25) |
| S103 | StatPearls — Aphasia (Le, Lui, Lui; 2024-10-29) |
| S104 | StatPearls — Middle Cerebral Artery Stroke (Benjamin, Galuska; 2026-04-12) |
| S105 | StatPearls — Neuroanatomy, Middle Cerebral Artery (Margetis, Sánchez-Manso; 2025-02-13) |
| S106 | StatPearls — Spatial Neglect (Benjamin, Gillespie; 2026-07-05) |
| S107 | StatPearls — Neuroanatomy, Cerebral Hemisphere (Bui, Das; 2023-07-24) |
| S108 | Knecht et al. — Handedness and hemispheric language dominance in healthy humans (Brain, 2000). **Abstract only**: the full text is paywalled and was not read |

## 1. Why this phase

Until now the cortex knew only the homunculus: which body region a lesion weakens or numbs.
It could not say *where in the hemisphere* a lesion is beyond that, and it had no notion of a
dominant hemisphere. Aphasia and neglect are how the bedside answers both questions, and an
inferior-division MCA stroke joins the language findings to the visual field P8 already models.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Broca area | "a region in the inferior frontal lobe of the brain's dominant hemisphere, comprising Brodmann areas 44 and 45" | S100 |
| Broca: fluency | "Broca aphasia is non-fluent aphasia." | S100 |
| Broca: comprehension | "In pure Broca aphasia, comprehension is intact." | S100 |
| Broca: repetition | "The ability to repeat phrases is also impaired." | S100 |
| Broca: company | "can accompany other neurological deficits such as right facial weakness, hemiparesis or hemiplegia" | S100 |
| Wernicke area | "the posterior superior temporal gyrus of the dominant hemisphere" | S101 |
| Wernicke: fluency | "language output is fluent with a normal rate and prosody" | S101 |
| Wernicke: comprehension | "markedly impaired auditory–verbal comprehension" | S101 |
| Wernicke: repetition | "repetition is typically impaired" | S101 |
| Wernicke: weakness | "patients with WA often do not have hemiparesis accompanying the language deficit" | S101 |
| Wernicke: vessel | "most commonly follows acute ischemic stroke involving the inferior division of the middle cerebral artery" | S101 |
| Conduction: lesion | "Any structural lesion in the left superior temporal gyrus, the left supramarginal gyrus, or the left inferior parietal lobe may cause conduction aphasia." | S102 |
| Conduction: triad | "fluent speech and intact comprehension but … unable to repeat" | S103 |
| Global | "nonfluent speech with impaired comprehension and inability to repeat"; "the peri-Sylvian region supplied by the dominant left MCA" | S103 |
| Superior division | "The prefrontal, precentral, and central branches constitute the superior division"; the precentral artery supplies Brodmann 44 and 45, "where the Broca area resides" | S104 |
| Superior division: weakness | "contralateral weakness of the face and upper limb, are common due to motor cortex involvement" | S105 |
| Inferior division | "primarily affect the lateral temporal lobe and parts of the parietal lobe"; the angular artery supplies "the angular and supramarginal gyri" | S105, S104 |
| Inferior division: field | "Contralateral homonymous hemianopia is frequently observed due to the involvement of the visual pathways." | S105 |
| Inferior division: weakness | "Motor deficits are generally absent in isolated inferior division strokes." | S105 |
| Dominance | "The dominant hemisphere, in most individuals, is the left hemisphere." | S107 |
| How often not | right-hemisphere language dominance rises "from 4% in strong right-handers … to 15% in ambidextrous individuals and 27% in strong left-handers" | S108 |
| Neglect | "nondominant, typically left-sided, spatial disorientation following an acute lateralized insult to the right cerebral hemisphere, most often involving the right posterior parietal cortex" | S106 |
| Neglect: nondominant parietal | "Damage to the nondominant parietal lobe, usually the right hemisphere, present with agnosia of the contralateral side of the world" | S107 |
| Neglect after left lesions | persistent at 12 weeks in "approximately 17% of patients with right hemispheric lesions, compared with 5% of patients with left hemispheric lesions" | S106 |

## 3. Design

**Three new cortical parts**, present in both hemispheres (the gyri are bilateral; language is
not): `inferior_frontal` (Broca area when dominant), `superior_temporal` (Wernicke area when
dominant), `inferior_parietal` (supramarginal and angular gyri).

**Language is read from the dominant hemisphere only**, which the model takes to be the left
(S107). The three bedside facets are derived, not named:

| Facet | Impaired when the dominant … is damaged | Source |
|---|---|---|
| fluency | inferior frontal gyrus | S100, S103 |
| comprehension | superior temporal gyrus | S101, S103 |
| repetition | any of the three | S100, S101, S102 |

So a frontal lesion is Broca aphasia, a temporal one Wernicke, a parietal one conduction, and
frontal with temporal is global — none of them named in the code.

**Neglect** is a finding about a side of space. The nondominant (right) inferior parietal lobule
gives neglect of the left side (S106, S107). A lesion of the dominant one leaves right-sided
neglect unsettled (C32).

**Places** (each on either side, each with a frozen case):

| Place | Takes | Left gives | Right gives |
|---|---|---|---|
| `mca_cortex` (amended) — superior division | motor and sensory cortex, face and arm; **and the inferior frontal gyrus** | Broca aphasia with right face and arm weakness | left face and arm weakness; language intact |
| `mca_inferior` — inferior division | superior temporal and inferior parietal cortex, and both optic radiations | Wernicke aphasia with a right hemianopia, no weakness | left neglect with a left hemianopia |
| `mca_whole` — both divisions | all of the above | global aphasia, right face and arm weakness, right hemianopia | left neglect, weakness and hemianopia |
| `broca_area` | inferior frontal gyrus | Broca aphasia alone | nothing the model examines |
| `wernicke_area` | superior temporal gyrus | Wernicke aphasia alone | nothing the model examines |
| `supramarginal` | inferior parietal lobule | conduction aphasia | left neglect |

`mca_cortex` changes: its claim already says it is the superior division (S54, S66), and S104
places Broca area in the superior division's precentral branch. Leaving the inferior frontal
gyrus out would make a left superior-division stroke speak normally.

## 4. Conflicts and limits, recorded rather than resolved

- **C31 — The field of an inferior-division stroke.** S105 says a contralateral homonymous
  hemianopia is *frequently* observed; a lesion confined to the temporal lobe takes only Meyer
  loop and gives a superior quadrantanopia (S97, P8). The model gives the inferior division
  both radiations — the hemianopia S105 describes — and leaves the smaller lesion to the
  Wernicke-area and Meyer-loop places.
- **C32 — Neglect after a left-hemisphere lesion.** Rarer and less lasting than after a right
  one (S106: 5% against 17% at twelve weeks), but not absent. The model reports right-sided
  neglect **unsettled** for a left inferior parietal lesion, never absent.
- **C33 — Neglect outside the parietal lobe.** S106 says *most often* the posterior parietal
  cortex, which admits other sites. The model places neglect in the inferior parietal lobule
  only, so no frozen case asserts that a frontal lesion spares it.

- **C34 — The superior temporal gyrus: Wernicke or conduction?** S101 localises Wernicke
  aphasia to the posterior superior temporal gyrus; S102 says a lesion of the left superior
  temporal gyrus *may* cause conduction aphasia. Both name the same gyrus for different
  aphasias. The model follows S101 for the superior temporal gyrus and places conduction
  aphasia in the inferior parietal lobule, which S102 also names; the comprehension row is
  T3 and cites both.

Found in the audit of this analysis, before any code: the first draft took the superior
temporal gyrus for Wernicke without noticing that S102 names it for conduction aphasia too.

## 5. Deliberately not modelled in P10

Right-hemisphere language dominance (S108: 4–27% by handedness) — the model states the usual
case and says so beside every language finding; the transcortical aphasias (watershed, S103)
and anomic aphasia; Gerstmann syndrome; anosognosia; aprosody; apraxia; forced gaze deviation
in a large MCA stroke; reading and writing; the ACA and PCA cortex beyond what P5 and P8 hold.

## 6. How P10 is accepted

1. Frozen cases for every place on the side that shows it, written from §2 and **run red
   against the P9 engine before any P10 engine code exists** — the order P9 got wrong.
2. Reverse examinations that separate Broca from conduction, conduction from Wernicke,
   Wernicke from global, and left-hemisphere aphasia from right-hemisphere neglect.
3. Every earlier frozen case still passes; `mca-cortex-left` gains its language assertions
   under amendment A14.
4. `npm run verify` passes; the mutation run leaves no P10 row with a survivor and the sourced
   score stays at or above 95%.
5. A browser check of the new examination controls, the presets and the findings panel.
