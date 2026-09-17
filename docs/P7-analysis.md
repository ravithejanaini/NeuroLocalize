# P7 — The lower limb: analysis before building

Written before any P7 code or expectation. Every fact below was read, verbatim, from the
source named beside it on 2026-09-17 (S71–S90 in `SOURCES.md`). Nothing here is from memory.

## 1. What P7 must teach

The questions an MBBS student is examined on for the leg, and the finding that answers each:

| Question | The finding that decides it | Source |
|---|---|---|
| Foot drop: common fibular nerve or L5 root? | Ankle inversion (tibialis posterior) and hip abduction (gluteus medius) are L5 but not fibular, so they are weak only in the root lesion | S83 |
| Foot drop: fibular nerve or sciatic nerve? | Plantar flexion, inversion and the hamstrings are weak in sciatic neuropathy; the whole foot is numb | S78, S75 |
| Sciatic nerve or sacral plexus? | Hip abduction and hip extension are weak in plexopathy | S78, S80, S81 |
| Knee extension weak: femoral nerve or L4 root? | Hip adduction is obturator, not femoral; L2–L4 overlap makes the root lesion broad | S73, S88, S89 |
| Numb lateral thigh with no weakness | The lateral femoral cutaneous nerve is purely sensory, trapped under the inguinal ligament | S74 |
| Which reflex? | Knee jerk L4 (femoral); ankle jerk S1 (tibial) | S82, S89 |
| Which dermatome? | L4 medial malleolus; L5 dorsum of the foot; S1 lateral malleolus and lateral foot | S82 |

## 2. Design

The arm's engine is reused. Two things it cannot yet express are added, each because
anatomy requires it:

1. **A plexus part may share a root with another.** L4 feeds both the lumbar plexus (L1–L4,
   S72) and, through the lumbosacral trunk, the sciatic nerve (S72, S75). A route is valid
   when the root belongs to the part its nerve leaves from.
2. **A nerve may leave another nerve.** The tibial and common fibular nerves divide from the
   sciatic above the popliteal fossa (S75, S76), so a sciatic lesion cuts both.
3. **A muscle may have more than one supply, and may have no sourced root.** Hip flexion is
   psoas (lumbar plexus directly, S85, S89) plus iliacus (femoral, S85, S89): cutting one
   supply leaves hip flexion `indeterminate`, matching "to a lesser extent" (S89). Hip
   adduction and hip extension have no myotome source (D29), so their strength is only
   certain when every root that could serve them is cut, as for skin with no roots (D30).

### Lesion places

| Place | Is | Source |
|---|---|---|
| `lumbar_plexus` | the lumbar plexus, L1–L4 | S72 |
| `sacral_plexus` | the sacral plexus, S1–S4, with L4–L5 through the lumbosacral trunk | S72, S75 |
| `femoral` | the femoral nerve in the pelvis: below the psoas branches, above the nerve to the iliacus and the inguinal ligament | S89, S73 |
| `obturator` | the obturator nerve | S71, S73 |
| `lateral_femoral_cutaneous` | the LFCN at the inguinal ligament | S74 |
| `superior_gluteal` | the superior gluteal nerve | S80 |
| `inferior_gluteal` | the inferior gluteal nerve | S81 |
| `sciatic` | the sciatic nerve in the buttock, above its thigh branches | S75, S78 |
| `tibial` | the tibial nerve below its division from the sciatic | S79 |
| `common_fibular` | the common fibular nerve at the fibular neck | S76, S77 |

### Muscles (one tested movement each)

| Muscle | Movement | Supply | Roots used | Source |
|---|---|---|---|---|
| iliopsoas | hip flexion (L2 row) | psoas: lumbar plexus directly; iliacus: femoral, after the femoral place | L1–L2 | S31, S85, S89 |
| hip adductors | hip adduction | obturator | none sourced; L2–L4 open | S73, S71 |
| quadriceps | knee extension (L3 row) | femoral, after its place | L3–L4 (L2 open) | S31, S82, S88 |
| gluteus medius | hip abduction | superior gluteal | L5 | S80, S83 |
| gluteus maximus | hip extension | inferior gluteal | none sourced; L5–S2 open | S81 |
| hamstrings | knee flexion (S2 row) | sciatic, after its place | S2 (L5–S1 open) | S31, S75, S82, S90 |
| tibialis anterior | ankle dorsiflexion (L4 row) | common fibular | L4–L5 | S31, S82, S76 |
| extensor hallucis longus | great toe extension (L5 row) | common fibular | L5 | S31, S82, S76 |
| fibularis longus | ankle eversion | common fibular | L5 | S78, S76 |
| tibialis posterior | ankle inversion | tibial | L5 | S83, S84 |
| gastrocnemius | ankle plantar flexion (S1 row) | tibial | S1 | S31, S82, S79 |

"Open" roots are `disputedRoots`: losing them alone leaves the muscle `indeterminate`.

### Skin

| Patch | Supply | Roots | Landmark | Source |
|---|---|---|---|---|
| anterior thigh | femoral, after its place | none; L2–L4 open | — | S71, S89 |
| medial thigh | obturator and femoral | none; L2–L4 open | — | S73, S89 |
| lateral thigh | LFCN | none; L2–L3 open | — | S74 |
| medial leg (to the medial malleolus) | saphenous, from femoral | L4 (L3 open) | L4 | S82, S86, S89 |
| dorsum of the foot | superficial fibular, from common fibular | L5 | L5 | S82, S77 |
| first web space | deep fibular, from common fibular | L5 | — | S77, S78 |
| lateral leg | common fibular | none; L4–S2 open | — | S76, S77 |
| lateral foot | sural: tibial and common fibular | S1 (S2 open) | S1 | S82, S87 |
| sole | tibial (plantar nerves) | none; L4–S3 open | — | S79 |

### Signs

| Sign | From lower-motor-neuron weakness of | Source |
|---|---|---|
| foot drop | tibialis anterior | S77, S78 |
| Trendelenburg gait | gluteus medius | S80 |

The knee jerk is judged through the quadriceps' supply, the ankle jerk through the
gastrocnemius' (as the arm's reflexes are, D28).

## 3. Conflicts, recorded rather than resolved

- **C19 — sacral plexus roots.** S72: S1–S4 form the sacral plexus, the lumbosacral trunk
  joining the sciatic; S80 calls L4, L5 and S1 roots of the sacral plexus; S75, S79: the
  sciatic and tibial nerves come from L4–S3. Modelled as L4–S4, which satisfies all three.
- **C20 — tibialis anterior.** S31 gives ankle dorsiflexion to L4; S82 gives tibialis
  anterior to L5. Both roots are kept: each source names a root whose loss weakens it.
- **C21 — quadriceps.** S31: knee extension L3; S82: quadriceps L4; S88: broad L2–L4
  overlap. L3–L4 kept, L2 open.
- **C22 — medial thigh.** S73 gives it to the obturator nerve; S89 to the femoral nerve's
  medial cutaneous branch. Both supply it; losing one leaves it `impaired`.
- **C24 — the femoral lesion place.** S89 puts the nerve to the iliacus above the inguinal
  ligament, and says femoral neuropathy weakens hip flexion "to a lesser extent" through the
  iliacus. The place is therefore the femoral nerve in the pelvis, above that branch; a
  lesion at the inguinal ligament, which would spare the iliacus, is not modelled.
- **C25 — the hamstrings' roots.** S31 gives knee flexion to S2; S82's medial hamstring
  reflex is L5; S90 says S1 contributes and that hamstring weakness is a possible, rare sign
  of S1 radiculopathy. S2 is kept; L5 and S1 are open.
- **C23 — lateral foot in a fibular palsy.** The sural nerve takes a branch from each
  nerve (S87), so the model says `impaired`; S77 and S78 do not list the lateral foot among
  the losses of a fibular palsy. The expectation allows `impaired` or `intact`.

## 4. Deliberately not modelled in P7

A femoral lesion at the inguinal ligament; the pudendal, posterior femoral cutaneous, iliohypogastric, ilioinguinal and genitofemoral
nerves; separate deep and superficial fibular lesion places; tarsal tunnel; piriformis;
the short head of biceps femoris; pectineus and sartorius; the medial hamstring reflex;
foot intrinsics; L1–L3 dermatome patches other than those above. Each is listed on the page
so a student is not misled into thinking it was considered and found normal.

## 5. How P7 is accepted

1. Frozen expectations (`spec/expectations/leg.ts`, `reverse-leg.ts`) are written from the
   tables above and fail against the P6 engine before any engine change.
2. The arm, cord and brain expectations still pass unchanged, except where a frozen case is
   amended (with an entry in `AMENDMENTS.md`) because a leg muscle now answers a strength row.
3. `npm run verify` passes; `npm run mutate` covers every new row and the sourced score does
   not fall below 94%.
4. Examination mode ranks the true lesion first for each reverse case, including the four
   foot-drop and thigh differentials in section 1.
5. The drawing is held to the engine: every leg fibre path passes exactly its route's places.
6. A final audit re-reads each row against its source, and a browser check covers the new
   station, table, body map and presets on desktop and phone.
