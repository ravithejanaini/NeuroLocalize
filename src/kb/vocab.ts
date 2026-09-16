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
export type NeurogenicShock = 'expected' | 'not_expected' | 'not_applicable';
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
] as const;
export type LesionFamily = (typeof LESION_FAMILIES)[number];

export type SensoryObservation = 'normal' | 'abnormal';
export type StrengthObservation = 'normal' | 'weak';
/** 'reduced' covers a reflex that is reduced or absent. */
export type ReflexObservation = 'normal' | 'reduced' | 'brisk';
export type SignObservation = 'present' | 'absent';
export type BladderObservation = 'normal' | 'overactive' | 'retention';
