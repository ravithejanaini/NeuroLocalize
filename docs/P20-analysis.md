# P20 — The tarsal tunnel: analysis before building

Written before any P20 code or expectation. Every fact below was read, verbatim, on 2026-09-24,
from the source itself through the NCBI Bookshelf. Search-engine summaries were used only to
find the pages.

| Id | Source |
|---|---|
| S140 | StatPearls — Tarsal Tunnel Syndrome (Adler, Bergman, Kaiser; 2026-05-24) |
| S141 | StatPearls — Tibial Neuropathy (Lew, Stearns; 2023-06-26) |
| S79 | cited since P7 for the tibial nerve |

## 1. Why this phase

The leg panel has named "the tibial nerve's tarsal tunnel" as not modelled since P19. It is the
twin of P19's anterior tarsal tunnel: a nerve compressed at the ankle, below the branches to its
leg muscles, so the foot's skin is lost and the leg's strength and reflex are kept. The model
already has the tibial nerve, its leg muscles, the ankle reflex and the sole. Only the place at
the ankle is missing.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Definition | "an entrapment neuropathy caused by compression of the tibial nerve within the posterior tarsal tunnel" | S140 |
| Where | "a narrow fibro-osseous space located posteroinferior to the medial malleolus"; its roof is "the flexor retinaculum" | S140 |
| The branches | the posterior tibial nerve "gives rise to the medial calcaneal nerve before dividing within the tarsal tunnel into 2 terminal branches, the medial (MPN) and lateral (LPN) plantar nerves" | S140 |
| Their skin | the MPN supplies "the medial half of the foot and the plantar surfaces of the first 3-1/2 digits"; the LPN "the lateral calcaneus and the plantar surfaces of the lateral 1-1/2 digits" | S140 |
| The sign | "Patients may exhibit diminished plantar sensation corresponding to the MPN or LPN distribution." | S140 |
| Strength | "Strength deficits typically appear as a late finding in TTS"; "Weakness of toe flexion and extension may develop in severe or chronic cases due to atrophy of the intrinsic foot muscles" | S140 |
| The heel | "A key component of tibial neuropathy at the tarsal tunnel or distally is the sparing of sensation over the heel. This is because the calcaneal branch of the tibial nerve branches off proximal to the tarsal tunnel" | S141 |
| The heel, variant | the medial calcaneal nerve "typically arises from the PTN proximal to the tarsal tunnel … In approximately 25% of individuals, this nerve either branches from the LPN or courses superficial to the flexor retinaculum" | S140 |
| The leg muscles | "The tibial nerve in the lower leg, proximal to the tarsal tunnel, provides motor innervation to the gastrocnemius, soleus, popliteus, flexor hallucis longus, flexor hallucis digitorum, tibialis posterior, and plantaris muscles." | S141 |
| The reflex | "Tarsal tunnel syndrome generally does not affect the Achilles reflex." | S141 |

## 3. Design

**The tibial nerve gets a second place: the tarsal tunnel.** It lies below the branches to the
leg muscles and to the sural nerve, and above the plantar nerves. The sole — which the model has
always defined as the plantar branches' territory — moves to after both places; the gastrocnemius
and tibialis posterior stay after the first only. What the tunnel shows:

- the sole numb;
- plantar flexion (gastrocnemius) and inversion (tibialis posterior) strong, the ankle reflex
  normal;
- the lateral foot (the sural nerve) and everything fibular intact.

A tibial lesion high in the leg (P7) is unchanged: it still takes the sole through both places.

## 4. Conflicts and limits, recorded rather than resolved

- **C59 — The heel.** S141 says the heel is spared in the tunnel; S140 says the heel's nerve
  arises from the lateral plantar nerve, or runs outside the retinaculum, in about 25%. The model
  has one plantar patch, "the sole", and no heel patch, so it neither shows the heel spared nor
  shows it lost. The examination does not test it.
- **C60 — Weakness of the intrinsic foot muscles.** S140 gives weakness "in severe or chronic
  cases" and "as a late finding". The intrinsic muscles of the foot are not in the model, which
  therefore shows the tunnel as purely sensory.

## 5. Deliberately not modelled in P20

Pain, the Tinel sign and the provocative tests (S140); the medial and lateral plantar nerves as
places of their own; the heel; the intrinsic foot muscles and claw toes.

## 6. How P20 is accepted

1. A frozen case for the tarsal tunnel, run against the P19 engine before any P20 code.
2. An examination: the sole numb, with plantar flexion, inversion and the ankle reflex normal —
   the answer is the tarsal tunnel, not the tibial nerve in the leg, S1 or the sciatic nerve.
3. Every earlier frozen case still passes — in particular the P7 tibial case.
4. `npm run verify` passes; the mutation run leaves no P20 row with a survivor.
5. A browser check.
