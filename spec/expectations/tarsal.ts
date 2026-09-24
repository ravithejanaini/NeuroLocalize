// Amendment A24. Frozen expected outputs for the tibial nerve in the tarsal tunnel, written from
// the sources in docs/P20-analysis.md (S140, S141) before any P20 code, and run against the P19
// engine first.
//
// Reading guide. The tunnel lies behind the medial malleolus, below the tibial nerve's branches
// to the calf and to the sural nerve and above the plantar nerves (S140, S141). So the sole goes
// and the leg keeps its strength and its ankle reflex. `sole` is the plantar nerves' territory;
// the model has no heel (C59) and no intrinsic foot muscle (C60).
import type { Muscle, SkinArea } from '../../src/kb/vocab.ts';
import type { LimbAssertion, LimbCase, PlexusRegion } from './types.ts';

const at = (site: PlexusRegion['plexus']): PlexusRegion => ({ plexus: site, sides: ['L'], severity: 'complete' });
type Cite = Pick<LimbAssertion, 'cite' | 'basis'> & { readonly note?: string };
const muscles = (list: readonly Muscle[], e: Cite): LimbAssertion =>
  ({ kind: 'muscle', side: 'L', muscles: list, oneOf: ['normal'], ...e }) as LimbAssertion;
const skin = (areas: readonly SkinArea[], oneOf: readonly ('lost' | 'impaired' | 'intact')[], e: Cite): LimbAssertion =>
  ({ kind: 'skin', side: 'L', modality: 'all', areas, oneOf, ...e });

export const TARSAL_CASES: readonly LimbCase[] = [
  {
    id: 'tarsal-tunnel-left',
    title: 'Left tibial nerve in the tarsal tunnel',
    pattern: 'the sole numb; plantar flexion, inversion and the ankle reflex kept',
    lesion: [at('tarsal_tunnel')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        skin(['sole'], ['lost', 'impaired'], { cite: ['S140'], basis: 'stated', note: 'diminished plantar sensation in the plantar nerves’ distribution' }),
        muscles(['gastrocnemius', 'tibialis_posterior'], { cite: ['S141'], basis: 'stated', note: 'supplied by the tibial nerve in the leg, proximal to the tunnel' }),
        { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['normal'], cite: ['S141'], basis: 'stated', note: 'generally does not affect the Achilles reflex' },
        skin(['lateral_foot'], ['intact'], { cite: ['S141', 'S87'], basis: 'composed', note: 'the sural nerve leaves the tibial nerve in the leg' }),
        muscles(['tibialis_anterior', 'toe_extensor', 'fibularis', 'hamstrings'], { cite: ['S141'], basis: 'composed', note: 'not the tibial nerve at the ankle' }),
        skin(['dorsum_foot', 'first_web', 'lateral_leg', 'medial_leg'], ['intact'], { cite: ['S138', 'S139'], basis: 'composed' }),
        { kind: 'deformity', side: 'L', deformity: 'foot_drop', oneOf: ['absent'], cite: ['S141'], basis: 'composed' },
      ],
      unasserted: [
        'the heel: spared in most (S141) but not in about 25% (S140); the model has no heel patch (C59)',
        'weakness of the intrinsic foot muscles, a late finding (S140): not modelled (C60)',
        'pain and the Tinel sign: not modelled',
      ],
    }],
  },
];
