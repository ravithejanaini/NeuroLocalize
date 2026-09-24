// Amendment A14. Frozen expected outputs for language and the dominant hemisphere, written
// from the sources in docs/P10-analysis.md (S100–S108) before any P10 engine code existed,
// and run red against the P9 engine first.
//
// Reading guide. A `language` assertion is about the patient, not a side, and names the
// abnormal state: 'present' means speech is nonfluent, comprehension is impaired, or
// repetition is impaired. A `neglect` assertion's side is the side of SPACE neglected — a
// right parietal lesion neglects the left. The model takes the left hemisphere to be dominant
// for language (S107; D68); S108 gives how often that is not so, and nothing here asserts
// anything about a right-dominant patient.
import type { FieldSector, LanguageSign, Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainRegion, LanguageAssertion, LanguageCase, VisionAssertion, VisionRegion } from './types.ts';

type E = Pick<LanguageAssertion, 'cite' | 'basis'> & { readonly note?: string };
type Span = readonly [Segment, Segment];
const all: Span = ['C1', 'Co1'];
const ARM: Span = ['C5', 'T1'];
const LEG: Span = ['L2', 'S2'];

const cortex = (side: 'L' | 'R', compartments: BrainRegion['compartments'], regions?: BrainRegion['regions']): BrainRegion => ({
  brain: 'cortex', sides: [side], compartments, severity: 'complete', ...(regions ? { regions } : {}),
});
const radiations = (side: 'L' | 'R'): VisionRegion[] => [
  { vision: 'meyer_loop', sides: [side], severity: 'complete' },
  { vision: 'parietal_radiation', sides: [side], severity: 'complete' },
];

const lang = (sign: LanguageSign, present: boolean | 'open', e: E): LanguageAssertion => ({
  kind: 'language', sign, oneOf: present === 'open' ? ['indeterminate'] : [present ? 'present' : 'absent'], ...e,
});
/** The three facets at once: nonfluent, comprehension impaired, repetition impaired. */
const speech = (nonfluent: boolean, comprehension: boolean, repetition: boolean, e: E): LanguageAssertion[] => [
  lang('nonfluent_speech', nonfluent, e),
  lang('impaired_comprehension', comprehension, e),
  lang('impaired_repetition', repetition, e),
];
const neglect = (space: 'L' | 'R', present: boolean | 'open', e: E): LanguageAssertion => ({
  kind: 'neglect', side: space, oneOf: present === 'open' ? ['indeterminate'] : [present ? 'present' : 'absent'], ...e,
});
const motor = (side: 'L' | 'R' | 'both', span: Span, lesion: 'none' | 'umn', e: E): Assertion => ({ kind: 'motor', side, span, lesion: [lesion], ...e });
const face = (side: 'L' | 'R', w: 'none' | 'lower' | 'whole', e: E): BrainAssertion => ({ kind: 'face_weakness', side, oneOf: [w], ...e });
const field = (eye: 'L' | 'R' | 'both', sectors: readonly FieldSector[], state: 'normal' | 'lost', e: E): VisionAssertion => ({
  kind: 'field', eye, sectors, oneOf: [state], ...e,
});
const rapd = (side: 'L' | 'R', e: E): VisionAssertion => ({ kind: 'rapd', side, oneOf: ['absent'], ...e });

const PERIPHERY: readonly FieldSector[] = ['temporal_superior', 'temporal_inferior', 'nasal_superior', 'nasal_inferior'];
const ALL_SECTORS: readonly FieldSector[] = [...PERIPHERY, 'central_left', 'central_right'];
/** The peripheral half-field on one side of both eyes, as each eye sees it. */
const half = (towards: 'L' | 'R', state: 'normal' | 'lost', e: E): VisionAssertion[] =>
  towards === 'R'
    ? [field('L', ['nasal_superior', 'nasal_inferior'], state, e), field('R', ['temporal_superior', 'temporal_inferior'], state, e)]
    : [field('L', ['temporal_superior', 'temporal_inferior'], state, e), field('R', ['nasal_superior', 'nasal_inferior'], state, e)];

const DOMINANCE = 'the model takes the left hemisphere as dominant for language (S107, D68)';

export const LANGUAGE_CASES: readonly LanguageCase[] = [
  // ───────────────────────────────────────── the inferior division of the MCA
  {
    id: 'mca-inferior-left',
    title: 'Left MCA, inferior division',
    pattern: 'Wernicke aphasia with a right hemianopia, strength spared',
    lesion: [cortex('L', ['superior_temporal', 'inferior_parietal']), ...radiations('L')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'gerstmann', oneOf: ['present'], cite: ['S128', 'S104'], basis: 'stated', note: 'A20: the angular gyrus of the dominant hemisphere, in the inferior division' },
        lang('nonfluent_speech', false, { cite: ['S101', 'S103'], basis: 'stated', note: 'fluent, with a normal rate and prosody' }),
        lang('impaired_comprehension', true, { cite: ['S101'], basis: 'stated', note: 'markedly impaired auditory–verbal comprehension' }),
        lang('impaired_repetition', true, { cite: ['S101', 'S102'], basis: 'stated' }),
        ...half('R', 'lost', { cite: ['S105'], basis: 'stated', note: 'contralateral homonymous hemianopia is frequently observed (C31)' }),
        ...half('L', 'normal', { cite: ['S105'], basis: 'composed' }),
        rapd('L', { cite: ['S95'], basis: 'composed', note: 'the lesion is behind the geniculate' }),
        rapd('R', { cite: ['S95'], basis: 'composed' }),
        motor('both', all, 'none', { cite: ['S105', 'S101'], basis: 'stated', note: 'motor deficits are generally absent in isolated inferior division strokes' }),
        face('L', 'none', { cite: ['S105'], basis: 'composed' }),
        face('R', 'none', { cite: ['S105'], basis: 'composed' }),
        neglect('R', 'open', { cite: ['S106'], basis: 'stated', note: 'C32: rarer after a left lesion, but not absent' }),
        neglect('L', false, { cite: ['S106'], basis: 'composed', note: 'neglect is of the side opposite the lesion' }),
      ],
      unasserted: [
        'the centre of the field: S105 does not say whether the macula is spared',
        'reading and writing are not modelled as findings of their own (A20: Gerstmann syndrome is)',
        'a smaller stroke confined to the temporal lobe takes only Meyer loop (C31)',
      ],
    }],
  },
  {
    id: 'mca-inferior-right',
    title: 'Right MCA, inferior division',
    pattern: 'left neglect with a left hemianopia, language intact',
    lesion: [cortex('R', ['superior_temporal', 'inferior_parietal']), ...radiations('R')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'gerstmann', oneOf: ['absent'], cite: ['S129', 'S107'], basis: 'stated', note: 'A20: Gerstmann syndrome is a sign of the dominant parietal lobe' },
        ...speech(false, false, false, { cite: ['S107'], basis: 'composed', note: DOMINANCE }),
        neglect('L', true, { cite: ['S106', 'S107', 'S104'], basis: 'stated', note: 'the nondominant parietal lobe: the left side of the world' }),
        neglect('R', false, { cite: ['S106'], basis: 'composed' }),
        ...half('L', 'lost', { cite: ['S105'], basis: 'stated' }),
        ...half('R', 'normal', { cite: ['S105'], basis: 'composed' }),
        motor('both', all, 'none', { cite: ['S105'], basis: 'stated' }),
      ],
      unasserted: ['anosognosia and aprosody (S104) are not modelled'],
    }],
  },

  // ───────────────────────────────────────── the whole MCA cortex
  {
    id: 'mca-whole-left',
    title: 'Left MCA cortex, both divisions',
    pattern: 'global aphasia with right face and arm weakness and a right hemianopia',
    lesion: [
      // A20: large MCA strokes give forced gaze deviation (S104): the frontal eye field is in the lesion.
      cortex('L', ['motor_cortex', 'sensory_cortex', 'inferior_frontal', 'superior_temporal', 'inferior_parietal', 'frontal_eye_field'], ['face', 'arm']),
      ...radiations('L'),
    ],
    evaluations: [{
      // A20: on the first day the eyes deviate toward the lesion — gaze to the right is lost.
      timepoint: 'hyperacute',
      assertions: [
        { kind: 'cranial', side: 'R', sign: 'gaze_palsy', oneOf: ['present'], cite: ['S104', 'S129', 'S130'], basis: 'stated', note: 'forced gaze deviation toward the lesion' },
        { kind: 'cranial', side: 'L', sign: 'gaze_palsy', oneOf: ['absent'], cite: ['S129'], basis: 'composed' },
      ],
      unasserted: ['every other finding on the first day'],
    }, {
      timepoint: 'chronic',
      assertions: [
        { kind: 'cranial', side: 'R', sign: 'gaze_palsy', oneOf: ['absent'], cite: ['S131'], basis: 'stated', note: 'A20: gone within five days in 90% (C50: prolonged after earlier contralateral frontal damage)' },
        { kind: 'gerstmann', oneOf: ['present'], cite: ['S128', 'S104'], basis: 'stated', note: 'A20: the dominant angular gyrus is in the inferior division' },
        ...speech(true, true, true, { cite: ['S103'], basis: 'stated', note: 'global: nonfluent, comprehension impaired, unable to repeat — the peri-Sylvian territory of the dominant MCA' }),
        motor('R', ARM, 'umn', { cite: ['S105', 'S54'], basis: 'stated' }),
        motor('R', LEG, 'none', { cite: ['S54', 'S66'], basis: 'composed', note: 'the leg area is medial, in the ACA territory' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        face('R', 'lower', { cite: ['S54', 'S51'], basis: 'composed', note: 'the forehead keeps its other hemisphere' }),
        ...half('R', 'lost', { cite: ['S105', 'S104'], basis: 'stated', note: 'visual field cuts in large MCA strokes' }),
        ...half('L', 'normal', { cite: ['S105'], basis: 'composed' }),
        neglect('R', 'open', { cite: ['S106'], basis: 'stated', note: 'C32' }),
      ],
      unasserted: ['the lenticulostriate territory and the capsule are not in this lesion'],
    }],
  },

  // ───────────────────────────────────────── single gyri
  {
    id: 'broca-area-left',
    title: 'Left inferior frontal gyrus',
    pattern: 'Broca aphasia',
    lesion: [cortex('L', ['inferior_frontal'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lang('nonfluent_speech', true, { cite: ['S100', 'S103'], basis: 'stated' }),
        lang('impaired_comprehension', false, { cite: ['S100'], basis: 'stated', note: 'in pure Broca aphasia, comprehension is intact' }),
        lang('impaired_repetition', true, { cite: ['S100'], basis: 'stated' }),
        motor('both', all, 'none', { cite: ['S100', 'S54'], basis: 'composed', note: 'the motor cortex is not in this lesion; S100 says weakness can accompany, not that it must' }),
        face('R', 'none', { cite: ['S54'], basis: 'composed' }),
        field('both', ALL_SECTORS, 'normal', { cite: ['S91'], basis: 'composed' }),
      ],
      unasserted: ['neglect: frontal lesions may give it (C33); the model places neglect in the parietal lobe only', 'apraxia is not modelled'],
    }],
  },
  {
    id: 'broca-area-right',
    title: 'Right inferior frontal gyrus',
    pattern: 'the same gyrus, nondominant: speech intact',
    lesion: [cortex('R', ['inferior_frontal'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        ...speech(false, false, false, { cite: ['S107', 'S100'], basis: 'stated', note: `Broca area is in the dominant hemisphere only; ${DOMINANCE}` }),
        motor('both', all, 'none', { cite: ['S54'], basis: 'composed' }),
      ],
      unasserted: ['aprosody (S104) is not modelled', 'neglect (C33)'],
    }],
  },
  {
    id: 'wernicke-area-left',
    title: 'Left posterior superior temporal gyrus',
    pattern: 'Wernicke aphasia',
    lesion: [cortex('L', ['superior_temporal'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        ...speech(false, true, true, { cite: ['S101', 'S103'], basis: 'stated', note: 'fluent speech, impaired comprehension, repetition impaired (C34)' }),
        motor('both', all, 'none', { cite: ['S101'], basis: 'stated', note: 'often no hemiparesis' }),
        face('R', 'none', { cite: ['S101'], basis: 'composed' }),
        neglect('L', false, { cite: ['S106'], basis: 'composed' }),
      ],
      unasserted: [
        'the visual field: S101 says it depends on the size of the lesion; the inferior-division place carries it (C31)',
        'anosognosia (S101) is not modelled',
      ],
    }],
  },
  {
    id: 'supramarginal-left',
    title: 'Left inferior parietal lobule',
    pattern: 'conduction aphasia',
    lesion: [cortex('L', ['inferior_parietal'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'gerstmann', oneOf: ['present'], cite: ['S128', 'S129', 'S107'], basis: 'stated', note: 'A20: the dominant inferior parietal lobule; S128: it often co-occurs with aphasia' },
        ...speech(false, false, true, { cite: ['S102', 'S103'], basis: 'stated', note: 'fluent, comprehension intact, unable to repeat' }),
        motor('both', all, 'none', { cite: ['S102'], basis: 'composed' }),
        neglect('R', 'open', { cite: ['S106'], basis: 'stated', note: 'C32' }),
        neglect('L', false, { cite: ['S106'], basis: 'composed' }),
      ],
      unasserted: ['ideomotor apraxia (S102) is not modelled; Gerstmann syndrome is, since A20'],
    }],
  },
  {
    id: 'supramarginal-right',
    title: 'Right inferior parietal lobule',
    pattern: 'left hemispatial neglect',
    lesion: [cortex('R', ['inferior_parietal'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'gerstmann', oneOf: ['absent'], cite: ['S129', 'S107'], basis: 'stated', note: 'A20: the nondominant parietal lobe gives neglect, not Gerstmann' },
        neglect('L', true, { cite: ['S106', 'S107'], basis: 'stated', note: 'most often the right posterior parietal cortex' }),
        neglect('R', false, { cite: ['S106'], basis: 'composed' }),
        ...speech(false, false, false, { cite: ['S107'], basis: 'composed', note: DOMINANCE }),
        motor('both', all, 'none', { cite: ['S106'], basis: 'stated', note: 'neglect occurs in the absence of primary sensory or motor impairment' }),
        field('both', ALL_SECTORS, 'normal', { cite: ['S106'], basis: 'composed', note: 'the radiations are not in this lesion: neglect is not a field defect' }),
      ],
      unasserted: ['extinction, line bisection and cancellation are how neglect is shown; the model records the finding, not the test'],
    }],
  },
];
