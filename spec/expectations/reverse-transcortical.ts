// Amendment A25. Reverse inference for the transcortical aphasias, written from
// docs/P21-analysis.md before any P21 engine code. The expectation is a property of the ranking,
// never a number. What sets these apart from Broca and Wernicke aphasia is one bedside test:
// ask the patient to repeat a phrase (S103).
import type { LanguageSign, Side } from '../../src/kb/vocab.ts';
import type { LanguageReverseCase } from './reverse-language.ts';
import type { VisionObservation } from './reverse-vision.ts';

const say = (sign: LanguageSign, abnormal: boolean): VisionObservation => ({ kind: 'language', sign, value: abnormal ? 'present' : 'absent' });
const power = (side: Side, at: 'C6' | 'L3'): VisionObservation => ({ kind: 'strength', side, span: [at, at], value: 'normal' });
const strong: VisionObservation[] = [power('L', 'C6'), power('R', 'C6'), power('L', 'L3'), power('R', 'L3')];

export const TRANSCORTICAL_REVERSE_CASES: readonly LanguageReverseCase[] = [
  {
    id: 'reverse-transcortical-motor',
    title: 'Halting speech, understands, and repeats a long phrase perfectly',
    observations: [say('nonfluent_speech', true), say('impaired_comprehension', false), say('impaired_repetition', false), ...strong],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['borderzone_anterior'] }],
    cite: ['S103', 'S142'],
    basis: 'stated',
    note: 'Non-fluent speech with repetition kept is transcortical motor aphasia: the left anterior border zone, around Broca area but sparing it (S103). Broca area itself would lose repetition.',
  },
  {
    id: 'reverse-transcortical-sensory',
    title: 'Fluent speech, does not understand, yet repeats a long phrase perfectly',
    observations: [say('nonfluent_speech', false), say('impaired_comprehension', true), say('impaired_repetition', false), ...strong],
    expectations: [{ timepoint: 'chronic', topFamily: 'hemisphere_left', topPlaces: ['borderzone_posterior'] }],
    cite: ['S103', 'S142'],
    basis: 'stated',
    note: 'Fluent speech, comprehension lost and repetition kept is transcortical sensory aphasia: the left posterior border zone, around Wernicke area but sparing it (S103). Wernicke area itself would lose repetition.',
  },
];
