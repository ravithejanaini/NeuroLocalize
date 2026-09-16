// Frozen expected outputs, written from the sources in docs/SOURCES.md before any engine
// code existed. Change one only with an entry in AMENDMENTS.md.
//
// Reading guide: spans are inclusive, rostral end first. 'both' expands to L and R.
// A pain–temperature span marked [lost, indeterminate] is where the 1–3 segment crossing
// offset (D2) leaves the answer open.
import { COMPARTMENTS } from '../../src/kb/vocab.ts';
import type { Case } from './types.ts';

const ALL = COMPARTMENTS;

export const CASES: readonly Case[] = [
  // ───────────────────────────────────────────────────────────────── 01
  {
    id: 'complete-T4',
    title: 'Complete transection at T4',
    pattern: 'transverse myelopathy, above T6',
    lesion: [{ at: { segments: ['T4', 'T4'] }, sides: ['L', 'R'], compartments: ALL, severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'hyperacute',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'all', span: ['T5', 'S5'], oneOf: ['lost'], cite: ['S05'], basis: 'stated' },
          { kind: 'motor', side: 'both', span: ['T5', 'Co1'], lesion: ['umn'], cite: ['S05'], basis: 'composed',
            note: 'anatomically an upper-motor-neuron lesion even while spinal shock masks its signs' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['absent'], cite: ['S02'], basis: 'stated',
            note: 'Ditunno phase 1: deep tendon reflexes absent' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['absent'], cite: ['S02'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S02'], basis: 'composed',
            note: 'S02 has the Babinski sign appearing in phase 3' },
          { kind: 'neurogenicShock', oneOf: ['expected'], cite: ['S03'], basis: 'stated' },
          { kind: 'dysreflexia', oneOf: ['not_yet'], cite: ['S04'], basis: 'stated' },
          { kind: 'bladder', oneOf: ['impaired_in_spinal_shock'], cite: ['S02'], basis: 'stated' },
          { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed',
            note: 'T4 lies below the ciliospinal centre at C8–T2' },
        ],
        unasserted: [
          'muscle tone during spinal shock: no source read states it',
          'sensation at the lesion level itself',
        ],
      },
      // A2: Ditunno phases 2 and 3 (S02), added after mutation testing.
      {
        timepoint: 'acute',
        assertions: [
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['absent'], cite: ['S02'], basis: 'stated',
            note: 'phase 2: deep tendon reflexes remain absent' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['absent'], cite: ['S02'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S02'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['impaired_in_spinal_shock'], cite: ['S02'], basis: 'stated' },
          { kind: 'dysreflexia', oneOf: ['not_yet'], cite: ['S04'], basis: 'stated' },
          { kind: 'neurogenicShock', oneOf: ['expected'], cite: ['S03'], basis: 'stated' },
        ],
        unasserted: ['muscle tone'],
      },
      {
        timepoint: 'subacute',
        assertions: [
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['indeterminate', 'normal', 'brisk'], cite: ['S02'], basis: 'stated',
            note: 'phase 3: reflexes usually return — so not absent' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['indeterminate', 'normal', 'brisk'], cite: ['S02'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['indeterminate', 'present'], cite: ['S02'], basis: 'stated',
            note: 'phase 3: the Babinski sign may appear' },
          { kind: 'bladder', oneOf: ['impaired_in_spinal_shock'], cite: ['S02', 'S20'], basis: 'composed',
            note: 'S20 defers bladder assessment until spinal shock has passed' },
          { kind: 'dysreflexia', oneOf: ['not_yet'], cite: ['S04'], basis: 'stated',
            note: 'uncommon in the first month' },
        ],
        unasserted: ['neurogenic shock: no source read gives its time window (R9)'],
      },
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'all', span: ['T5', 'S5'], oneOf: ['lost'], cite: ['S05'], basis: 'stated' },
          { kind: 'motor', side: 'both', span: ['T5', 'Co1'], lesion: ['umn'], tone: ['increased'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['brisk'], cite: ['S02', 'S12'], basis: 'stated',
            note: 'Ditunno phase 4: hyperactive reflexes' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['brisk'], cite: ['S02', 'S12'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['present'], cite: ['S12'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['suprasacral'], cite: ['S20'], basis: 'composed',
            note: 'lesion above the S2–S4 micturition centre' },
          { kind: 'dysreflexia', oneOf: ['susceptible'], cite: ['S04'], basis: 'stated' },
          { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        ],
        unasserted: ['neurogenic shock beyond the acute phase'],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 02
  {
    id: 'complete-T12',
    title: 'Complete transection at T12',
    pattern: 'transverse myelopathy, below T10',
    lesion: [{ at: { segments: ['T12', 'T12'] }, sides: ['L', 'R'], compartments: ALL, severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'hyperacute',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'all', span: ['L1', 'S5'], oneOf: ['lost'], cite: ['S05'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['absent'], cite: ['S02'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['absent'], cite: ['S02'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S02'], basis: 'composed' },
          { kind: 'neurogenicShock', oneOf: ['not_expected'], cite: ['S03', 'S07'], basis: 'composed',
            note: 'S03 places it chiefly above T6; a T12 lesion leaves most of the T1–L2 outflow (S07) under descending control' },
          { kind: 'dysreflexia', oneOf: ['not_yet'], cite: ['S04'], basis: 'stated' },
          { kind: 'bladder', oneOf: ['impaired_in_spinal_shock'], cite: ['S02'], basis: 'stated' },
        ],
        unasserted: ['muscle tone during spinal shock'],
      },
      // A2: Ditunno phases 2 and 3 (S02), added after mutation testing.
      {
        timepoint: 'acute',
        assertions: [
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['absent'], cite: ['S02'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['absent'], cite: ['S02'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S02'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['impaired_in_spinal_shock'], cite: ['S02'], basis: 'stated' },
          { kind: 'dysreflexia', oneOf: ['not_yet'], cite: ['S04'], basis: 'stated' },
          { kind: 'neurogenicShock', oneOf: ['not_expected'], cite: ['S03', 'S07'], basis: 'composed' },
        ],
        unasserted: ['muscle tone'],
      },
      {
        timepoint: 'subacute',
        assertions: [
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['indeterminate', 'normal', 'brisk'], cite: ['S02'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['indeterminate', 'normal', 'brisk'], cite: ['S02'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['indeterminate', 'present'], cite: ['S02'], basis: 'stated' },
          { kind: 'bladder', oneOf: ['impaired_in_spinal_shock'], cite: ['S02', 'S20'], basis: 'composed' },
          { kind: 'dysreflexia', oneOf: ['not_yet'], cite: ['S04'], basis: 'stated' },
        ],
        unasserted: ['neurogenic shock: no source read gives its time window (R9)'],
      },
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'all', span: ['L1', 'S5'], oneOf: ['lost'], cite: ['S05'], basis: 'stated' },
          { kind: 'motor', side: 'both', span: ['L1', 'Co1'], lesion: ['umn'], tone: ['increased'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['brisk'], cite: ['S02', 'S12'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['brisk'], cite: ['S02', 'S12'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['present'], cite: ['S12'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['suprasacral'], cite: ['S20', 'S14'], basis: 'composed',
            note: 'T12 lies above the conus (S2–Co1)' },
          { kind: 'dysreflexia', oneOf: ['rare'], cite: ['S04'], basis: 'stated', note: 'below T10' },
        ],
        unasserted: [],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 03
  {
    id: 'hemisection-T8-left',
    title: 'Left hemisection at T8',
    pattern: 'Brown-Séquard',
    lesion: [{ at: { segments: ['T8', 'T8'] }, sides: ['L'], compartments: ALL, severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'motor', side: 'L', span: ['T9', 'Co1'], lesion: ['umn'], cite: ['S01', 'S15', 'S05'], basis: 'stated' },
          { kind: 'motor', side: 'L', span: ['T8', 'T8'], lesion: ['lmn'], cite: ['S01'], basis: 'stated',
            note: 'flaccid paralysis at the level' },
          { kind: 'motor', side: 'L', span: ['C1', 'T7'], lesion: ['none'], cite: ['S01'], basis: 'composed' },
          { kind: 'motor', side: 'R', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S01', 'S15'], basis: 'composed' },
          { kind: 'sensory', side: 'L', modality: 'posterior_column', span: ['T9', 'S5'], oneOf: ['lost'], cite: ['S01', 'S15', 'S05'], basis: 'stated' },
          { kind: 'sensory', side: 'R', modality: 'posterior_column', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S01', 'S15'], basis: 'composed' },
          { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['T11', 'S5'], oneOf: ['lost'], cite: ['S01', 'S11', 'S15'], basis: 'composed',
            note: 'contralateral loss below the lesion; the 1–3 segment offset puts certain loss from T11 (C1)' },
          { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['T9', 'T10'], oneOf: ['lost', 'indeterminate'], cite: ['S01', 'S11'], basis: 'composed' },
          { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['C1', 'T8'], oneOf: ['intact'], cite: ['S15'], basis: 'composed' },
          { kind: 'sensory', side: 'L', modality: 'pain_temperature', span: ['C1', 'T7'], oneOf: ['intact'], cite: ['S15'], basis: 'composed' },
          { kind: 'sensory', side: 'L', modality: 'pain_temperature', span: ['T12', 'S5'], oneOf: ['intact'], cite: ['S01', 'S15'], basis: 'composed',
            note: 'ipsilateral pain fibres from well below the lesion have already crossed to the intact side' },
          { kind: 'reflex', side: 'L', reflex: 'patellar', oneOf: ['brisk'], cite: ['S01', 'S12'], basis: 'composed' },
          { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['brisk'], cite: ['S01', 'S12'], basis: 'composed' },
          { kind: 'reflex', side: 'R', reflex: 'patellar', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'R', reflex: 'achilles', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'babinski', side: 'L', oneOf: ['present'], cite: ['S12'], basis: 'composed' },
          { kind: 'babinski', side: 'R', oneOf: ['absent'], cite: ['S12'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['normal'], cite: ['S01'], basis: 'stated',
            note: 'ipsilateral autonomic damage generally does not affect sphincter function' },
          { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        ],
        unasserted: [
          'ipsilateral pain–temperature at T8–T11, the band around the lesion: no source read describes it',
          'dysreflexia and neurogenic shock after a unilateral lesion',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 04
  {
    id: 'hemisection-C7-left',
    title: 'Left hemisection at C7',
    pattern: 'Brown-Séquard above T1',
    lesion: [{ at: { segments: ['C7', 'C7'] }, sides: ['L'], compartments: ALL, severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'motor', side: 'L', span: ['C7', 'C7'], lesion: ['lmn'], cite: ['S01'], basis: 'stated' },
          { kind: 'motor', side: 'L', span: ['C8', 'Co1'], lesion: ['umn'], cite: ['S01', 'S15'], basis: 'stated' },
          { kind: 'motor', side: 'R', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S01', 'S15'], basis: 'composed' },
          { kind: 'sensory', side: 'L', modality: 'posterior_column', span: ['C8', 'S5'], oneOf: ['lost'], cite: ['S01', 'S15'], basis: 'stated' },
          { kind: 'sensory', side: 'R', modality: 'posterior_column', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S01', 'S15'], basis: 'composed' },
          { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['T2', 'S5'], oneOf: ['lost'], cite: ['S01', 'S11', 'S15'], basis: 'composed' },
          { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['C8', 'T1'], oneOf: ['lost', 'indeterminate'], cite: ['S01', 'S11'], basis: 'composed' },
          { kind: 'sensory', side: 'R', modality: 'pain_temperature', span: ['C1', 'C7'], oneOf: ['intact'], cite: ['S15'], basis: 'composed' },
          { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed',
            note: 'C5–C6 arc and its descending control both lie above the lesion' },
          { kind: 'reflex', side: 'L', reflex: 'patellar', oneOf: ['brisk'], cite: ['S01', 'S12'], basis: 'composed' },
          { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['brisk'], cite: ['S01', 'S12'], basis: 'composed' },
          { kind: 'reflex', side: 'R', reflex: 'biceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'R', reflex: 'patellar', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'babinski', side: 'L', oneOf: ['present'], cite: ['S12'], basis: 'composed' },
          { kind: 'babinski', side: 'R', oneOf: ['absent'], cite: ['S12'], basis: 'composed' },
          { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S16', 'S01'], basis: 'composed',
            note: 'first-order fibres run uncrossed to C8–T2; C7 is above them' },
          { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['normal'], cite: ['S01'], basis: 'stated' },
        ],
        unasserted: [
          'left triceps: its C7–C8 arc mixes the lesioned C7 with a disinhibited C8, and no source read resolves that',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 05
  {
    id: 'anterior-T6',
    title: 'Anterior two-thirds infarct at T6',
    pattern: 'anterior spinal artery syndrome',
    lesion: [{
      at: { segments: ['T6', 'T6'] },
      sides: ['L', 'R'],
      compartments: ['lateral_cst', 'anterolateral', 'anterior_horn', 'commissure', 'intermediolateral', 'descending_autonomic'],
      severity: 'complete',
      portion: 'whole',
    }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'motor', side: 'both', span: ['T6', 'T6'], lesion: ['lmn'], cite: ['S07', 'S18'], basis: 'composed' },
          { kind: 'motor', side: 'both', span: ['T7', 'Co1'], lesion: ['umn'], cite: ['S07', 'S15', 'S05'], basis: 'stated' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['T9', 'S5'], oneOf: ['lost'], cite: ['S07', 'S15', 'S05'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['T7', 'T8'], oneOf: ['lost', 'indeterminate'], cite: ['S07', 'S11'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['C1', 'T5'], oneOf: ['intact'], cite: ['S07'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'posterior_column', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S07', 'S05'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['brisk'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['brisk'], cite: ['S12'], basis: 'composed' },
          { kind: 'babinski', side: 'both', oneOf: ['present'], cite: ['S12'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['suprasacral'], cite: ['S07', 'S20'], basis: 'composed' },
        ],
        unasserted: [
          'dysreflexia: no source read addresses it after anterior spinal artery infarction',
          'hypotension from lateral-horn involvement (S07) is not modelled in P0',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 06
  {
    id: 'central-cord-C4-C6',
    title: 'Central cord injury, C4–C6, acute',
    pattern: 'central cord syndrome',
    lesion: [
      { at: { segments: ['C4', 'C6'] }, sides: ['L', 'R'], compartments: ['lateral_cst'], severity: 'partial', portion: 'central' },
      { at: { segments: ['C4', 'C6'] }, sides: ['L', 'R'], compartments: ['anterolateral'], severity: 'partial', portion: 'central' },
      { at: { segments: ['C4', 'C6'] }, sides: ['L', 'R'], compartments: ['commissure'], severity: 'complete', portion: 'whole' },
    ],
    evaluations: [
      {
        timepoint: 'acute',
        assertions: [
          { kind: 'qualifier', qualifier: 'upper_limb_predominant_weakness', present: true, cite: ['S06'], basis: 'stated' },
          { kind: 'qualifier', qualifier: 'sacral_sparing', present: true, cite: ['S06'], basis: 'stated',
            note: 'S06: sacral sensation is usually preserved' },
          { kind: 'motor', side: 'both', span: ['C8', 'T1'], lesion: ['umn'], cite: ['S06'], basis: 'composed',
            note: 'weakness maximal in the hands' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['S3', 'S5'], oneOf: ['intact'], cite: ['S06'], basis: 'stated' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['C7', 'C7'], oneOf: ['lost', 'impaired'], cite: ['S06', 'S08', 'S11'], basis: 'composed',
            note: 'every crossing path for C7 passes through the damaged commissure' },
        ],
        unasserted: [
          'reflexes and tone: an acute incomplete lesion',
          'posterior-column sensation: S06 calls sensory findings variable',
          'bladder: S06 calls retention possible, not required',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 07
  {
    id: 'syrinx-C4-T1',
    title: 'Syrinx confined to the commissure, C4–T1',
    pattern: 'syringomyelia',
    lesion: [{ at: { segments: ['C4', 'T1'] }, sides: ['L', 'R'], compartments: ['commissure'], severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['C7', 'T2'], oneOf: ['lost'], cite: ['S08', 'S11'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['C5', 'C6'], oneOf: ['lost', 'indeterminate'], cite: ['S08', 'S11'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['T3', 'T4'], oneOf: ['lost', 'indeterminate'], cite: ['S08', 'S11'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['C1', 'C4'], oneOf: ['intact'], cite: ['S08'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['T5', 'S5'], oneOf: ['intact'], cite: ['S08'], basis: 'composed',
            note: 'segmental, suspended loss' },
          { kind: 'sensory', side: 'both', modality: 'posterior_column', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S08'], basis: 'stated' },
          { kind: 'motor', side: 'both', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S08'], basis: 'composed',
            note: 'motor signs arise only when the syrinx expands beyond the commissure' },
          { kind: 'reflex', side: 'both', reflex: 'biceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
        ],
        unasserted: ['an expanding syrinx reaching the anterior horns or corticospinal tracts is a different lesion'],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 08
  {
    id: 'posterior-columns-T6',
    title: 'Bilateral posterior-column lesion at T6',
    pattern: 'posterior cord syndrome',
    lesion: [{ at: { segments: ['T6', 'T6'] }, sides: ['L', 'R'], compartments: ['dorsal_column'], severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'posterior_column', span: ['T7', 'S5'], oneOf: ['lost'], cite: ['S15'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'posterior_column', span: ['C1', 'T5'], oneOf: ['intact'], cite: ['S15'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'pain_temperature', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S15'], basis: 'stated' },
          { kind: 'motor', side: 'both', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S15'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S15', 'S12'], basis: 'composed' },
          { kind: 'romberg', oneOf: ['present'], cite: ['S13'], basis: 'composed' },
        ],
        unasserted: ['stretch reflexes: no source read states them for this syndrome'],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 09
  {
    id: 'posterolateral-C5-T10',
    title: 'Partial posterior- and lateral-column lesion, C5–T10',
    pattern: 'subacute combined degeneration',
    lesion: [{ at: { segments: ['C5', 'T10'] }, sides: ['L', 'R'], compartments: ['dorsal_column', 'lateral_cst'], severity: 'partial', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'posterior_column', span: ['L2', 'S2'], oneOf: ['impaired', 'lost'], cite: ['S10'], basis: 'stated' },
          { kind: 'motor', side: 'both', span: ['L2', 'S2'], lesion: ['umn'], cite: ['S10'], basis: 'stated',
            note: 'spastic paraparesis' },
          { kind: 'babinski', side: 'both', oneOf: ['present'], cite: ['S10'], basis: 'stated' },
        ],
        unasserted: [
          'stretch reflexes: S10 notes a coexisting peripheral neuropathy this cord model cannot represent',
          'pain and temperature: S10 is silent',
          'Romberg: no source read states it for this syndrome, and the legs are weak',
          'upper limbs: this case models a distribution, not disease progression',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 10
  {
    id: 'dorsal-root-and-column-L2-S5',
    title: 'Partial dorsal-root and posterior-column lesion, L2–S5',
    pattern: 'tabes dorsalis',
    lesion: [{ at: { segments: ['L2', 'S5'] }, sides: ['L', 'R'], compartments: ['dorsal_root', 'dorsal_column'], severity: 'partial', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'sensory', side: 'both', modality: 'posterior_column', span: ['L2', 'S2'], oneOf: ['impaired', 'lost'], cite: ['S13'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['reduced', 'absent'], cite: ['S13', 'S12'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['reduced', 'absent'], cite: ['S13', 'S12'], basis: 'stated' },
          { kind: 'motor', side: 'both', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S13'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S12'], basis: 'composed' },
          { kind: 'romberg', oneOf: ['present'], cite: ['S13'], basis: 'stated' },
          { kind: 'bladder', oneOf: ['sacral'], cite: ['S13', 'S20'], basis: 'composed',
            note: 'retention and overflow' },
        ],
        unasserted: ['pain: S13 says diminished, without stating its extent'],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 11
  {
    id: 'motor-neuron-pattern',
    title: 'Partial anterior-horn and corticospinal loss',
    pattern: 'amyotrophic lateral sclerosis',
    lesion: [
      { at: { segments: ['C5', 'T1'] }, sides: ['L', 'R'], compartments: ['anterior_horn'], severity: 'partial', portion: 'whole' },
      { at: { segments: ['L2', 'S1'] }, sides: ['L', 'R'], compartments: ['anterior_horn'], severity: 'partial', portion: 'whole' },
      { at: { segments: ['C1', 'S5'] }, sides: ['L', 'R'], compartments: ['lateral_cst'], severity: 'partial', portion: 'whole' },
    ],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'motor', side: 'both', span: ['C5', 'T1'], lesion: ['umn_lmn'], cite: ['S17'], basis: 'composed' },
          { kind: 'motor', side: 'both', span: ['L2', 'S1'], lesion: ['umn_lmn'], cite: ['S17'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'all', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S17', 'S18'], basis: 'stated' },
          { kind: 'bladder', oneOf: ['normal'], cite: ['S17'], basis: 'stated', note: 'sphincters spared until late' },
        ],
        unasserted: [
          'reflexes and the Babinski sign: S17 notes that lower-motor-neuron loss can mask upper-motor-neuron signs',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 12
  {
    id: 'anterior-horn-L2-S1-left',
    title: 'Complete loss of left anterior horn cells, L2–S1',
    pattern: 'poliomyelitis',
    lesion: [{ at: { segments: ['L2', 'S1'] }, sides: ['L'], compartments: ['anterior_horn'], severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'motor', side: 'L', span: ['L2', 'S1'], lesion: ['lmn'], tone: ['reduced'], cite: ['S18'], basis: 'stated' },
          { kind: 'motor', side: 'L', span: ['C1', 'L1'], lesion: ['none'], cite: ['S18'], basis: 'composed' },
          { kind: 'motor', side: 'R', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S18'], basis: 'composed' },
          { kind: 'reflex', side: 'L', reflex: 'patellar', oneOf: ['reduced', 'absent'], cite: ['S18', 'S12'], basis: 'stated' },
          { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['reduced', 'absent'], cite: ['S18', 'S12'], basis: 'stated' },
          { kind: 'reflex', side: 'R', reflex: 'patellar', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'R', reflex: 'achilles', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'all', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S18'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S18', 'S12'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['normal'], cite: ['S20'], basis: 'composed', note: 'S2–S4 untouched' },
        ],
        unasserted: [],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 13
  {
    id: 'root-C6-left',
    title: 'Left C6 root lesion',
    pattern: 'cervical radiculopathy',
    lesion: [{ at: { segments: ['C6', 'C6'] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'motor', side: 'L', span: ['C6', 'C6'], lesion: ['lmn'], cite: ['S19'], basis: 'stated' },
          { kind: 'motor', side: 'L', span: ['C1', 'C5'], lesion: ['none'], cite: ['S19'], basis: 'composed' },
          { kind: 'motor', side: 'L', span: ['C7', 'Co1'], lesion: ['none'], cite: ['S19'], basis: 'composed' },
          { kind: 'motor', side: 'R', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S19'], basis: 'composed' },
          { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['reduced'], cite: ['S12', 'S19'], basis: 'composed',
            note: 'its C5 contribution is intact' },
          { kind: 'reflex', side: 'L', reflex: 'brachioradialis', oneOf: ['reduced', 'absent'], cite: ['S12', 'S19'], basis: 'stated',
            note: 'C3: sources differ on whether C5 contributes' },
          { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'R', reflex: 'biceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'reflex', side: 'R', reflex: 'brachioradialis', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
          { kind: 'sensory', side: 'L', modality: 'all', span: ['C6', 'C6'], oneOf: ['impaired', 'lost'], cite: ['S19', 'S21'], basis: 'stated' },
          { kind: 'sensory', side: 'L', modality: 'all', span: ['C1', 'C4'], oneOf: ['intact'], cite: ['S19'], basis: 'composed' },
          { kind: 'sensory', side: 'L', modality: 'all', span: ['C8', 'S5'], oneOf: ['intact'], cite: ['S19'], basis: 'composed' },
          { kind: 'sensory', side: 'R', modality: 'all', span: ['C1', 'S5'], oneOf: ['intact'], cite: ['S19'], basis: 'composed' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S12'], basis: 'composed' },
        ],
        unasserted: ['C5 and C7 sensation: dermatomal overlap (S21) leaves the neighbours uncertain'],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 14
  {
    id: 'conus-at-L1-vertebra',
    title: 'Intramedullary lesion at the L1 vertebral level',
    pattern: 'conus medullaris syndrome',
    lesion: [{ at: { vertebra: 'L1' }, sides: ['L', 'R'], compartments: ALL, severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'resolvedSegments', span: ['S2', 'Co1'], cite: ['S14'], basis: 'stated',
            note: 'the test of defect A—03: vertebral level is not segment level' },
          { kind: 'sensory', side: 'both', modality: 'all', span: ['S3', 'S5'], oneOf: ['lost', 'impaired'], cite: ['S05', 'S09', 'S14'], basis: 'stated',
            note: 'saddle anaesthesia' },
          { kind: 'sensory', side: 'both', modality: 'all', span: ['L1', 'L3'], oneOf: ['intact'], cite: ['S14'], basis: 'composed',
            note: 'the conus holds only S2–Co1; a naive vertebra-equals-segment reading would lesion these' },
          { kind: 'reflex', side: 'both', reflex: 'bulbocavernosus', oneOf: ['absent', 'reduced'], cite: ['S05', 'S09'], basis: 'stated' },
          { kind: 'bladder', oneOf: ['sacral'], cite: ['S20', 'S14'], basis: 'composed' },
        ],
        unasserted: [
          'lower-limb reflexes and weakness: see C5 in DECISIONS.md',
          'S1: outside the conus by S14, but its position relative to L1 varies',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── 15
  {
    id: 'cauda-L3-Co1',
    title: 'Bilateral root lesion, L3 to coccygeal',
    pattern: 'cauda equina syndrome',
    lesion: [{ at: { segments: ['L3', 'Co1'] }, sides: ['L', 'R'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }],
    evaluations: [
      {
        timepoint: 'chronic',
        assertions: [
          { kind: 'motor', side: 'both', span: ['L3', 'S1'], lesion: ['lmn'], tone: ['reduced'], cite: ['S09', 'S14'], basis: 'stated' },
          { kind: 'reflex', side: 'both', reflex: 'patellar', oneOf: ['reduced', 'absent'], cite: ['S09', 'S12'], basis: 'composed',
            note: 'its L2 contribution is intact' },
          { kind: 'reflex', side: 'both', reflex: 'achilles', oneOf: ['absent'], cite: ['S09', 'S12'], basis: 'composed' },
          { kind: 'reflex', side: 'both', reflex: 'bulbocavernosus', oneOf: ['absent', 'reduced'], cite: ['S09'], basis: 'stated' },
          { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S09', 'S14'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'all', span: ['S3', 'S5'], oneOf: ['lost'], cite: ['S09'], basis: 'stated' },
          { kind: 'sensory', side: 'both', modality: 'all', span: ['L4', 'S2'], oneOf: ['lost', 'impaired'], cite: ['S09'], basis: 'composed' },
          { kind: 'sensory', side: 'both', modality: 'all', span: ['C1', 'L2'], oneOf: ['intact'], cite: ['S09'], basis: 'composed' },
          { kind: 'bladder', oneOf: ['sacral'], cite: ['S09', 'S20'], basis: 'composed' },
        ],
        unasserted: [
          'asymmetry: S09 allows a unilateral cauda equina lesion; this case is bilateral by construction',
          'L3 sensation: the rostral edge of a multi-root lesion, subject to overlap (S21)',
        ],
      },
    ],
  },
];
