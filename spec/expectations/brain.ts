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

/** No eye, tongue or palate sign on either side. A13 added the four eye-movement signs. */
const quietCranial = (e: E, except: readonly string[] = []): BrainAssertion[] =>
  (['L', 'R'] as const).flatMap((side) =>
    ([
      'oculomotor_palsy',
      'abduction_weakness',
      'gaze_palsy',
      'tongue_weakness',
      'palate_weakness',
      'adduction_weakness',
      'abducting_nystagmus',
      'ptosis',
      'elevation_weakness',
    ] as const)
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
        // A9: an uncompensated vestibular lesion can make the Romberg test positive, and a
        // cerebellar patient is unsteady with the eyes open, so the test cannot be read (S67).
        { kind: 'romberg', oneOf: ['indeterminate'], cite: ['S67'], basis: 'stated', note: 'A9: vestibular and cerebellar signs make it unreadable' },
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
        // A16: hearing is the cochlear nuclei alone (S114, D78); the facial nucleus sits beside the cochlear nuclei but is not them.
        { kind: 'cranial', side: 'L', sign: 'hearing_loss', oneOf: ['absent'], cite: ['S114'], basis: 'composed' },
        sign('L', 'gaze_palsy', true, { cite: ['S61'], basis: 'stated', note: 'toward the side of the lesion' }),
        sign('L', 'abduction_weakness', true, { cite: ['S61'], basis: 'composed', note: 'the left eye cannot abduct within the gaze palsy' }),
        face('L', 'whole', { cite: ['S61', 'S51'], basis: 'stated', note: 'the facial genu wraps the nucleus' }),
        motor('L', all, 'none', { cite: ['S61', 'S54'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S61', 'S54'], basis: 'composed' }),
        sense('L', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        sign('R', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        // A13: the nucleus holds the interneurons for the other eye's medial rectus, so the
        // gaze palsy is conjugate — the right eye does not adduct either.
        sign('R', 'adduction_weakness', true, { cite: ['S61', 'S99'], basis: 'composed', note: 'the interneurons cross to the right medial rectus' }),
        sign('L', 'adduction_weakness', false, { cite: ['S98'], basis: 'composed', note: 'the left MLF is spared, so the left eye still adducts' }),
        sign('R', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed', note: 'gaze to the right is intact' }),
        sign('L', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        sign('R', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        sign('L', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
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
        // A13: what "third nerve palsy" contains, stated part by part.
        sign('L', 'ptosis', true, { cite: ['S50', 'S62'], basis: 'stated', note: 'S50 names ptosis in Weber syndrome' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed', note: 'the fascicles are one-sided; only the nucleus takes both lids' }),
        sign('L', 'adduction_weakness', true, { cite: ['S62'], basis: 'composed', note: 'the eye rests down and out: the medial rectus is III' }),
        sign('R', 'adduction_weakness', false, { cite: ['S62'], basis: 'composed' }),
        sign('L', 'elevation_weakness', true, { cite: ['S70'], basis: 'composed', note: 'the superior rectus is III' }),
        sign('R', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed', note: 'a fascicle lesion spares the other eye; a nuclear one would not' }),
        sign('L', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed', note: 'gaze is a pontine sign' }),
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed', note: 'the sixth nerve is not in the midbrain' }),
      ],
      unasserted: ['sensation: S50 mentions crossed deficits "either sensory or motor" without saying which'],
    }],
  },

  // ──────────────────────────────────────────────── A13: the eye movements (P9)
  {
    id: 'mlf-left',
    title: 'Left medial longitudinal fasciculus',
    pattern: 'internuclear ophthalmoplegia',
    lesion: [at('pons', ['mlf'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'adduction_weakness', true, { cite: ['S98'], basis: 'stated', note: 'S98: impaired adduction on the same side as the MLF lesion' }),
        sign('R', 'abducting_nystagmus', true, { cite: ['S98'], basis: 'stated', note: 'S98: the contralateral abducting eye may show a dissociated nystagmus' }),
        sign('L', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed', note: 'the left eye is the adducting one' }),
        sign('R', 'adduction_weakness', false, { cite: ['S98'], basis: 'composed' }),
        sign('L', 'abduction_weakness', false, { cite: ['S98', 'S61'], basis: 'stated', note: 'abduction is the sixth nerve and is spared: this is what separates an INO from a sixth nerve palsy' }),
        sign('R', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed', note: 'the abducens nucleus and the PPRF are not in this lesion' }),
        sign('R', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        sign('L', 'ptosis', false, { cite: ['S98', 'S70'], basis: 'composed', note: 'the lid is the third nerve; an INO leaves it alone' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed' }),
        sign('R', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed' }),
        face('L', 'none', { cite: ['S51'], basis: 'composed' }),
        face('R', 'none', { cite: ['S51'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
        sense('L', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: [
        'convergence: S98 says it may be preserved (C30); the model does not examine it',
        'skew deviation and the vestibulo-ocular reflex are not modelled',
      ],
    }],
  },
  {
    id: 'mlf-midbrain-left',
    title: 'Left medial longitudinal fasciculus, in the midbrain',
    pattern: 'internuclear ophthalmoplegia from the rostral end of the tract',
    lesion: [at('midbrain', ['mlf'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        // The MLF ascends from the abducens nucleus in the pons to the oculomotor nucleus in
        // the midbrain, so the same signs appear wherever along it the tract is cut (S98).
        sign('L', 'adduction_weakness', true, { cite: ['S98'], basis: 'composed', note: 'the tract is the same tract at its rostral end' }),
        sign('R', 'abducting_nystagmus', true, { cite: ['S98'], basis: 'composed' }),
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed', note: 'the sixth nerve is pontine' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        sign('R', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        sign('R', 'adduction_weakness', false, { cite: ['S98'], basis: 'composed' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed', note: 'the fascicles and the nucleus are beside the tract, not in this lesion' }),
        sign('L', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed' }),
        sign('R', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed', note: 'the peduncle is ventral' }),
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
        face('L', 'none', { cite: ['S51'], basis: 'composed' }),
      ],
      unasserted: [
        'vertical gaze: the dorsal midbrain (A17) is not in this lesion, and no source read says what a rostral MLF lesion alone does to vertical gaze',
        'this lesion is not a named place in the app: it produces exactly what the pontine MLF produces (D66)',
      ],
    }],
  },
  {
    id: 'pprf-left',
    title: 'Left paramedian pontine reticular formation',
    pattern: 'horizontal gaze palsy toward the lesion',
    lesion: [at('pons', ['pprf'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'gaze_palsy', true, { cite: ['S99', 'S61'], basis: 'stated', note: 'a gaze palsy toward its own side' }),
        sign('L', 'abduction_weakness', true, { cite: ['S99', 'S61'], basis: 'composed', note: 'the left eye cannot abduct within the gaze palsy' }),
        sign('R', 'adduction_weakness', true, { cite: ['S61', 'S99'], basis: 'composed', note: 'the gaze is conjugate: the right medial rectus goes with it' }),
        sign('L', 'adduction_weakness', false, { cite: ['S98'], basis: 'composed', note: 'the MLF is spared, so this is a gaze palsy and not one-and-a-half' }),
        sign('R', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed' }),
        sign('R', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        sign('L', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        sign('R', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        sign('L', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        face('L', 'none', { cite: ['S51'], basis: 'composed', note: 'the facial genu lies dorsally, around the abducens nucleus' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
      ],
      unasserted: ['saccades and pursuit are not modelled separately'],
    }],
  },
  {
    id: 'pontine-tegmentum-left',
    title: 'Left pontine tegmentum: abducens nucleus and MLF',
    pattern: 'one-and-a-half syndrome',
    lesion: [at('pons', ['abducens_nucleus', 'mlf'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'gaze_palsy', true, { cite: ['S99', 'S61'], basis: 'stated', note: 'the "one": a gaze palsy toward the lesion' }),
        sign('L', 'abduction_weakness', true, { cite: ['S99'], basis: 'composed', note: 'within that gaze palsy' }),
        sign('L', 'adduction_weakness', true, { cite: ['S99', 'S98'], basis: 'stated', note: 'the "half": an INO on the same side, so the left eye does not move horizontally at all' }),
        sign('R', 'adduction_weakness', true, { cite: ['S99', 'S61'], basis: 'composed', note: 'the conjugate half of the gaze palsy' }),
        sign('R', 'abduction_weakness', false, { cite: ['S99'], basis: 'stated', note: 'S99: abduction of the contralateral eye is what remains' }),
        sign('R', 'abducting_nystagmus', true, { cite: ['S98'], basis: 'stated', note: 'the one movement left is the one that shows the nystagmus' }),
        sign('R', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        sign('L', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        sign('L', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed', note: 'vertical gaze is not pontine' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S62'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
      ],
      unasserted: [
        'eight-and-a-half syndrome adds the facial nerve (S99); the facial genu is not in this lesion',
        'the cause — infarct, demyelination, tumour — is not modelled',
      ],
    }],
  },
  {
    id: 'oculomotor-nucleus-left',
    title: 'Left oculomotor nucleus',
    pattern: 'nuclear third nerve palsy',
    lesion: [at('midbrain', ['oculomotor_nucleus'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('L', 'oculomotor_palsy', true, { cite: ['S70'], basis: 'stated', note: 'a unilateral third nerve palsy on the side of the nucleus' }),
        sign('R', 'oculomotor_palsy', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'adduction_weakness', true, { cite: ['S70', 'S62'], basis: 'composed', note: 'the medial rectus subnucleus is in the lesion' }),
        sign('L', 'elevation_weakness', true, { cite: ['S70'], basis: 'composed', note: 'the ipsilateral superior rectus' }),
        sign('R', 'elevation_weakness', true, { cite: ['S70'], basis: 'stated', note: 'the superior rectus subnucleus serves the other eye: this is what marks the lesion as nuclear' }),
        sign('L', 'ptosis', 'open', { cite: ['S70'], basis: 'stated', note: 'C29: one central caudal nucleus serves both lids — bilateral ptosis or none' }),
        sign('R', 'ptosis', 'open', { cite: ['S70'], basis: 'stated', note: 'C29: unsettled on this side too' }),
        sign('R', 'adduction_weakness', false, { cite: ['S70'], basis: 'composed', note: 'the medial rectus subnucleus is uncrossed' }),
        sign('L', 'gaze_palsy', false, { cite: ['S61'], basis: 'composed' }),
        sign('L', 'abduction_weakness', false, { cite: ['S61'], basis: 'composed' }),
        sign('L', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed', note: 'the peduncle lies ventral: this is not Weber syndrome' }),
        motor('R', all, 'none', { cite: ['S54'], basis: 'composed' }),
        sense('R', 'all', all, ['intact'], { cite: ['S57', 'S58'], basis: 'composed' }),
      ],
      unasserted: [
        'the pupil is not modelled (C21)',
        'the inferior rectus, inferior oblique and their subnuclei are not modelled separately',
      ],
    }],
  },

  {
    id: 'midbrain-peduncle-only-left',
    title: 'Left cerebral peduncle, the oculomotor fascicles spared',
    pattern: 'a hemiparesis from the midbrain with no third nerve palsy',
    lesion: [at('midbrain', ['peduncle'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        // A13: the crossed sign of Weber syndrome needs the fascicles. Without them the
        // midbrain gives a hemiparesis that looks capsular (S50, S62).
        motor('R', ARM, 'umn', { cite: ['S50', 'S65'], basis: 'composed' }),
        motor('R', LEG, 'umn', { cite: ['S50', 'S65'], basis: 'composed' }),
        motor('L', all, 'none', { cite: ['S54'], basis: 'composed' }),
        sign('L', 'oculomotor_palsy', false, { cite: ['S50', 'S62'], basis: 'composed', note: 'the fascicles lie medial to the peduncle and are not in this lesion' }),
        sign('L', 'ptosis', false, { cite: ['S62'], basis: 'composed' }),
        sign('R', 'ptosis', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed' }),
        sign('R', 'elevation_weakness', false, { cite: ['S70'], basis: 'composed' }),
        sign('L', 'adduction_weakness', false, { cite: ['S62', 'S98'], basis: 'composed' }),
        sign('R', 'adduction_weakness', false, { cite: ['S62'], basis: 'composed' }),
        sign('L', 'abducting_nystagmus', false, { cite: ['S98'], basis: 'composed' }),
        { kind: 'babinski', side: 'R', oneOf: ['present'], cite: ['S54'], basis: 'composed' },
        { kind: 'horner', side: 'both', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: [
        'this is not a named place in the app: the territory it belongs to is Weber syndrome, which takes the fascicles too',
        'sensation: as in the Weber case, S50 does not say which crossed deficits it means',
      ],
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
    // A14: the superior division's precentral branch also supplies Brodmann 44 and 45 — Broca
    // area (S104) — so the lesion takes the inferior frontal gyrus as well.
    lesion: [at('cortex', ['motor_cortex', 'sensory_cortex', 'inferior_frontal'], ['face', 'arm'])],
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
        // A14: Broca aphasia, with the face and arm weakness that S100 says can accompany it.
        { kind: 'language', sign: 'nonfluent_speech', oneOf: ['present'], cite: ['S104', 'S100'], basis: 'stated', note: 'a superior-division stroke of the dominant hemisphere: Broca aphasia' },
        { kind: 'language', sign: 'impaired_comprehension', oneOf: ['absent'], cite: ['S104', 'S100'], basis: 'stated', note: 'preserved comprehension' },
        { kind: 'language', sign: 'impaired_repetition', oneOf: ['present'], cite: ['S104', 'S100'], basis: 'stated', note: 'inability to repeat' },
      ],
      unasserted: [
        'neglect (C33), gaze deviation and field cuts (S52): not modelled for this lesion',
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
        // A18: the trigeminal nuclei lie beside these parts in the pontine tegmentum but are not them (S122).
        { kind: 'cranial', side: 'L', sign: 'jaw_deviation', oneOf: ['absent'], cite: ['S122'], basis: 'composed' },
        { kind: 'face_sensation', side: 'L', oneOf: ['intact'], cite: ['S122'], basis: 'composed' },
        // A16: hearing is the cochlear nuclei alone (S114, D78); the tract runs past the cochlear nuclei but is not them.
        { kind: 'cranial', side: 'L', sign: 'hearing_loss', oneOf: ['absent'], cite: ['S114'], basis: 'composed' },
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
        // A16: hearing is the cochlear nuclei alone (S114, D78); the sympathetic fibres are not the cochlear nuclei.
        { kind: 'cranial', side: 'L', sign: 'hearing_loss', oneOf: ['absent'], cite: ['S114'], basis: 'composed' },
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
        // A18: the trigeminal nuclei lie beside these parts in the pontine tegmentum but are not them (S122).
        { kind: 'cranial', side: 'L', sign: 'jaw_deviation', oneOf: ['absent'], cite: ['S122'], basis: 'composed' },
        { kind: 'face_sensation', side: 'L', oneOf: ['intact'], cite: ['S122'], basis: 'composed' },
        // A16: hearing is the cochlear nuclei alone (S114, D78); the vestibular nuclei are the eighth nerve's balance half; hearing is the cochlear half.
        { kind: 'cranial', side: 'L', sign: 'hearing_loss', oneOf: ['absent'], cite: ['S114'], basis: 'composed' },
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
