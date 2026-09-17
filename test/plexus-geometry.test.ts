import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapPlexus, routeSites } from '../src/engine/limb.ts';
import {
  limbFate,
  limbPath,
  mirror,
  plexusStrands,
  rootExit,
  siteAnchor,
  suppliesOf,
  TARGETS,
} from '../src/geometry/plexus.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import type { LimbPoint } from '../src/kb/types.ts';
import { MUSCLES, NERVES, PLEXUS_CORDS, PLEXUS_SITES, SEGMENTS, SKIN_AREAS, TRUNKS, type Segment } from '../src/kb/vocab.ts';

const L = RENDER.limb;
const idx = (s: Segment): number => SEGMENTS.indexOf(s);
const rootsOf = (t: (typeof TARGETS)[number]): Segment[] => {
  const row = (MUSCLES as readonly string[]).includes(t) ? KB.plexus.muscles[t as (typeof MUSCLES)[number]] : KB.plexus.skin[t as (typeof SKIN_AREAS)[number]];
  const spans = [row.roots, row.disputedRoots].filter((s) => s !== null && s !== undefined);
  return spans.flatMap(([a, b]) => SEGMENTS.slice(idx(a), idx(b) + 1));
};
/** Linear interpolation of a polyline's coordinate at a given y. */
const along = (line: readonly LimbPoint[], y: number, axis: 0 | 2): number => {
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if (!a || !b) continue;
    if ((y <= a[1] && y >= b[1]) || (y >= a[1] && y <= b[1])) {
      const f = a[1] === b[1] ? 0 : (y - a[1]) / (b[1] - a[1]);
      return a[axis] + f * (b[axis] - a[axis]);
    }
  }
  throw new Error(`y ${y} is outside the line`);
};
const alongX = (line: readonly LimbPoint[], x: number, axis: 1 | 2): number => {
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if (!a || !b) continue;
    if ((x <= a[0] && x >= b[0]) || (x >= a[0] && x <= b[0])) {
      const f = a[0] === b[0] ? 0 : (x - a[0]) / (b[0] - a[0]);
      return a[axis] + f * (b[axis] - a[axis]);
    }
  }
  throw new Error(`x ${x} is outside the line`);
};

const distanceToLine = (line: readonly LimbPoint[], p: LimbPoint): number => {
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if (!a || !b) continue;
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]] as const;
    const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]] as const;
    const len = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
    const f = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / len));
    best = Math.min(best, Math.hypot(ap[0] - f * ab[0], ap[1] - f * ab[1], ap[2] - f * ab[2]));
  }
  return best;
};

describe('plexus drawing matches the engine (D27)', () => {
  it('every fibre path passes exactly the lesion places its engine route passes, in order', () => {
    let paths = 0;
    for (const target of TARGETS) {
      for (const supply of suppliesOf(KB, target)) {
        for (const root of rootsOf(target)) {
          const p = limbPath(KB, RENDER, supply, root, target, 'L');
          if (!p) continue;
          paths++;
          const drawn = [...p.sitePoint.entries()].sort((a, b) => a[1] - b[1]).map(([s]) => s);
          assert.deepEqual(drawn, routeSites(p.route), `${target} via ${supply.nerve} from ${root}`);
        }
      }
    }
    // 21 muscle paths (one per root, disputed included — C8 to the interossei since A9) and 16 skin paths.
    assert.equal(paths, 37);
  });

  it('draws each branch after exactly as many named places as the knowledge base says', () => {
    for (const target of TARGETS) {
      for (const supply of suppliesOf(KB, target)) {
        const waypoints = L.nerves[supply.nerve];
        const at = waypoints.findIndex((w) => w.branches?.includes(target));
        assert.ok(at >= 0, `${target} has no branch on the ${supply.nerve} nerve`);
        const before = waypoints.slice(0, at + 1).filter((w) => w.site).length;
        assert.equal(before, supply.after, `${target} on the ${supply.nerve} nerve`);
      }
    }
  });

  it('draws every named place on its own nerve, once, in the knowledge base order', () => {
    for (const n of NERVES) {
      const drawn = L.nerves[n].flatMap((w) => (w.site ? [w.site] : []));
      assert.deepEqual(drawn, [...KB.plexus.nerves[n].sites], n);
    }
    for (const s of PLEXUS_SITES) assert.ok(siteAnchor(RENDER, s, 'L'), s);
  });

  it('stops a pulse at the first place the lesion cuts, and dims it past a partial one', () => {
    const p = limbPath(KB, RENDER, KB.plexus.muscles.thumb_extensor.supply, 'C8', 'thumb_extensor', 'L');
    assert.ok(p);
    const groove = p.sitePoint.get('radial_spiral_groove');
    const trunk = p.sitePoint.get('lower_trunk');
    assert.ok(groove !== undefined && trunk !== undefined && trunk < groove);
    const both = mapPlexus([
      { plexus: 'radial_spiral_groove', sides: ['L'], severity: 'complete' },
      { plexus: 'lower_trunk', sides: ['L'], severity: 'complete' },
    ]);
    assert.equal(limbFate(both, p, 'L').diesAt, trunk, 'the proximal cut stops it first');
    assert.equal(limbFate(both, p, 'R').diesAt, -1, 'the other side is untouched');
    const partial = mapPlexus([{ plexus: 'lower_trunk', sides: ['L'], severity: 'partial' }]);
    assert.deepEqual(limbFate(partial, p, 'L'), { diesAt: -1, dimmed: true });
  });

  it('mirrors the right side', () => {
    const l = plexusStrands(KB, RENDER, 'L');
    const r = plexusStrands(KB, RENDER, 'R');
    assert.equal(l.length, r.length);
    l.forEach((s, i) => s.points.forEach((pt, j) => assert.equal(r[i]?.points[j]?.x, -pt.x)));
    assert.equal(rootExit(RENDER, idx('C5'), 'R').x, -rootExit(RENDER, idx('C5'), 'L').x);
  });

  it('draws five roots, three trunks, six divisions, three cords, and a strand for every nerve', () => {
    const strands = plexusStrands(KB, RENDER, 'L');
    const count = (k: string): number => strands.filter((s) => s.kind === k).length;
    assert.equal(count('root'), 5);
    assert.equal(count('trunk'), 3);
    assert.equal(count('division'), 6);
    assert.equal(count('cord'), 3);
    assert.deepEqual([...new Set(strands.filter((s) => s.kind === 'nerve').map((s) => s.name))].sort(), [...NERVES].sort());
    assert.equal(strands.filter((s) => s.division === 'posterior').length, 3, 'three posterior divisions (S34)');
  });
});

describe('plexus drawing keeps the sourced relations', () => {
  it('runs the trunks between the anterior and middle scalenes (S34, S37)', () => {
    for (const t of TRUNKS) {
      const [start] = L.trunks[t];
      assert.ok(start);
      const front = along(L.scalenes.anterior, start[1], 2);
      const back = along(L.scalenes.middle, start[1], 2);
      assert.ok(start[2] > front && start[2] < back, `${t} trunk`);
    }
  });

  it('carries the trunks over the first rib (S37)', () => {
    for (const t of TRUNKS) {
      const end = L.trunks[t][L.trunks[t].length - 1];
      assert.ok(end);
      assert.ok(end[1] > alongX(L.firstRib, end[0], 1), `${t} trunk ends above the rib`);
    }
  });

  it('passes every division behind the clavicle (S37)', () => {
    for (const s of plexusStrands(KB, RENDER, 'L').filter((x) => x.kind === 'division')) {
      const mid = s.points[1];
      assert.ok(mid);
      assert.ok(mid.z > alongX(L.clavicle, mid.x, 2), `${s.name} lies dorsal to the clavicle`);
    }
  });

  it('places each cord where it is named, around the axillary artery (S33, S37)', () => {
    for (const c of PLEXUS_CORDS) {
      for (const p of L.cords[c]) {
        const az = alongX(L.artery, p[0], 2);
        if (c === 'posterior') assert.ok(p[2] > az + 0.2, `posterior cord is dorsal at x ${p[0]}`);
        else {
          // Lateral lies farther from the midline than the artery at the same height; medial nearer.
          const arteryX = along(L.artery, p[1], 0);
          if (c === 'lateral') assert.ok(Math.abs(p[0]) > Math.abs(arteryX), `lateral cord at y ${p[1]}`);
          else assert.ok(Math.abs(p[0]) < Math.abs(arteryX), `medial cord at y ${p[1]}`);
          assert.ok(distanceToLine(L.artery, p) < 0.45, `${c} cord stays beside the artery`);
        }
      }
    }
  });

  it('hangs the arm in the anatomical position: thumb lateral, little finger medial', () => {
    const thumb = mirror(L.targets.thumb, 'L');
    const little = mirror(L.targets.little_finger, 'L');
    assert.ok(Math.abs(thumb.x) > Math.abs(little.x));
  });
});
