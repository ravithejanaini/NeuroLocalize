// Knowledge used only to draw. The engine may not import this file (check-boundaries),
// so nothing here can change a computed deficit. Geometry tests exercise every row.
import type { RenderKb } from './types.ts';

export const RENDER: RenderKb = {
  dermatomeLandmarks: {
    meta: {
      id: 'render.dermatome-landmarks',
      claim: 'C6 thumb; C7 middle finger; C8 little finger; T1 anteromedial forearm and arm; T2 medial arm to the axilla; T4 nipple; T6 xiphoid; T10 umbilicus; L3 medial knee; L4 anterior knee and medial malleolus; L5 dorsum of the foot and first three toes; S1 lateral malleolus. Body positions are schematic.',
      sources: ['S21'],
      tier: 'T2',
      bookRef: 'pending',
    },
    // Front view, 200 × 360, patient's left drawn on the viewer's right. Mirrored for the right.
    landmarks: [
      { segment: 'C6', place: 'thumb', at: [{ x: 160, y: 226 }] },
      { segment: 'C7', place: 'middle finger', at: [{ x: 153, y: 243 }] },
      { segment: 'C8', place: 'little finger', at: [{ x: 145, y: 237 }] },
      { segment: 'T1', place: 'anteromedial forearm and arm', at: [{ x: 143, y: 172 }] },
      { segment: 'T2', place: 'medial arm to the axilla', at: [{ x: 136, y: 100 }] },
      { segment: 'T4', place: 'nipple', at: [{ x: 118, y: 90 }] },
      { segment: 'T6', place: 'xiphoid', at: [{ x: 104, y: 112 }] },
      { segment: 'T10', place: 'umbilicus', at: [{ x: 104, y: 152 }] },
      { segment: 'L3', place: 'medial knee', at: [{ x: 106, y: 252 }] },
      { segment: 'L4', place: 'anterior knee and medial malleolus', at: [{ x: 116, y: 247 }, { x: 108, y: 329 }] },
      { segment: 'L5', place: 'dorsum of the foot', at: [{ x: 116, y: 342 }] },
      { segment: 'S1', place: 'lateral malleolus', at: [{ x: 126, y: 330 }] },
    ],
  },

  saddle: {
    meta: {
      id: 'render.saddle',
      claim: 'Loss around the anus and perineum — saddle anaesthesia — marks conus and cauda equina lesions; it is drawn for S3–S5.',
      sources: ['S05', 'S09', 'S14'],
      tier: 'T2',
      bookRef: 'pending',
      pendingSource: 'R5: no source read assigns the saddle to particular segments',
    },
    span: ['S3', 'S5'],
    place: 'perianal',
    at: { x: 104, y: 186 },
  },

  myotomes: {
    meta: {
      id: 'render.myotomes',
      claim: 'C5 shoulder abduction; C6 elbow flexion and wrist extension; C7 elbow extension; C8 wrist flexion and thumb extension (S31) or finger flexion (S32); T1 finger abduction; T2–L1 chest wall and abdominal muscles; L2 hip flexion; L3 knee extension; L4 ankle dorsiflexion; L5 great toe extension; S1 ankle plantar flexion; S2 knee flexion.',
      sources: ['S31', 'S32', 'S19'],
      tier: 'T3',
      bookRef: 'pending',
      conflict: 'C9',
    },
    rows: [
      { span: ['C5', 'C5'], movement: 'shoulder abduction', sources: ['S31', 'S32'] },
      { span: ['C6', 'C6'], movement: 'elbow flexion, wrist extension', sources: ['S31', 'S32', 'S19'] },
      { span: ['C7', 'C7'], movement: 'elbow extension', sources: ['S31', 'S32'], otherAccount: 'S32 adds wrist flexion' },
      { span: ['C8', 'C8'], movement: 'wrist flexion, thumb extension', sources: ['S31'], otherAccount: 'S32: finger flexion' },
      { span: ['T1', 'T1'], movement: 'finger abduction', sources: ['S31'] },
      { span: ['T2', 'L1'], movement: 'chest wall and abdomen', sources: ['S31'] },
      { span: ['L2', 'L2'], movement: 'hip flexion', sources: ['S31'] },
      { span: ['L3', 'L3'], movement: 'knee extension', sources: ['S31'] },
      { span: ['L4', 'L4'], movement: 'ankle dorsiflexion', sources: ['S31'] },
      { span: ['L5', 'L5'], movement: 'great toe extension', sources: ['S31'] },
      { span: ['S1', 'S1'], movement: 'ankle plantar flexion', sources: ['S31'] },
      { span: ['S2', 'S2'], movement: 'knee flexion', sources: ['S31'] },
    ],
  },

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
