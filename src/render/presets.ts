// The lesions the instrument offers. Focal lesions are shapes placed in space (D19);
// system degenerations select tracts directly and ignore the level controls.
import type { LesionRegion } from '../engine/forward.ts';
import { SHAPES, type Shape } from '../geometry/lesion3d.ts';
import type { Segment } from '../kb/vocab.ts';

type Common = { readonly id: string; readonly label: string; readonly pattern: string };
export type FocalPreset = Common & {
  readonly kind: 'focal';
  readonly shape: Shape;
  readonly level: Segment;
  readonly extent: number;
};
export type SystemPreset = Common & { readonly kind: 'system'; readonly regions: readonly LesionRegion[] };
export type Preset = FocalPreset | SystemPreset;

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
];
