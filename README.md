# NeuroLocalize

Place a lesion anywhere from the eye and the cortex to a nerve in the hand or foot, and see the deficits it
produces and why. Or enter an examination, and see where the lesion could be, which test
would tell the candidates apart, and the reasoning behind every ranking. Or practise:
generated cases, scheduled by the pathways you get wrong, and a presentation mode for
teaching from a phone.

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
| P6 | Practice: cases generated from the model and checked by it, answers explained by the engine's own working, review scheduled by the pathways answered wrongly; progress kept in the browser with save and load to a file; presentation mode; offline use from the standalone build |
| P8 | The visual pathway: optic nerve, chiasm, tract, Meyer loop, parietal radiation and occipital cortex; each eye's field in six sectors with the pupil; monocular loss, bitemporal hemianopia, both quadrantanopias, and hemianopia with or without macular sparing |
| P7 | The leg: lumbar and sacral plexuses and nine nerves in 3D, eleven muscles, nine territories, foot drop and the Trendelenburg gait; examination mode separates the fibular nerve from L5, the sciatic nerve from the plexus, and the femoral nerve from the lumbar roots |
| P9 | Eye movements: the medial longitudinal fasciculus, the paramedian pontine reticular formation and the oculomotor nucleus, with four signs — adduction, abducting nystagmus, ptosis and elevation. Internuclear ophthalmoplegia, horizontal gaze palsy, one-and-a-half syndrome and a nuclear third nerve palsy, each derived rather than named; examination mode separates a sixth nerve palsy from a gaze palsy and a gaze palsy from one-and-a-half |
| P10 | Language and the dominant hemisphere: Broca area, Wernicke area and the inferior parietal lobule; fluency, comprehension and repetition read from the dominant hemisphere, and neglect from the other. Broca, Wernicke, conduction and global aphasia derived rather than named; the superior and inferior divisions of the MCA, the latter carrying its hemianopia; examination mode separates Broca from conduction, conduction from Wernicke, Wernicke from global, and aphasia from neglect |
| P11 | The cerebellum: each hemisphere and the midline vermis, behind the brainstem. Limb ataxia on the side of a hemisphere lesion, truncal ataxia with the limbs spared from the vermis, and the Romberg test withheld when the patient is unsteady with the eyes open; examination mode separates a cerebellar hemisphere from the brainstem, the vermis from a hemisphere, and cerebellar from sensory unsteadiness |
| P12 | The posterior circulation: the AICA (lateral pons, with hearing loss on the side of the lesion), the PICA (the lateral medulla and inferior cerebellum, so Wallenberg syndrome with truncal ataxia) and the SCA (the superior cerebellum); a territory may now span levels; examination mode separates the AICA from the other pontine places, the PICA from the lateral medulla alone, and the SCA from a cerebellar hemisphere alone |
| P13 | Vertical gaze and the pupils: the dorsal midbrain (Parinaud syndrome) — upgaze palsy, light–near dissociation and convergence–retraction nystagmus from the pretectum, a midline place; examination mode separates it from the horizontal-gaze places of P9 |
| P14 | The fourth and fifth nerves: the trochlear nucleus, whose lesion weakens the superior oblique of the other eye, and the trigeminal motor and principal sensory nuclei in the mid-pontine tegmentum, with the jaw deviating to the side of the lesion; the third nerve's pupil recorded as a limit, not modelled, with the reason |
| P15 | The basal ganglia: hemiballismus from the opposite subthalamic nucleus. Parkinsonism and chorea are recorded as degenerations the sources give no side for, not modelled as places |
| P16 | Gaze deviation and Gerstmann syndrome: the frontal eye field turns the eyes toward a hemisphere lesion for days only — the first brain sign that changes with time, so a gaze palsy that lasts points to the pons — and the dominant inferior parietal lobule gives Gerstmann signs |
| P17 | Locked-in syndrome: the ventral pons on both sides, from the basilar artery — awake, cannot move or speak, answers by looking up; one lesion across both sides of the pons |
| P18 | Both occipital lobes: cortical blindness with the centre kept and the pupils reacting. The top-of-the-basilar syndrome was planned and cut, because no source gives it a fixed set of parts |
| P19 | The deep and superficial fibular nerves, and the deep one in the anterior tarsal tunnel: foot drop with eversion spared, weak eversion with the dorsum numb, a numb first web alone |
| P20 | The tarsal tunnel: the tibial nerve at the ankle numbs the sole and keeps the calf and the ankle reflex |
| P21 | The transcortical aphasias: border-zone lesions around Broca or Wernicke area that keep repetition — the one bedside test that tells them from Broca and Wernicke aphasia |
| P22 | Anosognosia and apraxia, audited and **not built**: the sources give each several sites and an occurrence of a half or less, so the panel explains why neither localizes |
| P23 | The saddle and the pudendal nerve: the saddle now reads the perineum, which the pudendal nerve carries from S2–S4, so one side numb with normal legs points to that nerve or a sacral root, not cauda equina |
| P24 | The lateral geniculate nucleus: the optic tract's hemianopia without its pupillary defect, because the pupil's fibres leave the tract just before the nucleus |

## How accuracy is enforced

- **Expected outputs are written first**, from 147 open-access sources that were
  actually read — one of them, S108, as its free abstract only (`docs/SOURCES.md`) — and committed before the code they test. Every later change to
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
- **A clinical review** turns every claim into something a clinician can mark: read or
  print `review/worksheet.md`, or fill in `review/review.html` and save the answers to a file.
  `npm run review:ingest -- <file>` sorts returned reviews into `review/triage.md`. No review
  has been returned yet, so nothing here has been checked by a clinician.

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

### Offline

`dist/` is a complete static site. Served over HTTPS (or from `localhost`), it registers a
service worker that keeps the app and Three.js for use with no network; open it once online,
then use the browser's *Install* or *Add to Home screen*. Any static host will do, GitHub
Pages included. Practice progress lives in that browser; *Save progress to a file* moves it.
