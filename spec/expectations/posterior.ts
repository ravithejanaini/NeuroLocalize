// Amendment A16. Frozen expected outputs for the three cerebellar arteries, written from the
// sources in docs/P12-analysis.md (S65, S110, S113–S115) before any P12 engine code, and run
// red against the P11 engine first.
//
// Reading guide. Each case lesions the structures its artery supplies, on the left. What the
// sources disagree about is left unasserted and says so: weakness and position sense in the
// lateral pons (C37), facial sensation in the AICA syndrome (C39), vertigo from the SCA (C40).
import type { Segment } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
type Span = readonly [Segment, Segment];
const all: Span = ['C1', 'Co1'];

const at = (brain: BrainRegion['brain'], compartments: BrainRegion['compartments']): BrainRegion => ({
  brain, sides: ['L'], compartments, severity: 'complete',
});
const sign = (side: 'L' | 'R', s: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean, e: E): BrainAssertion => ({
  kind: 'cranial', side, sign: s, oneOf: [present ? 'present' : 'absent'], ...e,
});
const limb = (side: 'L' | 'R', present: boolean, e: E): BrainAssertion => ({ kind: 'ataxia', side, oneOf: [present ? 'present' : 'absent'], ...e });
const trunk = (present: boolean, e: E): BrainAssertion => ({ kind: 'truncal_ataxia', oneOf: [present ? 'present' : 'absent'], ...e });
const face = (side: 'L' | 'R', w: 'none' | 'whole', e: E): BrainAssertion => ({ kind: 'face_weakness', side, oneOf: [w], ...e });
const pain = (side: 'L' | 'R', state: 'lost' | 'intact', e: E): Assertion => ({
  kind: 'sensory', side, modality: 'pain_temperature', span: all, oneOf: [state], ...e,
});

const LATERAL_MEDULLA = ['spinothalamic', 'spinal_trigeminal', 'sympathetic', 'ambiguus', 'cerebellar_peduncle', 'vestibular'] as const;

export const POSTERIOR_CASES: readonly BrainCase[] = [
  {
    id: 'aica-left',
    title: 'Left anterior inferior cerebellar artery',
    pattern: 'lateral pontine syndrome: face, ear and limb on one side, pain and temperature on the other',
    lesion: [at('pons', ['facial', 'cochlear', 'vestibular', 'spinothalamic', 'sympathetic', 'cerebellar_peduncle'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'hearing_loss', true, { cite: ['S113', 'S114', 'S65'], basis: 'stated', note: 'loss of hearing on the ipsilateral side' }),
        sign('R', 'hearing_loss', false, { cite: ['S114'], basis: 'composed' }),
        face('L', 'whole', { cite: ['S113', 'S114', 'S65'], basis: 'stated', note: 'ipsilateral facial paralysis: the nucleus, so the forehead too (S51)' }),
        face('R', 'none', { cite: ['S51'], basis: 'composed' }),
        limb('L', true, { cite: ['S113', 'S65'], basis: 'stated', note: 'dysmetria; ipsilateral limb ataxia' }),
        limb('R', false, { cite: ['S65'], basis: 'composed' }),
        { kind: 'vertigo', oneOf: ['present'], cite: ['S65', 'S115'], basis: 'stated' },
        pain('R', 'lost', { cite: ['S113'], basis: 'stated', note: 'contralateral hemibody pain and temperature sensory loss' }),
        pain('L', 'intact', { cite: ['S58'], basis: 'composed', note: 'the tract already carries the other side' }),
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S114', 'S16'], basis: 'stated', note: 'ipsilateral Horner syndrome' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed', note: 'the abducens is medial, not in the AICA territory' }),
        sign('L', 'tongue_weakness', false, { cite: ['S63'], basis: 'composed' }),
        sign('L', 'palate_weakness', false, { cite: ['S64'], basis: 'composed', note: 'the nucleus ambiguus is medullary' }),
      ],
      unasserted: [
        'strength and position sense: S65 adds contralateral hemiparesis and loss of vibration from the basilar perforators; S113 and S114 do not (C37)',
        'facial sensation: "paralysis or anesthesia" (S113); the model’s trigeminal nucleus is medullary (C39)',
        'tinnitus is not modelled',
      ],
    }],
  },
  {
    id: 'pica-left',
    title: 'Left posterior inferior cerebellar artery',
    pattern: 'Wallenberg syndrome with the inferior cerebellum: truncal ataxia too',
    lesion: [at('medulla', [...LATERAL_MEDULLA]), at('cerebellum', ['cerebellar_hemisphere', 'vermis'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        trunk(true, { cite: ['S114', 'S110'], basis: 'stated', note: 'interruption of the PICA results in vertigo, truncal ataxia and nystagmus' }),
        limb('L', true, { cite: ['S47', 'S110'], basis: 'stated' }),
        limb('R', false, { cite: ['S110'], basis: 'composed' }),
        { kind: 'vertigo', oneOf: ['present'], cite: ['S114', 'S113'], basis: 'stated' },
        pain('R', 'lost', { cite: ['S113', 'S47'], basis: 'stated', note: 'contralateral arm and leg' }),
        { kind: 'face_sensation', side: 'L', oneOf: ['lost'], cite: ['S113', 'S47'], basis: 'stated', note: 'ipsilateral face' },
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S113', 'S47'], basis: 'stated' },
        sign('L', 'palate_weakness', true, { cite: ['S113', 'S47'], basis: 'stated', note: 'hoarseness: the nucleus ambiguus' }),
        sign('L', 'hearing_loss', false, { cite: ['S113'], basis: 'composed', note: 'hearing loss belongs to the AICA' }),
        face('L', 'none', { cite: ['S48'], basis: 'composed', note: 'facial weakness points to the pons' }),
        { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S47'], basis: 'composed' },
      ],
      unasserted: ['the vertebral artery as a cause distinct from PICA is not modelled', 'dysarthria is not modelled'],
    }],
  },
  {
    id: 'sca-left',
    title: 'Left superior cerebellar artery',
    pattern: 'ataxia of the limbs and trunk, without the ear or the face',
    lesion: [at('cerebellum', ['cerebellar_hemisphere', 'vermis'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        limb('L', true, { cite: ['S113', 'S114', 'S110'], basis: 'stated', note: 'the SCA tends to produce more ataxia' }),
        limb('R', false, { cite: ['S110'], basis: 'composed' }),
        trunk(true, { cite: ['S110', 'S109'], basis: 'composed', note: 'the SCA supplies the superior vermis, which coordinates the trunk' }),
        sign('L', 'hearing_loss', false, { cite: ['S113', 'S114'], basis: 'composed', note: 'hearing loss belongs to the AICA' }),
        face('L', 'none', { cite: ['S113'], basis: 'composed' }),
        pain('R', 'intact', { cite: ['S113'], basis: 'composed' }),
        { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S110'], basis: 'composed' },
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: [
        'vertigo: less frequent with the SCA, not absent (C40)',
        'the midbrain branches of the SCA (S110) are not modelled, so nothing is asserted of the midbrain',
        'dysarthria and vomiting are not modelled',
      ],
    }],
  },
];
