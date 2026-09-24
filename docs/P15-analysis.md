# P15 — The basal ganglia: analysis before building

Written before any P15 code or expectation. Every fact below was read, verbatim, on
2026-09-24 through NCBI's `/sites/books/` path. Nothing here is from memory or from a
search-engine summary; one claim met only in a summary — that striatal, thalamic and cortical
infarcts also cause hemiballismus — is not used.

| Id | Source |
|---|---|
| S125 | StatPearls — Neuroanatomy, Subthalamic Nucleus (Basinger, Joseph; 2022-10-31) |
| S126 | StatPearls — Neuroanatomy, Basal Ganglia (Young, Reddy, Sonne; 2023-07-24) |
| S127 | StatPearls — Neuroanatomy, Substantia Nigra (Sonne, Reddy, Beato; 2024-09-10) |

## 1. Why this phase, and why it is small

Movement disorders are the one kind of finding the model cannot show at all. The plan was the
basal ganglia as a whole — hemiballismus, parkinsonism, chorea. The sources read support only
one of them as a *focal, localising* sign:

- **Hemiballismus** — two sources put it opposite a subthalamic nucleus lesion (S125, S126),
  and name stroke as its commonest cause (S125).
- **Parkinsonism** — S126 and S127 describe it as "neurodegeneration of the SNpc dopaminergic
  neurons"; S127 names vascular parkinsonism after stroke but gives neither its site nor its
  side. A substantia nigra *place* would need a side no source read gives.
- **Chorea** — S126 ties it to Huntington disease, "neuronal death in the caudate and the
  putamen": a degeneration of both sides, not a place.

So P15 teaches the one that localises, and says plainly why the other two are not places.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Side | "Hemiballismus characteristically causes ballistic flailing movements of an extremity that occurs contralaterally to the injured subthalamic nucleus." | S125 |
| Side | "Commonly, a lesion in the contralateral subthalamic nuclei causes hemiballism." | S126 |
| What it is | "hyperkinetic, involuntary, forceful movements of the ipsilateral arm and leg" — the arm and leg of one side | S126 |
| Cause | "The most common etiology of hemiballismus is stroke." | S125 |
| Not only the STN | "lesions within the basal ganglia that do not involve the subthalamic nucleus can still produce hemiballismus" | S125 |
| Where | "located at the junction of the midbrain and diencephalon"; "medially to the internal capsule, dorsally to the substantia nigra, and ventrally to the thalamus" | S125 |
| Parkinsonism | "a result of neurodegeneration of the SNpc dopaminergic neurons" | S126 |
| Vascular parkinsonism | "When Parkinson disease is the result of a stroke of the central nervous system, it is called vascular parkinsonism and usually develops within one year of a stroke." | S127 |
| Chorea | the Huntington gene "leads to neuronal death in the caudate and the putamen" | S126 |

## 3. Design

**One new part**, `subthalamic`, at the model's diencephalic level (named `thalamus`, which
holds the parts between the midbrain and the capsule): medial to the capsule, below the
thalamus (S125).

**One new sign**, `hemiballismus`, on one side: flinging involuntary movements of that arm and
leg. It comes from the subthalamic nucleus of the **other** side (S125, S126).

**One new place**, `subthalamic_nucleus`, on either side, with a frozen case: hemiballismus of
the opposite limbs, strength and sensation untouched — the corticospinal tract runs in the
capsule lateral to it, and the sensory relays in the thalamus above it.

## 4. Conflicts and limits, recorded rather than resolved

- **C47 — Hemiballismus from elsewhere.** S125: basal ganglia lesions sparing the subthalamic
  nucleus "can still produce" it. The model places it in the subthalamic nucleus only, so the
  examination teaches the classic site, and the finding's note says it is not the only one.
- **C48 — Parkinsonism and chorea are not places.** Both are described as degenerations; no
  source read gives the side of a focal lesion that causes either. Neither is modelled.

## 5. Deliberately not modelled in P15

Parkinsonism, chorea, dystonia and athetosis (C48); the caudate, putamen, globus pallidus and
substantia nigra as places; tremor of any kind; the direct and indirect pathways as routes;
drug-induced movement disorders.

## 6. How P15 is accepted

1. A frozen case for the subthalamic nucleus, run red against the P14 engine before any P15
   engine code.
2. An examination in which one-sided flinging with normal strength and sensation points to the
   opposite subthalamic nucleus.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P15 row with a survivor.
5. A browser check of the preset, the control and the findings panel.
