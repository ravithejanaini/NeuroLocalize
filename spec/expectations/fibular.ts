// Amendment A23. Frozen expected outputs for the two branches of the common fibular nerve,
// written from the sources in docs/P19-analysis.md (S138, S139) before any P19 code, and run
// against the P18 engine first.
//
// Reading guide. The deep branch lifts the foot and the great toe and feels the first web; the
// superficial branch everts the foot and feels the dorsum and the anterolateral leg (S138,
// S139). The anterior tarsal tunnel is the deep branch at the ankle, below its muscle branches.
// Muscle and skin names are as in `leg.ts`.
import type { Muscle, SkinArea } from '../../src/kb/vocab.ts';
import type { Assertion, LimbAssertion, LimbCase, PlexusRegion } from './types.ts';

const at = (site: PlexusRegion['plexus']): PlexusRegion => ({ plexus: site, sides: ['L'], severity: 'complete' });
type Cite = Pick<LimbAssertion, 'cite' | 'basis'> & { readonly note?: string };
const muscles = (list: readonly Muscle[], state: 'weak' | 'normal', e: Cite): LimbAssertion =>
  ({ kind: 'muscle', side: 'L', muscles: list, oneOf: [state], ...e }) as LimbAssertion;
const skin = (areas: readonly SkinArea[], oneOf: readonly ('lost' | 'impaired' | 'intact')[], e: Cite): LimbAssertion =>
  ({ kind: 'skin', side: 'L', modality: 'all', areas, oneOf, ...e });
const footDrop = (present: boolean, e: Cite): LimbAssertion =>
  ({ kind: 'deformity', side: 'L', deformity: 'foot_drop', oneOf: [present ? 'present' : 'absent'], ...e });
const unmoved: (Assertion | LimbAssertion)[] = [
  muscles(['tibialis_posterior', 'gastrocnemius', 'hamstrings', 'gluteus_medius', 'quadriceps'], 'normal', { cite: ['S79', 'S83'], basis: 'composed', note: 'no fibular supply' }),
  skin(['sole', 'medial_leg'], ['intact'], { cite: ['S79', 'S86'], basis: 'composed' }),
  { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['normal'], cite: ['S82'], basis: 'composed', note: 'the tibial nerve carries it' },
  // Added after the first P19 mutation run: the sural nerve is formed from the tibial and common
  // fibular nerves (S138, S87), above the branches, so neither branch takes the lateral foot.
  skin(['lateral_foot'], ['intact'], { cite: ['S138', 'S87'], basis: 'composed', note: 'the sural nerve' }),
];

export const FIBULAR_CASES: readonly LimbCase[] = [
  {
    id: 'deep-fibular-left',
    title: 'Left deep fibular nerve, high in the leg',
    pattern: 'foot drop with eversion strong; only the first web numb',
    lesion: [at('deep_fibular')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        footDrop(true, { cite: ['S139'], basis: 'stated', note: 'foot drop due to loss of dorsiflexion' }),
        muscles(['tibialis_anterior', 'toe_extensor'], 'weak', { cite: ['S139'], basis: 'stated', note: 'tibialis anterior and extensor hallucis longus' }),
        muscles(['fibularis'], 'normal', { cite: ['S138'], basis: 'composed', note: 'the superficial branch everts' }),
        skin(['first_web'], ['lost'], { cite: ['S139'], basis: 'stated', note: 'sensory loss in the 1st web space' }),
        skin(['dorsum_foot', 'lateral_leg'], ['intact'], { cite: ['S138'], basis: 'composed', note: 'the superficial branch' }),
        ...unmoved,
      ],
      unasserted: ['extensor digitorum brevis and hallucis brevis: not modelled'],
    }],
  },
  {
    id: 'superficial-fibular-left',
    title: 'Left superficial fibular nerve',
    pattern: 'weak eversion with the dorsum numb; no foot drop, the first web spared',
    lesion: [at('superficial_fibular')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        muscles(['fibularis'], 'weak', { cite: ['S138'], basis: 'stated', note: 'diminishes the ability to evert the foot' }),
        muscles(['tibialis_anterior', 'toe_extensor'], 'normal', { cite: ['S139'], basis: 'composed', note: 'the deep branch' }),
        footDrop(false, { cite: ['S139'], basis: 'composed', note: 'dorsiflexion is the deep branch' }),
        skin(['dorsum_foot', 'lateral_leg'], ['lost'], { cite: ['S138'], basis: 'stated', note: 'the anterolateral leg and the foot dorsum' }),
        skin(['first_web'], ['intact'], { cite: ['S138'], basis: 'stated', note: 'except the web space between the first two digits' }),
        ...unmoved,
      ],
      unasserted: ['fibularis brevis apart from longus: not modelled'],
    }],
  },
  {
    id: 'anterior-tarsal-left',
    title: 'Left deep fibular nerve in the anterior tarsal tunnel',
    pattern: 'the first web numb; the leg muscles strong',
    lesion: [at('anterior_tarsal')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        skin(['first_web'], ['lost', 'impaired'], { cite: ['S139'], basis: 'stated', note: 'sensory disturbance in the 1st web space' }),
        muscles(['tibialis_anterior', 'toe_extensor', 'fibularis'], 'normal', { cite: ['S139'], basis: 'composed', note: 'the leg muscles are supplied above the ankle (C58)' }),
        footDrop(false, { cite: ['S139'], basis: 'composed' }),
        skin(['dorsum_foot', 'lateral_leg'], ['intact'], { cite: ['S138'], basis: 'composed' }),
        ...unmoved,
      ],
      unasserted: ['weakness of the short toe extensors on the foot, which S139 gives in some cases (C58): not modelled', 'pain: not modelled'],
    }],
  },
];
