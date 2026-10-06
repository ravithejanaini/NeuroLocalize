# P40 — The sympathetic pathway on the stage

Written on 2026-10-06. The last of four phases that put on the stage what the model already
knows, after the cranial nerves (P37), the visual pathway (P38) and the names of the parts (P39).

## What was missing

Since P34 the model has told the three neurones of a Horner syndrome apart, by where the lesion
lies and where sweating is lost. On the stage the pathway was six unconnected dots — three in the
brainstem, the chain, and two on the carotid — and nothing at all in the cord, where the first
neurone ends and the second begins. The one pathway in the model that runs down and comes back up
could not be seen to do so.

## What this phase draws

- **One strand a side, in three lengths.** The first neurone through the midbrain, pons and
  medulla and down the cord in the descending autonomic fibres to the ciliospinal centre; the
  second from the centre out by the T1 ventral root and up the cervical sympathetic chain; the
  third on the internal carotid, in the neck and then the cavernous sinus, to the eye.
- **Marks at the centre and at the T1 root**, which turn to the lesion's colour when the strand
  stops there. The parts above the cord already had marks.
- **Pulses** that run the whole loop and stop at the first place the lesion cuts.
- **A Sympathetic station**, the tenth, on the 0 key, far enough back to hold the loop, where the
  three neurones and the places along them are named.

## The rule it keeps

The strand is built from the rows the engine reads for a Horner syndrome and no others:
`brain.sympathetic`, `autonomic.ciliospinal`, `autonomic.sympathetic-outflow`,
`autonomic.sympathetic-root-compartment`, `brain.sympathetic-second` and `brain.sympathetic-third`.
Each thing the engine tests is a stop on the strand, tagged with its neurone. Because the neurones
lie in order along the strand, the first stop a lesion damages is the most central neurone cut —
which is what the engine reports.

A test holds this in every frozen case of the cord, the plexus, the brain and the cranial nerves,
on both sides: the strand stops exactly when the engine reports a Horner syndrome, and at the
neurone it reports. The cases reach all three neurones and none. A second test holds the shape:
uncrossed, the neurones in order, down to the outflow segment and up again.

## Sources

None new. Every length of the strand is a row already cited (S16, S01, S36, S69, S176, S177, S178,
S165, S70).

## Limits

- **The origin in the hypothalamus is not drawn.** The model's first-order row begins in the
  midbrain, and the stage draws only what the model holds.
- The superior cervical ganglion, where the second neurone ends and the third begins, has no part
  of its own in the model; the join is drawn between the chain and the carotid plexus.
- The fibres for sweating of the face, which leave with the external carotid, are not drawn; the
  model reads their loss from the neurone cut (P34).
- The centre is one mark at T1 standing for C8 to T2, and the descending fibres below T1 stop
  there too.
- The centre and the root cannot yet be named by a tap (P39 names only parts above the cord).
- No mutation run: nothing the engine reads changed.
