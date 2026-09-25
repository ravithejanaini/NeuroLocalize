# P23 — The saddle and the pudendal nerve: analysis before building

Written before any P23 code or expectation. Every fact below was read, verbatim, on 2026-09-25,
through the NCBI Bookshelf. S22 and S09 have been cited since P1 and were re-read for this phase;
S21 was re-read and found to say nothing about the saddle. Chosen by the user over three other
options, knowing it may move validated rankings.

| Id | Source |
|---|---|
| S22 | StatPearls — Anatomy, Abdomen and Pelvis, Pudendal Nerve (Kinter, Newton; 2023-02-10) — re-read |
| S09 | StatPearls — Cauda Equina and Conus Medullaris Syndromes (Rider, Marra; 2023-08-07) — re-read |
| S21 | StatPearls — Anatomy, Skin, Dermatomes (Whitman, Launico, Adigun; 2023-10-24) — re-read |

## 1. Why this phase

Since P1 the saddle has been a **dermatome**: a sensory test that reads the cord's segments S3 to
S5. That span has never had a source (R5, "no source read assigns the saddle to particular
segments"). And the skin under it belongs to a **nerve** the model did not have — the pudendal
nerve. A pudendal lesion numbs the saddle, but the model could only produce saddle loss from the
cord or the roots, so it would have called a pudendal palsy a conflict. The teaching point is the
one that matters at the bedside: one-sided perineal numbness with normal legs is not cauda
equina.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Roots | "The pudendal nerve carries motor and sensory axons from the ventral rami of the sacral spinal nerves S2-S4" | S22 |
| Course | it "exits the pelvis via the greater sciatic foramen inferior to the piriformis muscle"; in the perineum it "passes through a sheath of connective tissue on the medial wall of the obturator internus muscle called the pudendal (Alcock's) canal" | S22 |
| Its skin | "The left and right pudendal nerves give off branches, innervating regions of the rectal canal, anus, perineum, and external genitalia" | S22 |
| The anal verge | the inferior rectal nerve "Except for the anal verge (which is the S5 dermatome), it also carries somatic sensations from the skin adjacent to the anus" | S22 |
| Lesion | "Pudendal nerve injuries can result in loss of sensation in the nerve's distribution, fecal and urinary incontinence, and sexual dysfunction." | S22 |
| Sphincters | "this nerve innervates the external anal and external urethral sphincters" | S22 |
| The saddle | "Saddle anesthesia or decreased sensation in the perineum in up to 93% of patients" | S09 |
| Its segments | nothing — S21 names no sacral dermatome's skin | S21 |

## 3. Design

**The saddle becomes the skin it is.** A new patch, **the perineum**, is served by the pudendal
nerve from S2 to S4 (S22). The saddle test keeps its drawn span, S3–S5, because six frozen cases
and examinations name it, and now reads **both** that span and the perineum patch: abnormal if
either is. So the saddle is lost

- after a cauda equina or conus lesion, as before (S09);
- after a pudendal nerve lesion (S22) — new;
- through S2, which the pudendal nerve carries to it (S22) — new.

The perineum is not examined as a patch of its own, because the saddle already tests it, as the
dorsum of the foot is the L5 landmark (D30).

**One new nerve**, the pudendal, leaving the sacral plexus, with one place: **Alcock's canal**.
A lesion there numbs the perineum on its side and nothing in the leg.

## 4. Conflicts and limits, recorded rather than resolved

- **C66 — The saddle's segments.** No source read gives the saddle segments. S22 gives the skin
  under it a nerve (S2–S4) and the anal verge a dermatome (S5). The drawn span stays S3–S5 for the
  frozen cases, and the test reads S2 through the patch; R5 stays open for the span itself.
- **C67 — The sphincters are not modelled.** S22 gives pudendal injury fecal and urinary
  incontinence. The model's bladder finding is the reflex bladder of cord lesions and has no
  sphincter, so a pudendal lesion leaves it normal; the frozen case does not assert it.
- **C68 — A pudendal nerve and a sacral root look alike here.** A lesion of one left sacral root
  also numbs the left saddle and, with only the tests this model has, leaves the leg normal. The
  examination expects both among the leading candidates rather than one of them first.

## 5. Deliberately not modelled in P23

Pain (pudendal neuralgia); the bulbocavernosus and anal reflexes through the nerve (R4 is still
unsourced); the sphincters and sexual function; the posterior femoral cutaneous nerve, whose
sources read are anatomical only.

## 6. How P23 is accepted

1. A frozen case for the pudendal nerve in Alcock's canal, run against the P22 engine first.
2. An examination: the left saddle numb, the right normal, the legs normal — the pudendal nerve
   and a left sacral root lead; cauda equina and conus do not.
3. Every earlier frozen case and examination still passes; any ranking the redesign moves is
   recorded.
4. `npm run verify` passes; the mutation run leaves no P23 row with a survivor.
5. A browser check.
