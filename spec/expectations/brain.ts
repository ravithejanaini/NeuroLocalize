// Amendment A7. Frozen expected outputs above the cord, written from S47–S66 (with S12, S16
// and S21) before any brain code existed. Each lesion is the set of structures its source
// names; every assertion says whether a source states it of that lesion or whether it is
// composed from where the sources put a tract or a nucleus.
import type { Segment, SensoryState } from '../../src/kb/vocab.ts';
import type { Assertion, BrainAssertion, BrainCase, BrainRegion } from './types.ts';

type E = Pick<BrainAssertion, 'cite' | 'basis'> & { readonly note?: string };
type Span = readonly [Segment, Segment];
const all: Span = ['C1', 'Co1'];
const ARM: Span = ['C5', 'T1'];
const LEG: Span = ['L2', 'S2'];

const at = (brain: BrainRegion['brain'], compartments: BrainRegion['compartments'], regions?: BrainRegion['regions']): BrainRegion => ({
  brain, sides: ['L'], compartments, severity: 'complete', ...(regions ? { regions } : {}),
});
const sense = (
  side: 'L' | 'R',
  modality: 'pain_temperature' | 'posterior_column' | 'all',
  span: Span,
  oneOf: readonly SensoryState[],
  e: E,
): Assertion => ({ kind: 'sensory', side, modality, span, oneOf, ...e });
const motor = (side: 'L' | 'R', span: Span, lesion: 'none' | 'umn', e: E): Assertion => ({ kind: 'motor', side, span, lesion: [lesion], ...e });
const sign = (side: 'L' | 'R', sign: Extract<BrainAssertion, { kind: 'cranial' }>['sign'], present: boolean | 'open', e: E): BrainAssertion => ({
  kind: 'cranial', side, sign, oneOf: present === 'open' ? ['indeterminate'] : [present ? 'present' : 'absent'], ...e,
});
const face = (side: 'L' | 'R', w: 'none' | 'lower' | 'whole', e: E): BrainAssertion => ({ kind: 'face_weakness', side, oneOf: [w], ...e });
const feel = (side: 'L' | 'R', oneOf: readonly ('intact' | 'lost' | 'impaired')[], e: E): BrainAssertion => ({ kind: 'face_sensation', side, oneOf, ...e });

/** No eye, tongue or palate sign on either side. */
const quietCranial = (e: E, except: readonly string[] = []): BrainAssertion[] =>
  (['L', 'R'] as const).flatMap((side) =>
    (['oculomotor_palsy', 'abduction_weakness', 'gaze_palsy', 'tongue_weakness', 'palate_weakness'] as const)
      .filter((s) => !except.includes(`${side}:${s}`))
      .map((s) => sign(side, s, false, e)),
  );

export const BRAIN_CASES: readonly BrainCase[] = [
  // ─────────────────────────────────────────────────────────── medulla
  {
    id: 'lateral-medullary-left',
    title: 'Left lateral medulla',
    pattern: 'Wallenberg syndrome (PICA or vertebral artery)',
    lesion: [at('medulla', ['spinothalamic', 'spinal_trigeminal', 'sympathetic', 'ambiguus', 'cerebellar_peduncle', 'vestibular'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        feel('L', ['lost'], { cite: ['S47', 'S58', 'S60'], basis: 'stated', note: 'ipsilateral face, from the spinal trigeminal nucleus and tract' }),
        feel('R', ['intact'], { cite: ['S60'], basis: 'composed' }),
        sense('R', 'pain_temperature', all, ['lost'], { cite: ['S58', 'S47'], basis: 'stated', note: 'the entire contralateral body' }),
        sense('L', 'pain_temperature', all, ['intact'], { cite: ['S47', 'S58'], basis: 'composed', note: 'the tract already carries the other side' }),
        sense('L', 'posterior_column', all, ['intact'], { cite: ['S48', 'S57'], basis: 'composed', note: 'the medial lemniscus lies medially and is not in the lateral territory' }),
        sense('R', 'posterior_column', all, ['intact'], { cite: ['S48', 'S57'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S47', 'S48'], basis: 'stated', note: 'weakness is uncommon; the pyramid is medial' }),
        motor('R', all, 'none', { cite: ['S47', 'S48'], basis: 'stated' }),
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S47', 'S16'], basis: 'stated' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed', note: 'the fibres descend uncrossed' },
        ...quietCranial({ cite: ['S48', 'S59', 'S62'], basis: 'composed' }, ['L:palate_weakness']),
        sign('L', 'palate_weakness', true, { cite: ['S47', 'S64'], basis: 'stated', note: 'dysphagia and dysphonia from the nucleus ambiguus' }),
        { kind: 'ataxia', side: 'L', oneOf: ['present'], cite: ['S47'], basis: 'stated' },
        { kind: 'ataxia', side: 'R', oneOf: ['absent'], cite: ['S47'], basis: 'composed' },
        { kind: 'vertigo', oneOf: ['present'], cite: ['S47'], basis: 'stated' },
        face('L', 'none', { cite: ['S48'], basis: 'composed', note: 'facial weakness points to the pons' }),
        face('R', 'none', { cite: ['S48'], basis: 'composed' }),
        { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S54'], basis: 'composed' },
        { kind: 'reflex', side: 'both', reflex: 'biceps', oneOf: ['normal'], cite: ['S12', 'S47'], basis: 'composed' },
      ],
      unasserted: [
        'nystagmus, hiccups and taste: not modelled',
        'partial syndromes are commoner than the complete one (S47); this case is the complete one',
      ],
    }],
  },
  {
    id: 'medial-medullary-left',
    title: 'Left medial medulla',
    pattern: 'Dejerine syndrome (anterior spinal or vertebral branches)',
    lesion: [at('medulla', ['pyramid', 'medial_lemniscus', 'hypoglossal'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        motor('R', ARM, 'umn', { cite: ['S48'], basis: 'stated', note: 'contralateral arm and leg' }),
        motor('R', LEG, 'umn', { cite: ['S48'], basis: 'stated' }),
        { kind: 'motor', side: 'R', span: LEG, lesion: ['umn'], tone: ['increased'], cite: ['S54'], basis: 'composed', note: 'spasticity once established' },
        motor('L', all, 'none', { cite: ['S48', 'S54'], basis: 'composed', note: 'the pyramid crosses below the lesion' }),
        sense('R', 'posterior_column', all, ['lost'], { cite: ['S48', 'S57'], basis: 'stated' }),
        sense('L', 'posterior_column', all, ['intact'], { cite: ['S57'], basis: 'composed' }),
        sense('R', 'pain_temperature', all, ['intact'], { cite: ['S48'], basis: 'stated' }),
        sense('L', 'pain_temperature', all, ['intact'], { cite: ['S48'], basis: 'stated' }),
        sign('L', 'tongue_weakness', true, { cite: ['S48', 'S63'], basis: 'stated', note: 'the tongue deviates toward the lesion' }),
        face('L', 'none', { cite: ['S48'], basis: 'stated', note: 'facial musculature typically spared' }),
        face('R', 'none', { cite: ['S48'], basis: 'stated' }),
        feel('L', ['intact'], { cite: ['S60'], basis: 'composed' }),
        feel('R', ['intact'], { cite: ['S60'], basis: 'composed' }),
        { kind: 'babinski', side: 'R', oneOf: ['present'], cite: ['S54', 'S12'], basis: 'composed' },
        { kind: 'babinski', side: 'L', oneOf: ['absent'], cite: ['S54'], basis: 'composed' },
        { kind: 'reflex', side: 'R', reflex: 'biceps', oneOf: ['brisk'], cite: ['S54', 'S12'], basis: 'composed' },
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16', 'S47'], basis: 'composed', note: 'the sympathetic fibres run laterally' },
        { kind: 'ataxia', side: 'both', oneOf: ['absent'], cite: ['S47'], basis: 'composed' },
        { kind: 'vertigo', oneOf: ['absent'], cite: ['S47'], basis: 'composed' },
      ],
      unasserted: [
        'right tongue: whether the lesion also catches corticobulbar fibres bound for the other hypoglossal nucleus is not stated',
        'palate: where the corticobulbar fibres to the nucleus ambiguus leave the pyramid is not stated',
      ],
    }],
  },

  // ─────────────────────────────────────────────────────────── pons
  {
    id: 'ventral-pons-left',
    title: 'Left ventral pons',
    pattern: 'Millard-Gubler syndrome',
    lesion: [at('pons', ['basis', 'facial', 'abducens_fascicle'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        face('L', 'whole', { cite: ['S49', 'S51'], basis: 'stated', note: 'peripheral facial palsy: forehead included' }),
        sign('L', 'abduction_weakness', true, { cite: ['S61', 'S49'], basis: 'composed', note: 'the fascicle is in this lesion; S49 says an abducens palsy may be present' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed', note: 'the nucleus is spared' }),
        motor('R', ARM, 'umn', { cite: ['S49'], basis: 'stated' }),
        motor('R', LEG, 'umn', { cite: ['S49'], basis: 'stated' }),
        motor('L', all, 'none', { cite: ['S49', 'S54'], basis: 'composed' }),
        sense('L', 'all', all, ['intact'], { cite: ['S49'], basis: 'stated', note: 'sensation typically unaffected' }),
        sense('R', 'all', all, ['intact'], { cite: ['S49'], basis: 'stated' }),
        feel('L', ['intact'], { cite: ['S49'], basis: 'stated' }),
        feel('R', ['intact'], { cite: ['S49'], basis: 'stated' }),
        { kind: 'babinski', side: 'R', oneOf: ['present'], cite: ['S54'], basis: 'composed' },
        sign('L', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
      ],
      unasserted: [
        'right face: corticobulbar fibres for the right facial nucleus cross near this level; whether the lesion takes them is not stated',
        'tongue and palate: the corticobulbar fibres to them pass here, and their bilateral or crossed control makes the effect unstated',
      ],
    }],
  },
  {
    id: 'dorsal-pons-left',
    title: 'Left abducens nucleus and facial genu',
    pattern: 'dorsal pontine lesion: gaze palsy with facial palsy',
    lesion: [at('pons', ['abducens_nucleus', 'facial'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'gaze_palsy', true, { cite: ['S61'], basis: 'stated', note: 'toward the side of the lesion' }),
        sign('L', 'abduction_weakness', true, { cite: ['S61'], basis: 'composed', note: 'the left eye cannot abduct within the gaze palsy' }),
        face('L', 'whole', { cite: ['S61', 'S51'], basis: 'stated', note: 'the facial genu wraps the nucleus' }),
        motor('L', all, 'none', { cite: ['S61', 'S54'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S61', 'S54'], basis: 'composed' }),
        sense('L', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        sign('R', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
      ],
      unasserted: ['Foville syndrome adds a hemiparesis (S49); this lesion leaves the basis alone'],
    }],
  },

  // ─────────────────────────────────────────────────────────── midbrain
  {
    id: 'midbrain-peduncle-left',
    title: 'Left cerebral peduncle and oculomotor fascicles',
    pattern: 'Weber syndrome',
    lesion: [at('midbrain', ['peduncle', 'oculomotor'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'oculomotor_palsy', true, { cite: ['S50', 'S62'], basis: 'stated', note: 'ptosis, eye down and out' }),
        sign('R', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        motor('R', ARM, 'umn', { cite: ['S50', 'S62', 'S65'], basis: 'stated' }),
        motor('R', LEG, 'umn', { cite: ['S50', 'S62', 'S65'], basis: 'stated' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        face('R', 'lower', { cite: ['S54', 'S51'], basis: 'composed', note: 'corticobulbar fibres run in the peduncle; S50 says nothing of the face (C18)' }),
        face('L', 'none', { cite: ['S51'], basis: 'composed', note: 'the left lower face is served by the right hemisphere' }),
        sign('R', 'tongue_weakness', true, { cite: ['S63', 'S54'], basis: 'composed', note: 'supranuclear control of the tongue is mostly crossed' }),
        sign('L', 'tongue_weakness', false, { cite: ['S63'], basis: 'composed' }),
        sign('L', 'palate_weakness', 'open', { cite: ['S64'], basis: 'composed', note: 'bilateral supranuclear control: at most a milder weakness' }),
        sign('R', 'palate_weakness', 'open', { cite: ['S64'], basis: 'composed' }),
        { kind: 'babinski', side: 'R', oneOf: ['present'], cite: ['S54'], basis: 'composed' },
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: ['sensation: S50 mentions crossed deficits "either sensory or motor" without saying which'],
    }],
  },

  // ─────────────────────────────────────────────────────────── deep
  {
    id: 'internal-capsule-left',
    title: 'Left internal capsule, genu and posterior limb',
    pattern: 'pure motor hemiparesis (lacune)',
    lesion: [at('capsule', ['capsule_genu', 'capsule_posterior_motor'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        motor('R', ARM, 'umn', { cite: ['S55', 'S56'], basis: 'stated', note: 'face, arm and leg alike' }),
        motor('R', LEG, 'umn', { cite: ['S55', 'S56'], basis: 'stated' }),
        motor('L', all, 'none', { cite: ['S55'], basis: 'composed' }),
        face('R', 'lower', { cite: ['S55', 'S51'], basis: 'composed', note: 'S55 names the face; S51 spares the forehead in supranuclear lesions' }),
        face('L', 'none', { cite: ['S51'], basis: 'composed' }),
        sense('L', 'all', all, ['intact'], { cite: ['S55'], basis: 'stated', note: 'pure motor' }),
        sense('R', 'all', all, ['intact'], { cite: ['S55'], basis: 'stated' }),
        feel('R', ['intact'], { cite: ['S55'], basis: 'stated' }),
        sign('R', 'tongue_weakness', true, { cite: ['S63', 'S56'], basis: 'composed' }),
        sign('L', 'palate_weakness', 'open', { cite: ['S64'], basis: 'composed' }),
        sign('R', 'palate_weakness', 'open', { cite: ['S64'], basis: 'composed' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        { kind: 'ataxia', side: 'both', oneOf: ['absent'], cite: ['S55'], basis: 'composed', note: 'ataxic hemiparesis is a separate syndrome' },
        { kind: 'vertigo', oneOf: ['absent'], cite: ['S47'], basis: 'composed' },
        { kind: 'babinski', side: 'R', oneOf: ['present'], cite: ['S54'], basis: 'composed' },
        { kind: 'reflex', side: 'R', reflex: 'triceps', oneOf: ['brisk'], cite: ['S54', 'S12'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'capsule-sensory-left',
    title: 'Left internal capsule, posterior third of the posterior limb',
    pattern: 'hemisensory loss from the capsule',
    lesion: [at('capsule', ['capsule_posterior_sensory'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sense('R', 'all', ARM, ['lost', 'impaired'], { cite: ['S56'], basis: 'stated' }),
        sense('R', 'all', LEG, ['lost', 'impaired'], { cite: ['S56'], basis: 'stated' }),
        sense('L', 'all', all, ['intact'], { cite: ['S56'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S56'], basis: 'composed', note: 'the motor fibres lie in front' }),
      ],
      unasserted: ['the face: S56 says hemisensory without naming it'],
    }],
  },
  {
    id: 'thalamus-left',
    title: 'Left lateral thalamus',
    pattern: 'pure sensory stroke (lacune)',
    lesion: [at('thalamus', ['vpl', 'vpm'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        feel('R', ['lost', 'impaired'], { cite: ['S55', 'S60'], basis: 'stated', note: 'VPM carries the face' }),
        feel('L', ['intact'], { cite: ['S55'], basis: 'composed', note: 'modelled as crossed above the medulla (C16)' }),
        sense('R', 'all', ARM, ['lost', 'impaired'], { cite: ['S55', 'S57', 'S58'], basis: 'stated' }),
        sense('R', 'all', LEG, ['lost', 'impaired'], { cite: ['S55', 'S57', 'S58'], basis: 'stated' }),
        sense('L', 'all', all, ['intact'], { cite: ['S55'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S55'], basis: 'stated', note: 'pure sensory' }),
        motor('R', all, 'none', { cite: ['S55'], basis: 'stated' }),
        face('R', 'none', { cite: ['S55'], basis: 'stated' }),
      ],
      unasserted: ['neck and trunk: S55 names face, arm and leg'],
    }],
  },

  // ─────────────────────────────────────────────────────────── cortex
  {
    id: 'mca-cortex-left',
    title: 'Left lateral precentral and postcentral gyri',
    pattern: 'middle cerebral artery, superior division',
    lesion: [at('cortex', ['motor_cortex', 'sensory_cortex'], ['face', 'arm'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        motor('R', ARM, 'umn', { cite: ['S54', 'S66'], basis: 'stated', note: 'contralateral face and arm' }),
        motor('R', LEG, 'none', { cite: ['S54', 'S66'], basis: 'composed', note: 'the leg lies medially, in the ACA territory' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        face('R', 'lower', { cite: ['S54', 'S51'], basis: 'composed', note: 'S54: face weakness; S51: forehead spared' }),
        sense('R', 'all', ARM, ['lost', 'impaired'], { cite: ['S54', 'S66'], basis: 'stated' }),
        sense('R', 'all', LEG, ['intact'], { cite: ['S66'], basis: 'composed' }),
        feel('R', ['lost', 'impaired'], { cite: ['S54', 'S66'], basis: 'stated' }),
        feel('L', ['intact'], { cite: ['S66'], basis: 'composed' }),
        sign('R', 'tongue_weakness', true, { cite: ['S54', 'S63'], basis: 'composed', note: 'corticobulbar fibres start in the lateral motor cortex' }),
        { kind: 'reflex', side: 'R', reflex: 'biceps', oneOf: ['brisk'], cite: ['S54', 'S12'], basis: 'composed' },
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        // A8
        sign('L', 'palate_weakness', 'open', { cite: ['S64', 'S54'], basis: 'composed', note: 'A8: the palate has both hemispheres' }),
        sign('R', 'palate_weakness', 'open', { cite: ['S64', 'S54'], basis: 'composed' }),
      ],
      unasserted: [
        'aphasia, neglect, gaze deviation and field cuts (S52): not modelled',
        'the Babinski sign: a lesion confined to the lateral cortex spares the leg fibres, but MCA strokes often reach deeper; not asserted',
        'neck and trunk: no source read assigns them to either artery',
      ],
    }],
  },
  {
    id: 'aca-cortex-left',
    title: 'Left medial precentral and postcentral gyri',
    pattern: 'anterior cerebral artery',
    lesion: [at('cortex', ['motor_cortex', 'sensory_cortex'], ['leg'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        motor('R', LEG, 'umn', { cite: ['S53', 'S54', 'S66'], basis: 'stated' }),
        motor('R', ARM, 'none', { cite: ['S54', 'S66'], basis: 'composed', note: 'the arm lies laterally, in the MCA territory' }),
        face('R', 'none', { cite: ['S54', 'S66'], basis: 'composed' }),
        sense('R', 'all', LEG, ['lost', 'impaired'], { cite: ['S54', 'S66', 'S53'], basis: 'stated' }),
        sense('R', 'all', ARM, ['intact'], { cite: ['S66'], basis: 'composed' }),
        feel('R', ['intact'], { cite: ['S66'], basis: 'composed' }),
        { kind: 'babinski', side: 'R', oneOf: ['present'], cite: ['S54', 'S12'], basis: 'composed' },
        sign('R', 'tongue_weakness', false, { cite: ['S54'], basis: 'composed' }),
      ],
      unasserted: ['abulia and the other frontal features (S53): not modelled'],
    }],
  },

  // A8 ─────────────────────────────── the levels and parts no case had taken alone
  {
    id: 'pons-lemnisci-left',
    title: 'Left medial lemniscus and spinothalamic tract in the pons',
    pattern: 'both long sensory tracts above the medulla',
    lesion: [at('pons', ['medial_lemniscus', 'spinothalamic'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sense('R', 'posterior_column', all, ['lost'], { cite: ['S57'], basis: 'stated', note: 'A8: the lemniscus serves the contralateral body throughout the brainstem' }),
        sense('R', 'pain_temperature', all, ['lost'], { cite: ['S58'], basis: 'stated', note: 'A8: a brainstem lesion removes contralateral body pain' }),
        sense('L', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
        face('L', 'none', { cite: ['S51'], basis: 'composed' }),
        face('R', 'none', { cite: ['S51'], basis: 'composed' }),
      ],
      unasserted: ['facial sensation: where the trigeminothalamic fibres run in the pons is not stated (R22)'],
    }],
  },
  {
    id: 'midbrain-lemnisci-left',
    title: 'Left medial lemniscus and spinothalamic tract in the midbrain',
    pattern: 'both long sensory tracts, higher still',
    lesion: [at('midbrain', ['medial_lemniscus', 'spinothalamic'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sense('R', 'posterior_column', all, ['lost'], { cite: ['S57'], basis: 'stated', note: 'A8' }),
        sense('R', 'pain_temperature', all, ['lost'], { cite: ['S58'], basis: 'stated', note: 'A8' }),
        sense('L', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'pons-sympathetic-left',
    title: 'Left descending sympathetic fibres in the pons',
    pattern: 'a central Horner syndrome above the medulla',
    lesion: [at('pons', ['sympathetic'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S16'], basis: 'composed', note: 'A8: first-order fibres descend uncrossed through the pons' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'midbrain-sympathetic-left',
    title: 'Left descending sympathetic fibres in the midbrain',
    pattern: 'a central Horner syndrome in the midbrain',
    lesion: [at('midbrain', ['sympathetic'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S16'], basis: 'composed', note: 'A8: first-order fibres descend uncrossed through the midbrain' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'pons-cerebellar-left',
    title: 'Left cerebellar peduncle and vestibular nuclei in the pons',
    pattern: 'ataxia and vertigo without weakness',
    lesion: [at('pons', ['cerebellar_peduncle', 'vestibular'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'ataxia', side: 'L', oneOf: ['present'], cite: ['S65'], basis: 'composed', note: 'A8: ipsilateral limb ataxia in lateral pontine lesions' },
        { kind: 'ataxia', side: 'R', oneOf: ['absent'], cite: ['S65'], basis: 'composed' },
        { kind: 'vertigo', oneOf: ['present'], cite: ['S59', 'S47'], basis: 'composed', note: 'A8: vestibular nuclei lie in the inferior pons' },
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'pontine-lacune-left',
    title: 'Left basis pontis alone',
    pattern: 'pure motor hemiparesis from the ventral pons',
    lesion: [at('pons', ['basis'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        motor('R', ARM, 'umn', { cite: ['S55'], basis: 'stated', note: 'A8: pure motor hemiparesis can arise in the ventral pons' }),
        motor('R', LEG, 'umn', { cite: ['S55'], basis: 'stated' }),
        face('R', 'lower', { cite: ['S55', 'S51'], basis: 'composed', note: 'A8: S55 names the face; the corticobulbar fibres run in the basis (S54)' }),
        face('L', 'none', { cite: ['S51'], basis: 'composed', note: 'the facial nucleus is spared' }),
        sign('L', 'palate_weakness', 'open', { cite: ['S64'], basis: 'composed' }),
        sign('R', 'palate_weakness', 'open', { cite: ['S64'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S55'], basis: 'stated' }),
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed' }),
      ],
      unasserted: ['the tongue: where its supranuclear fibres run is not stated (R25)'],
    }],
  },
  {
    id: 'capsule-leg-left',
    title: 'Left posterior limb, the fibres for the leg',
    pattern: 'the capsule is laid out by body region',
    lesion: [at('capsule', ['capsule_posterior_motor', 'capsule_posterior_sensory'], ['leg'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        motor('R', LEG, 'umn', { cite: ['S56'], basis: 'composed', note: 'A8: the posterior fibres of the limb serve the lower extremity' }),
        motor('R', ARM, 'none', { cite: ['S56'], basis: 'composed', note: 'the fibres nearest the genu serve the cervical body' }),
        sense('R', 'all', LEG, ['lost', 'impaired'], { cite: ['S56'], basis: 'composed' }),
        sense('R', 'all', ARM, ['intact'], { cite: ['S56'], basis: 'composed' }),
        face('R', 'none', { cite: ['S56'], basis: 'composed', note: 'the genu is spared' }),
      ],
      unasserted: [],
    }],
  },
];
