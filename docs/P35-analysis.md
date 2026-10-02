# P35 — The facial nerve by segment: tears, the stapedius and taste

Written on 2026-10-02 before any P35 code. S179 was read in full in the browser (NCBI Bookshelf);
S51 was read in full for P29. Every quotation below is verbatim. This answers C75.

## Why

P29 gave the facial nerve one place, at the stylomastoid foramen, because the model had only the
face's strength. But the nerve gives off three branches inside the temporal bone, and which of their
functions is lost says how far up the canal the lesion lies — the classic way a lower-motor-neurone
facial palsy is localised.

## What each source states

**The branches, in order** (S179, S51). S179: "The labyrinthine segment gives off three branches: the
greater superficial petrosal nerve (containing parasympathetic fibers for the lacrimal gland and
taste fibers from the palate)…"; "The fifth segment of the facial nerve is the mastoid segment…
This segment gives off three branches: the nerve to stapedius muscle, the chorda tympani (containing
parasympathetic fibers to sublingual and submandibular salivary glands and taste fibers from the
anterior two-thirds of the tongue), and the sensory branch". S51: "The second branch of the facial
nerve running in the facial canal is the nerve to stapedius muscle"; "The chorda tympani nerve is the
last branch of the facial nerve within the facial canal".

**What each branch's loss does** (S179). "Damage to the nerve to stapedius results in hyperacusis;
damage to the greater petrosal branch manifests as loss of lacrimation, and damage to the chorda
tympani results in loss of taste from the anterior two-thirds of the tongue as well as the loss of
function of the sublingual and submandibular salivary glands."

**The lesion by segment** (S51). "Facial canal between the internal acoustic meatus and the geniculate
ganglion Ipsilateral facial plegia, decreased secretion of saliva and tears, hyperacusis and ageusia
to anterior two-thirds of the ipsilateral part of the tongue. Facial canal between geniculate ganglion
and nerve to the stapedius muscle Ipsilateral facial plegia, decreased salivary secretion, ageusia to
anterior two-thirds of the ipsilateral part of the tongue, hyperacusis. Facial canal between nerve to
stapedius and leaving of chorda tympani Ipsilateral facial plegia, decreased salivary secretion,
ageusia to anterior two-thirds of the ipsilateral part of the tongue. After giving the branch of
chorda tympani Ipsilateral facial plegia".

## Design

- Three new signs, each about one side: **tears reduced**, **hyperacusis**, and **taste lost on the
  front two-thirds of the tongue**.
- Three new parts of the facial nerve inside the temporal bone, named by the branch points: above the
  geniculate ganglion; between the ganglion and the nerve to stapedius; between that nerve and the
  chorda tympani. The P29 part — the nerve at the stylomastoid foramen — is the fourth, below the
  chorda tympani.
- Each sign reads the parts above its branch: tears the first; the stapedius the first two; taste
  the first three; the face all four.
- Each new part is a place. The four places then differ exactly as S51's list does.

## Conflicts and limits

- **C97 — Which named segment holds which branch.** S179 puts both the nerve to stapedius and the
  chorda tympani in the mastoid segment; S51 divides the canal at each branch. The two agree on the
  order of the branches, which is all the model uses; its parts are named by branch, not by segment.
- **C98 — Salivation** ("decreased salivary secretion") is not modelled, nor the stapedial reflex,
  nor taste from the palate.
- **C99 — Inside the brainstem.** A lesion of the facial nucleus or fascicle gives the face alone in
  the model: S51's pontine lesions list no taste or tear loss, the nervus intermedius having its own
  nuclei. The cerebellopontine angle, where S51 lists all four, is a place the model has without the
  facial nerve (C81).
- **C100 — Bell palsy's site.** The P29 preset called the stylomastoid place "Bell"; Bell palsy is
  not tied to that segment by any source read. The preset is renamed by its anatomy.
