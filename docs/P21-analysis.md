# P21 — The transcortical aphasias: analysis before building

Written before any P21 code or expectation. Every fact below was read, verbatim, on 2026-09-24:
S103 through the NCBI Bookshelf (it has been cited since P10 and was re-read for this phase; its
current version is dated 2024-10-29), and S142's abstract only, through Europe PMC. Search-engine
summaries were used only to find the pages.

| Id | Source |
|---|---|
| S103 | StatPearls — Aphasia (Le, Lui, Lui; 2024-10-29) — re-read |
| S142 | Cauquil-Michon, Flamand-Roze, Denier — Borderzone strokes and transcortical aphasia (Curr Neurol Neurosci Rep, 2011) — **abstract only** |
| S100–S102, S107 | cited since P10 for Broca, Wernicke and conduction aphasia and the dominant hemisphere |

## 1. Why this phase

P10 gave the model three bedside facets of language — fluency, comprehension, repetition — and
the aphasias they name. Its panel says the transcortical aphasias, which **keep repetition**,
"get no name" because the model could not produce them. They are the other half of the classic
table, and the one sign that tells them apart — repetition — is already examined.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Motor | "This syndrome features nonfluent speech with intact comprehension and exceptionally good repetition, often resulting in echolalia and perseveration." | S103 |
| Motor, site | "the lesion is located around the Broca area while sparing and isolating it" | S103 |
| Motor, artery | "arises from a watershed infarction between the anterior cerebral artery and MCAs, sometimes occurring with occlusion of the dominant internal carotid artery" | S103 |
| Sensory | "This syndrome features fluent speech and impaired comprehension, but patients demonstrate exceptionally good repetition" | S103 |
| Sensory, site | "the lesion is located around the Wernicke area while sparing and isolating it" | S103 |
| Sensory, artery | "a watershed infarction between the dominant middle and posterior cerebral" arteries | S103 |
| Mixed | "nonfluent speech with impaired comprehension but exceptionally good repetition" | S103 |
| Cause | "Transcortical aphasia often results from watershed infarctions caused by acute cerebral hypoxemia, such as severe hypotension or cardiac arrest." | S103 |
| Border zones | "aphasia is of transcortical (TCA) type, characterized by the preservation of repetition. TCA can be of motor, sensory, or mixed type depending on whether expression, understanding, or both are impaired" | S142 |
| Course | "BZI patients initially presented with mixed TCA. Aphasia specifically evolved according to the stroke location, toward motor or sensory TCA in patients with respectively anterior or posterior BZI." | S142 |

## 3. Design

**Two new parts of the dominant cortex, each a place of its own:**

- the **anterior border zone**, between the anterior and middle cerebral arteries, around and
  above Broca area. It joins the **fluency** facet only;
- the **posterior border zone**, between the middle and posterior cerebral arteries, around
  Wernicke area. It joins the **comprehension** facet only.

Neither joins the **repetition** facet, which stays Broca area, Wernicke area and the inferior
parietal lobule (P10). That is the whole teaching point: the lesion isolates the peri-Sylvian
language loop and leaves it working, so the patient repeats. As for every language finding,
only the dominant hemisphere counts (D68).

The panel names the three transcortical aphasias from the three facets, as it names the others
from S103's table: non-fluent with repetition kept is transcortical motor; fluent, not
understanding, repeating is transcortical sensory; both, repeating, is mixed. Mixed is only a
name here. The model produces it when both border zones are lesioned, but offers no place for it
(C63).

## 4. Conflicts and limits, recorded rather than resolved

- **C62 — The course.** S142: border-zone patients "initially presented with mixed TCA" and then
  evolved toward the motor or the sensory form. S142's abstract gives no times, so the model
  shows the settled form at every timepoint, and the frozen cases assert it only after a month.
- **C63 — Mixed transcortical aphasia is not a place.** S103 describes the syndrome but, in what
  was read, gives it no site of its own. The model names it when both border zones are damaged
  and offers no candidate for it.

## 5. Deliberately not modelled in P21

Echolalia, perseveration and semantic paraphasia; anomia and anomic aphasia (which the model's
three facets cannot show); subcortical aphasia; the deep border zone; limb weakness from the
anterior border zone, which no source read here states.

## 6. How P21 is accepted

1. Frozen cases: each border zone on the left and on the right, run against the P20 engine
   before any P21 code.
2. Examinations: non-fluent speech with comprehension and repetition kept → the left anterior
   border zone; fluent speech, comprehension lost, repetition kept → the left posterior border
   zone. Neither is Broca or Wernicke area, both of which lose repetition.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P21 row with a survivor.
5. A browser check.
