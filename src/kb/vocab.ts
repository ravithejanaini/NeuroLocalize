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

export const NERVES = [
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
export type Nerve = (typeof NERVES)[number];

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
] as const;
export type PlexusSite = (typeof PLEXUS_SITES)[number];

/** Muscles examined one at a time, each standing for the movement it is tested by. */
export const MUSCLES = [
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
export type Muscle = (typeof MUSCLES)[number];

/** Patches of skin examined, each served by named nerves. */
export const SKIN_AREAS = [
  'shoulder_badge',
  'lateral_forearm',
  'dorsal_web',
  'thumb',
  'middle_finger',
  'little_finger',
  'medial_forearm',
] as const;
export type SkinArea = (typeof SKIN_AREAS)[number];

export type MuscleState = 'normal' | 'weak' | 'indeterminate';

/** Deformities and postures that follow from lower-motor-neuron weakness of named muscles. */
export const DEFORMITIES = ['winged_scapula', 'waiters_tip', 'wrist_drop', 'claw_hand', 'ape_hand'] as const;
export type Deformity = (typeof DEFORMITIES)[number];

// ---- above the cord (P5) -------------------------------------------------
/** Rostral to caudal. The cord begins below the medulla. */
export const BRAIN_LEVELS = ['cortex', 'capsule', 'thalamus', 'midbrain', 'pons', 'medulla'] as const;
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
] as const;
export type BrainCompartment = (typeof BRAIN_COMPARTMENTS)[number];

/** Parts of the body as the cortex and its projections map them. */
export const BODY_REGIONS = ['face', 'neck', 'arm', 'trunk', 'leg'] as const;
export type BodyRegion = (typeof BODY_REGIONS)[number];

export const CRANIAL_SIGNS = ['oculomotor_palsy', 'abduction_weakness', 'gaze_palsy', 'tongue_weakness', 'palate_weakness'] as const;
export type CranialSign = (typeof CRANIAL_SIGNS)[number];

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
] as const;
export type Territory = (typeof TERRITORIES)[number];

/** Anywhere a named candidate can sit beyond the cord and roots. */
export const PLACES = [...PLEXUS_SITES, ...TERRITORIES] as const;
export type Place = (typeof PLACES)[number];
