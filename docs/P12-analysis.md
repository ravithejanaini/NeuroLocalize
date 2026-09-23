# P12 — The posterior circulation: analysis before building

Written before any P12 code or expectation. Every fact below was read, verbatim, from the
source named beside it on 2026-09-23. Nothing here is from memory or a search summary. The
first NCBI path returned a CAPTCHA page, so the same chapters were read through NCBI's own
`/sites/books/` path; nothing was taken from the search-engine summaries.

| Id | Source |
|---|---|
| S65 | StatPearls — Brainstem Stroke (Gowda, Munakomi; 2026-01-31, the version already registered) — cited since P5, re-read for the lateral pontine syndrome |
| S110 | StatPearls — Neuroanatomy, Cerebellum — cited since P11, for what each artery supplies |
| S113 | StatPearls — Cerebellar Infarction (Lui, Naqvi; 2026-06-17) |
| S114 | StatPearls — Vertebrobasilar Stroke (Benjamin, Ighodaro; 2026-06-08) |
| S115 | StatPearls — Pontine Infarction (Malla, Jillella; 2023-05-29) |

## 1. Why this phase

P11 put the cerebellum in the model; it still has no arteries. At the bedside the three
cerebellar arteries are how a student joins the brainstem to the cerebellum: PICA to the
lateral medulla, AICA to the lateral pons and the ear, SCA to the upper cerebellum. The
lateral pontine (AICA) syndrome needs a finding the model lacks — hearing — and reviewer
question R36 already asks whether PICA should take the cerebellum.

## 2. What the sources state

| Fact | Verbatim | Source |
|---|---|---|
| AICA | "Infarction in the AICA territory often causes dysmetria, unilateral hearing loss or tinnitus, and ipsilateral facial paralysis or anesthesia, with contralateral hemibody pain and temperature sensory loss." | S113 |
| AICA | "causes dysmetria, loss of hearing on the ipsilateral side, and paralysis of the ipsilateral face" | S114 |
| AICA and the ear | "The AICA provides a crucial branch to the labyrinthine artery." | S114 |
| Lateral pons | Marie-Foix syndrome "affects the nuclei of CN VII and VIII, the corticospinal tract, the spinothalamic tract, and the cerebellar tracts, resulting in contralateral hemiparesis, contralateral loss of proprioception and vibration, ipsilateral limb ataxia, ipsilateral facial palsy, lateral hearing loss, vertigo, and nystagmus" | S65 |
| Lateral pons: artery | "the perforating branches of the basilar artery and the anterior inferior cerebellar artery" | S65 |
| Lateral pons | "Ipsilateral Horner syndrome" among the lateral pontine findings | S114 |
| Caudal pons | "sensorineural hearing loss, and vertigo for caudal infarction" | S115 |
| PICA | "Interruption of the PICA results in vertigo, truncal ataxia, and horizontal nystagmus." | S114 |
| PICA | "leads to acute-onset dizziness, vertigo, and inability to walk or stand, sometimes resulting in classical Wallenberg syndrome" | S113 |
| PICA supplies | "the cerebellar nuclei, inferior surface of the vermis, and the undersurface area of the cerebellar hemisphere" | S110 |
| SCA | "tends to produce more ataxia, dysarthria, and nystagmus, with less frequent occurrences of vertigo, headache, and vomiting" | S113 |
| SCA | "causes dysarthria, ataxia, and vomiting" | S114 |
| SCA supplies | the superior vermis and superomedial cortex (medial branch), the superolateral cortex (lateral branch), and the midbrain and colliculi | S110 |

## 3. Design

**One new part and one new sign.** `cochlear` in the pons: the eighth nerve's cochlear nuclei,
which the AICA supplies with the labyrinth. `hearing_loss`, on the side of the lesion.

**A territory may span levels.** PICA supplies the lateral medulla and the inferior cerebellum,
so a territory gains an optional list of further parts at other levels on the same side
(`also`), checked exactly as its own parts are.

**Places**, each with a frozen case, each on either side:

| Place | Takes | Gives |
|---|---|---|
| `aica` | in the pons: facial nucleus, cochlear nuclei, vestibular nuclei, spinothalamic tract, sympathetic fibres, cerebellar peduncle | ipsilateral whole-face palsy, hearing loss, limb ataxia and Horner; vertigo; contralateral pain and temperature loss |
| `pica` | the lateral medulla as P5 has it, and the cerebellar hemisphere and vermis on that side | Wallenberg syndrome, with truncal ataxia |
| `sca` | the cerebellar hemisphere and vermis on that side | ipsilateral limb ataxia with truncal ataxia; no hearing loss. Its midbrain branches (S110) are not taken, so nothing is asserted of the midbrain |

The lateral medullary place of P5 stays as it is: S47 gives it to "PICA or vertebral artery",
and S113 says PICA occlusion only *sometimes* gives the full Wallenberg syndrome.

## 4. Conflicts and limits, recorded rather than resolved

- **C37 — Weakness and position sense in the lateral pons.** S65's Marie-Foix syndrome adds
  contralateral hemiparesis and loss of proprioception and vibration, from basilar perforators
  as well as the AICA. S113 and S114, describing the AICA territory, name neither. The AICA
  place takes the lateral structures only; the case asserts neither strength nor vibration.
- **C38 — PICA without the medulla, or without the cerebellum.** S113: PICA occlusion
  *sometimes* gives Wallenberg syndrome, so it can be cerebellar alone; the lateral medullary
  place can occur without the cerebellum. The model offers the full PICA territory as one
  place and keeps the medullary place alone beside it.
- **C39 — Facial sensation in the AICA syndrome.** S113: facial "paralysis or anesthesia". The
  model's trigeminal nucleus is in the medulla only (P5), so the AICA place does not take it
  and the case asserts nothing about facial sensation.
- **C40 — Vertigo from the SCA.** S113 says *less frequent*, not absent. The SCA place does
  not take the vestibular nuclei, and the case asserts nothing about vertigo.

Found in the audit of this analysis, before any code: the first draft said the SCA place gives
"no brainstem sign", which S110 contradicts — the SCA's medial branch supplies the midbrain and
colliculi. The model does not take those branches, so it asserts nothing about the midbrain
rather than asserting it is spared.

## 5. Deliberately not modelled in P12

Tinnitus; the labyrinth as a separate structure from the cochlear nuclei; dysarthria and
vomiting; the midbrain branches of the SCA; the basilar artery as a place (locked-in syndrome,
top of the basilar); malignant cerebellar oedema; the vertebral artery as distinct from PICA.

## 6. How P12 is accepted

1. Frozen cases for all three places, run red against the P11 engine before any P12 engine
   code.
2. Examinations that separate AICA from the other pontine places, PICA from the lateral
   medulla alone, and SCA from a cerebellar hemisphere alone.
3. Every earlier frozen case still passes.
4. `npm run verify` passes; the mutation run leaves no P12 row with a survivor.
5. A browser check of the presets, the hearing control and the findings panel.
