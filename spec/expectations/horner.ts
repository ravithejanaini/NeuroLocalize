// Amendment A40. Frozen expected outputs for the Horner syndrome by neurone, written from the
// sources in docs/P34-analysis.md (S16, S176–S178) before any P34 engine code, and run red
// against the P33 engine first.
//
// Reading guide. `sweating` is where sweating is lost on that side: 'body' (the face and that
// half of the body — first order), 'face' (second order), 'brow' (third order), or 'none'.
// The pupil's size and the drug tests are never asserted (C95).
import type { Muscle, Segment, SkinArea, SweatLoss } from '../../src/kb/vocab.ts';
import type { Assertion, BrainCase, BrainRegion, LesionRegion, LimbAssertion, PlexusRegion } from './types.ts';

type E = Pick<Assertion, 'cite' | 'basis'> & { readonly note?: string };
const all: readonly [Segment, Segment] = ['C1', 'Co1'];
const horner = (side: 'L' | 'R', present: boolean, e: E): Assertion => ({ kind: 'horner', side, oneOf: [present ? 'present' : 'absent'], ...e });
const sweat = (side: 'L' | 'R', loss: SweatLoss, e: E): Assertion => ({ kind: 'sweating', side, oneOf: [loss], ...e });
const brain = (level: BrainRegion['brain'], compartments: BrainRegion['compartments']): BrainRegion => ({ brain: level, sides: ['L'], compartments, severity: 'complete' });
const cord = (at: Segment, compartments: LesionRegion['compartments']): LesionRegion => ({
  at: { segments: [at, at] }, sides: ['L'], compartments, severity: 'complete', portion: 'whole',
});
const lowerTrunk: PlexusRegion = { plexus: 'lower_trunk', sides: ['L'], severity: 'complete' };
const muscles = (list: readonly Muscle[], state: 'weak' | 'normal', e: E): LimbAssertion => ({ kind: 'muscle', side: 'L', muscles: list, oneOf: [state], ...e });
const skin = (areas: readonly SkinArea[], oneOf: readonly ('lost' | 'impaired' | 'intact')[], e: E): LimbAssertion => ({ kind: 'skin', side: 'L', modality: 'all', areas, oneOf, ...e });
const noLimbs: Assertion = { kind: 'motor', side: 'both', span: all, lesion: ['none'], cite: ['S16'], basis: 'composed' };

const FIRST: E = { cite: ['S16', 'S176'], basis: 'stated', note: 'first order: anhidrosis of the entire half of the body' };
const SECOND: E = { cite: ['S16', 'S176'], basis: 'stated', note: 'second order: the ipsilateral face' };
const THIRD: E = { cite: ['S16', 'S176'], basis: 'stated', note: 'third order, beyond the superior cervical ganglion: the brow' };

export const HORNER_CASES: readonly BrainCase[] = [
  {
    id: 'horner-first-order-medulla',
    title: 'Left descending sympathetic fibres in the medulla, alone',
    pattern: 'Horner syndrome, sweating lost on the face and that half of the body',
    lesion: [brain('medulla', ['sympathetic'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S16', 'S47'], basis: 'stated' }),
        sweat('L', 'body', FIRST),
        horner('R', false, { cite: ['S16'], basis: 'stated', note: 'the fibres descend uncrossed' }),
        sweat('R', 'none', { cite: ['S16'], basis: 'composed' }),
      ],
      unasserted: ['the pupil’s size and the drug tests (C95)'],
    }],
  },
  {
    id: 'horner-first-order-cord',
    title: 'Left descending autonomic fibres at C4, alone',
    pattern: 'a cord lesion above the ciliospinal centre is first order too',
    lesion: [cord('C4', ['descending_autonomic'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S16'], basis: 'stated', note: 'spinal trauma above the T2 through T3 levels is a first-order cause' }),
        sweat('L', 'body', FIRST),
        sweat('R', 'none', { cite: ['S16'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'horner-first-order-centre',
    title: 'Left ciliospinal centre, C8–T2, alone',
    pattern: 'the centre itself: listed with the first neurone',
    lesion: [{ at: { segments: ['C8', 'T2'] }, sides: ['L'], compartments: ['intermediolateral'], severity: 'complete', portion: 'whole' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S16'], basis: 'stated' }),
        sweat('L', 'body', { cite: ['S16', 'S176'], basis: 'composed', note: 'both sources list syringomyelia, the lesion of this column, under the first-order neurone' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'horner-second-order-root',
    title: 'Left T1 ventral root, alone',
    pattern: 'the preganglionic fibres as they leave the cord',
    lesion: [cord('T1', ['ventral_root'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S16', 'S69'], basis: 'stated', note: 'second-order preganglionic neurons exit the spinal cord at the T1 level' }),
        sweat('L', 'face', SECOND),
        sweat('R', 'none', { cite: ['S16'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'horner-second-order-chain',
    title: 'Left cervical sympathetic chain and stellate ganglion, alone',
    pattern: 'a second-order Horner syndrome with a normal hand',
    lesion: [brain('medulla', ['sympathetic_chain'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S177', 'S16'], basis: 'stated', note: 'Horner syndrome from the stellate ganglion and sympathetic chain' }),
        sweat('L', 'face', SECOND),
        muscles(['interossei', 'thumb_abductor'], 'normal', { cite: ['S177'], basis: 'composed', note: 'the brachial plexus is a separate structure' }),
        horner('R', false, { cite: ['S16'], basis: 'composed' }),
        noLimbs,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'lung-apex-left',
    title: 'Left lung apex (Pancoast): the sympathetic chain and the lower trunk',
    pattern: 'Horner syndrome with a weak, numb ulnar side of the hand',
    lesion: [brain('medulla', ['sympathetic_chain']), lowerTrunk],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S177', 'S16'], basis: 'stated', note: 'a superior sulcus lesion involving the brachial plexus and sympathetic chain' }),
        sweat('L', 'face', SECOND),
        muscles(['interossei', 'thumb_abductor', 'finger_flexor_ulnar'], 'weak', { cite: ['S177'], basis: 'stated', note: 'weakness and atrophy of the intrinsic muscles of the hand' }),
        skin(['little_finger', 'medial_forearm'], ['lost', 'impaired'], { cite: ['S177'], basis: 'stated', note: 'the fourth and fifth digits and the medial aspect of the arm and forearm' }),
        muscles(['deltoid', 'biceps'], 'normal', { cite: ['S177'], basis: 'composed', note: 'involvement beyond the lower trunk is a different, larger lesion' }),
        horner('R', false, { cite: ['S177'], basis: 'composed' }),
        noLimbs,
      ],
      unasserted: ['shoulder pain (C94)', 'the C8–T1 roots themselves give the same picture (C94)'],
    }],
  },
  {
    id: 'carotid-neck-left',
    title: 'Left internal carotid artery in the neck: the carotid plexus',
    pattern: 'Horner syndrome with sweating lost only at the brow',
    lesion: [brain('medulla', ['carotid_plexus_neck'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S178', 'S16'], basis: 'stated', note: 'a hematoma of the cervical artery compresses the adjacent sympathetic nerve fibers' }),
        sweat('L', 'brow', THIRD),
        horner('R', false, { cite: ['S178'], basis: 'composed' }),
        { kind: 'cranial', side: 'L', sign: 'oculomotor_palsy', oneOf: ['absent'], cite: ['S165'], basis: 'composed', note: 'unlike the cavernous sinus, where the same plexus runs with the ocular nerves' },
        { kind: 'cranial', side: 'L', sign: 'abduction_weakness', oneOf: ['absent'], cite: ['S165'], basis: 'composed' },
        noLimbs,
      ],
      unasserted: ['pain (C95)', 'a stroke in the carotid territory, the dissection’s other consequence'],
    }],
  },
  {
    id: 'horner-third-order-sinus',
    title: 'Left carotid plexus in the cavernous sinus, alone',
    pattern: 'third order: the brow only',
    lesion: [brain('midbrain', ['carotid_sympathetic'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        horner('L', true, { cite: ['S165', 'S16'], basis: 'stated' }),
        sweat('L', 'brow', { cite: ['S16', 'S176'], basis: 'stated', note: 'parasellar lesions are third-order: the forehead and nose' }),
      ],
      unasserted: [],
    }],
  },
];
