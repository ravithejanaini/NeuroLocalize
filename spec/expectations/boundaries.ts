// Amendment A2. Cases placed exactly at boundaries the sources state, added after
// mutation testing showed the original fifteen never probed them. Every expected value
// comes from the cited source's stated level; none was read off the engine.
import { COMPARTMENTS, type Compartment, type Segment, type Side } from '../../src/kb/vocab.ts';
import type { Case, LesionRegion } from './types.ts';

const transection = (at: Segment): LesionRegion => ({
  at: { segments: [at, at] }, sides: ['L', 'R'], compartments: COMPARTMENTS, severity: 'complete', portion: 'whole',
});
const only = (from: Segment, to: Segment, sides: readonly Side[], compartments: readonly Compartment[]): LesionRegion => ({
  at: { segments: [from, to] }, sides, compartments, severity: 'complete', portion: 'whole',
});
const ROOTS: readonly Compartment[] = ['dorsal_root', 'ventral_root'];

export const BOUNDARY_CASES: readonly Case[] = [
  // ── autonomic thresholds (S03, S04) ──────────────────────────────────────
  {
    id: 'complete-T5', title: 'Complete transection at T5', pattern: 'neurogenic shock threshold',
    lesion: [transection('T5')],
    evaluations: [{
      timepoint: 'hyperacute',
      assertions: [{ kind: 'neurogenicShock', oneOf: ['expected'], cite: ['S03'], basis: 'stated', note: 'T5 is above T6' }],
      unasserted: ['T6 itself: S03 says "especially above T6", too soft to decide the boundary segment'],
    }],
  },
  {
    id: 'complete-T6', title: 'Complete transection at T6', pattern: 'dysreflexia threshold',
    lesion: [transection('T6')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'dysreflexia', oneOf: ['susceptible'], cite: ['S04'], basis: 'stated', note: 'at or above T6' }],
      unasserted: [],
    }],
  },
  {
    id: 'complete-T7', title: 'Complete transection at T7', pattern: 'dysreflexia grey zone',
    lesion: [transection('T7')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'dysreflexia', oneOf: ['possible'], cite: ['S04'], basis: 'composed',
        note: 'neither at or above T6 nor below T10' }],
      unasserted: [],
    }],
  },
  {
    id: 'complete-T10', title: 'Complete transection at T10', pattern: 'dysreflexia grey zone',
    lesion: [transection('T10')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'dysreflexia', oneOf: ['possible'], cite: ['S04'], basis: 'composed',
        note: 'T10 is not below T10' }],
      unasserted: [],
    }],
  },
  {
    id: 'complete-T11', title: 'Complete transection at T11', pattern: 'dysreflexia threshold',
    lesion: [transection('T11')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'dysreflexia', oneOf: ['rare'], cite: ['S04'], basis: 'stated', note: 'below T10' }],
      unasserted: [],
    }],
  },

  // ── reflex levels (S12, S19) ─────────────────────────────────────────────
  {
    id: 'root-C4-left', title: 'Left C4 root lesion', pattern: 'reflex level: above biceps',
    lesion: [only('C4', 'C4', ['L'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['normal'], cite: ['S12', 'S19'], basis: 'composed', note: 'biceps is C5–C6' },
        { kind: 'reflex', side: 'L', reflex: 'brachioradialis', oneOf: ['normal'], cite: ['S12', 'S19'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-C7-left', title: 'Left C7 root lesion', pattern: 'reflex level: triceps',
    lesion: [only('C7', 'C7', ['L'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['reduced', 'absent'], cite: ['S12'], basis: 'stated',
          note: 'C7–C8, predominantly C7' },
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['normal'], cite: ['S12', 'S19'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'brachioradialis', oneOf: ['normal'], cite: ['S12', 'S19'], basis: 'composed',
          note: 'both sources exclude C7' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-T1-left', title: 'Left T1 root lesion', pattern: 'reflex level: below triceps',
    lesion: [only('T1', 'T1', ['L'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' }],
      unasserted: ['C8 alone: S12 weights the triceps reflex toward C7 without saying what C8 loss does'],
    }],
  },
  {
    id: 'root-L1-left', title: 'Left L1 root lesion', pattern: 'reflex level: above patellar',
    lesion: [only('L1', 'L1', ['L'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'reflex', side: 'L', reflex: 'patellar', oneOf: ['normal'], cite: ['S12'], basis: 'composed', note: 'patellar is L2–L4' }],
      unasserted: [],
    }],
  },
  {
    id: 'root-L4-left', title: 'Left L4 root lesion', pattern: 'reflex level: patellar',
    lesion: [only('L4', 'L4', ['L'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'reflex', side: 'L', reflex: 'patellar', oneOf: ['reduced', 'absent'], cite: ['S12'], basis: 'stated', note: 'predominantly L4' },
        { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
      ],
      unasserted: ['L2 alone: S12 lists L2 without saying how much it contributes'],
    }],
  },
  {
    id: 'root-L5-left', title: 'Left L5 root lesion', pattern: 'reflex level: between patellar and Achilles',
    lesion: [only('L5', 'L5', ['L'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'reflex', side: 'L', reflex: 'patellar', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['normal'], cite: ['S12'], basis: 'composed', note: 'Achilles is S1' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-S2-left', title: 'Left S2 root lesion', pattern: 'reflex level: below Achilles',
    lesion: [only('S2', 'S2', ['L'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['normal'], cite: ['S12'], basis: 'composed' }],
      unasserted: ['bulbocavernosus: its level is unsourced (R4)'],
    }],
  },
  {
    id: 'ventral-root-S1-left', title: 'Left S1 ventral root lesion', pattern: 'efferent limb of the reflex arc',
    lesion: [only('S1', 'S1', ['L'], ['ventral_root'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['reduced', 'absent'], cite: ['S12', 'S19'], basis: 'composed',
          note: 'a lower-motor-neuron lesion depresses the reflex it serves' },
        { kind: 'motor', side: 'L', span: ['S1', 'S1'], lesion: ['lmn'], cite: ['S19', 'S18'], basis: 'composed' },
      ],
      unasserted: ['sensation: no source read states that a ventral root carries none'],
    }],
  },

  // ── sacral micturition centre (S20) ──────────────────────────────────────
  {
    id: 'roots-S5-Co1', title: 'Bilateral S5 and coccygeal root lesion', pattern: 'below the micturition centre',
    lesion: [only('S5', 'Co1', ['L', 'R'], ROOTS)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'bladder', oneOf: ['normal'], cite: ['S20'], basis: 'composed', note: 'the centre is S2–S4' }],
      unasserted: ['perianal sensation: overlap at the caudal edge (S21)'],
    }],
  },

  // ── central cord observations (S06) ──────────────────────────────────────
  {
    id: 'anterolateral-central-C4-C6', title: 'Partial central spinothalamic lesion alone, C4–C6', pattern: 'central lesion sparing the corticospinal tracts',
    lesion: [{ at: { segments: ['C4', 'C6'] }, sides: ['L', 'R'], compartments: ['anterolateral'], severity: 'partial', portion: 'central' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'qualifier', qualifier: 'upper_limb_predominant_weakness', present: false, cite: ['S06'], basis: 'composed',
          note: 'S06 attributes the weakness to the lateral corticospinal tracts, which this lesion spares' },
        { kind: 'motor', side: 'both', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S06'], basis: 'composed' },
        { kind: 'qualifier', qualifier: 'sacral_sparing', present: true, cite: ['S06'], basis: 'stated' },
        { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['S3', 'S5'], oneOf: ['intact'], cite: ['S06'], basis: 'stated' },
      ],
      unasserted: [],
    }],
  },

  // ── ciliospinal centre (S16) ─────────────────────────────────────────────
  {
    id: 'ciliospinal-centre-left', title: 'Left intermediolateral column, C8–T2', pattern: 'whole ciliospinal centre',
    lesion: [only('C8', 'T2', ['L'], ['intermediolateral'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S16'], basis: 'composed' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: ['a lesion of only part of the centre (R10)'],
    }],
  },
  {
    id: 'intermediolateral-C7-left', title: 'Left intermediolateral column at C7', pattern: 'just above the ciliospinal centre',
    lesion: [only('C7', 'C7', ['L'], ['intermediolateral'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed',
        note: 'outside C8–T2, and no descending fibres are cut' }],
      unasserted: [],
    }],
  },
  {
    id: 'intermediolateral-T3-left', title: 'Left intermediolateral column at T3', pattern: 'just below the ciliospinal centre',
    lesion: [only('T3', 'T3', ['L'], ['intermediolateral'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [{ kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed' }],
      unasserted: [],
    }],
  },
];
