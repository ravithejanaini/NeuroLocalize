// The lumbosacral plexus and the nerves, muscles and skin of the leg (P7). Data only; every
// row is a line of docs/P7-analysis.md, with the source it was read from.
import type { Plexus } from './types.ts';
import type { LegMuscle, LegNerve, LegSkinArea } from './vocab.ts';

const p = 'pending' as const;

export const LEG_PARTS: Plexus['legParts'] = {
  meta: {
    id: 'plexus.leg-parts',
    claim: 'The lumbar plexus is formed by L1–L4. The sacral plexus is formed by S1–S4, with L4 and L5 joining it through the lumbosacral trunk, so L4 serves both.',
    sources: ['S72', 'S80', 'S75'],
    tier: 'T3',
    bookRef: p,
    conflict: 'C19',
  },
  roots: { lumbar: ['L1', 'L4'], sacral: ['L4', 'S4'] },
};

export const LEG_NERVE_ROWS: Pick<Plexus['nerves'], LegNerve> = {
  nerve_to_psoas: {
    meta: {
      id: 'nerve.psoas-branches',
      claim: 'The psoas is supplied by short branches of the lumbar plexus itself, not by a named nerve.',
      sources: ['S85', 'S89'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'plexus', part: 'lumbar' },
    sites: [],
  },
  femoral: {
    meta: {
      id: 'nerve.femoral',
      claim: 'The femoral nerve leaves the lumbar plexus. The lesion place is in the pelvis, above its branch to the iliacus; its anterior cutaneous branches, the quadriceps branches and the saphenous nerve all leave below it.',
      sources: ['S89', 'S73', 'S71'],
      tier: 'T3',
      bookRef: p,
      conflict: 'C24',
    },
    origin: { from: 'plexus', part: 'lumbar' },
    sites: ['femoral'],
  },
  obturator: {
    meta: {
      id: 'nerve.obturator',
      claim: 'The obturator nerve leaves the lumbar plexus.',
      sources: ['S71', 'S73'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'plexus', part: 'lumbar' },
    sites: ['obturator'],
  },
  lateral_femoral_cutaneous: {
    meta: {
      id: 'nerve.lateral-femoral-cutaneous',
      claim: 'The lateral femoral cutaneous nerve leaves the lumbar plexus and is purely sensory; meralgia paresthetica is its entrapment beneath the inguinal ligament.',
      sources: ['S74', 'S71'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'plexus', part: 'lumbar' },
    sites: ['lateral_femoral_cutaneous'],
  },
  superior_gluteal: {
    meta: {
      id: 'nerve.superior-gluteal',
      claim: 'The superior gluteal nerve leaves the sacral plexus.',
      sources: ['S80'],
      tier: 'T2',
      bookRef: p,
    },
    origin: { from: 'plexus', part: 'sacral' },
    sites: ['superior_gluteal'],
  },
  inferior_gluteal: {
    meta: {
      id: 'nerve.inferior-gluteal',
      claim: 'The inferior gluteal nerve leaves the sacral plexus and is the motor nerve of gluteus maximus.',
      sources: ['S81'],
      tier: 'T2',
      bookRef: p,
    },
    origin: { from: 'plexus', part: 'sacral' },
    sites: ['inferior_gluteal'],
  },
  sciatic: {
    meta: {
      id: 'nerve.sciatic',
      claim: 'The sciatic nerve leaves the sacral plexus; the lesion place is in the buttock, above its branches to the hamstrings.',
      sources: ['S75', 'S72', 'S78'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'plexus', part: 'sacral' },
    sites: ['sciatic'],
  },
  tibial: {
    meta: {
      id: 'nerve.tibial',
      claim: 'The tibial nerve divides from the sciatic nerve before the popliteal fossa; its first lesion place is below the division, above its muscle branches. It then supplies the calf, gives its branch to the sural nerve, and passes behind the medial malleolus through the tarsal tunnel — its second place — to divide into the plantar nerves.',
      sources: ['S75', 'S79', 'S140', 'S141'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'nerve', nerve: 'sciatic' },
    sites: ['tibial', 'tarsal_tunnel'],
  },
  common_fibular: {
    meta: {
      id: 'nerve.common-fibular',
      claim: 'The common fibular nerve divides from the sciatic nerve before the popliteal fossa and divides again at the fibular neck, where the lesion place is, into its deep and superficial branches (P19), which carry its muscles and skin; its own branch to the sural nerve leaves above.',
      sources: ['S75', 'S76', 'S77', 'S139'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'nerve', nerve: 'sciatic' },
    sites: ['common_fibular'],
  },
  deep_fibular: {
    meta: {
      id: 'nerve.deep-fibular',
      claim: 'The deep fibular nerve leaves the common fibular nerve between fibularis longus and the head of the fibula. It supplies the anterior compartment in the leg, then passes beneath the inferior extensor retinaculum at the ankle — the anterior tarsal tunnel — to the first web space. Its two lesion places are high in the leg, above its muscle branches, and in the tunnel, below them.',
      sources: ['S139', 'S138'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'nerve', nerve: 'common_fibular' },
    sites: ['deep_fibular', 'anterior_tarsal'],
  },
  superficial_fibular: {
    meta: {
      id: 'nerve.superficial-fibular',
      claim: 'The superficial fibular nerve, the smaller branch of the common fibular nerve, runs through fibularis longus and supplies the lateral compartment and the skin of the anterolateral leg and the dorsum of the foot, except the first web space. Its lesion place is above its branches.',
      sources: ['S138', 'S139'],
      tier: 'T1',
      bookRef: p,
    },
    origin: { from: 'nerve', nerve: 'common_fibular' },
    sites: ['superficial_fibular'],
  },
};

export const LEG_MUSCLE_ROWS: Pick<Plexus['muscles'], LegMuscle> = {
  iliopsoas: {
    meta: {
      id: 'muscle.iliopsoas',
      claim: 'Hip flexion is the iliopsoas: the psoas from the lumbar plexus directly, the iliacus from the femoral nerve. S31 gives hip flexion to L1 and L2. A femoral lesion weakens it only in part.',
      sources: ['S85', 'S89', 'S31'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'nerve_to_psoas', after: 0 }, { nerve: 'femoral', after: 1 }],
    roots: ['L1', 'L2'],
    myotome: 'L2',
  },
  hip_adductors: {
    meta: {
      id: 'muscle.hip-adductors',
      claim: 'The hip adductors are supplied by the obturator nerve; no source read gives their roots, so any obturator root may serve them.',
      sources: ['S73', 'S71'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'obturator', after: 1 }],
    roots: null,
    disputedRoots: ['L2', 'L4'],
  },
  quadriceps: {
    meta: {
      id: 'muscle.quadriceps',
      claim: 'The quadriceps is supplied by the femoral nerve below the inguinal ligament; S31 gives knee extension to L3 and S82 the quadriceps to L4, with a broad L2–L4 overlap (S88).',
      sources: ['S89', 'S73', 'S31', 'S82', 'S88'],
      tier: 'T3',
      bookRef: p,
      conflict: 'C21',
    },
    supply: [{ nerve: 'femoral', after: 1 }],
    roots: ['L3', 'L4'],
    disputedRoots: ['L2', 'L2'],
    myotome: 'L3',
  },
  gluteus_medius: {
    meta: {
      id: 'muscle.gluteus-medius',
      claim: 'Gluteus medius, the hip abductor, is supplied by the superior gluteal nerve and has L5 innervation.',
      sources: ['S80', 'S83'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'superior_gluteal', after: 1 }],
    roots: ['L5', 'L5'],
  },
  gluteus_maximus: {
    meta: {
      id: 'muscle.gluteus-maximus',
      claim: 'Gluteus maximus, the hip extensor, is supplied by the inferior gluteal nerve; no source read gives its roots, so any of L5–S2 may serve it.',
      sources: ['S81'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'inferior_gluteal', after: 1 }],
    roots: null,
    disputedRoots: ['L5', 'S2'],
  },
  hamstrings: {
    meta: {
      id: 'muscle.hamstrings',
      claim: 'The hamstrings are supplied by the sciatic nerve in the thigh. S31 gives knee flexion to S2; the medial hamstring reflex is L5 (S82); S1 contributes, and its loss rarely weakens them (S90).',
      sources: ['S75', 'S31', 'S82', 'S90'],
      tier: 'T3',
      bookRef: p,
      conflict: 'C25',
    },
    supply: [{ nerve: 'sciatic', after: 1 }],
    roots: ['S2', 'S2'],
    disputedRoots: ['L5', 'S1'],
    myotome: 'S2',
  },
  tibialis_anterior: {
    meta: {
      id: 'muscle.tibialis-anterior',
      claim: 'Tibialis anterior, the ankle dorsiflexor, is supplied by the deep branch of the common fibular nerve; S31 gives dorsiflexion to L4 and S82 the muscle to L5.',
      sources: ['S76', 'S77', 'S31', 'S82'],
      tier: 'T3',
      bookRef: p,
      conflict: 'C20',
    },
    supply: [{ nerve: 'deep_fibular', after: 1 }],
    roots: ['L4', 'L5'],
    myotome: 'L4',
  },
  toe_extensor: {
    meta: {
      id: 'muscle.toe-extensor',
      claim: 'Extensor hallucis longus, the great toe extensor, is supplied by the deep branch of the common fibular nerve and is L5.',
      sources: ['S76', 'S77', 'S31', 'S82', 'S139'],
      tier: 'T1',
      bookRef: p,
    },
    supply: [{ nerve: 'deep_fibular', after: 1 }],
    roots: ['L5', 'L5'],
    myotome: 'L5',
  },
  fibularis: {
    meta: {
      id: 'muscle.fibularis',
      claim: 'Fibularis longus, the ankle evertor, is supplied by the superficial branch of the common fibular nerve; L5 radiculopathy weakens the evertors.',
      sources: ['S76', 'S77', 'S78', 'S138'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'superficial_fibular', after: 1 }],
    roots: ['L5', 'L5'],
  },
  tibialis_posterior: {
    meta: {
      id: 'muscle.tibialis-posterior',
      claim: 'Tibialis posterior, a primary invertor, is supplied by the tibial nerve and has L5 innervation, so it is weak in L5 radiculopathy and strong in a fibular neuropathy.',
      sources: ['S84', 'S83', 'S79'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'tibial', after: 1 }],
    roots: ['L5', 'L5'],
  },
  gastrocnemius: {
    meta: {
      id: 'muscle.gastrocnemius',
      claim: 'Gastrocnemius, the ankle plantar flexor, is supplied by the tibial nerve and is the S1 muscle.',
      sources: ['S79', 'S31', 'S82'],
      tier: 'T1',
      bookRef: p,
    },
    supply: [{ nerve: 'tibial', after: 1 }],
    roots: ['S1', 'S1'],
    myotome: 'S1',
  },
};

export const LEG_SKIN_ROWS: Pick<Plexus['skin'], LegSkinArea> = {
  anterior_thigh: {
    meta: {
      id: 'skin.anterior-thigh',
      claim: 'The anterior thigh is supplied by the femoral nerve’s cutaneous branches below the inguinal ligament; no source read gives its roots.',
      sources: ['S71', 'S89'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'femoral', after: 1 }],
    roots: null,
    disputedRoots: ['L2', 'L4'],
  },
  medial_thigh: {
    meta: {
      id: 'skin.medial-thigh',
      claim: 'The medial thigh is supplied by the obturator nerve (S73) and by the femoral nerve’s medial cutaneous branch (S89); no source read gives its roots.',
      sources: ['S73', 'S89', 'S71'],
      tier: 'T3',
      bookRef: p,
      conflict: 'C22',
    },
    supply: [{ nerve: 'obturator', after: 1 }, { nerve: 'femoral', after: 1 }],
    roots: null,
    disputedRoots: ['L2', 'L4'],
  },
  lateral_thigh: {
    meta: {
      id: 'skin.lateral-thigh',
      claim: 'The lateral thigh is supplied by the lateral femoral cutaneous nerve, which carries L2 and L3.',
      sources: ['S74'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'lateral_femoral_cutaneous', after: 1 }],
    roots: null,
    disputedRoots: ['L2', 'L3'],
  },
  medial_leg: {
    meta: {
      id: 'skin.medial-leg',
      claim: 'The medial leg down to the medial malleolus is the saphenous nerve, from the femoral nerve (L3–L4); the medial malleolus is the L4 landmark.',
      sources: ['S86', 'S89', 'S82'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'femoral', after: 1 }],
    roots: ['L4', 'L4'],
    disputedRoots: ['L3', 'L3'],
    landmark: 'L4',
  },
  lateral_leg: {
    meta: {
      id: 'skin.lateral-leg',
      claim: 'The anterolateral leg is supplied by the superficial fibular nerve, a branch of the common fibular nerve below the fibular neck; no source read gives its roots, so any of its roots may serve it.',
      sources: ['S76', 'S77', 'S138'],
      tier: 'T2',
      bookRef: p,
    },
    supply: [{ nerve: 'superficial_fibular', after: 1 }],
    roots: null,
    disputedRoots: ['L4', 'S2'],
  },
  dorsum_foot: {
    meta: {
      id: 'skin.dorsum-foot',
      claim: 'The dorsum of the foot is the superficial fibular nerve and the L5 landmark.',
      sources: ['S77', 'S76', 'S82', 'S138'],
      tier: 'T1',
      bookRef: p,
    },
    supply: [{ nerve: 'superficial_fibular', after: 1 }],
    roots: ['L5', 'L5'],
    landmark: 'L5',
  },
  first_web: {
    meta: {
      id: 'skin.first-web',
      claim: 'The first dorsal web space is the deep fibular nerve; L5 radiculopathy numbs it.',
      sources: ['S77', 'S76', 'S78', 'S139'],
      tier: 'T2',
      bookRef: p,
    },
    // P19: below the anterior tarsal tunnel, so a lesion at either deep place takes it.
    supply: [{ nerve: 'deep_fibular', after: 2 }],
    roots: ['L5', 'L5'],
  },
  lateral_foot: {
    meta: {
      id: 'skin.lateral-foot',
      claim: 'The lateral foot is the sural nerve, formed from a tibial and a common fibular branch (S1–S2); it is the S1 landmark.',
      sources: ['S87', 'S82'],
      tier: 'T3',
      bookRef: p,
      conflict: 'C23',
    },
    supply: [{ nerve: 'tibial', after: 1 }, { nerve: 'common_fibular', after: 1 }],
    roots: ['S1', 'S1'],
    disputedRoots: ['S2', 'S2'],
    landmark: 'S1',
  },
  sole: {
    meta: {
      id: 'skin.sole',
      claim: 'The sole is supplied by the medial and lateral plantar branches of the tibial nerve, which divide in the tarsal tunnel; no source read gives its roots.',
      sources: ['S79', 'S140'],
      tier: 'T2',
      bookRef: p,
    },
    // P20: past the tarsal tunnel, so a tibial lesion in the leg or at the ankle takes it.
    supply: [{ nerve: 'tibial', after: 2 }],
    roots: null,
    disputedRoots: ['L4', 'S3'],
  },
};

export const LEG_DEFORMITY_ROWS: Pick<Plexus['deformities'], 'foot_drop' | 'trendelenburg'> = {
  foot_drop: {
    meta: {
      id: 'deformity.foot-drop',
      claim: 'Weakness of ankle dorsiflexion, represented by tibialis anterior, gives foot drop.',
      sources: ['S77', 'S78'],
      tier: 'T1',
      bookRef: p,
    },
    muscles: ['tibialis_anterior'],
  },
  trendelenburg: {
    meta: {
      id: 'deformity.trendelenburg',
      claim: 'Weakness of gluteus medius weakens hip abduction and gives the Trendelenburg gait.',
      sources: ['S80'],
      tier: 'T2',
      bookRef: p,
    },
    muscles: ['gluteus_medius'],
  },
};
