// Amendment A29. Frozen expected outputs for reviewer questions answered from sources on
// 2026-09-25 (D131, D132), added after the mutation run counted their rows as sourced for the
// first time and found nothing pinning them.
//
// Reading guide. The bulbocavernosus reflex runs over S2–S4 (S148, S149); one root of three
// reduces it, as one root reduces its dermatome (D135). A relative pupillary defect needs one side
// worse than the other (S95), so two equally cut optic nerves give none.
import type { FieldSector } from '../../src/kb/vocab.ts';
import type { LesionRegion, LimbCase, VisionCase } from './types.ts';

const root = (s: 'S1' | 'S2' | 'S4'): LesionRegion => ({
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
