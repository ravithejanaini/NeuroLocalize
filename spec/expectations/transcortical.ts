// Amendment A25. Frozen expected outputs for the transcortical aphasias, written from the
// sources in docs/P21-analysis.md (S103, S142) before any P21 code, and run against the P20
// engine first.
//
// Reading guide. A border-zone lesion sits around Broca or Wernicke area and isolates it, so the
// patient loses fluency or comprehension and keeps repetition (S103, S142). As for every
// language finding, only the dominant (left) hemisphere counts (S107, D68). The settled form is
// asserted after a month; S142 says it starts as the mixed form (C62).
import type { LanguageSign } from '../../src/kb/vocab.ts';
import type { BrainRegion, LanguageAssertion, LanguageCase } from './types.ts';

type E = Pick<LanguageAssertion, 'cite' | 'basis'> & { readonly note?: string };
const cortex = (side: 'L' | 'R', compartments: BrainRegion['compartments']): BrainRegion => ({
  brain: 'cortex', sides: [side], compartments, severity: 'complete',
});
const lang = (sign: LanguageSign, present: boolean, e: E): LanguageAssertion => ({
  kind: 'language', sign, oneOf: [present ? 'present' : 'absent'], ...e,
});

export const TRANSCORTICAL_CASES: readonly LanguageCase[] = [
  {
    id: 'borderzone-anterior-left',
    title: 'Left anterior border zone, between the anterior and middle cerebral arteries',
    pattern: 'transcortical motor aphasia: non-fluent, understands, repeats',
    lesion: [cortex('L', ['anterior_borderzone'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lang('nonfluent_speech', true, { cite: ['S103', 'S142'], basis: 'stated', note: 'nonfluent speech' }),
        lang('impaired_comprehension', false, { cite: ['S103'], basis: 'stated', note: 'intact comprehension' }),
        lang('impaired_repetition', false, { cite: ['S103', 'S142'], basis: 'stated', note: 'exceptionally good repetition: Broca area is spared and isolated' }),
        { kind: 'gerstmann', oneOf: ['absent'], cite: ['S128'], basis: 'composed', note: 'the inferior parietal lobule is not in this lesion' },
      ],
      unasserted: ['the first days, when S142 gives the mixed form (C62)', 'echolalia and perseveration: not modelled', 'limb weakness: no source read states it'],
    }],
  },
  {
    id: 'borderzone-anterior-right',
    title: 'Right anterior border zone',
    pattern: 'no aphasia: the nondominant hemisphere',
    lesion: [cortex('R', ['anterior_borderzone'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lang('nonfluent_speech', false, { cite: ['S103', 'S107'], basis: 'composed', note: 'S103 places it in the dominant hemisphere' }),
        lang('impaired_comprehension', false, { cite: ['S107'], basis: 'composed' }),
        lang('impaired_repetition', false, { cite: ['S107'], basis: 'composed' }),
      ],
      unasserted: ['crossed aphasia in a right-dominant patient: not modelled (D68)'],
    }],
  },
  {
    id: 'borderzone-posterior-left',
    title: 'Left posterior border zone, between the middle and posterior cerebral arteries',
    pattern: 'transcortical sensory aphasia: fluent, does not understand, repeats',
    lesion: [cortex('L', ['posterior_borderzone'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lang('nonfluent_speech', false, { cite: ['S103'], basis: 'stated', note: 'fluent speech' }),
        lang('impaired_comprehension', true, { cite: ['S103', 'S142'], basis: 'stated', note: 'impaired comprehension' }),
        lang('impaired_repetition', false, { cite: ['S103', 'S142'], basis: 'stated', note: 'exceptionally good repetition: Wernicke area is spared and isolated' }),
      ],
      unasserted: ['the first days, when S142 gives the mixed form (C62)', 'semantic paraphasia and echolalia: not modelled', 'the visual field, which the MCA–PCA border zone may touch: no source read states it'],
    }],
  },
  {
    id: 'borderzone-posterior-right',
    title: 'Right posterior border zone',
    pattern: 'no aphasia: the nondominant hemisphere',
    lesion: [cortex('R', ['posterior_borderzone'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        lang('nonfluent_speech', false, { cite: ['S107'], basis: 'composed' }),
        lang('impaired_comprehension', false, { cite: ['S103', 'S107'], basis: 'composed', note: 'S103 places it in the dominant hemisphere' }),
        lang('impaired_repetition', false, { cite: ['S107'], basis: 'composed' }),
      ],
      unasserted: ['crossed aphasia in a right-dominant patient: not modelled (D68)'],
    }],
  },
];
