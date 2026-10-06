import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_CASES } from '../spec/expectations/index.ts';
import { ANGLE_CASES } from '../spec/expectations/angle.ts';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { CAVERNOUS_CASES } from '../spec/expectations/cavernous.ts';
import { CRANIAL_NERVE_CASES } from '../spec/expectations/cranial-nerves.ts';
import { HORNER_CASES } from '../spec/expectations/horner.ts';
import { JUGULAR_CASES } from '../spec/expectations/jugular.ts';
import { MIDBRAIN_CASES } from '../spec/expectations/midbrain.ts';
import { ORBIT_CASES } from '../spec/expectations/orbit.ts';
import { PLEXUS_CASES } from '../spec/expectations/plexus.ts';
import { POSTERIOR_CASES } from '../spec/expectations/posterior.ts';
import { mapBrain } from '../src/engine/brain.ts';
import { forward, isBrain, isCord, mapLesion, type AnyRegion } from '../src/engine/forward.ts';
import { sympatheticCourse, sympatheticFate } from '../src/geometry/sympathetic.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { SEGMENTS, SIDES } from '../src/kb/vocab.ts';

const CASES = [
  ...ALL_CASES,
  ...HORNER_CASES,
  ...BRAIN_CASES,
  ...PLEXUS_CASES,
  ...POSTERIOR_CASES,
  ...MIDBRAIN_CASES,
  ...CRANIAL_NERVE_CASES,
  ...CAVERNOUS_CASES,
  ...ANGLE_CASES,
  ...ORBIT_CASES,
  ...JUGULAR_CASES,
];

describe('the sympathetic pathway is drawn as the engine reads it (P40)', () => {
  it('stops a pulse exactly when the engine reports a Horner syndrome, at the neurone it reports', () => {
    let checked = 0;
    const seen = new Set<number>();
    for (const kase of CASES) {
      const lesion: readonly AnyRegion[] = kase.lesion;
      const map = mapLesion(lesion.filter(isCord), KB);
      const bmap = mapBrain(KB, lesion.filter(isBrain));
      const f = forward(lesion, 'chronic');
      for (const x of SIDES) {
        const fate = sympatheticFate(map, bmap, sympatheticCourse(KB, RENDER, x));
        assert.equal(fate.neurone, f.hornerNeurone[x], `${kase.id} ${x}: the strand stops at neurone ${fate.neurone}, the engine reports ${f.hornerNeurone[x]}`);
        assert.equal(fate.diesAt >= 0, f.horner[x] === 'present', `${kase.id} ${x}`);
        seen.add(fate.neurone);
        checked++;
      }
    }
    assert.ok(checked > 200, `${checked} comparisons`);
    assert.deepEqual([...seen].sort(), [0, 1, 2, 3], 'the cases reach every neurone and none');
  });

  it('runs the three neurones in order, down the cord and back up to the eye', () => {
    for (const x of SIDES) {
      const c = sympatheticCourse(KB, RENDER, x);
      const neurones = [...c.stops].sort((a, b) => a.point - b.point).map((s) => s.neurone);
      assert.deepEqual(neurones, [...neurones].sort(), 'a later neurone is met before an earlier one');
      assert.ok(c.starts[1] < c.starts[2] && c.starts[2] < c.starts[3]);
      // Uncrossed: every part lies on the eye's side.
      for (const s of c.stops) assert.equal(s.at.side, x, `${x}: a stop on the other side`);
      const sign = x === 'L' ? -1 : 1;
      for (const p of c.points) assert.ok(p.x * sign > 0, `${x}: a point across the midline`);
      // Down to the outflow segment, then up again.
      const outflow = SEGMENTS.indexOf(KB.autonomic.sympatheticOutflow.root);
      const root = c.points[c.root];
      const top = c.points[0];
      const eye = c.points[c.points.length - 1];
      const chain = c.points[c.root + 1];
      assert.ok(root && top && eye && chain);
      assert.ok(root.y < top.y - outflow / 2, 'the root lies well below the brainstem');
      assert.ok(chain.y > root.y && eye.y > chain.y, 'the chain and the eye lie above the root');
      // The centre stands for every segment the knowledge base gives it.
      const [a, b] = KB.autonomic.ciliospinal.centre;
      const centre = c.stops.filter((s) => s.at.kind === 'cord' && s.at.compartment === 'intermediolateral');
      assert.equal(centre.length, SEGMENTS.indexOf(b) - SEGMENTS.indexOf(a) + 1);
      for (const s of centre) assert.equal(s.point, c.centre);
    }
  });
});
