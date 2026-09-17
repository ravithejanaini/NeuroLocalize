// Amendment A4. Frozen expected outputs for the upper limb, written from the sources in
// docs/SOURCES.md (S33–S46, with S12, S16, S19, S21, S31) before any plexus code existed.
//
// Reading guide. A `muscle` assertion names the muscle that stands for a movement: the
// thumb abductor is abductor pollicis brevis, the ulnar finger flexor is flexor digitorum
// profundus to the ring and little fingers, the wrist extensors are the radial wrist
// extensors. `skin` names a patch: the dorsal web is the back of the first web space; the
// badge is the lateral shoulder. 'stated' means a source says it of this lesion; 'composed'
// means it follows from where the source puts the branch or the root.
import type { Compartment, Muscle, SkinArea } from '../../src/kb/vocab.ts';
import { MUSCLES, SKIN_AREAS } from '../../src/kb/vocab.ts';
import type { LesionRegion, LimbAssertion, LimbCase, PlexusRegion, Span } from './types.ts';

const ROOTS: readonly Compartment[] = ['dorsal_root', 'ventral_root'];
const roots = (span: Span): LesionRegion => ({
  at: { segments: span }, sides: ['L'], compartments: ROOTS, severity: 'complete', portion: 'whole',
});
const at = (site: PlexusRegion['plexus']): PlexusRegion => ({ plexus: site, sides: ['L'], severity: 'complete' });

type Cite = Pick<LimbAssertion, 'cite' | 'basis'> & { readonly note?: string };
const weak = (muscles: readonly Muscle[], e: Cite): LimbAssertion => ({ kind: 'muscle', side: 'L', muscles, oneOf: ['weak'], ...e });
const spared = (muscles: readonly Muscle[], e: Cite): LimbAssertion => ({ kind: 'muscle', side: 'L', muscles, oneOf: ['normal'], ...e });
const numb = (areas: readonly SkinArea[], e: Cite): LimbAssertion => ({ kind: 'skin', side: 'L', modality: 'all', areas, oneOf: ['lost'], ...e });
const felt = (areas: readonly SkinArea[], e: Cite): LimbAssertion => ({ kind: 'skin', side: 'L', modality: 'all', areas, oneOf: ['intact'], ...e });
const except = <T>(all: readonly T[], ...out: T[]): T[] => all.filter((x) => !out.includes(x));

/** Nothing on the right changes after a lesion of the left limb. */
const rightUntouched: LimbAssertion[] = [
  { kind: 'muscle', side: 'R', muscles: MUSCLES, oneOf: ['normal'], cite: ['S33'], basis: 'composed', note: 'the plexus serves its own side only' },
  { kind: 'skin', side: 'R', modality: 'all', areas: SKIN_AREAS, oneOf: ['intact'], cite: ['S33'], basis: 'composed' },
];

const HAND: readonly Muscle[] = ['thumb_abductor', 'finger_flexor_ulnar', 'interossei'];
const RADIAL_BELOW_GROOVE: readonly Muscle[] = ['brachioradialis', 'wrist_extensors', 'thumb_extensor'];

export const PLEXUS_CASES: readonly LimbCase[] = [
  // ───────────────────────────────────────────────────────────── trunks
  {
    id: 'upper-trunk-left',
    title: 'Left upper trunk',
    pattern: 'Erb palsy',
    lesion: [at('upper_trunk')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['present'], cite: ['S35', 'S33'], basis: 'stated', note: 'A6: the classic posture of Erb palsy' },
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['absent'], cite: ['S35'], basis: 'stated', note: 'A6: winging points beyond the upper trunk' },
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['absent'], cite: ['S35'], basis: 'composed', note: 'A6: the hand muscles are spared' },
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['absent'], cite: ['S35'], basis: 'composed', note: 'A6' },
        weak(['deltoid', 'supraspinatus', 'biceps'], { cite: ['S35', 'S33'], basis: 'stated' }),
        weak(['wrist_extensors'], { cite: ['S35', 'S19'], basis: 'composed', note: 'the waiter’s tip wrist is flexed; wrist extension is C6' }),
        weak(['brachioradialis'], { cite: ['S12', 'S33'], basis: 'composed', note: 'a C5–C6 muscle whose fibres all pass the upper trunk' }),
        spared(['rhomboids', 'serratus_anterior'], { cite: ['S35', 'S37'], basis: 'stated', note: 'winging means the injury reaches beyond the upper trunk' }),
        spared(['triceps'], { cite: ['S35', 'S19'], basis: 'composed', note: 'C7 is involved only in extended Erb palsy' }),
        spared(HAND, { cite: ['S35'], basis: 'stated', note: 'grasp is intact because C8–T1 function is preserved' }),
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['absent'], cite: ['S35'], basis: 'stated' },
        { kind: 'reflex', side: 'L', reflex: 'brachioradialis', oneOf: ['reduced', 'absent'], cite: ['S12', 'S33'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
        numb(['lateral_forearm'], { cite: ['S33'], basis: 'stated', note: 'lateral forearm to the base of the thumb' }),
        numb(['shoulder_badge'], { cite: ['S42', 'S33'], basis: 'composed', note: 'the axillary nerve is C5–C6' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['thumb'], oneOf: ['impaired', 'lost'], cite: ['S33'], basis: 'stated' },
        felt(['little_finger', 'medial_forearm'], { cite: ['S45', 'S21'], basis: 'composed' }),
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S35'], basis: 'stated', note: 'a Horner syndrome points to sympathetic chain involvement' },
        { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S12'], basis: 'composed' },
        { kind: 'bladder', oneOf: ['normal'], cite: ['S20'], basis: 'composed' },
        ...rightUntouched,
      ],
      unasserted: ['dorsal web: no source read gives the roots of the superficial radial territory'],
    }],
  },
  {
    id: 'lower-trunk-left',
    title: 'Left lower trunk',
    pattern: 'Klumpke palsy, postganglionic',
    lesion: [at('lower_trunk')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['present'], cite: ['S33', 'S36'], basis: 'stated', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['present'], cite: ['S33'], basis: 'stated', note: 'A6: S33 names the ape sign in Klumpke paralysis' },
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['absent'], cite: ['S19', 'S34'], basis: 'composed', note: 'A6: the radial wrist extensors are C6' },
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['absent'], cite: ['S34'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['absent'], cite: ['S35', 'S34'], basis: 'composed', note: 'A6' },
        weak(HAND, { cite: ['S33', 'S36'], basis: 'stated', note: 'intrinsic hand muscles weak; claw hand and ape sign' }),
        weak(['finger_flexor_superficial', 'wrist_flexor_ulnar'], { cite: ['S19', 'S31', 'S34'], basis: 'composed', note: 'C8 muscles; the lower trunk carries C8' }),
        weak(['thumb_extensor'], { cite: ['S31', 'S34', 'S40'], basis: 'composed',
          note: 'thumb extension is C8 (S31) and reaches the radial nerve through the posterior division of the lower trunk (S34)' }),
        spared(['deltoid', 'biceps', 'supraspinatus', 'rhomboids', 'serratus_anterior', 'brachioradialis', 'wrist_extensors'], { cite: ['S19', 'S34'], basis: 'composed' }),
        spared(['triceps'], { cite: ['S19'], basis: 'composed', note: 'triceps is C7' }),
        numb(['little_finger', 'medial_forearm'], { cite: ['S36', 'S45'], basis: 'stated', note: 'medial distal limb, C8–T1' }),
        felt(['thumb', 'middle_finger', 'lateral_forearm', 'shoulder_badge'], { cite: ['S21', 'S33'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed',
          note: 'second-order sympathetic neurons leave with T1 and enter the chain before the trunk forms (R13)' },
        ...rightUntouched,
      ],
      unasserted: [
        'triceps reflex: S12 weights it toward C7 without saying what loss of C8 does',
        'dorsal web: roots of the superficial radial territory not stated',
      ],
    }],
  },
  {
    id: 'roots-C8-T1-left',
    title: 'Left C8 and T1 roots',
    pattern: 'Klumpke palsy with a Horner syndrome',
    lesion: [roots(['C8', 'T1'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['present'], cite: ['S33', 'S36'], basis: 'stated', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['present'], cite: ['S33'], basis: 'stated', note: 'A6' },
        weak(HAND, { cite: ['S33', 'S36'], basis: 'stated' }),
        weak(['finger_flexor_superficial', 'wrist_flexor_ulnar', 'thumb_extensor'], { cite: ['S19', 'S31'], basis: 'composed' }),
        spared(['triceps', 'deltoid', 'biceps', 'rhomboids'], { cite: ['S19', 'S37'], basis: 'composed' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['little_finger', 'medial_forearm'], oneOf: ['impaired', 'lost'],
          cite: ['S36', 'S45'], basis: 'stated', note: 'overlap from neighbouring roots may leave some sensation (S21)' },
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S36', 'S16'], basis: 'stated', note: 'the T1 root carries the second-order sympathetic neurons' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S12'], basis: 'composed' },
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },

  // ───────────────────────────────────────────────────────────── roots
  {
    id: 'root-C8-only-left',
    title: 'Left C8 root',
    pattern: 'C8 radiculopathy',
    lesion: [roots(['C8', 'C8'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['finger_flexor_ulnar', 'finger_flexor_superficial'], { cite: ['S19', 'S32'], basis: 'stated', note: 'finger flexors are the C8 key muscles' }),
        weak(['wrist_flexor_ulnar', 'thumb_extensor'], { cite: ['S31'], basis: 'stated', note: 'S31: C8 is wrist flexion and thumb extension' }),
        weak(['thumb_abductor'], { cite: ['S33', 'S36'], basis: 'composed',
          note: 'the ape sign follows C8–T1 injury; that either root alone weakens the thumb abductor is R15' }),
        spared(['triceps', 'deltoid', 'biceps', 'wrist_extensors'], { cite: ['S19'], basis: 'composed' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['little_finger', 'medial_forearm'], oneOf: ['impaired', 'lost'],
          cite: ['S45', 'S21'], basis: 'stated', note: 'the C8 dermatome includes the whole little finger and the medial forearm (S45)' },
        felt(['thumb', 'middle_finger'], { cite: ['S21'], basis: 'composed' }),
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed', note: 'the sympathetic outflow is at T1' },
        // A5
        felt(['lateral_forearm', 'shoulder_badge'], { cite: ['S33', 'S42'], basis: 'composed', note: 'A5: neither nerve carries C8' }),
        spared(['serratus_anterior', 'rhomboids'], { cite: ['S34', 'S37'], basis: 'composed', note: 'A5: C5–C7 nerves' }),
        // A9: S68 gives the interossei C8 and T1, T1 the primary segment (R12).
        { kind: 'muscle', side: 'L', muscles: ['interossei'], oneOf: ['indeterminate'], cite: ['S68'], basis: 'stated',
          note: 'A9: C8 contributes, T1 is primary' },
      ],
      unasserted: [
        'triceps reflex: C8 alone is not described by S12',
      ],
    }],
  },
  {
    id: 'root-C5-only-left',
    title: 'Left C5 root',
    pattern: 'C5 radiculopathy: the root gives branches the trunk does not',
    lesion: [roots(['C5', 'C5'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['rhomboids'], { cite: ['S37', 'S34'], basis: 'stated', note: 'the dorsal scapular nerve comes from the C5 root' }),
        weak(['deltoid', 'biceps'], { cite: ['S19'], basis: 'stated', note: 'the C5 key muscles' }),
        weak(['serratus_anterior', 'supraspinatus'], { cite: ['S34', 'S37'], basis: 'composed', note: 'both nerves carry C5' }),
        spared(['triceps', 'wrist_extensors', ...HAND], { cite: ['S19'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['reduced', 'absent'], cite: ['S12', 'S19'], basis: 'composed' },
        { kind: 'skin', side: 'L', modality: 'all', areas: ['shoulder_badge'], oneOf: ['impaired', 'lost'], cite: ['S42'], basis: 'composed' },
        felt(['little_finger', 'medial_forearm', 'middle_finger'], { cite: ['S21', 'S45'], basis: 'composed' }),
        // A5
        felt(['thumb'], { cite: ['S21'], basis: 'composed', note: 'A5: the thumb is C6' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['lateral_forearm'], oneOf: ['impaired', 'lost'], cite: ['S33'], basis: 'composed',
          note: 'A5: the musculocutaneous nerve carries C5' },
        { kind: 'muscle', side: 'L', muscles: ['brachioradialis'], oneOf: ['indeterminate', 'weak'], cite: ['S12', 'S19'], basis: 'stated',
          note: 'A5: S12 gives its reflex C5–C6, S19 C6 alone (C3)' },
        { kind: 'skin', side: 'L', modality: 'all', areas: ['dorsal_web'], oneOf: ['indeterminate', 'impaired', 'lost'], cite: ['S39', 'S46'], basis: 'composed',
          note: 'A5: its roots are not stated, so it is not asserted intact' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'roots-C5-C6-left',
    title: 'Left C5 and C6 roots',
    pattern: 'upper plexus avulsion: the same roots as Erb palsy, taken proximally',
    lesion: [roots(['C5', 'C6'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['present'], cite: ['S35', 'S33'], basis: 'composed', note: 'A6: the same muscles as Erb palsy' },
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['present'], cite: ['S35', 'S44'], basis: 'composed', note: 'A6: the long thoracic nerve takes C5–C6 from the roots' },
        weak(['deltoid', 'supraspinatus', 'biceps', 'wrist_extensors', 'brachioradialis'], { cite: ['S35', 'S19'], basis: 'composed' }),
        weak(['rhomboids', 'serratus_anterior'], { cite: ['S35', 'S37'], basis: 'stated',
          note: 'winging and rhomboid weakness are what separate the roots from the upper trunk' }),
        spared(['triceps', ...HAND], { cite: ['S19', 'S35'], basis: 'composed' }),
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-C7-only-left',
    title: 'Left C7 root',
    pattern: 'C7 radiculopathy, with the sources that disagree about C7 left open',
    lesion: [roots(['C7', 'C7'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['present', 'indeterminate'], cite: ['S34', 'S37', 'S44'], basis: 'stated', note: 'A6: as C7 to the long thoracic nerve is disputed (C10)' },
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['absent'], cite: ['S19'], basis: 'composed', note: 'A6' },
        weak(['triceps'], { cite: ['S19', 'S31', 'S32'], basis: 'stated' }),
        spared(['deltoid', 'biceps', 'rhomboids', ...HAND], { cite: ['S19', 'S37'], basis: 'composed' }),
        { kind: 'muscle', side: 'L', muscles: ['serratus_anterior'], oneOf: ['weak', 'indeterminate'], cite: ['S34', 'S37', 'S44'], basis: 'stated',
          note: 'S34 and S44 give the long thoracic nerve C7; S37 says "± C7" (C10)' },
        { kind: 'skin', side: 'L', modality: 'all', areas: ['middle_finger'], oneOf: ['impaired', 'lost'], cite: ['S21'], basis: 'stated' },
        { kind: 'skin', side: 'L', modality: 'all', areas: ['lateral_forearm'], oneOf: ['intact', 'indeterminate'], cite: ['S33', 'S43'], basis: 'stated',
          note: 'S33 gives the musculocutaneous nerve C5–C6, S43 C5–C7 (C11)' },
        felt(['thumb', 'little_finger'], { cite: ['S21'], basis: 'composed' }),
        // A5
        spared(['wrist_extensors', 'brachioradialis'], { cite: ['S19'], basis: 'composed', note: 'A5: both are C6' }),
        spared(['thumb_extensor'], { cite: ['S31'], basis: 'composed', note: 'A5: thumb extension is C8' }),
      ],
      unasserted: ['wrist flexion: S32 gives it to C7, S31 to C8 (C9)'],
    }],
  },

  // A5 ─────────────────────────────────────────── the roots not yet examined alone
  {
    id: 'root-C6-only-left',
    title: 'Left C6 root',
    pattern: 'C6 radiculopathy at the arm',
    lesion: [roots(['C6', 'C6'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['wrist_extensors'], { cite: ['S19'], basis: 'stated', note: 'the C6 key muscle' }),
        weak(['biceps'], { cite: ['S31', 'S32'], basis: 'composed', note: 'elbow flexion is C6' }),
        weak(['brachioradialis'], { cite: ['S19', 'S12'], basis: 'composed' }),
        weak(['supraspinatus', 'serratus_anterior'], { cite: ['S34'], basis: 'composed', note: 'both nerves carry C6' }),
        spared(['deltoid'], { cite: ['S19', 'S31'], basis: 'composed', note: 'the deltoid is the C5 key muscle (D29)' }),
        spared(['rhomboids'], { cite: ['S37', 'S34'], basis: 'composed', note: 'the dorsal scapular nerve is C5' }),
        spared(['triceps', ...HAND, 'thumb_extensor'], { cite: ['S19', 'S31'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['reduced', 'absent'], cite: ['S12', 'S19'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'brachioradialis', oneOf: ['reduced', 'absent'], cite: ['S19'], basis: 'stated' },
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S12', 'S19'], basis: 'composed' },
        { kind: 'skin', side: 'L', modality: 'all', areas: ['thumb', 'shoulder_badge', 'lateral_forearm'], oneOf: ['impaired', 'lost'],
          cite: ['S21', 'S42', 'S33'], basis: 'composed' },
        felt(['middle_finger', 'little_finger', 'medial_forearm'], { cite: ['S21', 'S45'], basis: 'composed' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['dorsal_web'], oneOf: ['indeterminate', 'impaired', 'lost'], cite: ['S39', 'S46'], basis: 'composed',
          note: 'A5: its roots are not stated, so it is not asserted intact' },
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-T1-only-left',
    title: 'Left T1 root, examined at the arm',
    pattern: 'T1 radiculopathy: interossei and a Horner syndrome',
    lesion: [roots(['T1', 'T1'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['present'], cite: ['S19', 'S38'], basis: 'composed', note: 'A6: the interossei are the T1 key muscles' },
        weak(['interossei'], { cite: ['S19', 'S31'], basis: 'stated', note: 'the T1 key muscle' }),
        weak(['thumb_abductor'], { cite: ['S33'], basis: 'composed', note: 'R15' }),
        spared(['finger_flexor_ulnar', 'finger_flexor_superficial'], { cite: ['S19', 'S32'], basis: 'composed', note: 'finger flexion is C8' }),
        spared(['wrist_flexor_ulnar', 'thumb_extensor'], { cite: ['S31'], basis: 'composed', note: 'C8 movements in S31' }),
        spared(['triceps', 'deltoid', 'biceps', 'serratus_anterior'], { cite: ['S19', 'S34'], basis: 'composed' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['medial_forearm'], oneOf: ['impaired', 'lost'], cite: ['S21', 'S45'], basis: 'stated' },
        felt(['little_finger', 'middle_finger', 'thumb', 'lateral_forearm'], { cite: ['S21', 'S33'], basis: 'composed' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['dorsal_web'], oneOf: ['indeterminate', 'impaired', 'lost'], cite: ['S39', 'S46'], basis: 'composed',
          note: 'A5: its roots are not stated, so it is not asserted intact' },
        { kind: 'horner', side: 'L', oneOf: ['present'], cite: ['S16', 'S36'], basis: 'stated' },
        { kind: 'horner', side: 'R', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'dorsal-scapular-left',
    title: 'Left dorsal scapular nerve',
    pattern: 'rhomboid weakness alone',
    lesion: [at('dorsal_scapular')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['rhomboids'], { cite: ['S34', 'S37'], basis: 'composed' }),
        spared(except(MUSCLES, 'rhomboids'), { cite: ['S34'], basis: 'composed' }),
        felt(SKIN_AREAS, { cite: ['S34'], basis: 'composed', note: 'S34 gives it muscles only' }),
      ],
      unasserted: ['winging from rhomboid weakness: no source read describes it — A6'],
    }],
  },
  {
    id: 'suprascapular-left',
    title: 'Left suprascapular nerve',
    pattern: 'weak shoulder abduction and external rotation with the deltoid spared',
    lesion: [at('suprascapular')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['absent'], cite: ['S33'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['absent'], cite: ['S34'], basis: 'composed', note: 'A6' },
        weak(['supraspinatus'], { cite: ['S34', 'S37'], basis: 'composed' }),
        spared(except(MUSCLES, 'supraspinatus'), { cite: ['S34', 'S42'], basis: 'composed' }),
        felt(SKIN_AREAS, { cite: ['S34'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },

  // ───────────────────────────────────────────────────────────── cords
  {
    id: 'posterior-cord-left',
    title: 'Left posterior cord',
    pattern: 'axillary and radial nerves together',
    lesion: [at('posterior_cord')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['present'], cite: ['S39', 'S37'], basis: 'composed', note: 'A6: the whole radial nerve' },
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['absent'], cite: ['S37'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['absent'], cite: ['S33'], basis: 'composed', note: 'A6: the suprascapular and musculocutaneous nerves are spared' },
        weak(['deltoid'], { cite: ['S42', 'S37'], basis: 'composed', note: 'the axillary nerve leaves the posterior cord' }),
        weak(['triceps', ...RADIAL_BELOW_GROOVE], { cite: ['S37', 'S39', 'S40'], basis: 'composed', note: 'the whole radial nerve' }),
        spared(['biceps', 'supraspinatus', 'rhomboids', 'serratus_anterior', ...HAND, 'finger_flexor_superficial'], { cite: ['S37'], basis: 'composed' }),
        numb(['shoulder_badge', 'dorsal_web'], { cite: ['S42', 'S39'], basis: 'composed' }),
        felt(['lateral_forearm', 'little_finger', 'medial_forearm', 'middle_finger'], { cite: ['S37', 'S45'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['reduced', 'absent'], cite: ['S12', 'S40'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['normal'], cite: ['S12', 'S43'], basis: 'composed' },
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'medial-cord-left',
    title: 'Left medial cord',
    pattern: 'like a lower trunk lesion, but the radial nerve is spared',
    lesion: [at('medial_cord')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['present'], cite: ['S38', 'S37'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['present'], cite: ['S41', 'S37'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['absent'], cite: ['S37'], basis: 'composed', note: 'A6' },
        weak([...HAND, 'wrist_flexor_ulnar', 'finger_flexor_superficial'], { cite: ['S37', 'S38', 'S41'], basis: 'composed',
          note: 'ulnar nerve, and the medial-cord contribution to the median nerve' }),
        spared(['thumb_extensor'], { cite: ['S34', 'S40'], basis: 'composed',
          note: 'its C8 fibres run in the posterior division, which the medial cord does not contain' }),
        spared(['triceps', 'deltoid', 'biceps', 'wrist_extensors'], { cite: ['S37'], basis: 'composed' }),
        numb(['little_finger', 'medial_forearm'], { cite: ['S37', 'S45', 'S38'], basis: 'composed' }),
        felt(['dorsal_web', 'shoulder_badge', 'lateral_forearm'], { cite: ['S37'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S12', 'S40'], basis: 'composed' },
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },

  // ───────────────────────────────────────────────────────────── nerves
  {
    id: 'ulnar-elbow-left',
    title: 'Left ulnar nerve at the elbow',
    pattern: 'cubital tunnel: claw hand without medial forearm loss',
    lesion: [at('ulnar_elbow')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['present'], cite: ['S38'], basis: 'stated', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['absent'], cite: ['S38'], basis: 'stated', note: 'A6: the median nerve keeps the thenar eminence' },
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['absent'], cite: ['S38'], basis: 'composed', note: 'A6' },
        weak(['finger_flexor_ulnar', 'interossei'], { cite: ['S38'], basis: 'stated' }),
        weak(['wrist_flexor_ulnar'], { cite: ['S38'], basis: 'composed', note: 'modelled as supplied below the elbow site (R17)' }),
        spared(['thumb_abductor'], { cite: ['S38'], basis: 'stated', note: 'the median nerve supplies abductor pollicis' }),
        spared(['finger_flexor_superficial'], { cite: ['S41'], basis: 'stated', note: 'FDS is median' }),
        spared(['thumb_extensor', 'triceps', 'biceps', 'deltoid'], { cite: ['S36'], basis: 'stated',
          note: 'true ulnar entrapment involves nothing supplied proximal to it' }),
        numb(['little_finger'], { cite: ['S38'], basis: 'stated' }),
        felt(['medial_forearm'], { cite: ['S38', 'S45'], basis: 'stated', note: 'the medial forearm is the medial antebrachial cutaneous nerve' }),
        felt(['thumb', 'middle_finger'], { cite: ['S41'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
        { kind: 'horner', side: 'L', oneOf: ['absent'], cite: ['S16'], basis: 'composed' },
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'ulnar-wrist-left',
    title: 'Left ulnar nerve at the wrist',
    pattern: 'Guyon canal: the long flexor is spared',
    lesion: [at('ulnar_wrist')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['present'], cite: ['S38'], basis: 'composed', note: 'A6: the intrinsic muscles are supplied beyond the canal' },
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['absent'], cite: ['S38'], basis: 'composed', note: 'A6' },
        weak(['interossei'], { cite: ['S38'], basis: 'stated' }),
        spared(['finger_flexor_ulnar', 'wrist_flexor_ulnar'], { cite: ['S38', 'S36'], basis: 'composed', note: 'supplied in the forearm, above the canal' }),
        felt(['medial_forearm'], { cite: ['S38'], basis: 'stated' }),
      ],
      unasserted: ['little finger: S38 gives motor-only, sensory-only and mixed zones inside the canal'],
    }],
  },
  {
    id: 'radial-spiral-groove-left',
    title: 'Left radial nerve at the spiral groove',
    pattern: 'wrist drop with triceps spared',
    lesion: [at('radial_spiral_groove')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['present'], cite: ['S39', 'S40'], basis: 'stated', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['absent'], cite: ['S39'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['absent'], cite: ['S39'], basis: 'composed', note: 'A6' },
        weak(RADIAL_BELOW_GROOVE, { cite: ['S39'], basis: 'stated' }),
        spared(['triceps'], { cite: ['S39'], basis: 'stated' }),
        spared(['deltoid', 'biceps', ...HAND], { cite: ['S39', 'S37'], basis: 'composed' }),
        numb(['dorsal_web'], { cite: ['S39'], basis: 'stated', note: 'the dorsum of the hand' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['thumb'], oneOf: ['impaired'], cite: ['S46', 'S41'], basis: 'composed',
          note: 'the radial side of the thumb is lost; the median palmar thumb is kept' },
        felt(['little_finger', 'middle_finger', 'shoulder_badge'], { cite: ['S38', 'S41', 'S42'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['normal'], cite: ['S39', 'S12'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'brachioradialis', oneOf: ['reduced', 'absent'], cite: ['S39', 'S12'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['normal'], cite: ['S12'], basis: 'composed' },
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'radial-axilla-left',
    title: 'Left radial nerve in the axilla',
    pattern: 'wrist drop with triceps weak',
    lesion: [at('radial_axilla')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['present'], cite: ['S39', 'S40'], basis: 'stated', note: 'A6' },
        weak(['triceps', ...RADIAL_BELOW_GROOVE], { cite: ['S39'], basis: 'stated' }),
        spared(['deltoid'], { cite: ['S42', 'S37'], basis: 'composed', note: 'the axillary nerve leaves the posterior cord separately' }),
        numb(['dorsal_web'], { cite: ['S39'], basis: 'stated' }),
        { kind: 'reflex', side: 'L', reflex: 'triceps', oneOf: ['reduced', 'absent'], cite: ['S39', 'S12'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'posterior-interosseous-left',
    title: 'Left posterior interosseous nerve',
    pattern: 'finger drop without wrist drop or numbness',
    lesion: [at('posterior_interosseous')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['thumb_extensor'], { cite: ['S39', 'S40'], basis: 'stated' }),
        spared(['wrist_extensors', 'brachioradialis', 'triceps'], { cite: ['S40'], basis: 'stated',
          note: 'the radial nerve proper supplies ECRL and brachioradialis before the branch (C14)' }),
        felt(['dorsal_web'], { cite: ['S39'], basis: 'stated', note: 'the branch carries no sensory fibres' }),
        felt(['thumb'], { cite: ['S39'], basis: 'stated', note: 'A5: no sensory deficit' }),
      ],
      unasserted: ['wrist drop: S39 spares the wrist, S40 describes a partial wrist drop (C14) — A6'],
    }],
  },
  {
    id: 'median-wrist-left',
    title: 'Left median nerve at the wrist',
    pattern: 'carpal tunnel',
    lesion: [at('median_wrist')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['present'], cite: ['S41'], basis: 'stated', note: 'A6: low median lesion' },
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['absent'], cite: ['S38'], basis: 'composed', note: 'A6' },
        weak(['thumb_abductor'], { cite: ['S41', 'S38'], basis: 'stated', note: 'low median lesion: ape hand' }),
        spared(['finger_flexor_superficial'], { cite: ['S41'], basis: 'composed', note: 'PIP flexion is weak only in high lesions' }),
        spared(['finger_flexor_ulnar', 'interossei'], { cite: ['S38'], basis: 'composed' }),
        numb(['middle_finger'], { cite: ['S41'], basis: 'stated' }),
        { kind: 'skin', side: 'L', modality: 'all', areas: ['thumb'], oneOf: ['impaired'], cite: ['S41', 'S46'], basis: 'composed',
          note: 'palmar thumb lost, radial side kept' },
        felt(['little_finger', 'medial_forearm', 'dorsal_web'], { cite: ['S38', 'S39'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'median-elbow-left',
    title: 'Left median nerve at the elbow',
    pattern: 'high median lesion',
    lesion: [at('median_elbow')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'ape_hand', oneOf: ['present'], cite: ['S41'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'claw_hand', oneOf: ['absent'], cite: ['S38'], basis: 'composed', note: 'A6' },
        weak(['finger_flexor_superficial'], { cite: ['S41'], basis: 'stated' }),
        weak(['thumb_abductor'], { cite: ['S41'], basis: 'composed' }),
        spared(['finger_flexor_ulnar', 'interossei', 'wrist_flexor_ulnar'], { cite: ['S38'], basis: 'composed' }),
        numb(['middle_finger'], { cite: ['S41'], basis: 'stated' }),
        felt(['little_finger', 'medial_forearm'], { cite: ['S38'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'axillary-left',
    title: 'Left axillary nerve',
    pattern: 'after shoulder dislocation',
    lesion: [at('axillary')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['absent'], cite: ['S33'], basis: 'composed', note: 'A6: the posture needs the suprascapular and musculocutaneous nerves too' },
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['absent'], cite: ['S42'], basis: 'composed', note: 'A6' },
        weak(['deltoid'], { cite: ['S42'], basis: 'stated' }),
        spared(except(MUSCLES, 'deltoid'), { cite: ['S42'], basis: 'composed' }),
        numb(['shoulder_badge'], { cite: ['S42'], basis: 'stated' }),
        felt(except(SKIN_AREAS, 'shoulder_badge'), { cite: ['S42'], basis: 'composed' }),
      ],
      unasserted: [],
    }],
  },
  {
    id: 'musculocutaneous-left',
    title: 'Left musculocutaneous nerve',
    pattern: 'weak elbow flexion with lateral forearm numbness',
    lesion: [at('musculocutaneous')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['absent'], cite: ['S33'], basis: 'composed', note: 'A6' },
        weak(['biceps'], { cite: ['S43'], basis: 'stated' }),
        spared(['brachioradialis', 'deltoid', 'wrist_extensors'], { cite: ['S40', 'S42'], basis: 'composed' }),
        numb(['lateral_forearm'], { cite: ['S43'], basis: 'stated' }),
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['reduced', 'absent'], cite: ['S12', 'S43'], basis: 'composed' },
        { kind: 'reflex', side: 'L', reflex: 'brachioradialis', oneOf: ['normal'], cite: ['S40'], basis: 'composed' },
      ],
      unasserted: [],
    }],
  },
  {
    id: 'long-thoracic-left',
    title: 'Left long thoracic nerve',
    pattern: 'winged scapula',
    lesion: [at('long_thoracic')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'deformity', side: 'L', deformity: 'winged_scapula', oneOf: ['present'], cite: ['S44'], basis: 'stated', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'waiters_tip', oneOf: ['absent'], cite: ['S44'], basis: 'composed', note: 'A6' },
        { kind: 'deformity', side: 'L', deformity: 'wrist_drop', oneOf: ['absent'], cite: ['S44'], basis: 'composed', note: 'A6' },
        weak(['serratus_anterior'], { cite: ['S44', 'S34'], basis: 'stated', note: 'medial winging' }),
        spared(except(MUSCLES, 'serratus_anterior'), { cite: ['S44'], basis: 'composed' }),
        felt(SKIN_AREAS, { cite: ['S44'], basis: 'composed', note: 'a motor nerve' }),
      ],
      unasserted: [],
    }],
  },

  // ─────────────────────────────────────────── the cord, seen through the limb
  {
    id: 'hemicord-C4-limb',
    title: 'Left hemicord at C4, examined at the arm',
    pattern: 'Brown-Séquard above the plexus',
    lesion: [{ at: { segments: ['C4', 'C4'] }, sides: ['L'], compartments: ['dorsal_column', 'lateral_cst', 'anterolateral', 'anterior_horn', 'dorsal_horn', 'commissure', 'intermediolateral', 'descending_autonomic'], severity: 'complete', portion: 'whole' }],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        { kind: 'muscle', side: 'L', muscles: MUSCLES, oneOf: ['weak'], cite: ['S01'], basis: 'composed', note: 'upper-motor-neuron weakness below the lesion' },
        { kind: 'muscle', side: 'R', muscles: MUSCLES, oneOf: ['normal'], cite: ['S01'], basis: 'composed' },
        { kind: 'skin', side: 'L', modality: 'posterior_column', areas: ['thumb', 'middle_finger', 'little_finger', 'medial_forearm'], oneOf: ['lost'],
          cite: ['S01'], basis: 'stated' },
        { kind: 'skin', side: 'R', modality: 'pain_temperature', areas: ['middle_finger', 'little_finger', 'medial_forearm'], oneOf: ['lost'],
          cite: ['S01', 'S11'], basis: 'composed', note: 'C7 and below cross at C4 or lower, so every crossing passes the lesion' },
        { kind: 'skin', side: 'R', modality: 'pain_temperature', areas: ['thumb'], oneOf: ['lost', 'indeterminate'],
          cite: ['S01', 'S11'], basis: 'composed', note: 'a C6 fibre crossing three segments up reaches C3, above the lesion (D2)' },
        { kind: 'skin', side: 'R', modality: 'posterior_column', areas: SKIN_AREAS, oneOf: ['intact'], cite: ['S01'], basis: 'stated' },
        { kind: 'reflex', side: 'L', reflex: 'biceps', oneOf: ['brisk'], cite: ['S12'], basis: 'composed' },
      ],
      unasserted: [
        'deformities: no source read describes them after upper-motor-neuron weakness — A6','left pain and temperature near the lesion: fibres ascend 1–3 segments before crossing (D2)'],
    }],
  },
];
