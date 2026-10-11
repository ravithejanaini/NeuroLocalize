# P44 — An inspection, and the corrections it called for

Written on 2026-10-12. The owner asked for the whole thing to be inspected: what needs correcting,
what should be improved, where the gaps are — and said the visualization feels bad. This records
what was measured, what was corrected at once, and what is left as a recommendation.

## How it was inspected

The built app was opened and every one of the ten stations looked at on a 1280 by 800 screen and
on a phone-sized one, with a lesion in the cord and one in the brain, and a walk taken inside the
brain and along a limb. Three things were measured rather than judged by eye:

- **Names that overlap.** Every visible name's box was read from the page and the overlapping
  pairs counted.
- **Rendering load.** The WebGL draw calls and triangles were counted per frame, and the frame
  time over ninety frames.
- **Contrast.** The contrast ratio of each text colour on its background.

The code was read where the look pointed at a cause, and the project's own numbers were recomputed
— rows by tier, open questions, tests, mutation score.

## What was found

| | Measured |
|---|---|
| Overlapping names | Vision 35 pairs, Axial 25, Arm 7, Whole cord 4, Head 2, Sympathetic 1 |
| Rendering | 200 to 620 draw calls and 100,000 to 265,000 triangles a frame; 24 to 40 frames a second in the preview |
| Dim text on the stage | 4.2 to 1 at 10px; tertiary text in the panel 3.8 to 1 (light) and 3.9 to 1 (dark) |
| Step across | of 1,126 sampled offers, 504 were between walks that are only drawn close |
| Renderer code with no automated test | 3,353 of 15,420 lines |

And by eye:

1. **Nothing reads as anatomy.** The hemispheres are two glass domes, the limbs are lines, the
   end organs are grey balls. The scene is a wiring diagram hung in a void.
2. **Everything is drawn at full strength everywhere.** At the Vision station the cranial nerves
   are as loud as the visual pathway; nothing says what a view is about.
3. **A lesion in the brain can hardly be seen.** A cord lesion is a shape; a lateral medullary
   infarct is a few dots, in the same colour as the corticospinal tract.
4. **From the side, the arm hangs in front of the cord.**
5. **Inside a walk the pulses are boulders**, drawn at the size meant for the orbit, and the
   panel covers half the stage.
6. **The top controls collide**: the hint ran under the legend, and at widths near 1,000 pixels
   the second row of stations lay on the hint and the lists.
7. **The facial nerve had no strand.** Its three branches in the canal were drawn and walkable;
   its own trunk to the face had only pulses. The documents said sixteen courses a side; there
   were fifteen.

## What was corrected

- **Names no longer overlap.** `declutter()` places the more important name first and hides one
  that would lie on another; between equals the one already shown stays, so names do not flicker.
  A station about one pathway puts the landmarks and the limbs' names away. Overlapping pairs are
  now nought at all ten stations.
- **The lesion has a colour of its own**, no longer the corticospinal tract's.
- **The Side station is the cord alone**: the limbs and their pulses are put away there.
- **The top controls flow in one column**, and the walk's panel is three rows that share the
  stage, so nothing is placed by an offset that another row can outgrow. The legend moved to the
  foot of the stage.
- **A step across says what it is**: the part both walks pass, the named place that takes both,
  a branch, or "only drawn nearby" — the last styled apart and offered last.
- **On a walk**: pulses are drawn small; a pinch moves along the nerve instead of zooming the
  orbit behind it; the scrubber follows the walker again after it has been touched; a walk ends
  when the mode changes.
- **The name of the part under the mouse is shown beside it** — P39 was asked for tap or hover
  and built only the tap.
- **The facial nerve has its strand and its walk**, cut exactly when the engine reports the face
  weak, in every frozen case.
- **Text**: dim text on the stage and tertiary text in the panel now pass 4.5 to 1; names on the
  stage are 10.5 to 11px with a halo.
- **The count**: fifteen courses, in the three documents that said sixteen.

## What was not, and is recommended

In the order advised. None of it needs a new source except where said.

1. **Focus and context.** Each station brings its own pathways forward and dims the rest; a
   chosen part or a placed lesion does the same. The largest single gain in feel.
2. **A lesion in the brain as a region**, not dots, and the camera framed on it.
3. **Forms that read as anatomy**: hemispheres with a fissure, a skull and face outline, the
   limbs' outline. Whether to draw them by rule, as now, or to bring in a real model is the
   owner's call — a model is a dependency and a licence.
4. **The walk's point of view**: fade what is not the nerve or its neighbours, put the glass
   shells away from inside, and an inset that shows where in the body the walker is.
5. **Draw calls**: merge the fixed strands by material; the aim is under a hundred a frame.
6. **A way to check the scene without eyes**: a hook that steps the frame loop by hand, and the
   camera's path mathematics moved out of the renderer into something the tests can reach.
7. **One search** in place of two lists of 344 and 151 entries.
8. **A first screen** that says what this is and offers three things to try.
9. **Split `main.ts`** (1,558 lines) by concern.
10. **A full mutation run**, eight phases overdue.
11. **A clinician's review**: 63 questions, nine answered; every book reference still pending.
12. **Content** — each needs sources: the first cranial nerve, the pupil's light reflex, the
    neuromuscular junction and muscle, polyneuropathy, the arteries drawn.

## Limits of this inspection

- Frame rates were measured in the preview pane of one laptop, which may be throttled; they say
  which views are heavier, not how the app runs on a phone.
- Nothing was measured on a real phone.
- "Feels bad" was diagnosed by one reader with screenshots; the owner's friend, for whom this is
  made, has still not used it.
- No mutation run: nothing the engine reads changed.
