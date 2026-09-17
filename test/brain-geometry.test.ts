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

  it('draws every part a territory names', () => {
    for (const row of Object.values(KB.brain.territories)) {
      for (const c of row.compartments) assert.ok(partPoint(RENDER, row.level, c, 'R', 'face'), `${row.level} ${c}`);
    }
  });
});
