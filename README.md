# NeuroLocalize

Place a lesion anywhere from the cortex to a nerve in the hand, and see the deficits it
produces and why. Or enter an examination, and see where the lesion could be, which test
would tell the candidates apart, and the reasoning behind every ranking.

> **Educational use only.** This is not a clinical decision-support tool and must not be
> used to assess a real patient.

## What is built

| Phase | What it adds |
|---|---|
| P0 | Knowledge base, forward engine, frozen expectations, mutation testing, review worksheet |
| P1 | The cord in 3D, with signals that travel and stop where the engine says they stop |
| P2 | Body map, myotome grid, slice scrubber, phone layout |
| P3 | Examination mode: ranked candidates, the next test worth doing, and the working |
| P4 | The brachial plexus: roots, trunks, divisions, cords and nine nerves in 3D; fourteen muscles, seven nerve territories and five deformities (winged scapula, waiter's tip, wrist drop, claw hand, ape hand); examination mode separates root from plexus from nerve |
| P5 | Above the cord: medulla, pons, midbrain, thalamus, internal capsule and the motor and sensory homunculus; facial sensation and strength (forehead sparing), five cranial nerve signs, ataxia and vertigo; nine named territories from the lateral medulla to the ACA cortex; examination mode ranks candidates from cortex to muscle |

P6 (practice and offline use) is planned in `docs/plan.html`.

## How accuracy is enforced

- **Expected outputs are written first**, from 66 open-access sources that were actually
  read (`docs/SOURCES.md`), and committed before the code they test. Every later change to
  an expectation is an amendment with its reason (`spec/expectations/AMENDMENTS.md`).
- **Every fact carries its source.** Where sources disagree, both positions are recorded
  and the finding is reported as uncertain rather than settled by typing
  (`docs/DECISIONS.md`). Unsourced facts are marked and printed on every run.
- **Observations are separate from mechanisms.** Contested explanations — tract
  lamination above all — can be wrong without the computed deficits being wrong.
- **What is drawn is what is computed.** Signal paths in 3D are built from the engine's own
  routes, and tests hold the drawing to them.
- **Mutation testing** corrupts every knowledge-base value and requires a frozen forward
  case or a frozen examination to fail.
- **A review worksheet** (`review/worksheet.md`) turns clinical review into a list of
  claims with citations and open questions.

## Run it

Requires Node 24 or later.

```bash
npm install
npm run verify
npm run build
npm run serve
```

Then open http://localhost:5178. Three.js loads from a pinned CDN URL; everything else is
in this repository.
