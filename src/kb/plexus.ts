// The brachial plexus and the nerves, muscles and skin it serves (P4). Data only.
// Every muscle's roots are the myotome sources' (D29); every branch position is where a
// level-by-level lesion description puts it (D27).
import { LEG_DEFORMITY_ROWS, LEG_MUSCLE_ROWS, LEG_NERVE_ROWS, LEG_PARTS, LEG_SKIN_ROWS } from './leg.ts';
import type { Plexus } from './types.ts';

const p = 'pending' as const;

export const PLEXUS: Plexus = {
  trunks: {
    meta: {
      id: 'plexus.trunks',
      claim: 'The plexus is formed by the ventral rami of C5–T1: the upper trunk by C5 and C6, the middle trunk by C7, and the lower trunk by C8 and T1.',
      sources: ['S33', 'S34', 'S37'],
      tier: 'T1',
      bookRef: p,
    },
    plexusRoots: ['C5', 'T1'],
    roots: { upper: ['C5', 'C6'], middle: ['C7', 'C7'], lower: ['C8', 'T1'] },
  },
  cords: {
    meta: {
      id: 'plexus.cords',
      claim: 'The lateral cord takes fibres from the upper and middle trunks, the medial cord from the lower trunk, and the posterior cord from all three.',
      sources: ['S34'],
      tier: 'T2',
      bookRef: p,
    },
    formedBy: {
      lateral: ['upper', 'middle'],
      posterior: ['upper', 'middle', 'lower'],
      medial: ['lower'],
    },
  },
  legParts: LEG_PARTS,

  nerves: {
    dorsal_scapular: {
      meta: {
        id: 'nerve.dorsal-scapular',
        claim: 'The dorsal scapular nerve arises from the roots, before the trunks form.',
        sources: ['S34', 'S37'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'roots' },
      sites: ['dorsal_scapular'],
    },
    long_thoracic: {
      meta: {
        id: 'nerve.long-thoracic',
        claim: 'The long thoracic nerve arises from the roots (S34, S37), although S44 also calls it a branch of the upper trunk.',
        sources: ['S34', 'S37', 'S44'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C10',
      },
      origin: { from: 'roots' },
      sites: ['long_thoracic'],
    },
    suprascapular: {
      meta: {
        id: 'nerve.suprascapular',
        claim: 'The suprascapular nerve arises from the upper trunk.',
        sources: ['S37', 'S34', 'S33'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'trunk', trunk: 'upper' },
      sites: ['suprascapular'],
    },
    axillary: {
      meta: {
        id: 'nerve.axillary',
        claim: 'The axillary nerve leaves the posterior cord.',
        sources: ['S42', 'S33', 'S37'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'cords', cords: ['posterior'] },
      sites: ['axillary'],
    },
    musculocutaneous: {
      meta: {
        id: 'nerve.musculocutaneous',
        claim: 'The musculocutaneous nerve is a terminal branch of the lateral cord.',
        sources: ['S43', 'S33', 'S37'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'cords', cords: ['lateral'] },
      sites: ['musculocutaneous'],
    },
    radial: {
      meta: {
        id: 'nerve.radial',
        claim: 'The radial nerve leaves the posterior cord and is described at three levels: the axilla, the spiral groove and the posterior interosseous branch.',
        sources: ['S33', 'S34', 'S39', 'S40', 'S37'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'cords', cords: ['posterior'] },
      sites: ['radial_axilla', 'radial_spiral_groove', 'posterior_interosseous'],
    },
    median: {
      meta: {
        id: 'nerve.median',
        claim: 'The median nerve is formed by the lateral and medial cords and is described at the elbow and at the wrist.',
        sources: ['S41', 'S33', 'S37'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'cords', cords: ['lateral', 'medial'] },
      sites: ['median_elbow', 'median_wrist'],
    },
    ulnar: {
      meta: {
        id: 'nerve.ulnar',
        claim: 'The ulnar nerve is the continuation of the medial cord and is compressed at the cubital tunnel or in Guyon’s canal.',
        sources: ['S33', 'S34', 'S38'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'cords', cords: ['medial'] },
      sites: ['ulnar_elbow', 'ulnar_wrist'],
    },
    medial_antebrachial_cutaneous: {
      meta: {
        id: 'nerve.medial-antebrachial-cutaneous',
        claim: 'The medial antebrachial cutaneous nerve leaves the medial cord.',
        sources: ['S45', 'S38', 'S37'],
        tier: 'T1',
        bookRef: p,
      },
      origin: { from: 'cords', cords: ['medial'] },
      sites: [],
    },
    ...LEG_NERVE_ROWS,
  },

  muscles: {
    rhomboids: {
      meta: { id: 'muscle.rhomboids', claim: 'The rhomboids are supplied by the dorsal scapular nerve, from C5.', sources: ['S34', 'S37'], tier: 'T1', bookRef: p },
      supply: [{ nerve: 'dorsal_scapular', after: 1 }],
      roots: ['C5', 'C5'],
    },
    serratus_anterior: {
      meta: {
        id: 'muscle.serratus-anterior',
        claim: 'Serratus anterior is supplied by the long thoracic nerve (C5–C6, C7 disputed); its weakness gives medial winging of the scapula.',
        sources: ['S34', 'S37', 'S44'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C10',
      },
      supply: [{ nerve: 'long_thoracic', after: 1 }],
      roots: ['C5', 'C6'],
      disputedRoots: ['C7', 'C7'],
    },
    supraspinatus: {
      meta: {
        id: 'muscle.supraspinatus',
        claim: 'Supraspinatus and infraspinatus are supplied by the suprascapular nerve, C5–C6, and are weak in Erb palsy.',
        sources: ['S34', 'S35'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'suprascapular', after: 1 }],
      roots: ['C5', 'C6'],
    },
    deltoid: {
      meta: {
        id: 'muscle.deltoid',
        claim: 'The deltoid is supplied by the axillary nerve and is the C5 key muscle for shoulder abduction.',
        sources: ['S19', 'S31', 'S42'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'axillary', after: 1 }],
      roots: ['C5', 'C5'],
      myotome: 'C5',
    },
    biceps: {
      meta: {
        id: 'muscle.biceps',
        claim: 'The biceps is supplied by the musculocutaneous nerve; S19 lists it under C5 and S31 gives elbow flexion to C6.',
        sources: ['S19', 'S31', 'S43'],
        tier: 'T2',
        bookRef: p,
      },
      supply: [{ nerve: 'musculocutaneous', after: 1 }],
      roots: ['C5', 'C6'],
      myotome: 'C6',
    },
    triceps: {
      meta: {
        id: 'muscle.triceps',
        claim: 'The triceps is the C7 key muscle and is supplied by the radial nerve above the spiral groove, so a groove lesion spares it.',
        sources: ['S19', 'S31', 'S39'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'radial', after: 1 }],
      roots: ['C7', 'C7'],
      myotome: 'C7',
    },
    brachioradialis: {
      meta: {
        id: 'muscle.brachioradialis',
        claim: 'Brachioradialis is supplied by the radial nerve below the spiral groove and above the posterior interosseous branch; its roots are taken from its reflex (C6, C5 disputed).',
        sources: ['S39', 'S40', 'S12', 'S19'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C3',
      },
      supply: [{ nerve: 'radial', after: 2 }],
      roots: ['C6', 'C6'],
      disputedRoots: ['C5', 'C5'],
    },
    wrist_extensors: {
      meta: {
        id: 'muscle.wrist-extensors',
        claim: 'The radial wrist extensors are C6 and are supplied by the radial nerve proper, below the spiral groove and above the posterior interosseous branch.',
        sources: ['S19', 'S31', 'S39', 'S40'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C14',
      },
      supply: [{ nerve: 'radial', after: 2 }],
      roots: ['C6', 'C6'],
      myotome: 'C6',
    },
    thumb_extensor: {
      meta: {
        id: 'muscle.thumb-extensor',
        claim: 'Thumb extension is C8 (S31) and is supplied by the posterior interosseous nerve.',
        sources: ['S31', 'S39', 'S40'],
        tier: 'T2',
        bookRef: p,
      },
      supply: [{ nerve: 'radial', after: 3 }],
      roots: ['C8', 'C8'],
      myotome: 'C8',
    },
    wrist_flexor_ulnar: {
      meta: {
        id: 'muscle.wrist-flexor-ulnar',
        claim: 'Flexor carpi ulnaris is supplied by the ulnar nerve in the forearm; wrist flexion is C8 in S31 and C7 in S32.',
        sources: ['S38', 'S31', 'S32'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C9',
      },
      supply: [{ nerve: 'ulnar', after: 1 }],
      roots: ['C8', 'C8'],
      myotome: 'C8',
    },
    finger_flexor_superficial: {
      meta: {
        id: 'muscle.finger-flexor-superficial',
        claim: 'Flexor digitorum superficialis is supplied by the median nerve in the forearm, so only a high median lesion weakens PIP flexion; finger flexion is C8.',
        sources: ['S41', 'S19', 'S32'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'median', after: 1 }],
      roots: ['C8', 'C8'],
    },
    finger_flexor_ulnar: {
      meta: {
        id: 'muscle.finger-flexor-ulnar',
        claim: 'Flexor digitorum profundus to the ring and little fingers is supplied by the ulnar nerve in the forearm; finger flexion is C8.',
        sources: ['S38', 'S19', 'S32'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'ulnar', after: 1 }],
      roots: ['C8', 'C8'],
    },
    thumb_abductor: {
      meta: {
        id: 'muscle.thumb-abductor',
        claim: 'Abductor pollicis brevis is supplied by the median nerve in the hand; C8–T1 injury gives the ape sign.',
        sources: ['S41', 'S38', 'S33'],
        tier: 'T2',
        bookRef: p,
      },
      supply: [{ nerve: 'median', after: 2 }],
      roots: ['C8', 'T1'],
    },
    interossei: {
      meta: {
        id: 'muscle.interossei',
        claim: 'The interossei are the T1 key muscles and are supplied by the ulnar nerve in the hand, from C8 and T1 with T1 primary; C8 loss alone leaves their strength open.',
        sources: ['S19', 'S31', 'S38', 'S68'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'ulnar', after: 2 }],
      roots: ['T1', 'T1'],
      disputedRoots: ['C8', 'C8'],
      myotome: 'T1',
    },
    ...LEG_MUSCLE_ROWS,
  },

  skin: {
    shoulder_badge: {
      meta: {
        id: 'skin.shoulder-badge',
        claim: 'The regimental badge area over the lower deltoid is supplied by the axillary nerve (C5–C6).',
        sources: ['S42'],
        tier: 'T2',
        bookRef: p,
      },
      supply: [{ nerve: 'axillary', after: 1 }],
      roots: ['C5', 'C6'],
    },
    lateral_forearm: {
      meta: {
        id: 'skin.lateral-forearm',
        claim: 'The lateral forearm is supplied by the musculocutaneous nerve, C5–C6 with C7 disputed.',
        sources: ['S33', 'S43', 'S46'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C11',
      },
      supply: [{ nerve: 'musculocutaneous', after: 1 }],
      roots: ['C5', 'C6'],
      disputedRoots: ['C7', 'C7'],
    },
    dorsal_web: {
      meta: {
        id: 'skin.dorsal-web',
        claim: 'The dorsum of the hand is supplied by the radial nerve below the spiral groove, and not by the posterior interosseous branch; its roots are not given, so any radial root may serve it.',
        sources: ['S39', 'S46'],
        tier: 'T2',
        bookRef: p,
      },
      supply: [{ nerve: 'radial', after: 2 }],
      roots: null,
      disputedRoots: ['C5', 'T1'],
    },
    thumb: {
      meta: {
        id: 'skin.thumb',
        claim: 'The thumb is the C6 landmark; its palmar side is median and its radial side radial.',
        sources: ['S21', 'S41', 'S46'],
        tier: 'T2',
        bookRef: p,
      },
      supply: [{ nerve: 'median', after: 2 }, { nerve: 'radial', after: 2 }],
      roots: ['C6', 'C6'],
      landmark: 'C6',
    },
    middle_finger: {
      meta: {
        id: 'skin.middle-finger',
        claim: 'The middle finger is the C7 landmark and its palmar side is median, lost in carpal tunnel syndrome.',
        sources: ['S21', 'S41'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'median', after: 2 }],
      roots: ['C7', 'C7'],
      landmark: 'C7',
    },
    little_finger: {
      meta: {
        id: 'skin.little-finger',
        claim: 'The little finger is the C8 landmark and is ulnar territory.',
        sources: ['S21', 'S38', 'S45'],
        tier: 'T1',
        bookRef: p,
      },
      supply: [{ nerve: 'ulnar', after: 2 }],
      roots: ['C8', 'C8'],
      landmark: 'C8',
    },
    medial_forearm: {
      meta: {
        id: 'skin.medial-forearm',
        claim: 'The medial forearm is supplied by the medial antebrachial cutaneous nerve from C8 and T1, not by the ulnar nerve; S21 puts the T1 landmark there.',
        sources: ['S45', 'S38', 'S21'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C13',
      },
      supply: [{ nerve: 'medial_antebrachial_cutaneous', after: 0 }],
      roots: ['C8', 'T1'],
      landmark: 'T1',
    },
    ...LEG_SKIN_ROWS,
  },

  deformities: {
    winged_scapula: {
      meta: {
        id: 'deformity.winged-scapula',
        claim: 'Weakness of serratus anterior lets the scapula wing medially.',
        sources: ['S44', 'S35'],
        tier: 'T1',
        bookRef: p,
      },
      muscles: ['serratus_anterior'],
    },
    waiters_tip: {
      meta: {
        id: 'deformity.waiters-tip',
        claim: 'Loss of the axillary, suprascapular and musculocutaneous muscles leaves the arm adducted, internally rotated, extended at the elbow and pronated: the waiter’s tip.',
        sources: ['S33', 'S35'],
        tier: 'T1',
        bookRef: p,
      },
      muscles: ['deltoid', 'supraspinatus', 'biceps'],
    },
    wrist_drop: {
      meta: {
        id: 'deformity.wrist-drop',
        claim: 'Weakness of the radial wrist extensors gives wrist drop.',
        sources: ['S39', 'S40'],
        tier: 'T1',
        bookRef: p,
      },
      muscles: ['wrist_extensors'],
    },
    claw_hand: {
      meta: {
        id: 'deformity.claw-hand',
        claim: 'Weakness of the intrinsic hand muscles, represented here by the interossei, gives a claw hand.',
        sources: ['S38', 'S36', 'S33'],
        tier: 'T2',
        bookRef: p,
      },
      muscles: ['interossei'],
    },
    ape_hand: {
      meta: {
        id: 'deformity.ape-hand',
        claim: 'Weakness of the median thenar muscles, represented by abductor pollicis brevis, flattens the thenar eminence: the ape hand.',
        sources: ['S41', 'S33'],
        tier: 'T1',
        bookRef: p,
      },
      muscles: ['thumb_abductor'],
    },
    ...LEG_DEFORMITY_ROWS,
  },

  reflexMuscles: {
    meta: {
      id: 'plexus.reflex-muscles',
      claim: 'Each tendon reflex is tested through its muscle, so it shares that muscle’s nerves: biceps, brachioradialis and triceps through their namesakes, the knee jerk through the quadriceps and the ankle jerk through the gastrocnemius.',
      sources: [],
      tier: 'T1',
      bookRef: p,
      definitional: true,
    },
    muscles: { biceps: 'biceps', brachioradialis: 'brachioradialis', triceps: 'triceps', patellar: 'quadriceps', achilles: 'gastrocnemius' },
  },
  reflexNerves: {
    meta: {
      id: 'plexus.reflex-nerves',
      claim: 'The bulbocavernosus reflex runs through the pudendal nerve, which carries both the sensation of the penis or clitoris and the motor supply of bulbospongiosus (S22). No source read names the reflex, so a pudendal lesion leaves it unsettled rather than lost (D123, R4).',
      sources: ['S22'],
      tier: 'T2',
      bookRef: p,
      pendingSource: 'R4: no source read describes the bulbocavernosus reflex after a pudendal nerve lesion',
    },
    nerves: { bulbocavernosus: 'pudendal' },
  },
};
