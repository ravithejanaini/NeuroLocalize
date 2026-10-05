# P36 — Depth on the stage

Written on 2026-10-06. This phase changes how the scene is drawn and nothing else: no row of the
knowledge base, no finding, no expectation and no ranking. It cites no source because it makes no
anatomical claim; every position drawn is the one the geometry layer already gave.

## What was wrong

The stage read as flat. Looking at how it was drawn (`src/render/scene.ts`, `brain3d.ts`,
`limb3d.ts`), every surface used one unlit, see-through material that wrote no depth:

- no light, so a tube was the same colour all the way round and read as a ribbon;
- nothing hid anything, so a tract in front blended with the one behind it;
- no change with distance, so the far side of the cord was as bright as the near side;
- shells — the cord, the cortex — were a uniform tint with no edge.

## What was done

- **Light.** Solid structures — tracts, nerves, nuclei, muscles — are lit by a lamp fixed to the
  camera, up and to the left, with a soft fill from above. A tube now shades across its width.
- **Occlusion.** The same structures are solid and write depth, so the nearer hides the farther.
  Pulses are drawn slightly wider than the widest strand, so a pulse stands proud of the tube it
  runs in.
- **Distance.** A fog in the stage's own colour, whose range follows the camera's distance, so depth
  fades alike in a close view and a far one.
- **Glass.** The cord, the brainstem, the cerebellar lobes, the thalami and the cortical shells are
  clear face-on and brighter at the silhouette, so each reads as a volume.
- **A cut-away, looking down.** With solid tracts, the axial station — which looks down the cord from
  just above the slice — had its view blocked by the tracts running past the camera. Looking down,
  everything above the slice is now cut away, which is what a cross-section is.

## Checked

In the browser at every station — whole cord, lesion, axial, side, arm, leg, brain — with a lesion
placed. No test covers the scene (Three.js loads from the CDN and is not available to the unit
tests), so this phase is verified by eye, and says so.

## Left as it was

- Lines — the roots, the segment rings, the bones — are still one pixel wide at any distance; only
  the fog tells their depth.
- In the axial view the limb labels far below the slice bunch near the centre. That was so before
  this phase.
