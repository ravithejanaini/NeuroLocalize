// The lesions the instrument offers. Focal lesions are shapes placed in space (D19);
// system degenerations select tracts directly and ignore the level controls; limb lesions
// sit at a named place beyond the roots, on the side the arm control chooses.
import type { LesionRegion } from '../engine/forward.ts';
import { SHAPES, type Shape } from '../geometry/lesion3d.ts';
import type { PlexusSite, Segment, Territory } from '../kb/vocab.ts';

type Common = { readonly id: string; readonly label: string; readonly pattern: string };
export type FocalPreset = Common & {
  readonly kind: 'focal';
  readonly shape: Shape;
  readonly level: Segment;
  readonly extent: number;
};
export type SystemPreset = Common & { readonly kind: 'system'; readonly regions: readonly LesionRegion[] };
export type LimbPreset = Common & { readonly kind: 'limb'; readonly site: PlexusSite };
export type BrainPreset = Common & { readonly kind: 'brain'; readonly territory: Territory };
export type Preset = FocalPreset | SystemPreset | LimbPreset | BrainPreset;

const both = ['L', 'R'] as const;

export const PRESETS: readonly Preset[] = [
  { id: 'hemi-l', kind: 'focal', label: 'Left hemisection', pattern: 'Brown-Séquard', shape: SHAPES.hemisectionLeft, level: 'T8', extent: 1 },
  { id: 'hemi-r', kind: 'focal', label: 'Right hemisection', pattern: 'Brown-Séquard', shape: SHAPES.hemisectionRight, level: 'T8', extent: 1 },
  { id: 'complete', kind: 'focal', label: 'Complete', pattern: 'Transverse myelopathy', shape: SHAPES.complete, level: 'T4', extent: 1 },
  { id: 'anterior', kind: 'focal', label: 'Anterior two-thirds', pattern: 'Anterior spinal artery', shape: SHAPES.anterior, level: 'T6', extent: 1 },
  { id: 'posterior', kind: 'focal', label: 'Posterior columns', pattern: 'Posterior cord', shape: SHAPES.posterior, level: 'T6', extent: 1 },
  { id: 'central', kind: 'focal', label: 'Central', pattern: 'Central cord', shape: SHAPES.centralCord, level: 'C4', extent: 3 },
  { id: 'syrinx', kind: 'focal', label: 'Syrinx', pattern: 'Syringomyelia', shape: SHAPES.syrinx, level: 'C4', extent: 6 },
  {
    id: 'scd', kind: 'system', label: 'Posterior + lateral columns', pattern: 'Subacute combined degeneration',
    regions: [{ at: { segments: ['C5', 'T10'] }, sides: both, compartments: ['dorsal_column', 'lateral_cst'], severity: 'partial', portion: 'whole' }],
  },
  {
    id: 'tabes', kind: 'system', label: 'Dorsal roots + columns', pattern: 'Tabes dorsalis',
    regions: [{ at: { segments: ['L2', 'S5'] }, sides: both, compartments: ['dorsal_root', 'dorsal_column'], severity: 'partial', portion: 'whole' }],
  },
  {
    id: 'mnd', kind: 'system', label: 'Anterior horns + corticospinal', pattern: 'Motor neuron disease',
    regions: [
      { at: { segments: ['C5', 'T1'] }, sides: both, compartments: ['anterior_horn'], severity: 'partial', portion: 'whole' },
      { at: { segments: ['L2', 'S1'] }, sides: both, compartments: ['anterior_horn'], severity: 'partial', portion: 'whole' },
      { at: { segments: ['C1', 'S5'] }, sides: both, compartments: ['lateral_cst'], severity: 'partial', portion: 'whole' },
    ],
  },
  {
    id: 'root-c6', kind: 'system', label: 'Left C6 root', pattern: 'Radiculopathy',
    regions: [{ at: { segments: ['C6', 'C6'] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
  },
  {
    id: 'cauda', kind: 'system', label: 'Roots L3 to coccygeal', pattern: 'Cauda equina',
    regions: [{ at: { segments: ['L3', 'Co1'] }, sides: both, compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
  },
  {
    id: 'roots-c8-t1', kind: 'system', label: 'Left C8 and T1 roots', pattern: 'Klumpke, with Horner',
    regions: [{ at: { segments: ['C8', 'T1'] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
  },
  { id: 'upper-trunk', kind: 'limb', label: 'Upper trunk', pattern: 'Erb palsy', site: 'upper_trunk' },
  { id: 'lower-trunk', kind: 'limb', label: 'Lower trunk', pattern: 'Klumpke palsy', site: 'lower_trunk' },
  { id: 'posterior-cord', kind: 'limb', label: 'Posterior cord', pattern: 'Axillary + radial', site: 'posterior_cord' },
  { id: 'medial-cord', kind: 'limb', label: 'Medial cord', pattern: 'Ulnar + median, radial spared', site: 'medial_cord' },
  { id: 'long-thoracic', kind: 'limb', label: 'Long thoracic nerve', pattern: 'Winged scapula', site: 'long_thoracic' },
  { id: 'axillary', kind: 'limb', label: 'Axillary nerve', pattern: 'After shoulder dislocation', site: 'axillary' },
  { id: 'musculocutaneous', kind: 'limb', label: 'Musculocutaneous', pattern: 'Weak elbow flexion', site: 'musculocutaneous' },
  { id: 'radial-axilla', kind: 'limb', label: 'Radial, in the axilla', pattern: 'Wrist drop, triceps weak', site: 'radial_axilla' },
  { id: 'radial-groove', kind: 'limb', label: 'Radial, spiral groove', pattern: 'Wrist drop, triceps spared', site: 'radial_spiral_groove' },
  { id: 'pin', kind: 'limb', label: 'Posterior interosseous', pattern: 'Finger drop, no numbness', site: 'posterior_interosseous' },
  { id: 'median-elbow', kind: 'limb', label: 'Median, at the elbow', pattern: 'High median lesion', site: 'median_elbow' },
  { id: 'median-wrist', kind: 'limb', label: 'Median, at the wrist', pattern: 'Carpal tunnel', site: 'median_wrist' },
  { id: 'ulnar-elbow', kind: 'limb', label: 'Ulnar, at the elbow', pattern: 'Claw hand, cubital tunnel', site: 'ulnar_elbow' },
  { id: 'ulnar-wrist', kind: 'limb', label: 'Ulnar, at the wrist', pattern: 'Guyon canal', site: 'ulnar_wrist' },
  { id: 'lateral-medulla', kind: 'brain', label: 'Lateral medulla', pattern: 'Wallenberg (PICA)', territory: 'lateral_medullary' },
  { id: 'medial-medulla', kind: 'brain', label: 'Medial medulla', pattern: 'Dejerine', territory: 'medial_medullary' },
  { id: 'ventral-pons', kind: 'brain', label: 'Ventral pons', pattern: 'Millard-Gubler', territory: 'ventral_pons' },
  { id: 'dorsal-pons', kind: 'brain', label: 'Abducens nucleus', pattern: 'Gaze palsy + facial palsy', territory: 'dorsal_pons' },
  { id: 'peduncle', kind: 'brain', label: 'Cerebral peduncle', pattern: 'Weber', territory: 'midbrain_peduncle' },
  { id: 'capsule', kind: 'brain', label: 'Internal capsule', pattern: 'Pure motor lacune', territory: 'internal_capsule' },
  { id: 'thalamus', kind: 'brain', label: 'Lateral thalamus', pattern: 'Pure sensory lacune', territory: 'thalamus' },
  { id: 'mca', kind: 'brain', label: 'Lateral cortex', pattern: 'MCA: face and arm', territory: 'mca_cortex' },
  { id: 'aca', kind: 'brain', label: 'Medial cortex', pattern: 'ACA: leg', territory: 'aca_cortex' },
];
