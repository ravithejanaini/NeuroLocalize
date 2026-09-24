// Amendment A22. Frozen expected outputs for both occipital lobes, written from the sources in
// docs/P18-analysis.md (S135–S137) before any P18 code, and run against the P17 engine first.
//
// Reading guide. Both posterior cerebral arteries: the peripheral field is lost in both eyes on
// both sides, the centre is kept because the occipital pole has a second supply, and the pupils
// react — incomplete cortical blindness, the common kind (S137). This is NOT the top of the
// basilar: only 2 of 95 patients with that syndrome had both occipital lobes infarcted (S136, C55).
import type { FieldSector } from '../../src/kb/vocab.ts';
import type { Assertion, VisionAssertion, VisionCase } from './types.ts';

type E = Pick<VisionAssertion, 'cite' | 'basis'> & { readonly note?: string };
const PERIPHERY: readonly FieldSector[] = ['temporal_superior', 'temporal_inferior', 'nasal_superior', 'nasal_inferior'];
const field = (sectors: readonly FieldSector[], state: 'normal' | 'lost', e: E): VisionAssertion => ({ kind: 'field', eye: 'both', sectors, oneOf: [state], ...e });
const rapd = (side: 'L' | 'R', e: E): VisionAssertion => ({ kind: 'rapd', side, oneOf: ['absent'], ...e });
const bodyQuiet: Assertion[] = [
  { kind: 'motor', side: 'both', span: ['C1', 'Co1'], lesion: ['none'], cite: ['S137'], basis: 'composed', note: 'the visual cortex carries no motor fibres' },
];

export const OCCIPITAL_CASES: readonly VisionCase[] = [
  {
    id: 'pca-both',
    title: 'Both occipital lobes, the territory of both posterior cerebral arteries',
    pattern: 'cortical blindness with the centre kept; the pupils react',
    lesion: [
      { vision: 'calcarine_lower', sides: ['L', 'R'], severity: 'complete' },
      { vision: 'calcarine_upper', sides: ['L', 'R'], severity: 'complete' },
    ],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        field(PERIPHERY, 'lost', { cite: ['S137'], basis: 'stated', note: 'bilateral lesions of the striate cortex: loss of vision in both halves of the field' }),
        field(['central_left', 'central_right'], 'normal', { cite: ['S137'], basis: 'stated', note: 'in the majority of cases the central vision remains intact — the occipital pole has a second supply (C56)' }),
        rapd('L', { cite: ['S137'], basis: 'stated', note: 'no relative afferent pupil defect in cortical blindness' }),
        rapd('R', { cite: ['S137'], basis: 'stated' }),
        ...bodyQuiet,
      ],
      unasserted: [
        'the pupillary light reflex itself, which S137 says is normal: the model has no light-reflex finding apart from the afferent defect',
        'Anton syndrome, blindsight and hallucinations: not modelled',
        'the thalami and midbrain of the top of the basilar (C55)',
      ],
    }],
  },
];
