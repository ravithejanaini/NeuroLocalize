# P8 — The visual pathway: analysis before building

Written before any P8 code or expectation. Every fact below was read, verbatim, from the
source named beside it on 2026-09-17 (S91–S97 in `SOURCES.md`). Nothing here is from memory.

| Id | Source |
|---|---|
| S91 | StatPearls — Neuroanatomy, Visual Pathway (Gupta, Ireland, Omole, Bordoni; 2026-03-23) |
| S92 | StatPearls — Hemianopsia (Ruddy, Asuncion, Cardenas; 2024-01-09) |
| S93 | StatPearls — Homonymous Superior Quadrantanopia (Monserrate, De Jesus; 2023-08-23) |
| S94 | StatPearls — Posterior Cerebral Artery Stroke (Benjamin, Tadi, Singh; 2026-01-31) |
| S95 | StatPearls — Marcus Gunn Pupil (Simakurthy, Stokkermans, Tripathy; 2026-04-30) |
| S96 | StatPearls — Neuroanatomy, Bitemporal Hemianopsia (Yoshihara, Lui; 2023-08-07) |
| S97 | StatPearls — Homonymous Hemianopsia (Wolberg, Tripathy, Kapoor; 2024-03-01) |

## 1. What P8 must teach

| Question | The finding that decides it | Source |
|---|---|---|
| One eye or the pathway behind it? | A lesion of the retina or optic nerve loses vision in that eye alone | S91, S92 |
| Why bitemporal? | The chiasm carries the crossing nasal retinal fibres, which serve the temporal fields | S91, S92, S96 |
| Behind the chiasm | Any retrochiasmal lesion loses the same (contralateral) half-field in both eyes | S91, S92, S97 |
| Upper or lower quadrant? | The Meyer loop in the temporal lobe carries the superior field; the parietal radiation the inferior field; below the calcarine fissure is the superior field, above it the inferior | S91, S93, S94 |
| Tract or cortex? | A tract lesion adds an afferent pupillary defect, on the side opposite the lesion; lesions behind the lateral geniculate nucleus do not cause one; macular sparing points to the visual cortex | S92, S95, S97 |
| Why is the macula spared in a PCA stroke? | The occipital pole, where the macula is represented, is also supplied by the middle cerebral artery | S92, S94 |

## 2. Design

A new sensory system beside the body, with its own examination:

- **Visual field sectors.** For each eye: superior and inferior temporal, superior and
  inferior nasal (the periphery), and the centre of the field to the left and to the right of
  fixation (where macular sparing shows). Each is `normal`, `lost`, or `indeterminate` when only part of it is lost.
- **Relative afferent pupillary defect**, left or right: `present` or `absent`.

Each sector is served by one retinal quadrant of one eye (S91: the retina sees the opposite
side of the field; nasal fibres cross at the chiasm, temporal fibres do not), so a lesion is
judged by which fibres it cuts, exactly as the body's findings are.

### Parts of the pathway

| Part | Carries | Source |
|---|---|---|
| optic nerve (each side) | every fibre of that eye | S91, S92 |
| chiasm (midline) | the crossing nasal fibres of both eyes | S91, S92, S96 |
| optic tract (each side) | the opposite half-field of both eyes, centre included | S91, S92 |
| Meyer loop (each side, temporal lobe) | the opposite superior quadrants of both eyes | S91, S93 |
| parietal radiation (each side) | the opposite inferior quadrants of both eyes | S91, S93 |
| calcarine cortex below the fissure (each side) | the opposite superior quadrants | S91, S93 |
| calcarine cortex above the fissure (each side) | the opposite inferior quadrants | S91, S93 |
| occipital pole (each side) | the centre of the opposite half-field | S92, S94, S97 |

How the centre of each half-field is judged, so no sector is left ambiguous:

- The optic nerve and the tract carry the centre with the periphery: their lesions lose it.
- In the cortex the centre lies at the pole, apart from the calcarine banks: a lesion of both
  banks that spares the pole keeps it (macular sparing); a lesion that includes the pole loses it.
- A Meyer loop, parietal radiation or single calcarine bank carries only the upper or the lower
  half of the centre. The central sector is then `indeterminate`: part of it is lost, and the
  model does not split the centre into quadrants.
- The chiasm carries the crossing fibres of the central field too, so a chiasmal lesion loses
  the temporal half of the centre in each eye.

### The pupillary defect

| Lesion | Defect | Source |
|---|---|---|
| optic nerve | same side | S95 |
| optic tract | opposite side | S92, S95 |
| chiasm | not asserted: it "may" damage one eye's fibres more | S95 |
| anything behind the lateral geniculate nucleus | none | S97 |

### Places a lesion can sit

| Place | Parts | Source |
|---|---|---|
| optic nerve, left or right | the optic nerve | S91, S92 |
| chiasm | the chiasm | S96 |
| optic tract, left or right | the optic tract | S92 |
| temporal lobe (Meyer loop), left or right | the Meyer loop | S93, S94 |
| parietal radiation, left or right | the parietal radiation | S93, S94 |
| PCA territory, left or right | both calcarine banks, sparing the pole | S94, S92 |
| whole occipital cortex, left or right | both calcarine banks and the pole | S92, S97 |

## 3. Conflicts and limits, recorded rather than resolved

- **C26 — Congruity.** Taught as a sign of a posterior lesion; S97 reports that about 60% of
  radiation lesions and 50% of tract lesions are congruous. Not modelled.
- **C27 — The pupil in chiasmal lesions.** S95 says a chiasmal lesion may cause a defect when
  one eye's fibres are more damaged. The model does not assert one either way.
- **C28 — The extent of macular sparing.** S97 gives 5°–25°; the model has one central sector
  per half-field and does not grade it.

Not modelled in P8: the lateral geniculate nucleus as a separate place; junctional scotoma;
the pretectal (tectal) pupillary defect (S95); visual acuity and colour; the Riddoch
phenomenon; cortical blindness from bilateral lesions; any field defect that respects the
horizontal meridian in front of the chiasm (altitudinal defects).

## 4. How P8 is accepted

1. Frozen expectations for each place above, and examination cases for: monocular loss;
   bitemporal hemianopia; tract against cortex by the pupil; Meyer loop against parietal
   radiation; PCA sparing the macula against a whole occipital lesion — written from these
   tables, failing against the P7 engine first.
2. Every earlier frozen case still passes.
3. `npm run verify` passes; the mutation run covers every new row and the sourced score does
   not fall below 94%.
4. A field chart is drawn from the engine's sectors, and a test holds the drawing to them.
5. A final audit re-reads each row against its source; a browser check covers the chart, the
   new examination controls and the presets on desktop and phone.

The visual pathway is not drawn in the 3D scene this phase: the field chart carries the
finding, and the 3D stage keeps the brain it already has. A lesion of a visual place shows on
the brain station with the chart beside it.
