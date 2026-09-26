# P31 — The eighth nerve and the cerebellopontine angle

Written on 2026-09-27 before any P31 code. Sources were read in full in the browser (NCBI
Bookshelf); every quotation below is verbatim.

## Why

Unilateral hearing loss is taught as a localising sign, and the cerebellopontine angle tumour is
its classic cause. The model could lose hearing only at the cochlear nuclei inside the pons (the
AICA, P12), which always brings the facial nucleus, a Horner syndrome and the body's sensory
tracts. A tumour at the angle does not: it takes the eighth nerve first, then the fifth and the
cerebellum, and seldom the seventh.

## What each source states

**The angle** (S169). "Cerebellopontine angle (CPA) is a triangular space in the posterior cranial
fossa that is bounded by the tentorium superiorly, brainstem posteromedially and petrous part of
temporal bone posterolaterally." "The most common presenting symptoms of lesions involving the CPA
include hearing loss, tinnitus, dizziness, vertigo, headaches, and gait dysfunction." "Hearing loss
is mostly unilateral sensorineural and is due to the involvement of the cochlear nerve." "Other
cranial nerve deficits, brainstem compression symptoms, and hydrocephalus can also be seen with
larger tumors compressing these structures."

**The eighth nerve** (S167, S168, S170). S167: "Most individuals with acoustic neuromas present
unilateral hearing loss due to cochlear nerve interruption or impaired blood supply to the nerve."
"Other clinical features include tinnitus, decreased word understanding, vertigo, headaches, and
numbness." S168: "Vestibular schwannomas usually present with decreased hearing, tinnitus, and
imbalance." S170: "Typical manifestations include progressive unilateral SNHL, often with tinnitus
and vertigo."

**The seventh nerve is usually spared** (S167, S168, S170). S168: "Rarely will a patient show facial
nerve palsy." S170: "Facial nerve palsy occurs infrequently in vestibular schwannomas due to the
relative resistance of the facial nerve to chronic compression." S167: "Facial nerve (cranial nerve
VII) symptoms are often minimal or subtle during the early stages, leading to late presentation,
except in the case of very large tumors."

**The fifth nerve and the cerebellum in a larger tumour** (S167, S122). S167: "Trigeminal Nerve
(cranial nerve V) symptoms include paraesthesia in the trigeminal nerve distribution,
tongue-tingling, and corneal reflex impairment." "Cerebellar Compression Cerebellar compression can
occur in cases where there are large acoustic tumors." S122: the trigeminal nerve "travels through
the prepontine and cerebellopontine angle cisterns before entering" Meckel cave, where "the
trigeminal ganglion divides into 3 divisions" — so at the angle it is one root carrying all three.

**Brainstem compression** (S167). "Brainstem Compression/Torsion Symptoms include pyramidal weakness,
contralateral cranial nerve involvement, and nystagmus."

## Design

- Two new parts outside the brainstem, at the pons: the vestibulocochlear nerve, and the trigeminal
  root before the ganglion. The eighth nerve joins the hearing route; the root joins the route to
  the face ahead of the nuclei, carrying all three divisions.
- **Vertigo from the nerve is unsettled.** The sources give it as "often" (S170) or name imbalance
  instead (S168), so a nerve lesion gives vertigo as `indeterminate`, as a hemisphere lesion gives
  truncal ataxia (C35). A lesion of the vestibular nuclei still gives it outright.
- Two places: the **eighth nerve** alone (in the internal acoustic canal) — hearing lost, the face
  spared — and the **cerebellopontine angle**, a larger mass taking the eighth nerve, the trigeminal
  root and the cerebellar hemisphere beside it. Neither takes the facial nerve or the brainstem.

## Conflicts and limits

- **C80 — Vertigo from the eighth nerve.** "Often" (S170) against "imbalance" (S168); left
  unsettled, not chosen.
- **C81 — The facial nerve at the angle.** Rare (S168), infrequent (S170), late except in very large
  tumours (S167). The angle place does not take it; the case asserts nothing about the face's
  strength.
- **C82 — Brainstem compression.** Pyramidal weakness and contralateral cranial nerve signs come
  only with very large tumours (S167); not part of the place.
- **C83 — The corneal reflex, tinnitus and hydrocephalus** are not modelled.
