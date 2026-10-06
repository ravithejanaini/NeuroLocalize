# P37 — The cranial nerves on the stage

Written on 2026-10-06. The first of four phases that put on the stage what the model already
knows; the others are the visual pathway, names for the parts, and the sympathetic pathway.

## What was missing

An audit of the scene against the knowledge base: about fifty routes through the brain and the
cranial nerves, of which the stage drew three — the corticospinal tract, the posterior columns and
the spinothalamic tract — and ran pulses on those and the face. Sixty-four parts had a position and
appeared as identical, unnamed grey dots. Everything P29 to P35 added — the nerves outside the
brainstem, the cavernous sinus, the angle, the jugular foramen, the facial canal — was a dot. No
nerve ran to an eye, the face, the ear or the tongue.

## What this phase draws

- **Sixteen courses a side**, one for each nerve the model reads a finding from: III, IV and VI to
  the eye; V1, V2 and V3 in from the forehead, cheek and jaw; the trigeminal motor root to the jaw
  muscles; the greater petrosal nerve to the tear gland, the nerve to stapedius to the ear and the
  chorda tympani in from the front of the tongue; VIII in from the ear; IX in from the back of the
  tongue; X to the palate; XI to the shoulder; XII to the tongue.
- **Twelve end organs a side**, each taking the colour of its finding, as the muscles of the limbs do.
- **Pulses** on every course, stopping at the first part the lesion cuts.
- **A Head station**, close on the brainstem and face, where the nerves and organs are named; a
  lesion that lies wholly outside the brainstem flies there rather than to the far Brain view.

## The rule it keeps

A drawn course is the knowledge base's own step lists, in their own order, on the side each route
serves (D39). Nothing about a course is written twice. That needed four routes put in the order the
signal travels, which the file's own header promises and which had not mattered while they were
dots: the third nerve (nucleus, fascicle, nerve), the sixth (the reticular formation first), hearing
and taste (inward from the organ). The engine takes the worst damage along a route whatever the
order, so no finding changed.

A test holds every course to the engine in every frozen case above the cord: a pulse on a nerve
stops exactly when the engine reports that nerve's finding. For the palate, which also has a supply
from both hemispheres that the nerve's course does not draw, it holds one way.

## Sources

None new. The courses are the routes, which are sourced row by row. The end organs' positions are
schematic, as the brain's layout says of itself; what is kept is their order from above down and
from the midline out.

## Limits

- A straight strand joins each nerve's last part to its organ; the real nerves' paths through the
  skull are not drawn.
- The face's own movement still ends at one mark for the whole face.
- The mutation run was not repeated: the knowledge base changed only in the order of steps within
  four routes, which the engine does not read.
