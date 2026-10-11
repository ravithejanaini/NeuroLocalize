# P43 — Roaming: the walks as one world

Written on 2026-10-11, at the owner's request: the walk of P42 should be an open world — roam
along the nerves under one's own control, reach from one end to the other, and switch between
them.

## What P42 lacked

A walk was one nerve, travelled stop to stop in the direction the signal runs, and left by going
back to the orbit. To follow a command from the cortex to the hand took four separate walks and
four exits. And the limbs could not be reached at all from the cord: the nerves of the arm began
at the cords of the plexus, and nothing walkable joined those to the roots.

## What this phase adds

- **Moving under one's own control.** Hold Forward or Backward (W and S, or the up and down
  arrows) to travel for as long as it is held; Turn round (Q) to face the other way along the
  nerve; the head stays where it is turned until Look ahead (C) is pressed.
- **Stepping across.** Wherever another walk meets the current one or passes within reach, it is
  offered: as a numbered button, as the keys 1 to 6, and as a signpost on the stage pointing along
  it. Stepping across keeps the eye and the way it was looking, and lands at the nearest place on
  the other walk. A double-click on any other nerve in sight goes over to it likewise.
- **One connected world.** Forty-eight walks were added so that everything joins: each root from
  the cord into its trunk or part of the plexus, each trunk through its division into a cord, and
  the three long tracts to and from the foot as well as the hand. From any of the 148 walks every
  other can now be reached on foot — motor cortex to the ulnar nerve at the wrist is five steps.

## The rule it keeps

No anatomy is added. The new walks are the strands the stage already draws (`plexusStrands`,
`legStrands`) and the same long-tract paths for a second segment. Which walks are within a step
is geometry alone: the distance between two drawn lines. A step across is therefore a fact about
the drawing, not a claim that two nerves join — the panel says "step across", not "connects to" —
and the drawing is schematic.

Tests hold: from any walk every other is reachable; every root and every trunk-to-cord division
has a walk; the walks offered at the eye, at the end of the sciatic nerve, at the radial nerve's
origin and at the end of the corticospinal walk are the ones that meet there; every landing is on
the other walk's own line, is its nearest place, lies within reach, and can be stepped back from;
and never more than six are offered, nor more than three of one kind.

## Sources

None new.

## Limits

- **A step across is nearness in a schematic drawing.** Where two strands are drawn close they are
  offered to each other whether or not the nerves truly meet there — the sympathetic pathway and
  the corticospinal tract, for instance, where both run in the cord.
- A long-tract walk now ends at the root, not at a point standing for the limb, which no drawn
  nerve reached.
- The walker cannot leave the strands: this is roaming along the nerves, not free flight.
- A root's walk is stopped only when both its dorsal and ventral parts are lost; one alone
  weakens it.
- Motion was checked live for holding to move and reaching an end. Stepping across, turning round
  and the whole journey from cortex to ulnar nerve were checked with motion reduced, because the
  preview would not animate while it was not on screen. Double-click to step across, and
  everything on a real phone, are untested.
- No mutation run: nothing the engine reads changed.
