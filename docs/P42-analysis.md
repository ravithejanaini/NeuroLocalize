# P42 — Walking along a nerve

Written on 2026-10-06, at the owner's request: double-click a nerve and walk through it from a
first-person view, with depth and in detail.

## What it is

Every nerve and pathway the stage draws can be walked. The camera leaves its orbit and rides the
strand a little above it, looking ahead, from one stop to the next. A stop is a part the walk
passes; at each the panel shows that part's card (P39, P41): what the model reports when it alone
is lost, the places that take it, and the model's own sourced statements.

- **A hundred walks**: the sixteen cranial-nerve courses a side, the twenty fibres of the visual
  field, the sympathetic pathway a side, the twenty-one nerves of the arm and leg a side, and the
  three long tracts to and from each hand.
- **Three ways in**: double-click (or double-tap) a drawn nerve; choose it from the list "Walk
  along a nerve…"; or press "Walk along" on the card of a part that lies on it, which starts the
  walk at that part.
- **Depth**: a wider lens, a fog that closes in so that what is far is faint, a ring to pass
  through at each stop, and motes around the strand that slide past as the eye moves.
- **The lesion on the walk**: where the lesion in place cuts the pathway, the ring is closed by a
  wall in the lesion's colour, the rings past it go grey, and the panel says so at that stop and
  at every stop beyond it.
- **Controls**: Back and On between stops, Play to be carried along with a pause at each stop, a
  scrubber, three paces, a strip of the stops to jump to; drag to turn the head, scroll to move,
  arrows, space and Escape on the keyboard.

## The rule it keeps

A walk adds no anatomy. Its points and stops are the courses the stage already draws, taken from
the same functions (`cranialCourses`, `visionFibres`, `sympatheticCourse`, `nerveCourse`,
`motorPath`, `sensoryPath`). Where a walk is cut is decided by the functions that stop the pulses.
A stop's text is the card of P39 and P41, which states nothing of its own. The only words a walk
writes are the names of its ends and, for a nerve of the limbs, the list of branches the layout
draws from a point.

Tests hold this: every course, fibre and nerve has a walk; every walk has a name of its own,
something at both ends and stops in the order they are met; every stop that is a part has a
sourced statement; a cranial walk is cut exactly when the engine reports that nerve's finding in
every frozen cranial and cavernous case; a nerve of the limbs is cut at the first place the
lesion takes, going outward, on its own side only; the sympathetic and visual walks agree with
the engine in every frozen case; and the long tracts stop or pass a hemisection as they should.

## Sources

None new.

## Limits

- The camera's path is a smooth curve through the drawn points; the drawing is schematic, so the
  view is of the model, not of a dissection.
- A nerve that arises from two cords (the median) is walked from the first the model lists.
- The long tracts are walked for the hand only (C8).
- A walk stops only at parts the model names; the stretches between are travelled, not described.
- On a single tap the name of a part now waits a third of a second, so that a second tap can
  start a walk instead.
- With reduced motion on, the camera jumps from stop to stop and Play is off.
- Checked by eye on a desktop; on a phone-sized screen the layout was checked but not the motion.
- No mutation run: nothing the engine reads changed.
