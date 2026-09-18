// Amendment A14. Reverse inference for language and attention, written from
// docs/P10-analysis.md before any P10 engine code. Each examination is what a student can do
// at the bedside — listen, ask the patient to point, ask them to repeat, test the fields and
// the grip — and each expectation is a property of the ranking, never a number.
import type { FieldSector, LanguageSign, Side, SignObservation, SourceId, StrengthObservation, Territory, Timepoint, LesionFamily } from '../../src/kb/vocab.ts';
import type { ReverseExpectation } from './reverse.ts';
import type { VisionObservation } from './reverse-vision.ts';

export type LanguageReverseExpectation = ReverseExpectation & {
  readonly timepoint: Timepoint;
  readonly topFamily?: LesionFamily;
  /** Every candidate in the best-ranked group lies in one of these territories. */
  readonly topPlaces?: readonly Territory[];
};

export type LanguageReverseCase = {
  readonly id: string;
  readonly title: string;
  readonly observations: readonly VisionObservation[];
  readonly expectations: readonly LanguageReverseExpectation[];
  readonly cite: readonly SourceId[];
  readonly basis: 'stated' | 'composed';
  readonly note: string;
};

const say = (sign: LanguageSign, value: SignObservation): VisionObservation => ({ kind: 'language', sign, value });
/** Speech as heard: non-fluent?, understands?, repeats? — each true when abnormal. */
const speech = (nonfluent: boolean, noComprehension: boolean, noRepetition: boolean): VisionObservation[] => [
  say('nonfluent_speech', nonfluent ? 'present' : 'absent'),
  say('impaired_comprehension', noComprehension ? 'present' : 'absent'),
  say('impaired_repetition', noRepetition ? 'present' : 'absent'),
];
const neglect = (side: Side, value: SignObservation): VisionObservation => ({ kind: 'neglect', side, value });
const power = (side: Side, at: 'C6' | 'C7' | 'L3' | 'L4', value: StrengthObservation): VisionObservation => ({ kind: 'strength', side, span: [at, at], value });
const f = (eye: Side, sector: FieldSector, value: 'normal' | 'abnormal'): VisionObservation => ({ kind: 'field', eye, sector, value });
/** The peripheral half-field towards one side, both eyes. */
const half = (towards: Side, value: 'normal' | 'abnormal'): VisionObservation[] =>
  towards === 'R'
    ? [f('L', 'nasal_superior', value), f('L', 'nasal_inferior', value), f('R', 'temporal_superior', value), f('R', 'temporal_inferior', value)]
    : [f('L', 'temporal_superior', value), f('L', 'temporal_inferior', value), f('R', 'nasal_superior', value), f('R', 'nasal_inferior', value)];
const strong: VisionObservation[] = [power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal')];

export const LANGUAGE_REVERSE_CASES: readonly LanguageReverseCase[] = [
  {
    id: 'reverse-broca',
    title: 'Halting speech, understands, cannot repeat; right arm and lower face weak',
    observations: [
      ...speech(true, false, true),
      power('R', 'C6', 'weak'),
      power('R', 'C7', 'weak'),
      power('R', 'L3', 'normal'),
      power('L', 'C6', 'normal'),
      { kind: 'face_weakness', side: 'R', value: 'lower' },
      ...half('R', 'normal'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['mca_cortex'] }],
    cite: ['S100', 'S104', 'S105'],
    basis: 'stated',
    note: 'Broca aphasia with right face and arm weakness is the superior division of the left MCA (S100, S104); the fields are full, so not the whole artery.',
  },
  {
    id: 'reverse-conduction',
    title: 'Fluent speech, understands, cannot repeat; strength and fields normal',
    observations: [...speech(false, false, true), ...strong, ...half('R', 'normal'), ...half('L', 'normal')],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['supramarginal'] }],
    cite: ['S102', 'S103'],
    basis: 'stated',
    note: 'Repetition fails while fluency and comprehension hold: conduction aphasia, the left inferior parietal lobule (S102). The one question that separates it from Wernicke is whether the patient understands.',
  },
  {
    id: 'reverse-wernicke-hemianopia',
    title: 'Fluent speech, does not understand, cannot repeat; right hemianopia; strength normal',
    observations: [...speech(false, true, true), ...strong, ...half('R', 'abnormal'), ...half('L', 'normal')],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['mca_inferior'] }],
    cite: ['S101', 'S105'],
    basis: 'stated',
    note: 'Wernicke aphasia with a right hemianopia and no weakness: the inferior division of the left MCA (S101, S105).',
  },
  {
    id: 'reverse-global',
    title: 'Speaks little, does not understand, cannot repeat; right arm weak; right hemianopia',
    observations: [
      ...speech(true, true, true),
      power('R', 'C6', 'weak'),
      power('R', 'C7', 'weak'),
      power('R', 'L3', 'normal'),
      power('L', 'C6', 'normal'),
      ...half('R', 'abnormal'),
      ...half('L', 'normal'),
    ],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['mca_whole'] }],
    cite: ['S103', 'S104'],
    basis: 'stated',
    note: 'Global aphasia with a hemiparesis and a hemianopia: the whole left MCA cortex (S103, S104). Fluency is what separates it from the inferior division alone.',
  },
  {
    id: 'reverse-neglect',
    title: 'Ignores the left side of space; speech normal; strength and fields normal',
    observations: [neglect('L', 'present'), neglect('R', 'absent'), ...speech(false, false, false), ...strong, ...half('L', 'normal'), ...half('R', 'normal')],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_right', topPlaces: ['supramarginal'] }],
    cite: ['S106', 'S107'],
    basis: 'stated',
    note: 'Left neglect without weakness or a field defect: the right posterior parietal cortex (S106). Language is normal because the lesion is in the nondominant hemisphere (S107).',
  },
];
