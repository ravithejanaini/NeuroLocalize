// Amendment A26. Frozen expected outputs for the pudendal nerve, written from the sources in
// docs/P23-analysis.md (S22, re-read) before any P23 code, and run against the P22 engine first.
//
// Reading guide. `perineum` is the skin the pudendal nerve carries (S22); the bedside test of it
// is the saddle. The sphincters are not in the model (C67), so the bladder is not asserted.
import type { Muscle, SkinArea } from '../../src/kb/vocab.ts';
import { LEG_MUSCLES } from '../../src/kb/vocab.ts';
import type { LesionRegion, LimbAssertion, LimbCase, PlexusRegion } from './types.ts';

const at = (site: PlexusRegion['plexus']): PlexusRegion => ({ plexus: site, sides: ['L'], severity: 'complete' });
const root = (s: 'S1' | 'S2' | 'S4'): LesionRegion => ({
  at: { segments: [s, s] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole',
});
type Cite = Pick<LimbAssertion, 'cite' | 'basis'> & { readonly note?: string };
const skin = (side: 'L' | 'R', areas: readonly SkinArea[], oneOf: readonly ('lost' | 'impaired' | 'intact')[], e: Cite): LimbAssertion =>
  ({ kind: 'skin', side, modality: 'all', areas, oneOf, ...e });
const muscles = (list: readonly Muscle[], e: Cite): LimbAssertion =>
  ({ kind: 'muscle', side: 'L', muscles: list, oneOf: ['normal'], ...e }) as LimbAssertion;

export const PUDENDAL_CASES: readonly LimbCase[] = [
  {
    id: 'pudendal-canal-left',
    title: 'Left pudendal nerve in Alcock’s canal',
    pattern: 'the left perineum numb; the legs normal',
    lesion: [at('pudendal_canal')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [
        skin('L', ['perineum'], ['lost'], { cite: ['S22'], basis: 'stated', note: 'loss of sensation in the nerve’s distribution' }),
        skin('R', ['perineum'], ['intact'], { cite: ['S22'], basis: 'composed', note: 'the left and right pudendal nerves are paired' }),
        muscles(LEG_MUSCLES, { cite: ['S22', 'S75'], basis: 'composed', note: 'the pudendal nerve supplies no leg muscle' }),
        skin('L', ['sole', 'lateral_foot', 'dorsum_foot', 'anterior_thigh'], ['intact'], { cite: ['S22'], basis: 'composed' }),
        { kind: 'reflex', side: 'L', reflex: 'achilles', oneOf: ['normal'], cite: ['S22', 'S79'], basis: 'composed' },
        // A28: R4 answered — the reflex's arc is the pudendal nerve, afferent and efferent (S149, S148).
        { kind: 'reflex', side: 'L', reflex: 'bulbocavernosus', oneOf: ['absent'], cite: ['S149', 'S148'], basis: 'stated', note: 'pudendal afferent, pudendal efferent and the S2–S4 arc' },
        { kind: 'reflex', side: 'R', reflex: 'bulbocavernosus', oneOf: ['normal'], cite: ['S149'], basis: 'composed', note: 'the right pudendal nerve is intact' },
      ],
      unasserted: [
        'the sphincters and the bladder: S22 gives incontinence; the model has no sphincter (C67)',
        'pain (pudendal neuralgia): not modelled',
      ],
    }],
  },
  // Added after the first P23 mutation run: four mutants of the perineum's roots survived because
  // no case cut a single sacral root and looked at it. One root of three impairs; one outside the
  // three spares (S22: the pudendal nerve is S2–S4).
  ...(['S2', 'S4'] as const).map((s): LimbCase => ({
    id: `root-${s}-perineum-left`,
    title: `Left ${s} root, examined at the perineum`,
    pattern: 'one of the pudendal nerve’s three roots: the perineum reduced',
    lesion: [root(s)],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [skin('L', ['perineum'], ['impaired'], { cite: ['S22'], basis: 'composed', note: 'one of S2–S4 (R2: one root reduces, not abolishes)' })],
      unasserted: ['every other finding of the root'],
    }],
  })),
  {
    id: 'root-S1-perineum-left',
    title: 'Left S1 root, examined at the perineum',
    pattern: 'outside the pudendal nerve’s roots: the perineum spared',
    lesion: [root('S1')],
    evaluations: [{
      timepoint: 'chronic',
      assertions: [skin('L', ['perineum'], ['intact'], { cite: ['S22'], basis: 'composed', note: 'the pudendal nerve is S2–S4' })],
      unasserted: ['every other finding of the root'],
    }],
  },
];
