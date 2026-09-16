# NeuroLocalize

Place a lesion in the spinal cord; get the deficits it produces, and why.

This repository is phase P0 of the plan in `docs/plan.html`: the knowledge base, the
engine and the tests that prove the engine right. There is no 3D yet. That is deliberate —
accuracy is the risk worth retiring before anything is drawn.

> **Educational use only.** This is not a clinical decision-support tool and must not be
> used to assess a real patient.

## How accuracy is enforced

- **Expected outputs were written first**, from 23 open-access sources that were actually
  read, and frozen in git (`expectations-frozen`) before any engine code existed.
- **Every fact carries its source.** Unsourced facts are marked and printed on every run.
- **Observations are separate from mechanisms.** Contested explanations — tract
  lamination above all — can be wrong without the computed deficits being wrong.
- **Mutation testing** corrupts every knowledge-base row and requires a test to fail.
- **A review worksheet** turns clinical review into a list of claims with citations.

## Run it

Requires Node 24 or later.

```bash
npm install
npm run verify
```
