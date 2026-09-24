import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { mapBrain } from '../src/engine/brain.ts';
import { crossingOffsets, forward, isBrain, isCord, isSacral, mapLesion } from '../src/engine/forward.ts';
import { faceMotorPath, faceSensoryPath, partPoint } from '../src/geometry/brain.ts';
import { fate, motorPath, sensoryPath, type PathOptions } from '../src/geometry/paths.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { SEGMENTS, SENSORY_MODALITIES, SIDES } from '../src/kb/vocab.ts';

const OPTIONS: PathOptions = { model: 'classical', painFibre: 'adelta' };
const L = RENDER.brainLayout;

describe('pulses above the cord die where the engine says (D18, D39)', () => {
  it('agrees with the engine on every body route in every brain case', () => {
    let routes = 0;
    for (const kase of BRAIN_CASES) {
      const map = mapLesion(kase.lesion.filter(isCord), KB);
      const bmap = mapBrain(KB, kase.lesion.filter(isBrain));
      const f = forward(kase.lesion, 'chronic');
      for (const x of SIDES) {
        for (let s = 0; s < SEGMENTS.length; s++) {
          const seg = SEGMENTS[s];
          if (!seg) continue;
          for (const m of SENSORY_MODALITIES) {
            for (const o of m === 'posterior_column' ? [0] : crossingOffsets(KB)) {
              const d = fate(map, KB, sensoryPath(KB, RENDER, x, m, s, o, OPTIONS), isSacral(KB, s), bmap);
              const drawn = d.diesAtPoint >= 0 ? 'lost' : d.dimmed ? 'impaired' : 'intact';
              assert.equal(drawn, f.sensory[x][m][seg], `${kase.id} ${x} ${m} ${seg}`);
              routes++;
            }
          }
          const d = fate(map, KB, motorPath(KB, RENDER, x, s, OPTIONS), false, bmap);
          const weak = f.motor[x][seg].lesion !== 'none';
          assert.equal(d.diesAtPoint >= 0, weak, `${kase.id} motor ${x} ${seg}`);
        }
      }
    }
    assert.ok(routes > 1000, `only ${routes} routes`);
  });

  it('stops a pulse in the brain, before the cord, when the brain is where it is cut', () => {
    const lesion = BRAIN_CASES.find((c) => c.id === 'internal-capsule-left')?.lesion ?? [];
    const bmap = mapBrain(KB, lesion.filter(isBrain));
    const path = motorPath(KB, RENDER, 'R', SEGMENTS.indexOf('C6'), OPTIONS);
    const d = fate(mapLesion([], KB), KB, path, false, bmap);
    const firstCord = Math.min(...path.elementPoint);
    assert.ok(d.diesAtPoint >= 0 && d.diesAtPoint < firstCord);
    assert.equal(path.brain.find((e) => e.point === d.diesAtPoint)?.compartment, 'capsule_posterior_motor');
    assert.equal(fate(mapLesion([], KB), KB, motorPath(KB, RENDER, 'L', 5, OPTIONS), false, bmap).diesAtPoint, -1, 'the left side is spared');
  });

  it('agrees with the engine for facial sensation and lower-face movement', () => {
    for (const kase of BRAIN_CASES) {
      const bmap = mapBrain(KB, kase.lesion.filter(isBrain));
      const f = forward(kase.lesion, 'chronic');
      const none = mapLesion([], KB);
      for (const x of SIDES) {
        const sense = faceSensoryPath(KB, RENDER, x);
        const ds = fate(none, KB, { points: sense.points, legs: [], elementPoint: [], route: { elements: [], crossesAt: -1 }, brain: sense.elements }, false, bmap);
        assert.equal(ds.diesAtPoint >= 0 ? 'lost' : 'intact', f.faceSensation[x], `${kase.id} face sensation ${x}`);
        const move = faceMotorPath(KB, RENDER, x);
        const dm = fate(none, KB, { points: move.points, legs: [], elementPoint: [], route: { elements: [], crossesAt: -1 }, brain: move.elements }, false, bmap);
        assert.equal(dm.diesAtPoint >= 0, f.faceWeakness[x] !== 'none', `${kase.id} face movement ${x}`);
      }
    }
  });
});

describe('the drawn brain keeps the sourced relations', () => {
  it('stacks medulla, pons, midbrain, thalamus, capsule and cortex upward', () => {
    const ys = (['medulla', 'pons', 'midbrain', 'thalamus', 'capsule', 'cortex'] as const).map((l) => L.levels[l].y);
    assert.deepEqual([...ys].sort((a, b) => a - b), ys);
  });

  it('puts the pyramid and medial lemniscus medial, the spinothalamic tract and trigeminal nucleus lateral (S48, S58)', () => {
    const x = (c: Parameters<typeof partPoint>[2]) => Math.abs(partPoint(RENDER, 'medulla', c, 'L', 'arm').x);
    assert.ok(x('pyramid') < x('spinothalamic'));
    assert.ok(x('medial_lemniscus') < x('spinothalamic'));
    assert.ok(x('hypoglossal') < x('ambiguus'));
    assert.ok(Math.abs(x('spinothalamic') - x('spinal_trigeminal')) < 0.2, 'the tract runs beside the nucleus');
    assert.ok(partPoint(RENDER, 'medulla', 'pyramid', 'L', 'arm').z < partPoint(RENDER, 'medulla', 'medial_lemniscus', 'L', 'arm').z, 'the pyramid is ventral');
    assert.ok(partPoint(RENDER, 'pons', 'basis', 'L', 'arm').z < partPoint(RENDER, 'pons', 'facial', 'L', 'arm').z, 'the basis is ventral');
  });

  it('lays the homunculus out from the leg at the midline to the face laterally (S54, S66)', () => {
    const order = (['leg', 'trunk', 'neck', 'arm', 'face'] as const).map((r) => Math.abs(partPoint(RENDER, 'cortex', 'motor_cortex', 'L', r).x));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
    assert.ok(partPoint(RENDER, 'cortex', 'motor_cortex', 'L', 'arm').z < partPoint(RENDER, 'cortex', 'sensory_cortex', 'L', 'arm').z, 'motor strip in front of sensory');
  });

  it('keeps the MLF paramedian and dorsal, the third nerve nucleus behind its fascicles (S98, S99, S70)', () => {
    const pons = (c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, 'pons', c, 'L', 'face');
    assert.ok(Math.abs(pons('mlf').x) < Math.abs(pons('abducens_nucleus').x), 'the MLF is the more medial of the two');
    assert.ok(pons('mlf').z > pons('basis').z, 'the MLF is dorsal: the basis is ventral');
    assert.ok(Math.abs(pons('pprf').x - pons('abducens_nucleus').x) < 0.4, 'the PPRF lies beside the abducens nucleus');
    const mid = (c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, 'midbrain', c, 'L', 'face');
    assert.ok(mid('oculomotor_nucleus').z > mid('oculomotor').z, 'the nucleus is dorsal to the fascicles it sends forward');
    assert.ok(Math.abs(mid('mlf').x) < Math.abs(mid('peduncle').x), 'the MLF stays paramedian in the midbrain');
  });

  it('puts Broca area in front of the motor strip and the inferior parietal lobule behind the sensory strip (S104, S107)', () => {
    const at = (c: Parameters<typeof partPoint>[2], r: 'face' | 'arm' = 'face') => partPoint(RENDER, 'cortex', c, 'L', r);
    assert.ok(at('inferior_frontal').z < at('motor_cortex').z, 'the inferior frontal gyrus is anterior');
    assert.ok(at('inferior_parietal').z > at('sensory_cortex').z, 'the inferior parietal lobule is posterior');
    assert.ok(at('superior_temporal').y < at('inferior_parietal').y, 'the temporal lobe lies below the parietal');
    assert.ok(Math.abs(at('superior_temporal').x) >= Math.abs(at('motor_cortex', 'face').x), 'the Sylvian cortex is lateral, beside the face area');
  });

  it('puts the cerebellum behind the brainstem, the vermis medial to the hemispheres (S110)', () => {
    const at = (c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, 'cerebellum', c, 'L', 'face');
    assert.ok(at('cerebellar_hemisphere').z > partPoint(RENDER, 'pons', 'facial', 'L', 'face').z, 'dorsal to the pons tegmentum');
    assert.ok(at('vermis').z > partPoint(RENDER, 'medulla', 'vestibular', 'L', 'face').z, 'dorsal to the medulla');
    assert.ok(Math.abs(at('vermis').x) < Math.abs(at('cerebellar_hemisphere').x), 'the vermis is midline');
    const { cerebellum, pons, medulla } = L.levels;
    assert.ok(cerebellum.y > medulla.y && cerebellum.y < pons.y + pons.height / 2, 'beside the pons and upper medulla');
  });

  it('puts the cochlear nuclei lateral to the vestibular nuclei in the pons (P12)', () => {
    const at = (c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, 'pons', c, 'L', 'face');
    assert.ok(Math.abs(at('cochlear').x) > Math.abs(at('vestibular').x), 'the cochlear nuclei are the more lateral');
    assert.ok(at('cochlear').z > at('basis').z, 'dorsal to the basis');
  });

  it('puts the pretectum dorsal and rostral in the midbrain, near the midline (S116)', () => {
    const mid = (c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, 'midbrain', c, 'L', 'face');
    assert.ok(mid('pretectum').z > mid('oculomotor_nucleus').z, 'dorsal to the third nerve nucleus');
    assert.ok(mid('pretectum').y > mid('oculomotor').y, 'rostral, at the superior colliculus');
    assert.ok(Math.abs(mid('pretectum').x) < Math.abs(mid('peduncle').x), 'near the midline');
  });

  it('puts the trochlear nucleus beside the MLF below the pretectum, and the trigeminal motor nucleus medial to the sensory (S120, S122)', () => {
    const mid = (c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, 'midbrain', c, 'L', 'face');
    assert.ok(mid('trochlear_nucleus').y < mid('pretectum').y, 'the inferior colliculus is below the superior');
    assert.ok(Math.abs(mid('trochlear_nucleus').x - mid('mlf').x) < 0.1, 'near the midline along the MLF');
    const pons = (c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, 'pons', c, 'L', 'face');
    assert.ok(Math.abs(pons('trigeminal_motor').x) < Math.abs(pons('trigeminal_sensory').x), 'the motor nucleus is medial');
    assert.ok(pons('trigeminal_motor').z < pons('trigeminal_sensory').z, 'and anterior');
  });

  it('draws every part a territory names', () => {
    for (const row of Object.values(KB.brain.territories)) {
      for (const c of row.compartments) assert.ok(partPoint(RENDER, row.level, c, 'R', 'face'), `${row.level} ${c}`);
      // P12: and every part it takes at another level (D77).
      for (const a of row.also ?? []) for (const c of a.compartments) assert.ok(partPoint(RENDER, a.level, c, 'R', 'face'), `${a.level} ${c}`);
    }
  });
});
