# P24 — The lateral geniculate nucleus: analysis before building

Written before any P24 code or expectation. Every fact below was read, verbatim, on 2026-09-25,
through the NCBI Bookshelf. S91 and S137 were re-read; S91's current version is dated 2026-03-23.
Search-engine summaries were used only to find the pages.

| Id | Source |
|---|---|
| S147 | StatPearls — Neuroanatomy, Nucleus Lateral Geniculate (Covington, Al Khalili; 2023-07-24) |
| S137 | StatPearls — Cortical Blindness (Sarkar, Tripathy; 2023-08-25) — re-read |
| S91 | StatPearls — Neuroanatomy, Visual Pathway (Gupta, Ireland, Omole, Bordoni; 2026-03-23) — re-read |
| S92, S95, S97 | cited since P8 for the hemianopias, the afferent pupillary defect and congruity |

## 1. Why this phase

Since P8 the visual-field panel has said "the lateral geniculate nucleus as a place of its own"
is not modelled. P22's audit expected it to need finer field sectors. It does not, for the one
contrast worth teaching: an optic tract lesion and a lateral geniculate lesion both give a
complete homonymous hemianopia, but only the tract gives an afferent pupillary defect, because
the pupil's fibres leave the tract before it reaches the nucleus.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| The field | lesions of the nucleus "can produce contralateral homonymous hemianopias and quadrantanopias" | S147 |
| The pupil fibres | "Afferent fibers from the pupil leave the tract just anterior to the LGB." | S137 |
| The tract | "Most fibers synapse within the LGN, while collateral projections extend to the superior colliculus, pretectal nuclei, and suprachiasmatic nucleus." | S91 |
| Supply | "The posterior cerebral artery supplies the lateral geniculate nucleus from the lateral posterior choroidal branch and by the internal carotid artery from its anterior choroidal branch." | S147 |
| Incongruity | Gunderson and Hoyt's "incongruous homonymous field defects in two patients with partial lesions of the lateral geniculate nucleus" — named in S147's references, not read | S147 |

## 3. Design

**One new part and one new place: the lateral geniculate nucleus**, one side. The part carries
the opposite half-field of both eyes, centre included — as the tract does (S147) — and gives **no
afferent pupillary defect** (S137, S91). No engine change: each visual part already declares its
field and its pupil effect (P8).

What it teaches, in the model's terms:

- **tract against nucleus:** the same complete hemianopia; the pupillary defect opposite the
  lesion says tract, its absence says nucleus or beyond;
- **nucleus against the whole occipital cortex:** the same field and no defect — the model cannot
  separate them, and says so (C70).

## 4. Conflicts and limits, recorded rather than resolved

- **C69 — The nucleus's partial lesions.** S147 gives quadrantanopias and, through its references,
  incongruous and sector-shaped defects from one choroidal artery or the other. The model's field
  has four quadrants and a centre per eye; it shows only the whole nucleus.
- **C70 — The nucleus and the occipital cortex look alike here.** Both give a complete homonymous
  hemianopia, centre included, with no pupillary defect. Congruity would separate them (S97), and
  the model does not show congruity (C26).

## 5. How P24 is accepted

1. A frozen case for the left nucleus, run against the P23 engine first.
2. An examination: a complete right hemianopia with no pupillary defect — not the optic tract.
3. Every earlier frozen case and examination still passes; no earlier ranking moves.
4. `npm run verify` passes; the mutation run leaves no P24 row with a survivor.
5. A browser check.
