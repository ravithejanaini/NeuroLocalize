// The knowledge base. Data only — scripts/check-boundaries.ts rejects any function here.
// Each row's `claim` is what a clinical reviewer is asked to confirm.
import { BRAIN } from './brain.ts';
import { PLEXUS } from './plexus.ts';
import { VISION } from './vision.ts';
import type { Kb } from './types.ts';

export const KB: Kb = {
  pathways: {
    posteriorColumn: {
      meta: {
        id: 'pathway.posterior-column',
        claim: 'Posterior-column sensation ascends on the side of entry and crosses only in the medulla, so a cord lesion removes it ipsilaterally below the lesion.',
        sources: ['S01', 'S15', 'S05'],
        tier: 'T1',
        bookRef: 'pending',
      },
      ascendsOn: 'ipsilateral',
    },
    spinothalamic: {
      meta: {
        id: 'pathway.spinothalamic',
        claim: 'Pain and temperature fibres cross in the anterior white commissure one to three segments rostral to entry and ascend contralaterally.',
        sources: ['S01', 'S11'],
        tier: 'T3',
        bookRef: 'pending',
        conflict: 'C1',
      },
      crossingOffset: [1, 3],
      ascendsOn: 'contralateral',
    },
    corticospinal: {
      meta: {
        id: 'pathway.corticospinal',
        claim: 'Within the cord the lateral corticospinal tract has already crossed, so a cord lesion weakens muscles on its own side below it.',
        sources: ['S01', 'S15', 'S05'],
        tier: 'T1',
        bookRef: 'pending',
      },
      descendsOn: 'ipsilateral',
    },
  },

  compartments: {
    motorNeuron: {
      meta: {
        id: 'compartment.lower-motor-neuron',
        claim: 'Damage to anterior horn cells or ventral roots produces lower-motor-neuron weakness at those segments.',
        sources: ['S18', 'S01', 'S19'],
        tier: 'T1',
        bookRef: 'pending',
      },
      lowerMotorNeuron: ['anterior_horn', 'ventral_root'],
    },
    dorsalRoot: {
      meta: {
        id: 'compartment.dorsal-root',
        claim: 'A dorsal root carries both pain–temperature and posterior-column input for its segment.',
        sources: ['S13', 'S19'],
        tier: 'T2',
        bookRef: 'pending',
      },
      carries: ['pain_temperature', 'posterior_column'],
    },
    reflexArc: {
      meta: {
        id: 'compartment.reflex-arc',
        claim: 'A segmental reflex runs through the dorsal root, the anterior horn and the ventral root; damage to any of them depresses it.',
        sources: ['S12', 'S13', 'S18'],
        tier: 'T2',
        bookRef: 'pending',
      },
      via: ['dorsal_root', 'anterior_horn', 'ventral_root'],
    },
  },

  autonomic: {
    ciliospinal: {
      meta: {
        id: 'autonomic.ciliospinal',
        claim: 'Oculosympathetic first-order fibres descend uncrossed to the ciliospinal centre at C8–T2; a cord lesion at or above it causes an ipsilateral Horner syndrome.',
        sources: ['S16', 'S01'],
        tier: 'T2',
        bookRef: 'pending',
      },
      centre: ['C8', 'T2'],
      firstOrderRunsOn: 'ipsilateral',
    },
    micturitionCentre: {
      meta: {
        id: 'autonomic.micturition-centre',
        claim: 'The sacral micturition centre lies at S2–S4, and its reflex arc runs through those segments and roots.',
        sources: ['S20', 'S22'],
        tier: 'T2',
        bookRef: 'pending',
      },
      span: ['S2', 'S4'],
      arc: ['dorsal_root', 'anterior_horn', 'intermediolateral', 'ventral_root'],
    },
    bladderControl: {
      meta: {
        id: 'autonomic.bladder-control',
        claim: 'Descending bladder control survives a unilateral cord lesion; sphincter function is generally spared in hemisection.',
        sources: ['S01'],
        tier: 'T2',
        bookRef: 'pending',
        pendingSource: 'R7: the pathway’s position in the lateral funiculus is not stated by any source read',
      },
      requiresBilateralLesion: true,
    },
    sympatheticOutflow: {
      meta: {
        id: 'autonomic.sympathetic-outflow',
        claim: 'Second-order oculosympathetic neurons leave the cord at T1, so a lesion of the T1 root causes an ipsilateral Horner syndrome.',
        sources: ['S16', 'S36'],
        tier: 'T1',
        bookRef: 'pending',
      },
      root: 'T1',
    },
    sympatheticRootCompartment: {
      meta: {
        id: 'autonomic.sympathetic-root-compartment',
        claim: 'The preganglionic sympathetic fibres leave in the ventral root, so a dorsal root lesion alone spares them.',
        sources: ['S69', 'S16'],
        tier: 'T2',
        bookRef: 'pending',
      },
      compartment: 'ventral_root',
    },
  },

  reflexes: {
    biceps: {
      meta: { id: 'reflex.biceps', claim: 'The biceps reflex is served by C5–C6.', sources: ['S12', 'S19'], tier: 'T1', bookRef: 'pending' },
      span: ['C5', 'C6'],
    },
    brachioradialis: {
      meta: {
        id: 'reflex.brachioradialis',
        claim: 'The brachioradialis reflex is served by C5–C6 (S12); S19 lists it under C6 alone.',
        sources: ['S12', 'S19'],
        tier: 'T3',
        bookRef: 'pending',
        conflict: 'C3',
      },
      span: ['C5', 'C6'],
    },
    triceps: {
      meta: {
        id: 'reflex.triceps',
        claim: 'The triceps reflex is served by C7–C8, predominantly C7. (C6–C7 is also taught; no source read gives it — see C2.)',
        sources: ['S12'],
        tier: 'T2',
        bookRef: 'pending',
      },
      span: ['C7', 'C8'],
    },
    patellar: {
      meta: { id: 'reflex.patellar', claim: 'The patellar reflex is served by L2–L4, predominantly L4.', sources: ['S12'], tier: 'T2', bookRef: 'pending' },
      span: ['L2', 'L4'],
    },
    achilles: {
      meta: { id: 'reflex.achilles', claim: 'The Achilles reflex is served by S1.', sources: ['S12'], tier: 'T2', bookRef: 'pending' },
      span: ['S1', 'S1'],
    },
    bulbocavernosus: {
      meta: {
        id: 'reflex.bulbocavernosus',
        claim: 'The bulbocavernosus reflex is served by the S2–S4 segments through the pudendal nerve, afferent and efferent (R4, D132).',
        sources: ['S148', 'S149', 'S22', 'S09'],
        tier: 'T1',
        bookRef: 'pending',
      },
      span: ['S2', 'S4'],
    },
  },

  vertebrae: [
    {
      meta: {
        id: 'vertebra.L1',
        claim: 'At the L1 vertebra lies the conus medullaris, which holds cord segments S2–S5 and coccygeal (its tip ranges from T11 to L3).',
        sources: ['S14', 'S09'],
        tier: 'T2',
        bookRef: 'pending',
      },
      vertebra: 'L1',
      segments: ['S2', 'Co1'],
    },
  ],

  regions: {
    cervical: {
      meta: { id: 'region.cervical', claim: 'The cervical cord is segments C1–C8.', sources: [], tier: 'T1', bookRef: 'pending', definitional: true },
      span: ['C1', 'C8'],
    },
    lowerLimb: {
      meta: {
        id: 'region.lower-limb',
        claim: 'The lower limb is served by segments L2–S2.',
        sources: [],
        tier: 'T2',
        bookRef: 'pending',
        pendingSource: 'R5: a modelling convention; no source read defines it',
      },
      span: ['L2', 'S2'],
    },
    sacral: {
      meta: { id: 'region.sacral', claim: 'The sacral cord is segments S1–S5.', sources: [], tier: 'T1', bookRef: 'pending', definitional: true },
      span: ['S1', 'S5'],
    },
  },

  plexus: PLEXUS,
  vision: VISION,
  brain: BRAIN,

  observations: {
    spinalShock: {
      meta: {
        id: 'observation.spinal-shock',
        claim: 'Spinal shock is a flaccid paralysis. Below a complete lesion, deep tendon reflexes are absent for the first three days and return from day four, while the bulbocavernosus reflex is among the first to return, within the first day; the Babinski sign may appear from day four; bladder control is impaired throughout.',
        sources: ['S02'],
        tier: 'T2',
        bookRef: 'pending',
      },
      reflexesAbsent: ['hyperacute', 'acute'],
      returnEarly: ['bulbocavernosus'],
      tone: 'reduced',
      babinskiAbsent: ['hyperacute', 'acute'],
      bladderImpaired: ['hyperacute', 'acute', 'subacute'],
    },
    neurogenicShock: {
      meta: {
        id: 'observation.neurogenic-shock',
        claim: 'Neurogenic shock follows acute cord injury chiefly above T6, and its symptoms may persist for four to five weeks.',
        sources: ['S03', 'S15'],
        tier: 'T2',
        bookRef: 'pending',
      },
      strictlyAbove: 'T6',
      during: ['hyperacute', 'acute'],
      mayPersist: ['subacute'],
    },
    dysreflexia: {
      meta: {
        id: 'observation.dysreflexia',
        claim: 'Autonomic dysreflexia follows injury at or above T6, is rare below T10, and is uncommon in the first month.',
        sources: ['S04'],
        tier: 'T2',
        bookRef: 'pending',
      },
      atOrAbove: 'T6',
      rareBelow: 'T10',
      from: ['chronic'],
    },
    chronicUmn: {
      meta: {
        id: 'observation.chronic-umn',
        claim: 'An established upper-motor-neuron lesion gives hyperreflexia, spasticity and a Babinski sign.',
        sources: ['S12', 'S02'],
        tier: 'T2',
        bookRef: 'pending',
      },
      reflex: 'brisk',
      tone: 'increased',
      babinskiPresent: true,
    },
    babinski: {
      meta: {
        id: 'observation.babinski-level',
        claim: 'The plantar reflex runs from the S1 dermatome to the S1 segment; when the corticospinal tract is damaged the input spreads to the L5 and L4 anterior horn cells and the great toe extends. So a Babinski sign needs corticospinal interruption rostral to L5 with the S1 arc intact (R6, D134).',
        sources: ['S151', 'S12'],
        tier: 'T2',
        bookRef: 'pending',
      },
      corticospinalRostralTo: 'L5',
    },
    lmn: {
      meta: {
        id: 'observation.lmn',
        claim: 'Lower-motor-neuron loss gives flaccid weakness with depressed reflexes.',
        sources: ['S18', 'S09'],
        tier: 'T1',
        bookRef: 'pending',
      },
      tone: 'reduced',
      partialReflex: 'reduced',
    },
    armPredominance: {
      meta: {
        id: 'observation.arm-predominance',
        claim: 'A central lesion of the cervical cord weakens the arms more than the legs, most of all the hands.',
        sources: ['S06'],
        tier: 'T2',
        bookRef: 'pending',
      },
      compartment: 'lateral_cst',
      region: 'cervical',
    },
    sacralSparing: {
      meta: {
        id: 'observation.sacral-sparing',
        claim: 'A central cord lesion usually spares sacral sensation.',
        sources: ['S06'],
        tier: 'T2',
        bookRef: 'pending',
      },
      compartment: 'anterolateral',
      region: 'sacral',
    },
    romberg: {
      meta: {
        id: 'observation.romberg',
        claim: 'Proprioceptive loss in the legs produces a positive Romberg test. Uncompensated vestibular dysfunction can also make it positive, and cerebellar patients — ataxic in the limbs or the trunk — are unsteady with the eyes open, so it is not read when any of these is present. It is reported as untestable when the legs are weak.',
        sources: ['S13', 'S67', 'S111'],
        tier: 'T2',
        bookRef: 'pending',
        pendingSource: 'the weak-legs exclusion is a modelling convention; no source read states it',
      },
      region: 'lowerLimb',
      untestableWithWeakLegs: true,
      unreadableWithVertigoOrAtaxia: true,
    },
    overlap: {
      meta: {
        id: 'observation.dermatomal-overlap',
        claim: 'Because dermatomes overlap, losing a single segment’s input reduces sensation there rather than abolishing it: after one root, decreased sensation is noted along its dermatome (R2, D135).',
        sources: ['S21', 'S82'],
        tier: 'T2',
        bookRef: 'pending',
      },
      isolatedLossReadsAs: 'impaired',
    },
    bladder: {
      meta: {
        id: 'observation.bladder',
        claim: 'A lesion above the micturition centre gives an overactive bladder with possible dyssynergia; a lesion of the centre or its roots gives a hypoactive bladder with retention.',
        sources: ['S20', 'S02'],
        tier: 'T2',
        bookRef: 'pending',
      },
      aboveCentre: 'suprasacral',
      atCentre: 'sacral',
      duringShock: 'impaired_in_spinal_shock',
    },
  },
};
