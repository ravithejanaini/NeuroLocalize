# P22 — Anosognosia and apraxia: analysis, and why neither was built

Written before any P22 code. Every fact below was read, verbatim, on 2026-09-25: S143 through the
NCBI Bookshelf, S146 as open full text through Europe PMC, and S144 and S145 as abstracts only,
through Europe PMC. Search-engine summaries were used only to find the pages; one of them said
anosognosia "manifests" after a right parietal lesion, which is S143's own simplification and is
checked against S144 and S145 below.

| Id | Source |
|---|---|
| S143 | StatPearls — Anosognosia (Acharya, Sánchez-Manso; 2023-04-24) |
| S144 | Pia, Neppi-Modona, Ricci, Berti — The anatomy of anosognosia for hemiplegia: a meta-analysis (Cortex, 2004) — **abstract only** |
| S145 | Vocat, Staub, Stroppini, Vuilleumier — Anosognosia for hemiplegia: a clinical-anatomical prospective study (Brain, 2010) — **abstract only** |
| S146 | Park — Apraxia: Review and Update (J Clin Neurol, 2017, PMC5653618) |

## 1. Why this phase

The language panel has listed apraxia and anosognosia as "not modelled" since P10. With Gerstmann
syndrome (P16) from the dominant parietal lobe and neglect (P10) from the nondominant one, these
two looked like the last parietal findings — anosognosia on the right, apraxia on the left.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Anosognosia, the simple view | "Most often, it precipitates in the setting of structural damage, from ischemic strokes, in the right parietal cortex." | S143 |
| …and its qualification | "anosognosia can occur with temporoparietal, thalamic, or basal ganglia lesions" | S143 |
| How often | "In stroke patients with hemiparesis, the incidence of anosognosia is 10% to 18%." | S143 |
| Where, pooled | "It seems to be equally frequent when the damage is confined to frontal, parietal or temporal cortical structures, and may also emerge as a consequence of subcortical lesions." | S144 |
| Where, combined | "the probability of occurrence of anosognosia is highest when the lesion involves parietal and frontal structures in combination" | S144 |
| When | "frequent in the hyperacute phase (32%), but reduced by almost half 1 week later (18%) and only rarely seen at 6 months (5%)" — in 58 right-hemisphere strokes with significant left motor deficit | S145 |
| Where, early | "damage to the insula (particularly its anterior part) and adjacent subcortical structures was determinant for anosognosia for hemiplegia in the hyperacute period" | S145 |
| Apraxia, where | "ideomotor apraxia has been found to occur in left hemispheric stroke patients with injury to the premotor cortex, supplementary motor cortex, inferior parietal lobe or corpus callosum" | S146 |
| Apraxia, how often | "the relative frequency of limb apraxia has been reported to be approximately 51% in patients with left hemispheric stroke" | S146 |

## 3. The audit, and the decision

Every place in this model predicts its findings: a lesion there gives the sign, or the model says
"uncertain" and names the conflict. For both candidates the sources defeat that:

- **Anosognosia** follows frontal, parietal, temporal, insular and subcortical damage about
  equally (S144, S145). It occurs in a minority even of right-hemisphere strokes with hemiplegia —
  a third at three days, a twentieth at six months (S145). S143's "right parietal" is the common
  simplification those studies correct. Wiring it to the right inferior parietal lobule would teach
  exactly that simplification.
- **Apraxia** follows damage to four left-hemisphere sites, three of which — the premotor and
  supplementary motor cortex and the corpus callosum — the model does not have, and it is found in
  about half of left-hemisphere strokes (S146). Wiring it to the inferior parietal lobule would say
  it is always there and nowhere else.

A model that can only say "uncertain" for a sign adds no localizing value, and a model that says
"present" is wrong most of the time. So **neither is built**. As in P15 (D91) and P18 (D102), the
phase is cut to what the sources support — here, the explanation. The language panel now says why
the two are not localized, with the numbers, instead of only "not modelled".

## 4. Conflicts and limits, recorded rather than resolved

- **C64 — Anosognosia is not a right-parietal sign.** S143 against S144 and S145, as above.
- **C65 — Apraxia is not one place.** S146, as above.

## 5. How P22 is accepted

1. The language panel's note explains why neither is localized, citing S144–S146; a test checks
   that it does.
2. No frozen case, examination or engine row changes. `npm run verify` passes.
3. A browser check that the note shows.
