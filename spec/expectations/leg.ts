// Amendment A10. Frozen expected outputs for the lower limb, written from the sources in
// docs/P7-analysis.md (S71–S90, with S12, S21, S31) before any lower-limb code existed.
//
// Reading guide. A `muscle` names the muscle that stands for a movement: `toe_extensor` is
// extensor hallucis longus (great toe extension), `fibularis` is fibularis longus (ankle
// eversion), `hip_adductors` the obturator adductors. `skin` names a patch: `medial_leg`
// runs down to the medial malleolus, `first_web` is the dorsal first web space, `lateral_foot`
// is the sural territory. 'stated' means a source says it of this lesion; 'composed' means
// it follows from where the sources put the branch or the root.
import type { Compartment, Deformity, Muscle, SkinArea } from '../../src/kb/vocab.ts';
import { LEG_MUSCLES, LEG_SKIN } from '../../src/kb/vocab.ts';
import type { Assertion, LesionRegion, LimbAssertion, LimbCase, PlexusRegion, Span } from './types.ts';

const ROOTS: readonly Compartment[] = ['dorsal_root', 'ventral_root'];
const roots = (span: Span): LesionRegion => ({
  at: { segments: span }, sides: ['L'], compartments: ROOTS, severity: 'complete', portion: 'whole',
});
const at = (site: PlexusRegion['plexus']): PlexusRegion => ({ plexus: site, sides: ['L'], severity: 'complete' });

type Cite = Pick<LimbAssertion, 'cite' | 'basis'> & { readonly note?: string };
const muscles = (list: readonly Muscle[], oneOf: LimbAssertion['oneOf'], e: Cite): LimbAssertion =>
  ({ kind: 'muscle', side: 'L', muscles: list, oneOf, ...e }) as LimbAssertion;
const weak = (list: readonly Muscle[], e: Cite): LimbAssertion => muscles(list, ['weak'], e);
const spared = (list: readonly Muscle[], e: Cite): LimbAssertion => muscles(list, ['normal'], e);
const open = (list: readonly Muscle[], e: Cite): LimbAssertion => muscles(list, ['indeterminate'], e);
const skin = (areas: readonly SkinArea[], oneOf: readonly ('lost' | 'impaired' | 'intact' | 'indeterminate')[], e: Cite): LimbAssertion =>
  ({ kind: 'skin', side: 'L', modality: 'all', areas, oneOf, ...e });
const sign = (deformity: Deformity, present: boolean, e: Cite): LimbAssertion =>
  ({ kind: 'deformity', side: 'L', deformity, oneOf: [present ? 'present' : 'absent'], ...e });
const reflex = (r: 'patellar' | 'achilles', oneOf: readonly ('normal' | 'reduced' | 'absent')[], e: Cite): Assertion =>
  ({ kind: 'reflex', side: 'L', reflex: r, oneOf, ...e });
const except = <T>(all: readonly T[], ...out: T[]): T[] => all.filter((x) => !out.includes(x));

/** Nothing on the right changes, and no long tract is touched. */
const rightUntouched: (Assertion | LimbAssertion)[] = [
  { kind: 'muscle', side: 'R', muscles: LEG_MUSCLES, oneOf: ['normal'], cite: ['S72'], basis: 'composed', note: 'the plexus serves its own side only' },
  { kind: 'skin', side: 'R', modality: 'all', areas: LEG_SKIN, oneOf: ['intact'], cite: ['S72'], basis: 'composed' },
  { kind: 'babinski', side: 'both', oneOf: ['absent'], cite: ['S12'], basis: 'composed', note: 'a lower-motor-neuron lesion' },
];

export const LEG_CASES: readonly LimbCase[] = [
  // ───────────────────────────────────────────────────── the foot-drop differential
  {
    id: 'common-fibular-left',
    title: 'Left common fibular nerve at the fibular neck',
    pattern: 'foot drop with inversion and hip abduction spared',
    lesion: [at('common_fibular')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('foot_drop', true, { cite: ['S77', 'S78'], basis: 'stated' }),
        sign('trendelenburg', false, { cite: ['S83'], basis: 'composed', note: 'gluteus medius has no fibular supply' }),
        weak(['tibialis_anterior', 'toe_extensor'], { cite: ['S77', 'S76'], basis: 'stated', note: 'the deep branch' }),
        weak(['fibularis'], { cite: ['S77', 'S76'], basis: 'stated', note: 'the superficial branch: eversion' }),
        spared(['tibialis_posterior', 'gluteus_medius'], { cite: ['S83'], basis: 'stated', note: 'L5 muscles with no fibular supply' }),
        spared(['gastrocnemius'], { cite: ['S79'], basis: 'composed', note: 'tibial' }),
        spared(['hamstrings'], { cite: ['S75'], basis: 'composed', note: 'supplied by the sciatic above the division' }),
        spared(['quadriceps', 'iliopsoas', 'hip_adductors', 'gluteus_maximus'], { cite: ['S71', 'S81'], basis: 'composed' }),
        skin(['dorsum_foot', 'first_web', 'lateral_leg'], ['lost'], { cite: ['S77', 'S76'], basis: 'stated' }),
        skin(['lateral_foot'], ['impaired', 'intact'], { cite: ['S87', 'S77'], basis: 'composed',
          note: 'C23: the sural nerve takes a branch from each nerve; S77 does not list the lateral foot' }),
        skin(['medial_leg', 'sole', 'anterior_thigh', 'medial_thigh', 'lateral_thigh'], ['intact'], { cite: ['S86', 'S79', 'S89', 'S74'], basis: 'composed' }),
        reflex('patellar', ['normal'], { cite: ['S82'], basis: 'composed' }),
        reflex('achilles', ['normal'], { cite: ['S82'], basis: 'composed', note: 'the tibial nerve carries it' }),
        ...rightUntouched,
      ],
      unasserted: ['separate deep and superficial fibular lesions: not modelled'],
    }],
  },
  {
    id: 'root-L5-leg-left',
    title: 'Left L5 root, examined at the leg',
    pattern: 'L5 radiculopathy: foot drop with weak inversion and hip abduction',
    lesion: [roots(['L5', 'L5'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('foot_drop', true, { cite: ['S88'], basis: 'stated' }),
        sign('trendelenburg', true, { cite: ['S80', 'S83'], basis: 'composed', note: 'gluteus medius has L5 innervation' }),
        weak(['tibialis_anterior', 'toe_extensor'], { cite: ['S82'], basis: 'stated' }),
        weak(['fibularis'], { cite: ['S78'], basis: 'stated', note: 'L5 radiculopathy weakens the evertors' }),
        weak(['tibialis_posterior', 'gluteus_medius'], { cite: ['S83'], basis: 'stated' }),
        spared(['gastrocnemius'], { cite: ['S82'], basis: 'composed', note: 'S1' }),
        spared(['quadriceps', 'iliopsoas', 'hip_adductors'], { cite: ['S82', 'S31', 'S71'], basis: 'composed' }),
        open(['hamstrings'], { cite: ['S82'], basis: 'composed', note: 'C25: the medial hamstring reflex is L5' }),
        open(['gluteus_maximus'], { cite: ['S81'], basis: 'composed', note: 'its nerve carries L5, S1 and S2; no myotome source gives its roots' }),
        skin(['dorsum_foot'], ['impaired'], { cite: ['S82', 'S21'], basis: 'stated', note: 'one root: reduced, not absent (R2)' }),
        skin(['first_web'], ['impaired'], { cite: ['S78'], basis: 'stated' }),
        skin(['medial_leg', 'lateral_foot'], ['intact'], { cite: ['S82'], basis: 'composed', note: 'L4 and S1' }),
        skin(['sole', 'lateral_leg'], ['indeterminate'], { cite: ['S79', 'S76'], basis: 'composed', note: 'A12: the tibial nerve carries L4–S3 and the common fibular L4–S2; no source gives either patch its roots' }),
        reflex('patellar', ['normal'], { cite: ['S82'], basis: 'composed' }),
        reflex('achilles', ['normal'], { cite: ['S82'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: ['the medial hamstring reflex: not modelled'],
    }],
  },
  {
    id: 'sciatic-left',
    title: 'Left sciatic nerve in the buttock',
    pattern: 'flail foot with the gluteal muscles spared',
    lesion: [at('sciatic')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        sign('foot_drop', true, { cite: ['S78'], basis: 'stated', note: 'flail foot' }),
        sign('trendelenburg', false, { cite: ['S78', 'S80'], basis: 'composed' }),
        weak(['hamstrings', 'gastrocnemius', 'tibialis_posterior'], { cite: ['S78', 'S75'], basis: 'stated' }),
        weak(['tibialis_anterior', 'toe_extensor', 'fibularis'], { cite: ['S75', 'S76'], basis: 'composed', note: 'the common fibular division' }),
        spared(['gluteus_medius', 'gluteus_maximus'], { cite: ['S78'], basis: 'stated', note: 'their weakness points to the plexus instead' }),
        spared(['quadriceps', 'hip_adductors', 'iliopsoas'], { cite: ['S71'], basis: 'composed' }),
        skin(['dorsum_foot', 'first_web', 'sole', 'lateral_foot', 'lateral_leg'], ['lost'], { cite: ['S78'], basis: 'stated', note: 'the entire foot' }),
        skin(['medial_leg', 'anterior_thigh', 'lateral_thigh'], ['intact'], { cite: ['S86', 'S89', 'S74'], basis: 'composed', note: 'the saphenous nerve is femoral' }),
        reflex('achilles', ['reduced', 'absent'], { cite: ['S79', 'S82'], basis: 'composed' }),
        reflex('patellar', ['normal'], { cite: ['S89'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: ['the short head of biceps femoris: not modelled'],
    }],
  },
  {
    id: 'sacral-plexus-left',
    title: 'Left sacral plexus',
    pattern: 'sciatic deficits with the gluteal muscles weak',
    lesion: [at('sacral_plexus')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['gluteus_medius', 'gluteus_maximus'], { cite: ['S78'], basis: 'stated' }),
        sign('trendelenburg', true, { cite: ['S80', 'S78'], basis: 'composed' }),
        sign('foot_drop', true, { cite: ['S78'], basis: 'composed' }),
        weak(['hamstrings', 'gastrocnemius', 'tibialis_posterior', 'tibialis_anterior', 'toe_extensor', 'fibularis'], { cite: ['S78', 'S75'], basis: 'composed' }),
        spared(['quadriceps', 'hip_adductors', 'iliopsoas'], { cite: ['S72'], basis: 'composed', note: 'the lumbar plexus' }),
        skin(['dorsum_foot'], ['lost'], { cite: ['S72'], basis: 'stated' }),
        skin(['sole', 'lateral_foot', 'first_web'], ['lost'], { cite: ['S78'], basis: 'composed' }),
        skin(['medial_leg', 'anterior_thigh', 'medial_thigh', 'lateral_thigh'], ['intact'], { cite: ['S72'], basis: 'composed', note: 'lumbar plexus territory' }),
        reflex('achilles', ['reduced', 'absent'], { cite: ['S82'], basis: 'composed' }),
        reflex('patellar', ['normal'], { cite: ['S72'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: ['the posterior thigh and perineum: the posterior femoral cutaneous and pudendal nerves are not modelled'],
    }],
  },
  {
    id: 'tibial-left',
    title: 'Left tibial nerve below the division',
    pattern: 'weak plantar flexion and inversion, numb sole',
    lesion: [at('tibial')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['gastrocnemius', 'tibialis_posterior'], { cite: ['S79', 'S84'], basis: 'stated' }),
        spared(['tibialis_anterior', 'toe_extensor', 'fibularis'], { cite: ['S76'], basis: 'composed' }),
        spared(['hamstrings'], { cite: ['S75'], basis: 'composed', note: 'supplied above the division' }),
        sign('foot_drop', false, { cite: ['S76'], basis: 'composed' }),
        skin(['sole'], ['lost'], { cite: ['S79'], basis: 'stated' }),
        skin(['lateral_foot'], ['impaired'], { cite: ['S87'], basis: 'composed', note: 'one of the sural nerve’s two contributors' }),
        skin(['dorsum_foot', 'first_web', 'medial_leg'], ['intact'], { cite: ['S77', 'S86'], basis: 'composed' }),
        reflex('achilles', ['reduced', 'absent'], { cite: ['S82', 'S79'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: ['the tarsal tunnel: not modelled'],
    }],
  },

  // ───────────────────────────────────────────────────── the thigh
  {
    id: 'femoral-left',
    title: 'Left femoral nerve in the pelvis',
    pattern: 'weak knee extension with hip adduction spared',
    lesion: [at('femoral')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['quadriceps'], { cite: ['S89'], basis: 'stated' }),
        open(['iliopsoas'], { cite: ['S89'], basis: 'stated', note: 'hip flexion weak "to a lesser extent": the psoas is spared' }),
        spared(['hip_adductors'], { cite: ['S73'], basis: 'composed', note: 'obturator' }),
        spared(except(LEG_MUSCLES, 'quadriceps', 'iliopsoas', 'hip_adductors'), { cite: ['S72'], basis: 'composed' }),
        reflex('patellar', ['reduced', 'absent'], { cite: ['S89'], basis: 'stated' }),
        reflex('achilles', ['normal'], { cite: ['S82'], basis: 'composed' }),
        skin(['anterior_thigh', 'medial_leg'], ['lost'], { cite: ['S89'], basis: 'stated' }),
        skin(['medial_thigh'], ['indeterminate'], { cite: ['S89', 'S73'], basis: 'composed', note: 'C22: the obturator nerve also supplies it' }),
        skin(['lateral_thigh', 'dorsum_foot', 'sole', 'lateral_foot'], ['intact'], { cite: ['S74', 'S77', 'S79'], basis: 'composed' }),
        sign('foot_drop', false, { cite: ['S76'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: ['a femoral lesion at the inguinal ligament: not modelled (C24)'],
    }],
  },
  {
    id: 'root-L4-leg-left',
    title: 'Left L4 root, examined at the leg',
    pattern: 'L4 radiculopathy: weak knee extension, reduced knee jerk, numb medial leg',
    lesion: [roots(['L4', 'L4'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['quadriceps'], { cite: ['S82'], basis: 'stated' }),
        reflex('patellar', ['reduced'], { cite: ['S82', 'S88'], basis: 'stated' }),
        skin(['medial_leg'], ['impaired'], { cite: ['S82', 'S88'], basis: 'stated' }),
        weak(['tibialis_anterior'], { cite: ['S31'], basis: 'composed', note: 'C20: S31 gives ankle dorsiflexion to L4' }),
        sign('foot_drop', true, { cite: ['S31'], basis: 'composed', note: 'C20' }),
        open(['hip_adductors'], { cite: ['S71'], basis: 'composed', note: 'the obturator carries L2–L4; no myotome source gives their roots' }),
        spared(['iliopsoas'], { cite: ['S31'], basis: 'composed', note: 'hip flexion is L1–L2' }),
        spared(['toe_extensor', 'gastrocnemius', 'tibialis_posterior', 'gluteus_medius', 'fibularis'], { cite: ['S82', 'S83', 'S78'], basis: 'composed' }),
        reflex('achilles', ['normal'], { cite: ['S82'], basis: 'composed' }),
        skin(['dorsum_foot', 'lateral_foot'], ['intact'], { cite: ['S82'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'obturator-left',
    title: 'Left obturator nerve',
    pattern: 'weak hip adduction alone',
    lesion: [at('obturator')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['hip_adductors'], { cite: ['S71', 'S73'], basis: 'stated' }),
        spared(except(LEG_MUSCLES, 'hip_adductors'), { cite: ['S71'], basis: 'composed' }),
        skin(['medial_thigh'], ['indeterminate'], { cite: ['S73', 'S89'], basis: 'composed', note: 'C22: the femoral nerve also supplies it' }),
        skin(['anterior_thigh', 'lateral_thigh', 'medial_leg'], ['intact'], { cite: ['S89', 'S74'], basis: 'composed' }),
        reflex('patellar', ['normal'], { cite: ['S89'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'lateral-femoral-cutaneous-left',
    title: 'Left lateral femoral cutaneous nerve',
    pattern: 'meralgia paresthetica: numb lateral thigh, nothing weak',
    lesion: [at('lateral_femoral_cutaneous')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        skin(['lateral_thigh'], ['lost'], { cite: ['S74'], basis: 'stated' }),
        spared(LEG_MUSCLES, { cite: ['S74'], basis: 'stated', note: 'purely sensory' }),
        reflex('patellar', ['normal'], { cite: ['S74'], basis: 'stated', note: 'no reflex function' }),
        skin(except(LEG_SKIN, 'lateral_thigh'), ['intact'], { cite: ['S74'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'lumbar-plexus-left',
    title: 'Left lumbar plexus',
    pattern: 'weak hip flexion, knee extension and adduction; numb thigh and medial leg',
    lesion: [at('lumbar_plexus')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['iliopsoas', 'quadriceps', 'hip_adductors'], { cite: ['S72'], basis: 'stated' }),
        skin(['anterior_thigh', 'medial_thigh', 'medial_leg'], ['lost'], { cite: ['S72'], basis: 'stated' }),
        skin(['lateral_thigh'], ['lost'], { cite: ['S74', 'S72'], basis: 'composed' }),
        spared(['tibialis_anterior', 'toe_extensor', 'fibularis', 'tibialis_posterior', 'gastrocnemius', 'hamstrings', 'gluteus_medius', 'gluteus_maximus'],
          { cite: ['S72'], basis: 'composed', note: 'the sacral plexus carries L4 and L5 to these' }),
        sign('foot_drop', false, { cite: ['S72'], basis: 'composed' }),
        sign('trendelenburg', false, { cite: ['S80'], basis: 'composed' }),
        skin(['dorsum_foot', 'sole', 'lateral_foot'], ['intact'], { cite: ['S72'], basis: 'composed' }),
        reflex('patellar', ['reduced', 'absent'], { cite: ['S89'], basis: 'composed' }),
        reflex('achilles', ['normal'], { cite: ['S82'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: ['the iliohypogastric, ilioinguinal and genitofemoral nerves: not modelled'],
    }],
  },

  // ───────────────────────────────────────────────────── the hip and the S1 root
  {
    id: 'superior-gluteal-left',
    title: 'Left superior gluteal nerve',
    pattern: 'Trendelenburg gait',
    lesion: [at('superior_gluteal')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['gluteus_medius'], { cite: ['S80'], basis: 'stated' }),
        sign('trendelenburg', true, { cite: ['S80'], basis: 'stated' }),
        spared(except(LEG_MUSCLES, 'gluteus_medius'), { cite: ['S80', 'S81'], basis: 'composed' }),
        skin(LEG_SKIN, ['intact'], { cite: ['S80'], basis: 'composed', note: 'a motor nerve' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'inferior-gluteal-left',
    title: 'Left inferior gluteal nerve',
    pattern: 'weak hip extension alone',
    lesion: [at('inferior_gluteal')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['gluteus_maximus'], { cite: ['S81'], basis: 'stated' }),
        spared(except(LEG_MUSCLES, 'gluteus_maximus'), { cite: ['S81', 'S80'], basis: 'composed' }),
        sign('trendelenburg', false, { cite: ['S80'], basis: 'composed' }),
        skin(LEG_SKIN, ['intact'], { cite: ['S81'], basis: 'composed', note: 'a motor nerve' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },

  // ───────────────────────────────── A12: one case per root, to pin what each root serves
  {
    id: 'root-L1-leg-left',
    title: 'Left L1 root, examined at the leg',
    pattern: 'the upper end of hip flexion',
    lesion: [roots(['L1', 'L1'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['iliopsoas'], { cite: ['S31'], basis: 'stated', note: 'A12: S31 gives hip flexion to L1 and L2' }),
        spared(['quadriceps'], { cite: ['S31'], basis: 'composed', note: 'knee extension is L3' }),
        skin(['lateral_thigh'], ['intact'], { cite: ['S74'], basis: 'composed', note: 'the lateral femoral cutaneous nerve carries L2 and L3' }),
        skin(['medial_leg'], ['intact'], { cite: ['S82', 'S86'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-L2-leg-left',
    title: 'Left L2 root, examined at the leg',
    pattern: 'hip flexion, and the upper end of the thigh',
    lesion: [roots(['L2', 'L2'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['iliopsoas'], { cite: ['S31'], basis: 'stated', note: 'A12' }),
        open(['quadriceps'], { cite: ['S88'], basis: 'composed', note: 'A12: L2 is the open end of the L2–L4 overlap (C21)' }),
        skin(['lateral_thigh'], ['indeterminate'], { cite: ['S74'], basis: 'composed', note: 'A12: the nerve carries L2, but no source gives the patch its roots' }),
        skin(['anterior_thigh', 'medial_thigh'], ['indeterminate'], { cite: ['S71', 'S73'], basis: 'composed', note: 'A12' }),
        skin(['medial_leg'], ['intact'], { cite: ['S86'], basis: 'composed', note: 'A12: the saphenous nerve is L3–L4' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-L3-leg-left',
    title: 'Left L3 root, examined at the leg',
    pattern: 'knee extension without hip flexion',
    lesion: [roots(['L3', 'L3'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['quadriceps'], { cite: ['S31'], basis: 'stated', note: 'A12: S31 gives knee extension to L3' }),
        spared(['iliopsoas'], { cite: ['S31'], basis: 'composed', note: 'A12: hip flexion is L1–L2' }),
        spared(['tibialis_anterior'], { cite: ['S31', 'S82'], basis: 'composed', note: 'A12: dorsiflexion is L4–L5' }),
        skin(['medial_leg'], ['indeterminate'], { cite: ['S86'], basis: 'composed', note: 'A12: the saphenous nerve carries L3, the landmark is L4' }),
        skin(['lateral_thigh'], ['indeterminate'], { cite: ['S74'], basis: 'composed', note: 'A12' }),
        reflex('patellar', ['reduced'], { cite: ['S82', 'S88'], basis: 'composed', note: 'A12: one segment of the L2–L4 arc' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-S2-leg-left',
    title: 'Left S2 root, examined at the leg',
    pattern: 'knee flexion, and the lower end of the sural and gluteal supply',
    lesion: [roots(['S2', 'S2'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['hamstrings'], { cite: ['S31'], basis: 'stated', note: 'A12: S31 gives knee flexion to S2' }),
        spared(['gastrocnemius'], { cite: ['S31', 'S82'], basis: 'composed', note: 'A12: plantar flexion is S1' }),
        open(['gluteus_maximus'], { cite: ['S81'], basis: 'composed', note: 'A12: its nerve carries L5–S2' }),
        skin(['lateral_foot'], ['indeterminate'], { cite: ['S87'], basis: 'composed', note: 'A12: the sural nerve carries S1 and S2; the landmark is S1' }),
        skin(['sole'], ['indeterminate'], { cite: ['S79'], basis: 'composed', note: 'A12: the tibial nerve carries L4–S3' }),
        reflex('achilles', ['normal'], { cite: ['S82'], basis: 'composed', note: 'A12: the arc is S1' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-S3-leg-left',
    title: 'Left S3 root, examined at the leg',
    pattern: 'below everything the leg is tested by, except the sole',
    lesion: [roots(['S3', 'S3'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        spared(['hamstrings', 'gastrocnemius', 'gluteus_maximus', 'tibialis_posterior'], { cite: ['S31', 'S81'], basis: 'composed', note: 'A12: all of these end at S2' }),
        skin(['lateral_foot'], ['intact'], { cite: ['S87'], basis: 'composed', note: 'A12: the sural nerve ends at S2' }),
        skin(['sole'], ['indeterminate'], { cite: ['S79'], basis: 'composed', note: 'A12: the tibial nerve reaches S3' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
  {
    id: 'root-S1-leg-left',
    title: 'Left S1 root, examined at the leg',
    pattern: 'S1 radiculopathy: weak plantar flexion, lost ankle jerk, numb lateral foot',
    lesion: [roots(['S1', 'S1'])],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        weak(['gastrocnemius'], { cite: ['S82', 'S88'], basis: 'stated' }),
        reflex('achilles', ['reduced', 'absent'], { cite: ['S82', 'S88'], basis: 'stated' }),
        skin(['lateral_foot'], ['impaired'], { cite: ['S82'], basis: 'stated', note: 'one root: reduced, not absent (R2)' }),
        open(['hamstrings'], { cite: ['S90'], basis: 'stated', note: 'C25: a possible, rare manifestation' }),
        open(['gluteus_maximus'], { cite: ['S81'], basis: 'composed' }),
        spared(['tibialis_anterior', 'toe_extensor', 'fibularis', 'tibialis_posterior', 'gluteus_medius', 'quadriceps'], { cite: ['S82', 'S83', 'S78'], basis: 'composed' }),
        sign('foot_drop', false, { cite: ['S82'], basis: 'composed' }),
        skin(['dorsum_foot', 'medial_leg'], ['intact'], { cite: ['S82'], basis: 'composed' }),
        reflex('patellar', ['normal'], { cite: ['S82'], basis: 'composed' }),
        ...rightUntouched,
      ],
      unasserted: [],
    }],
  },
];
