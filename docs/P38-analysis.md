# P38 — The visual pathway on the stage

Written on 2026-10-06. The second of four phases that put on the stage what the model already
knows; the first was the cranial nerves (P37), and the names for the parts and the sympathetic
pathway follow.

## What was missing

The model has read visual fields since P13: eleven parts from the optic nerve to the occipital
pole, ten cells of each eye's field, and the rules for which part carries which cell. None of it
was drawn. A lesion of the chiasm changed the panel's field charts and nothing on the stage.

## What this phase draws

- **Twenty fibres**, one for each cell of each eye's field, from the retina back through every
  part the engine says carries that cell, coloured by the half of space the cell lies in. The
  fibres from the nasal half of each retina are the ones that pass the chiasm and change sides.
- **A mark on every part** on each side — the chiasm once, on the midline — which takes the
  lesion's colour when the lesion takes the part.
- **Pulses** from the retina backward, stopping at the first damaged part of a fibre whose cell
  the engine reports lost, and dimmed where the engine leaves the cell unsettled.
- **A Vision station**, from above and in front, where the parts are named and the cranial
  nerves' names are put away. A lesion of the visual pathway alone flies there.

## The rule it keeps

The engine's rule for which part carries which cell was written twice, once in the forward pass and
once in the explanation. It is now one function, `carries()`, with `carriers()` listing the parts
of one cell's fibre in the pathway's order; the forward pass, the explanation and the drawing all
read it. The change is an equivalent rewrite: every earlier test passes and no examination's
leader moved.

A test holds the drawing to the engine in every frozen case of the visual pathway and the orbit:
a cell the engine reports lost has a damaged part on its drawn fibre, a cell reported seen has
none that carries all of it, and an unsettled cell has one. A second test holds the crossing: each
tract carries the opposite half of space, and only the fibres that change sides pass the chiasm.

## Sources

None new. The order of the parts and their relations — the chiasm on the midline, Meyer loop
below and in front of the parietal fibres, the lower bank of the calcarine cortex below the upper,
the pole behind — are those the visual rows already cite (S91, S93, S147). Positions are schematic.

## Limits

- The centre of the field runs in both halves of the radiation; it is drawn as one strand between
  them, and a lesion of one half dims its pulse rather than stopping it.
- The crest and horns of the lateral geniculate nucleus are one mark each, beside the nucleus.
- The pupil's own pathway, which leaves the tract before the geniculate, is not drawn.
- The two halves of space borrow the colours of the posterior columns and the spinothalamic tract;
  the stage has no others. The labels behind the occipital poles say which is which.
- No mutation run: the knowledge base gained one layout row, which no finding reads.
