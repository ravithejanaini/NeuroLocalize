// Knowledge used only to draw. The engine may not import this file (check-boundaries),
// so nothing here can change a computed deficit. Geometry tests exercise every row.
import type { RenderKb } from './types.ts';

export const RENDER: RenderKb = {
  cord: {
    meta: {
      id: 'render.cord-dimensions',
      claim: 'The adult cord is 42–45 cm long; about 0.64–0.83 cm wide in the thoracic region and 1.27–1.33 cm in the cervical and lumbar regions.',
      sources: ['S30', 'S24'],
      tier: 'T2',
      bookRef: 'pending',
    },
    lengthCm: [42, 45],
    widthCm: { cervical: [1.27, 1.33], thoracic: [0.64, 0.83], lumbar: [1.27, 1.33] },
  },

  enlargements: {
    meta: {
      id: 'render.enlargements',
      claim: 'The cervical enlargement spans C5–T1 (S24) or C3–T1 (S26); the lumbar enlargement L2–S3 (S24) or L1–S2 (S26). Drawn over the union.',
      sources: ['S24', 'S26'],
      tier: 'T3',
      bookRef: 'pending',
      conflict: 'C6',
    },
    cervical: [['C5', 'T1'], ['C3', 'T1']],
    lumbar: [['L2', 'S3'], ['L1', 'S2']],
  },

  ruler: {
    meta: {
      id: 'render.segment-ruler',
      claim: 'C1 begins at the foramen magnum and C8 lies at the C7 vertebra; the lower thoracic cord runs three segments ahead of the vertebrae; the conus (S2–Co1) lies at L1 and the cord ends at L1–L2. Positions between these anchors are interpolated.',
      sources: ['S26', 'S14', 'S24', 'S30'],
      tier: 'T2',
      bookRef: 'pending',
    },
    // Vertebral units: 0 is the top of C1, 7 the top of T1, 19 the top of L1.
    anchors: [
      { segment: 'C1', vertebraTop: 0 },
      { segment: 'C8', vertebraTop: 6 },
      { segment: 'T12', vertebraTop: 15 },
      { segment: 'S2', vertebraTop: 19 },
    ],
    cordEndsAtVertebra: 20,
  },

  lateralHorn: {
    meta: {
      id: 'render.lateral-horn',
      claim: 'The lateral horn is present only from T1 to L2.',
      sources: ['S24', 'S07'],
      tier: 'T1',
      bookRef: 'pending',
    },
    span: ['T1', 'L2'],
  },

  posteriorColumn: {
    meta: {
      id: 'render.posterior-column-somatotopy',
      claim: 'The fasciculus gracilis lies medially and carries the lower body; the fasciculus cuneatus lies laterally, exists at T6 and above, and carries the upper body.',
      sources: ['S27', 'S24'],
      tier: 'T2',
      bookRef: 'pending',
    },
    cuneatusCarriesRostralTo: 'T6',
  },

  layout: {
    meta: {
      id: 'render.cross-section-layout',
      claim: 'Posterior columns lie dorsally with gracilis medial; the lateral corticospinal tract in the lateral funiculus; the spinothalamic tract anterolaterally; grey matter forms an H around the central canal. Coordinates are a schematic, not measurements.',
      sources: ['S24', 'S27'],
      tier: 'T2',
      bookRef: 'pending',
      pendingSource: 'the positions of the descending autonomic pathway and the roots are schematic (R7)',
    },
    discs: {
      dorsal_column: { x: -0.17, z: 0.62, r: 0.16 },
      dorsal_horn: { x: -0.36, z: 0.4, r: 0.1 },
      lateral_cst: { x: -0.64, z: 0.08, r: 0.16 },
      descending_autonomic: { x: -0.44, z: -0.02, r: 0.07 },
      intermediolateral: { x: -0.33, z: 0.06, r: 0.05 },
      anterior_horn: { x: -0.3, z: -0.28, r: 0.13 },
      anterolateral: { x: -0.58, z: -0.42, r: 0.16 },
      commissure: { x: -0.06, z: -0.12, r: 0.05 },
      dorsal_root: { x: -1.18, z: 0.42, r: 0.08 },
      ventral_root: { x: -1.18, z: -0.42, r: 0.08 },
    },
  },

  speeds: {
    meta: {
      id: 'render.conduction-velocity',
      claim: 'Aβ fibres conduct at 16–100 m/s, Aδ at 5–30 (about 15), C at 0.2–2 (about 1); the corticospinal tract at about 67 m/s.',
      sources: ['S25', 'S28', 'S29'],
      tier: 'T2',
      bookRef: 'pending',
    },
    abeta: [16, 100],
    adelta: [5, 30],
    c: [0.2, 2],
    adeltaTypical: 15,
    cTypical: 1,
    corticospinal: 67.4,
  },

  intraspinalSpeed: {
    meta: {
      id: 'render.intraspinal-speed',
      claim: 'Posterior-column and spinothalamic axons inside the cord are drawn at one illustrative speed.',
      sources: [],
      tier: 'T2',
      bookRef: 'pending',
      pendingSource: 'D14: no source read gives their conduction velocity',
    },
    illustrative: 40,
  },

  lamination: {
    spinothalamic: {
      meta: {
        id: 'render.lamination-spinothalamic',
        claim: 'Classical: lumbar and sacral fibres dorsolateral, cervical ventromedial. Revised (cordotomy mapping): lower-limb fibres superficial and posterior, shifting ventrally on ascent; upper-limb fibres deep and anterior, some posterior. Positions schematic.',
        sources: ['S23'],
        tier: 'T3',
        bookRef: 'pending',
        conflict: 'C7',
      },
      models: {
        classical: {
          upperLimb: { cervical: { lateral: -0.7, dorsal: -0.6 }, lumbar: { lateral: -0.7, dorsal: -0.6 } },
          lowerLimb: { cervical: { lateral: 0.7, dorsal: 0.6 }, lumbar: { lateral: 0.7, dorsal: 0.6 } },
          scatter: 0,
        },
        revised: {
          upperLimb: { cervical: { lateral: -0.6, dorsal: -0.3 }, lumbar: { lateral: -0.6, dorsal: -0.3 } },
          lowerLimb: { cervical: { lateral: 0.7, dorsal: -0.5 }, lumbar: { lateral: 0.7, dorsal: 0.6 } },
          scatter: 0.35,
        },
      },
    },
    corticospinal: {
      meta: {
        id: 'render.lamination-corticospinal',
        claim: 'Historical: arm fibres medial in the lateral corticospinal tract. Current: arm and leg fibres diffusely distributed. Positions schematic.',
        sources: ['S06'],
        tier: 'T3',
        bookRef: 'pending',
        conflict: 'C8',
      },
      models: {
        classical: {
          upperLimb: { cervical: { lateral: -0.7, dorsal: 0 }, lumbar: { lateral: -0.7, dorsal: 0 } },
          lowerLimb: { cervical: { lateral: 0.7, dorsal: 0 }, lumbar: { lateral: 0.7, dorsal: 0 } },
          scatter: 0,
        },
        revised: {
          upperLimb: { cervical: { lateral: 0, dorsal: 0 }, lumbar: { lateral: 0, dorsal: 0 } },
          lowerLimb: { cervical: { lateral: 0, dorsal: 0 }, lumbar: { lateral: 0, dorsal: 0 } },
          scatter: 1,
        },
      },
    },
  },
};
