// Knowledge used only to draw. The engine may not import this file (check-boundaries),
// so nothing here can change a computed deficit. Geometry tests exercise every row.
import type { RenderKb } from './types.ts';

export const RENDER: RenderKb = {
  divisions: {
    meta: {
      id: 'render.plexus-divisions',
      claim: 'Each trunk divides beneath the clavicle; the three posterior divisions form the posterior cord and the anterior divisions form the lateral and medial cords.',
      sources: ['S34', 'S37'],
      tier: 'T1',
      bookRef: 'pending',
    },
    ofCord: { lateral: 'anterior', posterior: 'posterior', medial: 'anterior' },
  },

  limb: {
    meta: {
      id: 'render.limb-layout',
      claim: 'The roots pass between the anterior and middle scalenes; the trunks cross the first rib; the divisions pass beneath and behind the clavicle; the cords are named by where they lie around the axillary artery. Positions are schematic and the arm is drawn shortened.',
      sources: ['S34', 'S37', 'S33'],
      tier: 'T1',
      bookRef: 'pending',
    },
    // Patient's left; x lateral (negative), y rostral, z dorsal. One unit is one vertebra.
    trunks: {
      upper: [[-2.0, -5.0, 0], [-2.5, -6.1, -0.05], [-3.0, -7.3, -0.1]],
      middle: [[-2.05, -6.25, 0], [-2.55, -7.0, -0.05], [-3.05, -7.75, -0.1]],
      lower: [[-2.1, -7.6, 0], [-2.6, -7.95, -0.05], [-3.1, -8.2, -0.1]],
    },
    cords: {
      lateral: [[-4.0, -8.75, -0.3], [-4.5, -9.4, -0.28], [-4.95, -9.9, -0.28]],
      posterior: [[-3.8, -8.95, 0.05], [-4.3, -9.6, 0.05], [-4.75, -10.15, 0.05]],
      medial: [[-3.6, -9.1, -0.3], [-4.05, -9.7, -0.28], [-4.45, -10.25, -0.28]],
    },
    nerves: {
      dorsal_scapular: [
        { at: [-1.7, -4.9, 0.5] },
        { at: [-1.8, -6.6, 0.95], site: 'dorsal_scapular' },
        { at: [-1.85, -8.8, 1.3], branches: ['rhomboids'] },
      ],
      long_thoracic: [
        { at: [-1.75, -6.3, 0.35] },
        { at: [-2.4, -8.9, 0.4], site: 'long_thoracic' },
        { at: [-3.2, -10.4, 0.1] },
        { at: [-3.45, -11.6, -0.1], branches: ['serratus_anterior'] },
      ],
      suprascapular: [
        { at: [-2.9, -6.4, 0.35] },
        { at: [-3.4, -7.0, 0.7], site: 'suprascapular' },
        { at: [-3.75, -7.5, 0.9], branches: ['supraspinatus'] },
      ],
      axillary: [
        { at: [-5.0, -10.45, 0.35], site: 'axillary' },
        { at: [-5.45, -10.5, 0.3], branches: ['deltoid', 'shoulder_badge'] },
      ],
      musculocutaneous: [
        { at: [-5.1, -10.7, -0.45], site: 'musculocutaneous' },
        { at: [-5.25, -12.6, -0.6], branches: ['biceps'] },
        { at: [-5.6, -15.3, -0.55], branches: ['lateral_forearm'] },
      ],
      radial: [
        { at: [-4.95, -10.7, 0.2], site: 'radial_axilla' },
        { at: [-5.05, -11.4, 0.45], branches: ['triceps'] },
        { at: [-5.4, -12.8, 0.6], site: 'radial_spiral_groove' },
        { at: [-5.85, -15.3, 0], branches: ['brachioradialis', 'wrist_extensors', 'dorsal_web', 'thumb'] },
        { at: [-5.8, -16.3, 0.3], site: 'posterior_interosseous' },
        { at: [-5.75, -18.2, 0.35], branches: ['thumb_extensor'] },
      ],
      median: [
        { at: [-4.9, -10.6, -0.35] },
        { at: [-5.2, -13.2, -0.5] },
        { at: [-5.3, -15.4, -0.55], site: 'median_elbow' },
        { at: [-5.4, -16.4, -0.55], branches: ['finger_flexor_superficial'] },
        { at: [-5.55, -20.6, -0.45], site: 'median_wrist' },
        { at: [-5.65, -21.3, -0.45], branches: ['thumb_abductor', 'thumb', 'middle_finger'] },
      ],
      ulnar: [
        { at: [-4.7, -10.7, -0.15] },
        { at: [-4.95, -13.4, 0.05] },
        { at: [-5.0, -15.5, 0.25], site: 'ulnar_elbow' },
        { at: [-5.05, -16.4, 0], branches: ['wrist_flexor_ulnar', 'finger_flexor_ulnar'] },
        { at: [-5.2, -20.6, -0.3], site: 'ulnar_wrist' },
        { at: [-5.35, -21.3, -0.25], branches: ['interossei', 'little_finger'] },
      ],
      medial_antebrachial_cutaneous: [{ at: [-4.6, -10.8, -0.1], branches: ['medial_forearm'] }],
    },
    targets: {
      rhomboids: [-1.9, -9.6, 1.4],
      serratus_anterior: [-3.5, -12.4, -0.2],
      supraspinatus: [-3.9, -7.8, 1.0],
      deltoid: [-5.75, -10.2, -0.05],
      biceps: [-5.3, -13.0, -0.75],
      triceps: [-5.2, -12.2, 0.7],
      brachioradialis: [-5.95, -16.6, -0.2],
      wrist_extensors: [-5.95, -17.4, 0.15],
      thumb_extensor: [-5.85, -19.2, 0.35],
      wrist_flexor_ulnar: [-5.05, -17.5, -0.1],
      finger_flexor_superficial: [-5.4, -17.6, -0.5],
      finger_flexor_ulnar: [-5.15, -17.9, -0.2],
      thumb_abductor: [-5.95, -21.4, -0.5],
      interossei: [-5.55, -22.1, -0.1],
      shoulder_badge: [-5.9, -11.2, 0],
      lateral_forearm: [-5.95, -17.6, -0.45],
      dorsal_web: [-5.95, -21.6, 0.25],
      thumb: [-6.3, -22.6, -0.35],
      middle_finger: [-5.6, -24.3, -0.35],
      little_finger: [-5.15, -23.6, -0.3],
      medial_forearm: [-5.0, -17.9, -0.35],
    },
    clavicle: [[-1.4, -8.0, -1.6], [-2.6, -7.95, -1.0], [-3.6, -8.05, -0.75], [-4.6, -8.1, -0.6], [-5.2, -8.4, -0.4]],
    firstRib: [[-1.1, -8.3, 0.5], [-2.0, -8.45, 0.3], [-2.8, -8.55, -0.3], [-3.2, -8.7, -1.0], [-3.0, -9.0, -1.8]],
    artery: [[-1.2, -7.4, -0.6], [-2.3, -7.9, -0.45], [-3.3, -8.5, -0.35], [-3.8, -8.95, -0.3], [-4.7, -10.05, -0.3], [-5.2, -12.5, -0.4], [-5.45, -15.4, -0.5]],
    scalenes: {
      anterior: [[-1.7, -3.6, -0.45], [-2.5, -8.4, -0.5]],
      middle: [[-1.7, -3.6, 0.4], [-2.6, -8.4, 0.45]],
    },
    bones: [
      [[-5.2, -9.8, 0], [-5.4, -15.6, 0]],
      [[-5.75, -15.8, -0.05], [-5.8, -20.9, -0.1]],
      [[-5.1, -15.7, 0.05], [-5.25, -20.9, 0]],
      [[-2.2, -8.2, 1.2], [-4.2, -8.0, 1.1], [-2.3, -12.2, 1.2], [-2.2, -8.2, 1.2]],
      [[-5.8, -21.0, -0.1], [-6.3, -22.9, -0.3]],
      [[-5.5, -21.0, -0.1], [-5.6, -24.6, -0.3]],
      [[-5.25, -21.0, -0.1], [-5.1, -23.8, -0.25]],
    ],
  },

  leg: {
    meta: {
      id: 'render.leg-layout',
      claim: 'The lumbar plexus lies in front of the sacral plexus; the femoral nerve passes beneath the inguinal ligament to the front of the thigh and the obturator nerve to its medial side; the gluteal nerves leave the pelvis behind; the sciatic nerve runs down the back of the thigh and divides above the knee into the tibial nerve behind the leg and the common fibular nerve, which winds round the fibular neck to the front. Positions are schematic.',
      sources: ['S71', 'S72', 'S73', 'S75', 'S76', 'S79', 'S80', 'S81', 'S89'],
      tier: 'T1',
      bookRef: 'pending',
    },
    // Patient's left; x lateral (negative), y rostral, z dorsal. One unit is one vertebra.
    parts: {
      lumbar: [[-1.3, -21.5, 0.2], [-1.8, -22.8, 0.1], [-2.2, -24.0, 0.0]],
      sacral: [[-1.2, -25.2, 0.6], [-1.7, -26.0, 0.7], [-2.1, -26.6, 0.8]],
    },
    nerves: {
      nerve_to_psoas: [{ at: [-1.9, -23.0, -0.1], branches: ['iliopsoas'] }],
      femoral: [
        { at: [-2.4, -24.6, -0.3] },
        { at: [-2.6, -25.6, -0.6], site: 'femoral' },
        { at: [-2.7, -26.6, -0.9], branches: ['iliopsoas'] },
        { at: [-2.6, -27.6, -1.1], branches: ['anterior_thigh', 'medial_thigh', 'quadriceps'] },
        { at: [-2.2, -32.0, -0.9], branches: ['medial_leg'] },
      ],
      obturator: [
        { at: [-1.9, -24.8, -0.1] },
        { at: [-2.0, -26.2, -0.4], site: 'obturator' },
        { at: [-2.0, -28.2, -0.6], branches: ['hip_adductors', 'medial_thigh'] },
      ],
      lateral_femoral_cutaneous: [
        { at: [-2.6, -24.4, -0.2] },
        { at: [-3.0, -25.6, -0.8], site: 'lateral_femoral_cutaneous' },
        { at: [-3.1, -27.6, -0.9], branches: ['lateral_thigh'] },
      ],
      superior_gluteal: [
        { at: [-2.4, -26.4, 0.9] },
        { at: [-2.8, -26.6, 1.1], site: 'superior_gluteal' },
        { at: [-3.0, -26.9, 1.2], branches: ['gluteus_medius'] },
      ],
      inferior_gluteal: [
        { at: [-2.3, -27.0, 0.9] },
        { at: [-2.6, -27.4, 1.1], site: 'inferior_gluteal' },
        { at: [-2.8, -27.8, 1.3], branches: ['gluteus_maximus'] },
      ],
      sciatic: [
        { at: [-2.4, -27.0, 0.8] },
        { at: [-2.6, -28.0, 0.9], site: 'sciatic' },
        { at: [-2.6, -31.0, 0.9], branches: ['hamstrings'] },
        { at: [-2.5, -35.5, 0.8] },
      ],
      tibial: [
        { at: [-2.4, -36.4, 0.8], site: 'tibial' },
        { at: [-2.3, -38.5, 0.8], branches: ['gastrocnemius', 'tibialis_posterior', 'lateral_foot'] },
        // P20: behind the medial malleolus, the tarsal tunnel, then the plantar nerves.
        { at: [-2.0, -45.0, 0.5], site: 'tarsal_tunnel' },
        { at: [-2.1, -45.8, 0.3], branches: ['sole'] },
      ],
      common_fibular: [
        { at: [-2.9, -36.4, 0.7] },
        { at: [-3.3, -37.8, 0.3], site: 'common_fibular' },
        { at: [-2.8, -45.6, -0.4], branches: ['lateral_foot'] },
      ],
      // P19: the two branches leave at the fibular neck; the deep one runs down the front to
      // the anterior tarsal tunnel at the ankle, the superficial one down the lateral side.
      deep_fibular: [
        { at: [-3.2, -38.3, -0.1], site: 'deep_fibular' },
        { at: [-3.0, -39.2, -0.5], branches: ['tibialis_anterior', 'toe_extensor'] },
        { at: [-2.5, -46.4, -1.2], site: 'anterior_tarsal' },
        { at: [-2.35, -47.2, -1.5], branches: ['first_web'] },
      ],
      superficial_fibular: [
        { at: [-3.5, -38.3, 0.2], site: 'superficial_fibular' },
        { at: [-3.5, -39.2, 0.1], branches: ['fibularis', 'lateral_leg'] },
        { at: [-2.8, -46.2, -0.8], branches: ['dorsum_foot'] },
      ],
      // P23: below piriformis, round the sacrospinous ligament, then forward in Alcock's canal.
      pudendal: [
        { at: [-1.6, -26.9, 1.0] },
        { at: [-1.2, -27.6, 0.8], site: 'pudendal_canal' },
        { at: [-0.5, -28.0, 0.3], branches: ['perineum'] },
      ],
    },
    targets: {
      iliopsoas: [-2.0, -27.0, -0.6],
      hip_adductors: [-1.8, -29.5, -0.6],
      quadriceps: [-2.6, -31.0, -1.1],
      gluteus_medius: [-3.2, -26.8, 1.2],
      gluteus_maximus: [-2.9, -28.3, 1.5],
      hamstrings: [-2.6, -32.5, 1.1],
      tibialis_anterior: [-2.9, -40.0, -0.6],
      toe_extensor: [-2.7, -42.5, -0.6],
      fibularis: [-3.4, -40.5, 0.1],
      tibialis_posterior: [-2.3, -40.5, 0.6],
      gastrocnemius: [-2.5, -39.5, 1.2],
      anterior_thigh: [-2.7, -30.0, -1.4],
      medial_thigh: [-1.7, -31.0, -0.9],
      lateral_thigh: [-3.4, -30.0, -0.6],
      medial_leg: [-2.0, -44.0, -0.4],
      lateral_leg: [-3.4, -43.5, -0.2],
      dorsum_foot: [-2.6, -47.2, -1.0],
      first_web: [-2.3, -47.6, -1.6],
      lateral_foot: [-3.2, -47.0, 0.2],
      sole: [-2.6, -47.8, 0.3],
      // P23: between the thighs, below the pelvis.
      perineum: [-0.3, -28.2, 0.2],
    },
    inguinalLigament: [[-1.0, -26.2, -1.2], [-2.4, -25.8, -1.0], [-3.3, -25.0, -0.7]],
    bones: [
      [[-1.0, -24.8, 0.4], [-3.2, -24.6, 0.2], [-3.4, -26.4, 0.2], [-1.2, -27.6, 0.3], [-1.0, -24.8, 0.4]],
      [[-3.0, -27.0, 0], [-2.4, -36.2, 0]],
      [[-2.3, -36.8, -0.2], [-2.2, -45.8, -0.2]],
      [[-3.1, -37.0, 0.2], [-3.0, -45.6, 0.1]],
      [[-2.4, -46.4, 0.3], [-2.5, -47.4, -1.8]],
    ],
  },

  brainLayout: {
    meta: {
      id: 'render.brain-layout',
      claim: 'The medulla, pons and midbrain stack above C1; within them the pyramid and medial lemniscus lie medially and the spinothalamic tract, spinal trigeminal nucleus, sympathetic fibres, nucleus ambiguus and cerebellar peduncle laterally; the medial longitudinal fasciculus runs paramedian and dorsal through pons and midbrain with the paramedian pontine reticular formation beside the abducens nucleus and the oculomotor nucleus dorsal to its fascicles; the thalamus and internal capsule lie above, and the cortex carries the leg medially and the face laterally, with the inferior frontal gyrus in front of the motor strip and the frontal eye field (Brodmann area 8) in front of it and higher, with the anterior border zone around Broca area and the posterior border zone around Wernicke area, the inferior parietal lobule behind the sensory strip and the superior temporal gyrus below them; the cerebellum lies behind the pons and medulla, its hemispheres lateral to the midline vermis; the pretectum is dorsal in the rostral midbrain, and the trochlear nucleus beside the MLF below it; the trigeminal motor nucleus lies medial and anterior to the principal sensory nucleus in the pons; the subthalamic nucleus lies below the thalamus, medial to the capsule. Positions are schematic.',
      sources: ['S48', 'S58', 'S47', 'S54', 'S66', 'S59', 'S98', 'S99', 'S70', 'S104', 'S105', 'S107', 'S110', 'S116', 'S120', 'S122', 'S125', 'S130', 'S103'],
      tier: 'T1',
      bookRef: 'pending',
    },
    // Heights in vertebral units above the top of C1.
    levels: {
      medulla: { y: 1.2, height: 2.0, radius: 0.95 },
      pons: { y: 3.2, height: 2.0, radius: 1.35 },
      midbrain: { y: 5.0, height: 1.6, radius: 1.05 },
      thalamus: { y: 6.8, height: 1.2, radius: 1.3 },
      capsule: { y: 8.0, height: 1.2, radius: 1.9 },
      cortex: { y: 11.0, height: 2.4, radius: 3.6 },
      // P11: behind the pons and upper medulla, not in the stack; its parts sit dorsally (+z).
      cerebellum: { y: 2.4, height: 2.2, radius: 2.4 },
    },
    parts: {
      'medulla:pyramid': [-0.25, 0, -0.7],
      'medulla:medial_lemniscus': [-0.18, 0, -0.32],
      'medulla:hypoglossal': [-0.12, 0.2, 0.35],
      'medulla:spinothalamic': [-0.72, 0, -0.12],
      'medulla:spinal_trigeminal': [-0.74, 0.1, 0.3],
      'medulla:sympathetic': [-0.56, -0.1, 0.06],
      'medulla:ambiguus': [-0.48, 0.25, -0.18],
      'medulla:vestibular': [-0.52, 0.35, 0.62],
      'medulla:cerebellar_peduncle': [-0.9, 0.3, 0.55],
      // P29: the twelfth leaving ventrally beside the pyramid, towards the hypoglossal canal (S63).
      'medulla:hypoglossal_nerve': [-0.45, 0.1, -1.2],
      'pons:basis': [-0.4, 0, -0.95],
      'pons:facial': [-0.62, -0.3, 0.08],
      'pons:abducens_nucleus': [-0.2, -0.45, 0.55],
      // P9: the MLF is paramedian and dorsal, the PPRF beside the abducens nucleus (S98, S99).
      'pons:mlf': [-0.1, -0.2, 0.5],
      'pons:pprf': [-0.32, -0.35, 0.34],
      'pons:abducens_fascicle': [-0.28, -0.4, -0.35],
      'pons:medial_lemniscus': [-0.3, 0.2, -0.12],
      'pons:spinothalamic': [-0.82, 0.2, 0.0],
      'pons:sympathetic': [-0.7, 0.1, 0.22],
      'pons:cerebellar_peduncle': [-1.25, 0.1, 0.42],
      'pons:vestibular': [-0.76, -0.5, 0.55],
      // P12: the cochlear nuclei, lateral to the vestibular nuclei (S65, S114).
      'pons:cochlear': [-1.05, -0.55, 0.45],
      // P14: the trigeminal motor nucleus medial and anterior to the principal sensory nucleus (S122).
      'pons:trigeminal_motor': [-0.72, 0.55, 0.05],
      'pons:trigeminal_sensory': [-0.95, 0.6, 0.3],
      // P29: the sixth ventral along the clivus, the seventh lateral at the cerebellopontine angle (S61, S51).
      'pons:abducens_nerve': [-0.3, -0.8, -1.6],
      'pons:facial_nerve': [-1.6, -0.6, -0.1],
      'midbrain:peduncle': [-0.55, 0, -0.62],
      'midbrain:oculomotor': [-0.2, 0.15, -0.3],
      'midbrain:oculomotor_nucleus': [-0.13, 0.35, 0.22],
      'midbrain:mlf': [-0.09, 0.1, 0.3],
      // P13: the pretectum, dorsal and near the midline at the superior colliculus (S116).
      'midbrain:pretectum': [-0.12, 0.5, 0.65],
      // P14: the trochlear nucleus near the midline beside the MLF, caudal, at the inferior colliculus (S120).
      'midbrain:trochlear_nucleus': [-0.11, -0.4, 0.35],
      // P29: the nerves outside the brainstem, beyond each level's radius — the third ventral in
      // the interpeduncular fossa, the fourth lateral around the midbrain (S62, S120).
      'midbrain:oculomotor_nerve': [-0.35, -0.1, -1.3],
      'midbrain:trochlear_nerve': [-1.25, -0.5, 0.2],
      'midbrain:medial_lemniscus': [-0.6, 0, 0.0],
      'midbrain:spinothalamic': [-0.76, 0.1, 0.2],
      'midbrain:sympathetic': [-0.66, -0.2, 0.32],
      'thalamus:vpl': [-1.0, 0, 0.1],
      'thalamus:vpm': [-0.72, 0, 0.1],
      // P15: below the thalamus, medial to the capsule, at the top of the midbrain (S125).
      'thalamus:subthalamic': [-0.6, -0.55, -0.1],
      'capsule:capsule_genu': [-1.4, 0, -0.35],
      'capsule:capsule_posterior_motor': [-1.55, 0, 0.15],
      'capsule:capsule_posterior_sensory': [-1.62, 0, 0.6],
      // P10: around the Sylvian fissure, lateral to the homunculus — Broca area in front of the
      // motor strip, the inferior parietal lobule behind the sensory strip, the superior
      // temporal gyrus below both (S104, S105, S107).
      'cortex:inferior_frontal': [-3.3, -0.5, -1.2],
      'cortex:superior_temporal': [-3.4, -1.1, 0.55],
      'cortex:inferior_parietal': [-3.0, 0.4, 1.25],
      // P16: Brodmann area 8, in front of the motor strip and above the inferior frontal gyrus (S130).
      'cortex:frontal_eye_field': [-2.3, 0.5, -1.3],
      // P21: the border zones, around Broca area (in front and above) and around Wernicke area (behind).
      'cortex:anterior_borderzone': [-2.8, 0.2, -1.9],
      'cortex:posterior_borderzone': [-2.9, -0.5, 1.9],
      'cerebellum:cerebellar_hemisphere': [-1.7, 0, 2.3],
      'cerebellum:vermis': [-0.2, 0.1, 2.5],
    },
    // Motor strip at z −0.3, sensory at z +0.4; the leg sits next to the midline.
    homunculus: {
      leg: [-0.5, 1.1, 0],
      trunk: [-1.3, 0.9, 0],
      neck: [-1.9, 0.6, 0],
      arm: [-2.6, 0.1, 0],
      face: [-3.2, -0.8, 0],
    },
    decussationY: 0.35,
    face: [-2.4, 3.4, -1.6],
  },

  nerveRoots: {
    meta: {
      id: 'render.nerve-roots',
      claim: 'Dorsal scapular C5; long thoracic C5–C6, C7 disputed; suprascapular C5–C6; axillary C5–C6; musculocutaneous C5–C6, C7 disputed; radial C5–T1; median C6–T1, C5 disputed; ulnar and medial antebrachial cutaneous C8–T1. In the leg: psoas branches L1–L3; femoral and obturator L2–L4; lateral femoral cutaneous L2–L3; superior gluteal L4–S1; inferior gluteal L5–S2; sciatic and tibial L4–S3; common fibular L4–S2.',
      sources: ['S33', 'S34', 'S37', 'S41', 'S42', 'S43', 'S44', 'S45', 'S46', 'S85', 'S89', 'S71', 'S74', 'S80', 'S81', 'S75', 'S79', 'S76'],
      tier: 'T3',
      bookRef: 'pending',
      conflict: 'C12',
    },
    nerves: {
      dorsal_scapular: { roots: ['C5', 'C5'] },
      long_thoracic: { roots: ['C5', 'C6'], disputedRoots: ['C7', 'C7'] },
      suprascapular: { roots: ['C5', 'C6'] },
      axillary: { roots: ['C5', 'C6'] },
      musculocutaneous: { roots: ['C5', 'C6'], disputedRoots: ['C7', 'C7'] },
      radial: { roots: ['C5', 'T1'] },
      median: { roots: ['C6', 'T1'], disputedRoots: ['C5', 'C5'] },
      ulnar: { roots: ['C8', 'T1'] },
      medial_antebrachial_cutaneous: { roots: ['C8', 'T1'] },
      nerve_to_psoas: { roots: ['L1', 'L3'] },
      femoral: { roots: ['L2', 'L4'] },
      obturator: { roots: ['L2', 'L4'] },
      lateral_femoral_cutaneous: { roots: ['L2', 'L3'] },
      superior_gluteal: { roots: ['L4', 'S1'] },
      inferior_gluteal: { roots: ['L5', 'S2'] },
      sciatic: { roots: ['L4', 'S3'] },
      tibial: { roots: ['L4', 'S3'] },
      common_fibular: { roots: ['L4', 'S2'] },
      // P19: the branches carry their parent's roots (C57).
      deep_fibular: { roots: ['L4', 'S2'] },
      superficial_fibular: { roots: ['L4', 'S2'] },
      pudendal: { roots: ['S2', 'S4'] },
    },
  },

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
      claim: 'Loss around the anus and perineum — saddle anaesthesia — marks conus and cauda equina lesions; it is drawn for S3–S5, and since P23 the test also reads the perineum, which the pudendal nerve carries from S2–S4 (C66).',
      sources: ['S05', 'S09', 'S14'],
      tier: 'T2',
      bookRef: 'pending',
      pendingSource: 'R5: no source read assigns the saddle to particular segments',
    },
    span: ['S3', 'S5'],
    place: 'perianal',
    at: { x: 104, y: 186 },
  },

  skinPatches: {
    meta: {
      id: 'render.skin-patches',
      claim: 'The regimental badge lies over the lower lateral deltoid; the musculocutaneous nerve supplies the lateral forearm; the superficial radial nerve the back of the hand at the first web space. In the leg: the anterior, medial and lateral thigh; the anterolateral leg; the first dorsal web space of the foot; and the sole, drawn at the edge of the foot because the map is a front view. Body positions are schematic.',
      sources: ['S42', 'S43', 'S39', 'S71', 'S73', 'S74', 'S77', 'S79'],
      tier: 'T2',
      bookRef: 'pending',
    },
    at: {
      shoulder_badge: { x: 150, y: 84 },
      lateral_forearm: { x: 156, y: 176 },
      dorsal_web: { x: 159, y: 212 },
      anterior_thigh: { x: 113, y: 205 },
      medial_thigh: { x: 105, y: 222 },
      lateral_thigh: { x: 121, y: 215 },
      lateral_leg: { x: 119, y: 290 },
      first_web: { x: 110, y: 346 },
      sole: { x: 123, y: 347 },
    },
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
