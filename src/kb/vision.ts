// The visual pathway (P8): what each part carries, and the places a lesion can sit. Data
// only; every row is a line of docs/P8-analysis.md, with the source it was read from.
import type { Vision } from './types.ts';

const p = 'pending' as const;

export const VISION: Vision = {
  parts: {
    optic_nerve: {
      meta: {
        id: 'vision.optic-nerve',
        claim: 'The optic nerve carries every fibre of its own eye, so a lesion of it loses vision in that eye alone and gives an afferent pupillary defect on the same side.',
        sources: ['S91', 'S92', 'S95'],
        tier: 'T1',
        bookRef: p,
      },
      eye: 'same',
      field: 'whole',
      quadrants: 'both',
      centre: 'with',
      rapd: 'same',
    },
    chiasm: {
      meta: {
        id: 'vision.chiasm',
        claim: 'The chiasm carries the crossing nasal fibres of both eyes, which serve the temporal half-fields, so a lesion of it gives a bitemporal hemianopia. Whether it gives an afferent pupillary defect is left open: S95 says it may, when one eye loses more fibres.',
        sources: ['S91', 'S92', 'S96', 'S95'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C27',
      },
      eye: 'both',
      field: 'temporal',
      quadrants: 'both',
      centre: 'with',
      rapd: 'open',
    },
    optic_tract: {
      meta: {
        id: 'vision.optic-tract',
        claim: 'Each optic tract carries the opposite half-field of both eyes, centre included, and the afferent pupillary fibres with it, so a lesion gives a homonymous hemianopia with a pupillary defect on the side opposite the lesion.',
        sources: ['S91', 'S92', 'S95'],
        tier: 'T1',
        bookRef: p,
      },
      eye: 'both',
      field: 'opposite',
      quadrants: 'both',
      centre: 'with',
      rapd: 'opposite',
    },
    lgn: {
      meta: {
        id: 'vision.lgn',
        claim: 'The lateral geniculate nucleus relays the opposite half-field of both eyes, centre included, to the optic radiation. The pupil’s afferent fibres leave the tract just before it, for the pretectum, so a lesion of the nucleus gives no afferent pupillary defect.',
        sources: ['S147', 'S137', 'S91', 'S95'],
        tier: 'T1',
        bookRef: p,
      },
      eye: 'both',
      field: 'opposite',
      quadrants: 'both',
      centre: 'with',
      rapd: 'none',
    },
    meyer_loop: {
      meta: {
        id: 'vision.meyer-loop',
        claim: 'Meyer loop, in the temporal lobe, carries the opposite superior quadrant of both eyes. It lies behind the lateral geniculate nucleus, so it gives no afferent pupillary defect.',
        sources: ['S91', 'S93', 'S97'],
        tier: 'T1',
        bookRef: p,
      },
      eye: 'both',
      field: 'opposite',
      quadrants: 'upper',
      centre: 'half',
      rapd: 'none',
    },
    parietal_radiation: {
      meta: {
        id: 'vision.parietal-radiation',
        claim: 'The parietal fibres of the optic radiation carry the opposite inferior quadrant of both eyes, and give no afferent pupillary defect.',
        sources: ['S91', 'S93', 'S97'],
        tier: 'T1',
        bookRef: p,
      },
      eye: 'both',
      field: 'opposite',
      quadrants: 'lower',
      centre: 'half',
      rapd: 'none',
    },
    calcarine_lower: {
      meta: {
        id: 'vision.calcarine-lower',
        claim: 'The calcarine cortex below the fissure carries the opposite superior quadrant. The centre of the field lies at the occipital pole, not on the banks.',
        sources: ['S91', 'S93'],
        tier: 'T1',
        bookRef: p,
      },
      eye: 'both',
      field: 'opposite',
      quadrants: 'upper',
      centre: 'none',
      rapd: 'none',
    },
    calcarine_upper: {
      meta: {
        id: 'vision.calcarine-upper',
        claim: 'The calcarine cortex above the fissure carries the opposite inferior quadrant.',
        sources: ['S91', 'S93'],
        tier: 'T1',
        bookRef: p,
      },
      eye: 'both',
      field: 'opposite',
      quadrants: 'lower',
      centre: 'none',
      rapd: 'none',
    },
    occipital_pole: {
      meta: {
        id: 'vision.occipital-pole',
        claim: 'The occipital pole holds the centre of the opposite half-field — the macula — and keeps a supply from the middle cerebral artery, which is why a posterior cerebral artery stroke spares it.',
        sources: ['S92', 'S94'],
        tier: 'T2',
        bookRef: p,
      },
      eye: 'both',
      field: 'opposite',
      quadrants: 'none',
      centre: 'only',
      rapd: 'none',
    },
  },

  places: {
    optic_nerve: {
      meta: {
        id: 'vision-place.optic-nerve',
        claim: 'A lesion of one optic nerve.',
        sources: ['S92'],
        tier: 'T2',
        bookRef: p,
      },
      parts: ['optic_nerve'],
    },
    chiasm: {
      meta: {
        id: 'vision-place.chiasm',
        claim: 'A lesion of the chiasm, from below: a pituitary adenoma, a craniopharyngioma or a meningioma. It is midline, so it has no side.',
        sources: ['S96', 'S92'],
        tier: 'T1',
        bookRef: p,
      },
      parts: ['chiasm'],
      midline: true,
    },
    optic_tract: {
      meta: {
        id: 'vision-place.optic-tract',
        claim: 'A lesion of one optic tract.',
        sources: ['S92', 'S97'],
        tier: 'T1',
        bookRef: p,
      },
      parts: ['optic_tract'],
    },
    meyer_loop: {
      meta: {
        id: 'vision-place.meyer-loop',
        claim: 'A lesion of the temporal lobe taking Meyer loop.',
        sources: ['S93', 'S94'],
        tier: 'T1',
        bookRef: p,
      },
      parts: ['meyer_loop'],
    },
    parietal_radiation: {
      meta: {
        id: 'vision-place.parietal-radiation',
        claim: 'A lesion of the parietal optic radiation.',
        sources: ['S93', 'S94'],
        tier: 'T1',
        bookRef: p,
      },
      parts: ['parietal_radiation'],
    },
    pca_occipital: {
      meta: {
        id: 'vision-place.pca-occipital',
        claim: 'An occipital infarct in the posterior cerebral artery territory: both calcarine banks, with the occipital pole spared by its supply from the middle cerebral artery.',
        sources: ['S94', 'S92'],
        tier: 'T1',
        bookRef: p,
      },
      parts: ['calcarine_lower', 'calcarine_upper'],
    },
    occipital_cortex: {
      meta: {
        id: 'vision-place.occipital-cortex',
        claim: 'A lesion of the whole occipital visual cortex, the pole included, so the centre of the half-field goes with it.',
        sources: ['S97', 'S92'],
        tier: 'T2',
        bookRef: p,
      },
      parts: ['calcarine_lower', 'calcarine_upper', 'occipital_pole'],
    },
    pca_bilateral: {
      meta: {
        id: 'vision-place.pca-bilateral',
        claim: 'Both occipital lobes in the territory of both posterior cerebral arteries: cortical blindness — vision lost on both sides with the pupils reacting normally and no afferent defect — with the centre usually kept, because the occipital pole has a second supply (C55, C56).',
        sources: ['S137', 'S94'],
        tier: 'T3',
        bookRef: p,
        conflict: 'C56',
      },
      parts: ['calcarine_lower', 'calcarine_upper'],
      midline: true,
    },
    lgn: {
      meta: {
        id: 'vision-place.lgn',
        claim: 'A lesion of the whole lateral geniculate nucleus: a complete homonymous hemianopia on the other side, centre included, with no afferent pupillary defect — the optic tract’s field without its pupil. Partial lesions give quadrantanopias and sector defects the model does not draw (C69); the whole occipital cortex looks the same here (C70).',
        sources: ['S147', 'S137'],
        tier: 'T2',
        bookRef: p,
      },
      parts: ['lgn'],
    },
  },

  rapd: {
    meta: {
      id: 'vision.rapd-symmetry',
      claim: 'A relative afferent pupillary defect is a sign of unilateral or asymmetric dysfunction of the afferent pathway, so it is reported only when one side is affected more than the other; when both are equally affected there is no relative defect (R30, D131).',
      sources: ['S95'],
      tier: 'T2',
      bookRef: p,
    },
    whenEqual: 'absent',
  },
};
