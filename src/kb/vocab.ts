// Names shared by the knowledge base, the engine and the frozen expectations.
// Nothing here is a clinical claim; it is the alphabet the claims are written in.

export const SEGMENTS = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
  'L1', 'L2', 'L3', 'L4', 'L5',
  'S1', 'S2', 'S3', 'S4', 'S5',
  'Co1',
] as const;
export type Segment = (typeof SEGMENTS)[number];

export const VERTEBRAE = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7',
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
  'L1', 'L2', 'L3', 'L4', 'L5',
] as const;
export type Vertebra = (typeof VERTEBRAE)[number];

export const SIDES = ['L', 'R'] as const;
export type Side = (typeof SIDES)[number];

// Ditunno's four phases (S02): 0–24 h, 1–3 d, 4 d–1 month, beyond one month.
export const TIMEPOINTS = ['hyperacute', 'acute', 'subacute', 'chronic'] as const;
export type Timepoint = (typeof TIMEPOINTS)[number];

// posterior_column carries vibration, proprioception and fine touch together (D6).
export const SENSORY_MODALITIES = ['pain_temperature', 'posterior_column'] as const;
export type SensoryModality = (typeof SENSORY_MODALITIES)[number];

export const COMPARTMENTS = [
  'dorsal_column',
  'lateral_cst',
  'anterolateral',
  'anterior_horn',
  'dorsal_horn',
  'commissure',
  'intermediolateral',
  'descending_autonomic',
  'dorsal_root',
  'ventral_root',
] as const;
export type Compartment = (typeof COMPARTMENTS)[number];

export type Severity = 'complete' | 'partial';
// 'central' is the part of a compartment nearest the central canal.
export type Portion = 'whole' | 'central';

export const REFLEXES = ['biceps', 'brachioradialis', 'triceps', 'patellar', 'achilles', 'bulbocavernosus'] as const;
export type Reflex = (typeof REFLEXES)[number];

// ---- output states -------------------------------------------------------
// 'indeterminate' means the answer depends on a quantity the sources give only as a range.
export type SensoryState = 'intact' | 'impaired' | 'lost' | 'indeterminate';
export type MotorLesion = 'none' | 'umn' | 'lmn' | 'umn_lmn';
export type Tone = 'normal' | 'reduced' | 'increased' | 'indeterminate';
export type ReflexState = 'normal' | 'reduced' | 'absent' | 'brisk' | 'indeterminate';
export type SignState = 'present' | 'absent' | 'indeterminate';
// suprasacral: overactive detrusor ± dyssynergia. sacral: hypoactive or atonic (S20).
export type BladderState = 'normal' | 'suprasacral' | 'sacral' | 'impaired_in_spinal_shock';
// possible: past the acute phase, when S03 says symptoms may persist for 4–5 weeks (A9).
export type NeurogenicShock = 'expected' | 'possible' | 'not_expected' | 'not_applicable';
// not_yet: first month after injury (S04). rare: below T10 (S04).
export type Dysreflexia = 'susceptible' | 'possible' | 'rare' | 'not_yet' | 'none';
export type Qualifier = 'upper_limb_predominant_weakness' | 'sacral_sparing';

export type SourceId = `S${number}`;

// ---- reverse mode ----------------------------------------------------------
// Families of candidate lesion that reverse inference chooses between.
export const LESION_FAMILIES = [
  'complete',
  'hemicord_left',
  'hemicord_right',
  'anterior',
  'posterior',
  'central_small',
  'central_cord',
  'root_left',
  'root_right',
  'roots_bilateral',
  'posterolateral',
  'dorsal_root_column',
  'motor_neuron',
  'plexus_left',
  'plexus_right',
  'nerve_left',
  'nerve_right',
  'brainstem_left',
  'brainstem_right',
  'hemisphere_left',
  'hemisphere_right',
  'cerebellum_left',
  'cerebellum_right',
  'cerebellum_midline',
  'brainstem_midline',
  'visual_left',
  'visual_right',
  'visual_chiasm',
  // P18: both posterior cerebral arteries, one candidate across the midline.
  'visual_both',
] as const;
export type LesionFamily = (typeof LESION_FAMILIES)[number];

export type SensoryObservation = 'normal' | 'abnormal';
export type StrengthObservation = 'normal' | 'weak';
/** 'reduced' covers a reflex that is reduced or absent. */
export type ReflexObservation = 'normal' | 'reduced' | 'brisk';
export type SignObservation = 'present' | 'absent';
export type BladderObservation = 'normal' | 'overactive' | 'retention';

// ---- the upper limb (P4) ---------------------------------------------------
// Anatomical names for the brachial plexus and the nerves it gives. Order runs proximal
// to distal wherever there is an order.
export const TRUNKS = ['upper', 'middle', 'lower'] as const;
export type Trunk = (typeof TRUNKS)[number];

export const PLEXUS_CORDS = ['lateral', 'posterior', 'medial'] as const;
export type PlexusCord = (typeof PLEXUS_CORDS)[number];

export const ARM_NERVES = [
  'dorsal_scapular',
  'long_thoracic',
  'suprascapular',
  'axillary',
  'musculocutaneous',
  'radial',
  'median',
  'ulnar',
  'medial_antebrachial_cutaneous',
] as const;
export type ArmNerve = (typeof ARM_NERVES)[number];

/** P7: the nerves of the lumbosacral plexus that the model follows, proximal first. */
export const LEG_NERVES = [
  'nerve_to_psoas',
  'femoral',
  'obturator',
  'lateral_femoral_cutaneous',
  'superior_gluteal',
  'inferior_gluteal',
  'sciatic',
  'tibial',
  'common_fibular',
  // P19: the two branches of the common fibular nerve.
  'deep_fibular',
  'superficial_fibular',
] as const;
export type LegNerve = (typeof LEG_NERVES)[number];

export const NERVES = [...ARM_NERVES, ...LEG_NERVES] as const;
export type Nerve = (typeof NERVES)[number];

/** P7: the two parts of the lumbosacral plexus a nerve can leave from. */
export const LEG_PLEXUS_PARTS = ['lumbar', 'sacral'] as const;
export type LegPlexusPart = (typeof LEG_PLEXUS_PARTS)[number];

/** Places a lesion can sit beyond the roots. Roots themselves are the root compartments. */
export const PLEXUS_SITES = [
  'upper_trunk',
  'middle_trunk',
  'lower_trunk',
  'lateral_cord',
  'posterior_cord',
  'medial_cord',
  'dorsal_scapular',
  'long_thoracic',
  'suprascapular',
  'axillary',
  'musculocutaneous',
  'radial_axilla',
  'radial_spiral_groove',
  'posterior_interosseous',
  'median_elbow',
  'median_wrist',
  'ulnar_elbow',
  'ulnar_wrist',
  // P7: the lower limb, proximal first.
  'lumbar_plexus',
  'sacral_plexus',
  'femoral',
  'obturator',
  'lateral_femoral_cutaneous',
  'superior_gluteal',
  'inferior_gluteal',
  'sciatic',
  'tibial',
  'common_fibular',
  // P19: the deep branch high in the leg and at the ankle; the superficial branch.
  'deep_fibular',
  'anterior_tarsal',
  'superficial_fibular',
] as const;
export type PlexusSite = (typeof PLEXUS_SITES)[number];
export const ARM_SITES = PLEXUS_SITES.slice(0, PLEXUS_SITES.indexOf('lumbar_plexus'));
export const LEG_SITES = PLEXUS_SITES.slice(PLEXUS_SITES.indexOf('lumbar_plexus'));

/** Muscles examined one at a time, each standing for the movement it is tested by. */
export const ARM_MUSCLES = [
  'rhomboids',
  'serratus_anterior',
  'supraspinatus',
  'deltoid',
  'biceps',
  'triceps',
  'brachioradialis',
  'wrist_extensors',
  'thumb_extensor',
  'wrist_flexor_ulnar',
  'finger_flexor_superficial',
  'finger_flexor_ulnar',
  'thumb_abductor',
  'interossei',
] as const;

export type ArmMuscle = (typeof ARM_MUSCLES)[number];

/** P7. Each stands for one tested movement (docs/P7-analysis.md). */
export const LEG_MUSCLES = [
  'iliopsoas',
  'hip_adductors',
  'quadriceps',
  'gluteus_medius',
  'gluteus_maximus',
  'hamstrings',
  'tibialis_anterior',
  'toe_extensor',
  'fibularis',
  'tibialis_posterior',
  'gastrocnemius',
] as const;

export type LegMuscle = (typeof LEG_MUSCLES)[number];
export const MUSCLES = [...ARM_MUSCLES, ...LEG_MUSCLES] as const;
export type Muscle = (typeof MUSCLES)[number];

/** Patches of skin examined, each served by named nerves. */
export const ARM_SKIN = [
  'shoulder_badge',
  'lateral_forearm',
  'dorsal_web',
  'thumb',
  'middle_finger',
  'little_finger',
  'medial_forearm',
] as const;

export type ArmSkinArea = (typeof ARM_SKIN)[number];

/** P7, proximal first. */
export const LEG_SKIN = [
  'anterior_thigh',
  'medial_thigh',
  'lateral_thigh',
  'medial_leg',
  'lateral_leg',
  'dorsum_foot',
  'first_web',
  'lateral_foot',
  'sole',
] as const;

export type LegSkinArea = (typeof LEG_SKIN)[number];
export const SKIN_AREAS = [...ARM_SKIN, ...LEG_SKIN] as const;
export type SkinArea = (typeof SKIN_AREAS)[number];

export type MuscleState = 'normal' | 'weak' | 'indeterminate';

/** Deformities and postures that follow from lower-motor-neuron weakness of named muscles. */
export const ARM_DEFORMITIES = ['winged_scapula', 'waiters_tip', 'wrist_drop', 'claw_hand', 'ape_hand'] as const;
/** P7: foot drop, and the Trendelenburg gait of a weak gluteus medius. */
export const LEG_DEFORMITIES = ['foot_drop', 'trendelenburg'] as const;
export const DEFORMITIES = [...ARM_DEFORMITIES, ...LEG_DEFORMITIES] as const;
export type Deformity = (typeof DEFORMITIES)[number];

// ---- above the cord (P5) -------------------------------------------------
/** Rostral to caudal. The cord begins below the medulla. */
/** P11 adds the cerebellum, which lies behind the pons and medulla rather than in the stack. */
export const BRAIN_LEVELS = ['cortex', 'capsule', 'thalamus', 'midbrain', 'pons', 'medulla', 'cerebellum'] as const;
export type BrainLevel = (typeof BRAIN_LEVELS)[number];

/** Named parts of the brain a lesion can take. Each belongs to one or more levels. */
export const BRAIN_COMPARTMENTS = [
  'motor_cortex',
  'sensory_cortex',
  'capsule_genu',
  'capsule_posterior_motor',
  'capsule_posterior_sensory',
  'vpl',
  'vpm',
  'peduncle',
  'oculomotor',
  'basis',
  'facial',
  'abducens_nucleus',
  'abducens_fascicle',
  'pyramid',
  'hypoglossal',
  'medial_lemniscus',
  'spinothalamic',
  'spinal_trigeminal',
  'sympathetic',
  'ambiguus',
  'cerebellar_peduncle',
  'vestibular',
  // P9.
  'mlf',
  'pprf',
  'oculomotor_nucleus',
  // P10: cortex beyond the homunculus. The gyri are bilateral; language is not.
  'inferior_frontal',
  'superior_temporal',
  'inferior_parietal',
  // P11: the cerebellum. The vermis is midline; each side holds half of it.
  'cerebellar_hemisphere',
  'vermis',
  // P12: the cochlear nuclei and eighth nerve, in the pons.
  'cochlear',
  // P13: the pretectal area and the vertical gaze centres beside it. Midline; each side holds half.
  'pretectum',
  // P14: the fourth nerve's nucleus; the fifth nerve's motor and principal sensory nuclei.
  'trochlear_nucleus',
  'trigeminal_motor',
  'trigeminal_sensory',
  // P15: the subthalamic nucleus, held at the diencephalic level the model calls `thalamus`.
  'subthalamic',
  // P16: the frontal eye field, Brodmann area 8.
  'frontal_eye_field',
] as const;
export type BrainCompartment = (typeof BRAIN_COMPARTMENTS)[number];

/** Parts of the body as the cortex and its projections map them. */
export const BODY_REGIONS = ['face', 'neck', 'arm', 'trunk', 'leg'] as const;
export type BodyRegion = (typeof BODY_REGIONS)[number];

export const CRANIAL_SIGNS = [
  'oculomotor_palsy',
  'abduction_weakness',
  'gaze_palsy',
  'tongue_weakness',
  'palate_weakness',
  // P9: the eye movements of the brainstem.
  'adduction_weakness',
  'abducting_nystagmus',
  'ptosis',
  'elevation_weakness',
  // P12: the ear, on the side of the lesion.
  'hearing_loss',
  // P14: the fourth and fifth nerves.
  'superior_oblique_weakness',
  'jaw_deviation',
] as const;
export type CranialSign = (typeof CRANIAL_SIGNS)[number];

/**
 * P10: the three bedside facets of language, each named for its abnormal state. They are
 * findings about the patient, not a side: language lives in the dominant hemisphere (D68).
 */
export const LANGUAGE_SIGNS = ['nonfluent_speech', 'impaired_comprehension', 'impaired_repetition'] as const;
export type LanguageSign = (typeof LANGUAGE_SIGNS)[number];

/**
 * P13: findings about both eyes together, named for their abnormal state: conjugate upgaze
 * limited; pupils poor to light but constricting to near; convergence–retraction nystagmus.
 */
export const DORSAL_MIDBRAIN_SIGNS = ['upgaze_palsy', 'light_near_dissociation', 'convergence_retraction_nystagmus'] as const;
export type DorsalMidbrainSign = (typeof DORSAL_MIDBRAIN_SIGNS)[number];

/** 'lower': the forehead spared, as after an upper-motor-neuron lesion. 'whole': the forehead too. */
export type FaceWeakness = 'none' | 'lower' | 'whole' | 'indeterminate';
export type FaceWeaknessObservation = 'normal' | 'lower' | 'whole';

/** Named vascular or anatomical territories, the places a brain candidate can sit. */
export const TERRITORIES = [
  'lateral_medullary',
  'medial_medullary',
  'ventral_pons',
  'dorsal_pons',
  'midbrain_peduncle',
  'internal_capsule',
  'thalamus',
  'mca_cortex',
  'aca_cortex',
  // P9.
  'mlf_pons',
  'pontine_tegmentum',
  'oculomotor_nucleus',
  // P10.
  'mca_inferior',
  'mca_whole',
  'broca_area',
  'wernicke_area',
  'supramarginal',
  // P11.
  'cerebellar_hemisphere',
  'vermis',
  // P12: the three cerebellar arteries.
  'aica',
  'pica',
  'sca',
  // P13.
  'dorsal_midbrain',
  // P14.
  'trochlear_nucleus',
  'midpontine_tegmentum',
  // P15.
  'subthalamic_nucleus',
  // P16.
  'frontal_eye_field',
  // P17: the ventral pons on both sides — locked-in syndrome.
  'ventral_pons_bilateral',
] as const;
export type Territory = (typeof TERRITORIES)[number];

// ---- the visual pathway (P8) ----------------------------------------------
/**
 * Sectors of one eye's visual field (docs/P8-analysis.md). Temporal is away from the nose;
 * the centre is split at fixation into the half to the patient's left and to the right.
 */
export const FIELD_SECTORS = [
  'temporal_superior',
  'temporal_inferior',
  'nasal_superior',
  'nasal_inferior',
  'central_left',
  'central_right',
] as const;
export type FieldSector = (typeof FIELD_SECTORS)[number];
export type FieldState = 'normal' | 'lost' | 'indeterminate';

/** Parts of the visual pathway, front to back. The chiasm is midline. */
export const VISUAL_PARTS = [
  'optic_nerve',
  'chiasm',
  'optic_tract',
  'meyer_loop',
  'parietal_radiation',
  'calcarine_lower',
  'calcarine_upper',
  'occipital_pole',
] as const;
export type VisualPart = (typeof VISUAL_PARTS)[number];

/** Places a visual-pathway candidate can sit. */
export const VISION_PLACES = [
  'optic_nerve',
  'chiasm',
  'optic_tract',
  'meyer_loop',
  'parietal_radiation',
  'pca_occipital',
  'occipital_cortex',
  // P18: both occipital lobes.
  'pca_bilateral',
] as const;
export type VisionPlace = (typeof VISION_PLACES)[number];

/** Anywhere a named candidate can sit beyond the cord and roots. */
export const PLACES = [...PLEXUS_SITES, ...TERRITORIES, ...VISION_PLACES] as const;
export type Place = (typeof PLACES)[number];
