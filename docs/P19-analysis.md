# P19 — The deep and superficial fibular nerves: analysis before building

Written before any P19 code or expectation. Every fact below was read, verbatim, on 2026-09-24,
from the source itself through the NCBI Bookshelf. Search-engine summaries were used only to
find the pages.

| Id | Source |
|---|---|
| S138 | StatPearls — Anatomy, Bony Pelvis and Lower Limb: Superficial Peroneal Nerve (Superficial Fibular Nerve) (Garrett, Black, Launico, Geiger; 2023-10-24) |
| S139 | StatPearls — Anatomy, Bony Pelvis and Lower Limb: Calf Deep Peroneal Nerve (Deep Fibular Nerve) (Palmisano, Launico; 2025-08-09) |
| S76, S77, S78, S83 | cited since P7 for the common fibular nerve and foot drop |

## 1. Why this phase

Since P7 the leg panel has said: "Not modelled: … deep and superficial fibular lesions apart."
The model already has every muscle and patch of skin that tells the two branches apart:
tibialis anterior and the great-toe extensor (deep), fibularis longus (superficial), the first
web space (deep), and the dorsum of the foot and the anterolateral leg (superficial). Only the
branches themselves, as places, are missing. S139 also gives a third place, low on the deep
branch: the anterior tarsal tunnel at the ankle.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| Two branches | the superficial nerve "originates from the common peroneal nerve alongside the deep peroneal nerve" | S138 |
| Where they divide | "arising in the lateral compartment of the leg where the common fibular nerve bifurcates into its superficial and deep branches … between the upper segment of the fibularis longus (peroneus longus) muscle and the head of the fibula" | S139 |
| Superficial, motor | "provides motor stimulation to the peroneus longus and peroneus brevis muscles"; they are "primarily responsible for eversion" | S138 |
| Superficial, skin | "sensory innervation to the leg's anterolateral aspect, the dorsum of the foot, and the dorsal aspect of the toes, except the 1st interdigital space … which is innervated by the deep peroneal nerve" | S138 |
| Superficial, lesion | "Injury to the superficial peroneal nerve diminishes the ability to evert the foot. Additionally, the foot dorsum exhibits loss of sensation, except in the web space between the first two digits" | S138 |
| Deep, motor | "the deep fibular nerve supplies the tibialis anterior, extensor hallucis longus, extensor digitorum longus, and fibularis tertius" | S139 |
| Deep, skin | "The sensory component provides cutaneous innervation to the 1st web space" | S139 |
| Deep, lesion | "Injury to the deep fibular nerve may result in foot drop due to loss of dorsiflexion, along with sensory loss in the 1st web space." | S139 |
| Foot drop | "Common causes include injury to the deep or common fibular nerve, radiculopathy of the 5th lumbar spinal nerve, and upper motor neuron lesions." | S139 |
| Anterior tarsal tunnel | "a compression neuropathy of the deep fibular nerve as it passes beneath the inferior extensor retinaculum at the anterior ankle" | S139 |
| Its findings | "dorsal foot pain, sensory disturbance in the 1st web space, and, in some cases, weakness of toe extension" | S139 |
| At the ankle | the deep nerve "divides into lateral and medial terminal branches at the level of the ankle"; the lateral branch supplies "the extensor digitorum brevis … and the extensor hallucis brevis" | S139 |
| Roots | "The common peroneal nerve comprises fibers from spinal nerves L4 through S1" | S138 |
| Roots, against | "the common fibular nerve, which originates from spinal nerves L4 to S2" | S139 |

## 3. Design

**Two new nerves, branching from the common fibular nerve**, as the tibial and common fibular
branch from the sciatic (P7):

- the **deep fibular** nerve, with two places: high in the leg, above its muscle branches, and
  at the **anterior tarsal tunnel**, below them and above its skin branch. It supplies tibialis
  anterior and the great-toe extensor (extensor hallucis longus), and the skin of the first web;
- the **superficial fibular** nerve, with one place, above its branches. It supplies fibularis
  longus and the skin of the anterolateral leg and the dorsum of the foot.

The muscles and skin move from the common fibular nerve to the branch that serves them. A
lesion of the common fibular nerve reaches them through the branches, as a sciatic lesion
reaches the tibial muscles. **The common fibular nerve's findings must not change.** Its frozen
case of P7 is the check. The sural share of the lateral foot stays with the common fibular.

What each place shows:

- **deep fibular:** foot drop, weak great-toe extension, eversion strong, the first web numb,
  the dorsum and the lateral leg intact;
- **superficial fibular:** weak eversion, no foot drop, the dorsum and the anterolateral leg
  numb, the first web intact;
- **anterior tarsal tunnel:** the first web numb and nothing else the model can test. The
  muscles are supplied higher in the leg.

## 4. Conflicts and limits, recorded rather than resolved

- **C57 — The common fibular nerve's roots.** S138 gives L4–S1; S139, like S76 since P7, gives
  L4–S2. The model keeps L4–S2 and draws the branches with it. No finding depends on S2 here.
- **C58 — Toe extension in the anterior tarsal tunnel.** S139 says toe extension is weak "in
  some cases". That weakness is of the short extensors on the foot, which the model does not
  test. The model's great-toe extensor is extensor hallucis longus, supplied in the leg, so it
  stays strong. The examination therefore tests the first web alone.

## 5. Deliberately not modelled in P19

Pain and paresthesia as findings; compartment syndrome; the extensor digitorum brevis and
hallucis brevis; the accessory deep fibular nerve (S139); the variants of the superficial
nerve's course (S138). The tarsal tunnel of the tibial nerve, the pudendal and the posterior
femoral cutaneous nerves stay for later.

## 6. How P19 is accepted

1. Three frozen cases — deep fibular, superficial fibular, anterior tarsal tunnel — run against
   the P18 engine before any P19 code.
2. Two examinations: foot drop with eversion strong and only the first web numb → the deep
   fibular nerve; the first web numb with every muscle strong → the anterior tarsal tunnel.
3. Every earlier frozen case still passes — in particular the common fibular nerve's.
4. `npm run verify` passes; the mutation run leaves no P19 row with a survivor.
5. A browser check.
