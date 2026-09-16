// Explanations for observations. They drive rendering and teaching, never findings:
// the engine is forbidden to import this file (scripts/check-boundaries.ts).
import type { Mechanism } from './types.ts';

export const MECHANISMS: readonly Mechanism[] = [
  {
    meta: {
      id: 'mechanism.spinothalamic-lamination',
      claim: 'How fibres from different body regions are arranged inside the spinothalamic tract is disputed.',
      sources: ['S23'],
      tier: 'T3',
      bookRef: 'pending',
    },
    explains: 'observation.sacral-sparing',
    positions: [
      { account: 'Classical: lumbar and sacral fibres lie dorsolaterally, cervical fibres ventromedially.', sources: ['S23'] },
      { account: 'Cordotomy mapping: lower-limb fibres lie superficially and posteriorly, upper-limb fibres deeper and anteriorly; earlier technique may have biased the classical account.', sources: ['S23'] },
    ],
  },
  {
    meta: {
      id: 'mechanism.spinothalamic-level-dependence',
      claim: 'Lower-body spinothalamic fibres shift ventrally as they ascend, lying ventral to the dentate ligament at cervical levels.',
      sources: ['S23'],
      tier: 'T2',
      bookRef: 'pending',
    },
    explains: 'observation.sacral-sparing',
    positions: [{ account: 'The cross-sectional arrangement changes with level; one profile cannot be lofted along the cord.', sources: ['S23'] }],
  },
  {
    meta: {
      id: 'mechanism.corticospinal-lamination',
      claim: 'Why central cord injury weakens the arms more than the legs is disputed.',
      sources: ['S06'],
      tier: 'T3',
      bookRef: 'pending',
    },
    explains: 'observation.arm-predominance',
    positions: [
      { account: 'Historical: arm fibres lie medially in the lateral corticospinal tract and are reached first by a central lesion.', sources: ['S06'] },
      { account: 'Current: arm and leg fibres are diffusely distributed; the hand is more densely represented in the tract.', sources: ['S06'] },
    ],
  },
];
