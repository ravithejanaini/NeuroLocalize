// Amendment A29. Frozen expected outputs for reviewer questions answered from sources on
// 2026-09-25 (D131, D132), added after the mutation run counted their rows as sourced for the
// first time and found nothing pinning them.
//
// Reading guide. The bulbocavernosus reflex runs over S2–S4 (S148, S149); one root of three
// reduces it, as one root reduces its dermatome (D135). A relative pupillary defect needs one side
// worse than the other (S95), so two equally cut optic nerves give none.
import type { FieldSector, Muscle } from '../../src/kb/vocab.ts';
import type { BrainCase, BrainRegion, LesionRegion, LimbCase, VisionCase } from './types.ts';

const root = (s: 'S1' | 'S2' | 'S4' | 'C5' | 'C6' | 'C8' | 'L5'): LesionRegion => ({
  at: { segments: [s, s] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole',
});
const ALL: readonly FieldSector[] = ['temporal_superior', 'temporal_inferior', 'nasal_superior', 'nasal_inferior', 'central_left', 'central_right'];

export const ANSWERED_LIMB_CASES: readonly LimbCase[] = (['S1', 'S2', 'S4'] as const).map((s): LimbCase => ({
  id: `root-${s}-bulbocavernosus-left`,
  title: `Left ${s} root, examined at the bulbocavernosus reflex`,
  pattern: s === 'S1' ? 'outside the reflex’s arc: the reflex kept' : 'one of the reflex’s three roots: the reflex reduced',
  lesion: [root(s)],
  evaluations: [{
    timepoint: 'chronic',
    assertions: [
      {
        kind: 'reflex', side: 'L', reflex: 'bulbocavernosus', oneOf: [s === 'S1' ? 'normal' : 'reduced'],
        cite: ['S148', 'S149'], basis: 'composed',
        note: s === 'S1' ? 'the arc is S2–S4' : 'one of S2–S4, the others intact',
      },
    ],
    unasserted: ['every other finding of the root'],
  }],
}));

export const ANSWERED_VISION_CASES: readonly VisionCase[] = [
  {
    id: 'optic-nerves-both',
    title: 'Both optic nerves, equally',
    pattern: 'both eyes blind, with no relative pupillary defect',
    lesion: [{ vision: 'optic_nerve', sides: ['L', 'R'], severity: 'complete' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'field', eye: 'L', sectors: ALL, oneOf: ['lost'], cite: ['S91', 'S92'], basis: 'composed', note: 'each nerve carries its own eye' },
        { kind: 'field', eye: 'R', sectors: ALL, oneOf: ['lost'], cite: ['S91', 'S92'], basis: 'composed' },
        { kind: 'rapd', side: 'L', oneOf: ['absent'], cite: ['S95'], basis: 'stated', note: 'a sign of unilateral or asymmetric dysfunction (R30)' },
        { kind: 'rapd', side: 'R', oneOf: ['absent'], cite: ['S95'], basis: 'stated' },
      ],
      unasserted: ['the absolute light reflex, which the model does not show'],
    }],
  },
];

// A30 (P25): the roots of two arm muscles, answered for R14 and R18 from their StatPearls anatomy
// articles. The triceps is C7 with C6 and C8 contributing (S152); the brachioradialis takes most
// of its input from C5 and C6, C7 contributing (S153).
const muscle = (list: readonly Muscle[], state: 'weak' | 'normal' | 'indeterminate', cite: LimbCase['evaluations'][number]['assertions'][number]['cite'], note: string) =>
  ({ kind: 'muscle', side: 'L', muscles: list, oneOf: [state], cite, basis: 'composed', note }) as LimbCase['evaluations'][number]['assertions'][number];

export const ROOT_MUSCLE_CASES: readonly LimbCase[] = [
  {
    id: 'root-C5-arm-roots-left',
    title: 'Left C5 root, examined at the brachioradialis and triceps',
    pattern: 'the brachioradialis weak; the triceps kept',
    lesion: [root('C5')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        muscle(['brachioradialis'], 'weak', ['S153'], 'most of its input comes from C5 and C6'),
        muscle(['triceps'], 'normal', ['S152'], 'the triceps is C6–C8'),
      ],
      unasserted: ['every other finding of the root'],
    }],
  },
  {
    id: 'root-C6-arm-roots-left',
    title: 'Left C6 root, examined at the brachioradialis and triceps',
    pattern: 'the brachioradialis weak; the triceps unsettled',
    lesion: [root('C6')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        muscle(['brachioradialis'], 'weak', ['S153'], 'C5 and C6'),
        muscle(['triceps'], 'indeterminate', ['S152', 'S19'], 'C6 contributes; C7 is the key root'),
      ],
      unasserted: ['every other finding of the root'],
    }],
  },
  {
    id: 'root-C8-arm-roots-left',
    title: 'Left C8 root, examined at the triceps and brachioradialis',
    pattern: 'the triceps unsettled; the brachioradialis kept',
    lesion: [root('C8')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        muscle(['triceps'], 'indeterminate', ['S152', 'S19'], 'C8 contributes; C7 is the key root'),
        muscle(['brachioradialis'], 'normal', ['S153'], 'C5 to C7'),
      ],
      unasserted: ['every other finding of the root'],
    }],
  },
];

// A31 (P26): the sole's roots, answered in part for R51. The lateral plantar aspect of the foot is
// the S1 dermatome (S151); Foerster's S1 covers the heel and the posterior side of the foot (S155).
// S1 becomes the sole's certain root; the others the tibial nerve carries stay possible.
const sole = (state: 'impaired' | 'indeterminate', note: string): LimbCase['evaluations'][number]['assertions'][number] =>
  ({ kind: 'skin', side: 'L', modality: 'all', areas: ['sole'], oneOf: [state], cite: ['S151', 'S155'], basis: 'composed', note });

export const SOLE_ROOT_CASES: readonly LimbCase[] = [
  {
    id: 'root-S1-sole-left',
    title: 'Left S1 root, examined at the sole',
    pattern: 'the sole reduced',
    lesion: [root('S1')],
    evaluations: [{ timepoint: 'chronic', assertions: [sole('impaired', 'the lateral plantar aspect is the S1 dermatome; one root reduces (D135)')], unasserted: ['every other finding of the root'] }],
  },
  {
    id: 'root-S2-sole-left',
    title: 'Left S2 root, examined at the sole',
    pattern: 'the sole unsettled',
    lesion: [root('S2')],
    evaluations: [{ timepoint: 'chronic', assertions: [sole('indeterminate', 'S2 may serve it; no source read says so either way')], unasserted: ['every other finding of the root'] }],
  },
];

// A33 (P27): one part of the tongue's route at a time. Once R25 was answered the route counted as
// sourced, and six mutants moving one of its steps onto a neighbouring part survived, because no
// case lesioned a single part of it (D148). The fibres run through the capsule, the peduncle and
// the medial ventral pons before they cross (S157); a paramedian pontine infarct deviates the tongue
// to the other side (S157).
const part = (brain: BrainRegion['brain'], compartments: BrainRegion['compartments'], regions?: BrainRegion['regions']): BrainRegion =>
  ({ brain, sides: ['L'], compartments, severity: 'complete', ...(regions ? { regions } : {}) });
const tongue = (basis: 'stated' | 'composed', note: string): BrainCase['evaluations'][number]['assertions'] => [
  { kind: 'cranial', side: 'R', sign: 'tongue_weakness', oneOf: ['present'], cite: ['S157', 'S156'], basis, note },
  { kind: 'cranial', side: 'L', sign: 'tongue_weakness', oneOf: ['absent'], cite: ['S157', 'S156'], basis: 'composed', note: 'the fibres to the left nucleus come from the other hemisphere' },
];

export const TONGUE_ROUTE_CASES: readonly BrainCase[] = [
  { id: 'tongue-route-pontine-base-left', title: 'Left base of the pons alone', pattern: 'the tongue deviates to the other side', lesion: [part('pons', ['basis'])],
    evaluations: [{ timepoint: 'chronic', assertions: tongue('stated', 'paramedian pontine infarction: contralateral tongue deviation'), unasserted: ['every other finding'] }] },
  { id: 'tongue-route-peduncle-left', title: 'Left cerebral peduncle alone', pattern: 'the other half of the tongue weak', lesion: [part('midbrain', ['peduncle'])],
    evaluations: [{ timepoint: 'chronic', assertions: tongue('composed', 'the fibres run through the cerebral peduncle'), unasserted: ['every other finding'] }] },
  { id: 'tongue-route-capsule-genu-left', title: 'Left genu of the internal capsule alone', pattern: 'the other half of the tongue weak', lesion: [part('capsule', ['capsule_genu'])],
    evaluations: [{ timepoint: 'chronic', assertions: tongue('composed', 'the fibres run through the internal capsule'), unasserted: ['every other finding'] }] },
  { id: 'tongue-route-motor-face-left', title: 'Left motor cortex, face area alone', pattern: 'the other half of the tongue weak', lesion: [part('cortex', ['motor_cortex'], ['face'])],
    evaluations: [{ timepoint: 'chronic', assertions: tongue('composed', 'the fibres begin in the motor cortex'), unasserted: ['every other finding'] }] },
];
