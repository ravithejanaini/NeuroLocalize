# P9 — Eye movements: analysis before building

Written before any P9 code or expectation. Every fact below was read, verbatim, from the
source named beside it on 2026-09-18. Nothing here is from memory.

| Id | Source |
|---|---|
| S61 | StatPearls — Neuroanatomy, Abducens Nucleus (Somani, Adesina; 2022-10-10) — already cited since P5 |
| S70 | Cornblath — Diplopia Due to Ocular Motor Cranial Neuropathies (Continuum, 2014) — already cited since the audit |
| S98 | StatPearls — Internuclear Ophthalmoplegia (Feroze, Wang; 2023-06-26) |
| S99 | Xue et al. — One-and-a-half syndrome with its spectrum disorders (Quant Imaging Med Surg, 2017) |

## 1. What P9 must teach

| Question | The finding that decides it | Source |
|---|---|---|
| A weak-looking eye: nerve or brainstem? | A sixth nerve lesion fails to abduct one eye; an abducens **nucleus** lesion is a conjugate gaze palsy toward that side | S61 |
| Why does one eye fail to adduct with normal convergence? | The medial longitudinal fasciculus carries the abducens interneurons to the other side's medial rectus: a lesion loses adduction on its own side | S98, S61 |
| Which eye has the nystagmus? | The abducting eye, on the side opposite the lesion | S98 |
| Gaze palsy and INO together | One-and-a-half syndrome: the abducens nucleus (or PPRF) and the MLF on one side, leaving only the other eye's abduction | S61, S99 |
| A third nerve palsy that is not the nerve | An oculomotor **nucleus** lesion gives bilateral ptosis or none, and weakens the other eye's superior rectus | S70 |

## 2. Design

Four new signs, each recorded on one side, beside the five the model already has:

| Sign | Means | Source |
|---|---|---|
| `adduction_weakness` | that eye does not adduct (the INO side) | S98 |
| `abducting_nystagmus` | nystagmus of that eye as it abducts | S98 |
| `ptosis` | the lid droops on that side | S70 |
| `elevation_weakness` | that eye's superior rectus is weak | S70 |

Three new parts, each in the brainstem the sources place it in:

| Part | Where | What a lesion does | Source |
|---|---|---|---|
| `mlf` | pons and midbrain, near the midline | adduction fails on its own side; the other eye has abducting nystagmus | S98 |
| `pprf` | pons, beside the abducens nucleus | conjugate gaze palsy toward its own side, so that eye does not abduct | S61, S99 |
| `oculomotor_nucleus` | midbrain | a third nerve palsy on its own side, the other eye's superior rectus weak, and ptosis on both sides or neither | S70 |

The abducens nucleus keeps what P5 gave it: a gaze palsy toward its own side (S61), with the
abducens fascicle giving only that eye's abduction weakness. One-and-a-half syndrome is not a
new rule: it is the abducens nucleus (or the PPRF) and the MLF on the same side, and the model
derives it (S61, S99).

## 3. Conflicts and limits, recorded rather than resolved

- **C29 — Ptosis in a nuclear third nerve lesion.** S70: a nuclear lesion gives "either
  bilateral ptosis or no ptosis", because one central caudal nucleus serves both lids. The
  model reports ptosis unsettled on both sides for that lesion rather than choosing.
- **C30 — Convergence in internuclear ophthalmoplegia.** S98 says some patients keep normal
  convergence. Convergence is not examined in the model, so nothing is asserted about it.

Not modelled in P9: vertical gaze and the dorsal midbrain (Parinaud) syndrome; the
vestibulo-ocular reflex and skew deviation; WEBINO and bilateral internuclear ophthalmoplegia
as a named place; eight-and-a-half syndrome (it is this plus the facial nerve the model
already has, so a lesion can produce it, but there is no preset for it); saccades and pursuit
as separate systems; the third nerve's pupil.

## 4. How P9 is accepted

1. Frozen expectations for the MLF, the PPRF, one-and-a-half syndrome and the oculomotor
   nucleus, and examinations that separate a sixth nerve palsy from a gaze palsy, and a gaze
   palsy from one-and-a-half — written from these tables and failing against the P8 engine.
2. Every earlier frozen case still passes, including the P5 dorsal pons case.
3. `npm run verify` passes; the mutation run covers every new row and the sourced score stays
   at or above 94%.
4. A browser check covers the new examination controls and presets.
