// The lesions the instrument offers. Focal lesions are shapes placed in space (D19);
// system degenerations select tracts directly and ignore the level controls; limb lesions
// sit at a named place beyond the roots, on the side the arm control chooses.
import type { LesionRegion } from '../engine/forward.ts';
import { SHAPES, type Shape } from '../geometry/lesion3d.ts';
import type { PlexusSite, Segment, Territory, VisionPlace } from '../kb/vocab.ts';

type Common = { readonly id: string; readonly label: string; readonly pattern: string };
export type FocalPreset = Common & {
  readonly kind: 'focal';
  readonly shape: Shape;
  readonly level: Segment;
  readonly extent: number;
};
export type SystemPreset = Common & { readonly kind: 'system'; readonly regions: readonly LesionRegion[]; readonly leg?: true };
export type LimbPreset = Common & { readonly kind: 'limb'; readonly site: PlexusSite; readonly leg?: true };
export type BrainPreset = Common & { readonly kind: 'brain'; readonly territory: Territory };
export type VisionPreset = Common & { readonly kind: 'vision'; readonly place: VisionPlace };
export type Preset = FocalPreset | SystemPreset | LimbPreset | BrainPreset | VisionPreset;

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
  {
    id: 'root-l4',
    kind: 'system',
    leg: true,
    label: 'L4 root',
    pattern: 'Weak knee extension, knee jerk down',
    regions: [{ at: { segments: ['L4', 'L4'] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
  },
  {
    id: 'root-l5',
    kind: 'system',
    leg: true,
    label: 'L5 root',
    pattern: 'Foot drop with weak inversion',
    regions: [{ at: { segments: ['L5', 'L5'] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
  },
  {
    id: 'root-s1',
    kind: 'system',
    leg: true,
    label: 'S1 root',
    pattern: 'Weak plantar flexion, ankle jerk lost',
    regions: [{ at: { segments: ['S1', 'S1'] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
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
  // P7: the leg.
  { id: 'lumbar-plexus', kind: 'limb', leg: true, label: 'Lumbar plexus', pattern: 'Weak hip flexion, knee extension, adduction', site: 'lumbar_plexus' },
  { id: 'sacral-plexus', kind: 'limb', leg: true, label: 'Sacral plexus', pattern: 'Sciatic deficits, gluteals weak', site: 'sacral_plexus' },
  { id: 'femoral', kind: 'limb', leg: true, label: 'Femoral nerve', pattern: 'Weak knee extension, adduction spared', site: 'femoral' },
  { id: 'obturator', kind: 'limb', leg: true, label: 'Obturator nerve', pattern: 'Weak hip adduction', site: 'obturator' },
  { id: 'lfcn', kind: 'limb', leg: true, label: 'Lateral femoral cutaneous', pattern: 'Meralgia paresthetica', site: 'lateral_femoral_cutaneous' },
  { id: 'superior-gluteal', kind: 'limb', leg: true, label: 'Superior gluteal nerve', pattern: 'Trendelenburg gait', site: 'superior_gluteal' },
  { id: 'inferior-gluteal', kind: 'limb', leg: true, label: 'Inferior gluteal nerve', pattern: 'Weak hip extension', site: 'inferior_gluteal' },
  { id: 'sciatic', kind: 'limb', leg: true, label: 'Sciatic nerve', pattern: 'Flail foot, gluteals spared', site: 'sciatic' },
  { id: 'tibial', kind: 'limb', leg: true, label: 'Tibial nerve', pattern: 'Weak plantar flexion, numb sole', site: 'tibial' },
  { id: 'common-fibular', kind: 'limb', leg: true, label: 'Common fibular, fibular neck', pattern: 'Foot drop, inversion spared', site: 'common_fibular' },
  { id: 'lateral-medulla', kind: 'brain', label: 'Lateral medulla', pattern: 'Wallenberg, medulla only', territory: 'lateral_medullary' },
  { id: 'medial-medulla', kind: 'brain', label: 'Medial medulla', pattern: 'Dejerine', territory: 'medial_medullary' },
  { id: 'ventral-pons', kind: 'brain', label: 'Ventral pons', pattern: 'Millard-Gubler', territory: 'ventral_pons' },
  { id: 'dorsal-pons', kind: 'brain', label: 'Abducens nucleus', pattern: 'Gaze palsy + facial palsy', territory: 'dorsal_pons' },
  { id: 'peduncle', kind: 'brain', label: 'Cerebral peduncle', pattern: 'Weber', territory: 'midbrain_peduncle' },
  { id: 'capsule', kind: 'brain', label: 'Internal capsule', pattern: 'Pure motor lacune', territory: 'internal_capsule' },
  { id: 'thalamus', kind: 'brain', label: 'Lateral thalamus', pattern: 'Pure sensory lacune', territory: 'thalamus' },
  { id: 'mca', kind: 'brain', label: 'Lateral cortex', pattern: 'MCA: face and arm', territory: 'mca_cortex' },
  { id: 'aca', kind: 'brain', label: 'Medial cortex', pattern: 'ACA: leg', territory: 'aca_cortex' },
  // P10: language and attention. Language needs the left side; neglect the right.
  { id: 'mca-inferior', kind: 'brain', label: 'MCA inferior division', pattern: 'Left: Wernicke + hemianopia · right: neglect', territory: 'mca_inferior' },
  { id: 'mca-whole', kind: 'brain', label: 'Whole MCA cortex', pattern: 'Left: global aphasia + hemiparesis', territory: 'mca_whole' },
  { id: 'broca', kind: 'brain', label: 'Inferior frontal gyrus', pattern: 'Left: Broca aphasia', territory: 'broca_area' },
  { id: 'wernicke', kind: 'brain', label: 'Superior temporal gyrus', pattern: 'Left: Wernicke aphasia', territory: 'wernicke_area' },
  // P11: the cerebellum. The vermis is midline, so the side does not change it.
  { id: 'cerebellar-hemisphere', kind: 'brain', label: 'Cerebellar hemisphere', pattern: 'Limb ataxia, same side', territory: 'cerebellar_hemisphere' },
  { id: 'vermis', kind: 'brain', label: 'Cerebellar vermis', pattern: 'Truncal ataxia, limbs spared', territory: 'vermis' },
  // P12: the three cerebellar arteries.
  { id: 'aica', kind: 'brain', label: 'AICA, lateral pons', pattern: 'Face, ear, limb + crossed pain loss', territory: 'aica' },
  { id: 'pica', kind: 'brain', label: 'PICA', pattern: 'Wallenberg + truncal ataxia', territory: 'pica' },
  { id: 'sca', kind: 'brain', label: 'SCA', pattern: 'Limb and truncal ataxia, no ear', territory: 'sca' },
  { id: 'supramarginal', kind: 'brain', label: 'Inferior parietal lobule', pattern: 'Left: conduction · right: neglect', territory: 'supramarginal' },
  // P9: the eye movements.
  // P13: the dorsal midbrain is midline, so the side does not change it.
  { id: 'dorsal-midbrain', kind: 'brain', label: 'Dorsal midbrain', pattern: 'Parinaud: cannot look up', territory: 'dorsal_midbrain' },
  // P17: the ventral pons on both sides is midline, so the side does not change it.
  { id: 'locked-in', kind: 'brain', label: 'Ventral pons, both sides', pattern: 'Locked-in: awake, looks up to answer', territory: 'ventral_pons_bilateral' },
  // P16: the frontal eye field; its deviation fades, so the timepoint matters.
  { id: 'frontal-eye-field', kind: 'brain', label: 'Frontal eye field', pattern: 'Eyes deviate toward it; recovers in days', territory: 'frontal_eye_field' },
  // P15: the basal ganglia.
  { id: 'subthalamic', kind: 'brain', label: 'Subthalamic nucleus', pattern: 'Hemiballismus of the OTHER side', territory: 'subthalamic_nucleus' },
  // P14: the fourth and fifth nerves.
  { id: 'trochlear-nucleus', kind: 'brain', label: 'Trochlear nucleus', pattern: 'The OTHER eye rides high', territory: 'trochlear_nucleus' },
  { id: 'midpontine', kind: 'brain', label: 'Mid-pontine tegmentum', pattern: 'Jaw and face one side, body the other', territory: 'midpontine_tegmentum' },
  { id: 'mlf', kind: 'brain', label: 'Medial longitudinal fasciculus', pattern: 'Internuclear ophthalmoplegia', territory: 'mlf_pons' },
  { id: 'pontine-tegmentum', kind: 'brain', label: 'Pontine tegmentum', pattern: 'One-and-a-half syndrome', territory: 'pontine_tegmentum' },
  { id: 'oculomotor-nucleus', kind: 'brain', label: 'Oculomotor nucleus', pattern: 'Nuclear third nerve palsy', territory: 'oculomotor_nucleus' },
  // P8: the visual pathway.
  { id: 'optic-nerve', kind: 'vision', label: 'Optic nerve', pattern: 'One eye blind, pupil defect', place: 'optic_nerve' },
  { id: 'chiasm', kind: 'vision', label: 'Optic chiasm', pattern: 'Bitemporal hemianopia', place: 'chiasm' },
  { id: 'optic-tract', kind: 'vision', label: 'Optic tract', pattern: 'Hemianopia with a pupil defect', place: 'optic_tract' },
  { id: 'meyer-loop', kind: 'vision', label: 'Meyer loop (temporal)', pattern: 'Superior quadrantanopia', place: 'meyer_loop' },
  { id: 'parietal-radiation', kind: 'vision', label: 'Parietal radiation', pattern: 'Inferior quadrantanopia', place: 'parietal_radiation' },
  { id: 'pca-occipital', kind: 'vision', label: 'Occipital cortex (PCA)', pattern: 'Hemianopia, macula spared', place: 'pca_occipital' },
  { id: 'occipital-cortex', kind: 'vision', label: 'Whole occipital cortex', pattern: 'Hemianopia, macula lost', place: 'occipital_cortex' },
];
