# P28 — A finer field chart, and the sectoranopias: analysis before building

Asked for on 2026-09-26. Written before any P28 code or expectation. Every fact below was read,
verbatim, that day, through Europe PMC as open full text. Search summaries were used only to find
the papers. The PubMed Central pages for two further case reports would not load, so they were not
used.

| Id | Source |
|---|---|
| S160 | Hanai, Hashimoto, Ishikawa, Nakamura — Congenital geniculate quadruple sectoranopia with occipital heterotopia (Am J Ophthalmol Case Rep, 2020, PMC7509790) |
| S161 | Kedar, Ghate, Corbett — Visual fields in neuro-ophthalmology (Indian J Ophthalmol, 2011, PMC3116538) |
| S162 | Pula, Yuen — Eyes and stroke: the visual aspects of cerebrovascular disease (Stroke Vasc Neurol, 2017, PMC5829892) |
| S147 | cited since P24: the lateral geniculate nucleus and its two arteries |

## 1. Why this phase

Since P8 each eye's field has had four quadrants and a centre split at fixation. That cannot
draw the defect the lateral geniculate nucleus is known for — a sectoranopia — so P24 left it out
(C69, R55). A sectoranopia is the one field defect that points to the nucleus alone (S161), and it
comes in two shapes, one for each of the nucleus's two arteries.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Two shapes, two arteries | "Geniculate hemianopia is characterized by either a wedge-shaped homonymous hemianopia or a quadruple sectoranopia. The former visual field defect is produced by a lesion in the dorsal crest of the lateral geniculate nucleus (LGN) supplied by the lateral posterior choroidal artery, while the latter is produced by lesions of the medial and lateral horns of the LGN supplied by the distal anterior choroidal artery." | S160 |
| The wedge's shape | "A hemi-hourglass shape in the horizontal midline of the visual field is a consequence of horizontal wedge-shaped homonymous sectoranopia." | S162 |
| The quadruple shape | "The superior and inferior sectorial visual field defects along the vertical meridian spare the horizontal macular zone" | S160 |
| Only the nucleus | "homonymous sectoranopia that are produced exclusively by anterior occipital and geniculate lesions, respectively" (read with the sentence it ends: the temporal crescent is anterior occipital, the sectoranopia geniculate) | S161 |
| The whole nucleus | "Extensive LGN injury manifests as a complete HH." | S162 |

## 3. Design

**The chart.** Each quadrant of each eye's field is split in two: the half beside the horizontal
meridian and the half beside the vertical meridian. With the centre split at fixation as before,
that is ten cells an eye. The wedge of S162 is the four cells beside the horizontal meridian of one
half-field; the quadruple sectoranopia of S160 is the four beside the vertical meridian.

**Nothing earlier changes meaning.** The six names the frozen cases use — four quadrants and two
halves of the centre — stay, each quadrant now meaning its two cells together. A quadrant is lost
when both its cells are, normal when both are, and unsettled otherwise. Every earlier lesion takes
whole quadrants, so every earlier case reads exactly as before. The examination offers the ten
cells; an observation of a whole quadrant is still understood.

**Two new parts of the nucleus, each a place.** Each visual part already declares which quadrants
it takes (P8); it may now also declare a band — the horizontal cells or the vertical ones.

- the **dorsal crest** (lateral posterior choroidal artery): the horizontal band of the opposite
  half-field of both eyes — the wedge;
- the **medial and lateral horns** (anterior choroidal artery): the vertical band — the quadruple
  sectoranopia.

Neither takes the centre: S160 says the quadruple defect spares "the horizontal macular zone", and
S162's hourglass narrows to fixation. Neither gives a pupillary defect, like the whole nucleus
(P24). The whole nucleus is both parts together (S162).

## 4. Conflicts and limits, recorded rather than resolved

- **C71 — The wedge and the centre.** S162's hourglass narrows toward fixation without saying
  whether fixation itself is lost. The model leaves the centre intact for the wedge and asserts
  nothing about it.
- **C72 — Incongruity.** S160's patient had a larger defect in one eye, and S161 says either
  sectoranopia can be incongruous. The model draws both eyes alike (C26).
- **C73 — The occipital pole is still open.** S162 reports an occipital pole infarct giving "a
  partial congruous right inferior field defect" and says "A small occipital pole embolus can cause a
  complete hemianopia" — neither settles what the pole alone does to the periphery (D129).

## 5. How P28 is accepted

1. Frozen cases for each artery's part, and an examination for each shape, run against the P27
   engine first.
2. Every earlier frozen case and examination passes unchanged, with no leader moved.
3. `npm run verify` passes; the mutation run leaves no P28 row with a survivor.
4. A browser check of the new chart.
