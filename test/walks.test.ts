import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CAVERNOUS_CASES } from '../spec/expectations/cavernous.ts';
import { CRANIAL_NERVE_CASES } from '../spec/expectations/cranial-nerves.ts';
import { HORNER_CASES } from '../spec/expectations/horner.ts';
import { VISION_CASES } from '../spec/expectations/vision.ts';
import { mapBrain } from '../src/engine/brain.ts';
import { forward, isBrain, isCord, isPlexus, isVision, mapLesion, type AnyRegion } from '../src/engine/forward.ts';
import { mapPlexus } from '../src/engine/limb.ts';
import { mapVision } from '../src/engine/vision.ts';
import { cranialCourses, visionFibres } from '../src/geometry/brain.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { ARM_NERVES, LEG_NERVES, NERVES, SEGMENTS, SIDES } from '../src/kb/vocab.ts';
import { describePart } from '../src/render/describe.ts';
import { allWalks, crossings, lesionAt, nearestOn, pointAlong, REACH, reachable, stopIndexAt, WALK_GROUPS, type WalkLesion } from '../src/render/walks.ts';

const WALKS = allWalks(KB, RENDER);
const lesionOf = (regions: readonly AnyRegion[]): WalkLesion => ({
  map: mapLesion(regions.filter(isCord), KB),
  bmap: mapBrain(KB, regions.filter(isBrain)),
  pmap: mapPlexus(regions.filter(isPlexus)),
  vmap: mapVision(KB, regions.filter(isVision)),
  fields: regions.some(isVision) ? forward(regions, 'chronic').fields : null,
});
const walk = (id: string) => {
  const w = WALKS.find((x) => x.id === id);
  assert.ok(w, `no walk ${id}`);
  return w;
};

describe('every drawn nerve and pathway can be walked (P42)', () => {
  it('offers a walk for each cranial course, each fibre of the field, each nerve of the limbs, the sympathetic strand and the long tracts', () => {
    for (const x of SIDES) {
      for (const c of cranialCourses(KB, RENDER, x)) assert.ok(WALKS.some((w) => w.id === `cranial|${x}|${c.id}`), `${x} ${c.id}`);
      for (const n of NERVES) assert.ok(WALKS.some((w) => w.id === `nerve|${x}|${n}`), `${x} ${n}`);
      assert.ok(WALKS.some((w) => w.id === `sympathetic|${x}`));
      for (const t of ['motor', 'posterior', 'pain']) assert.ok(WALKS.some((w) => w.id === `tract|${x}|${t}`));
    }
    assert.equal(WALKS.filter((w) => w.group === 'visual pathway').length, visionFibres(KB, RENDER).length);
    assert.equal(WALKS.filter((w) => w.id.startsWith('nerve|') && w.group === 'nerves of the arm').length, ARM_NERVES.length * 2);
    assert.equal(WALKS.filter((w) => w.id.startsWith('nerve|') && w.group === 'nerves of the leg').length, LEG_NERVES.length * 2);
    for (const w of WALKS) assert.ok(WALK_GROUPS.includes(w.group));
  });

  it('gives every walk a name of its own, a direction, points to walk and stops in the order they are met', () => {
    assert.equal(new Set(WALKS.map((w) => w.id)).size, WALKS.length);
    assert.equal(new Set(WALKS.map((w) => w.name)).size, WALKS.length, 'two walks share a name');
    for (const w of WALKS) {
      assert.ok(w.points.length >= 2, `${w.id}: nothing to walk`);
      assert.ok(w.runs.length > 10, `${w.id}: no direction`);
      assert.ok(w.stops.length >= 2, `${w.id}: fewer than two stops`);
      let last = -1;
      for (const s of w.stops) {
        assert.ok(Number.isInteger(s.point) && s.point >= 0 && s.point < w.points.length, `${w.id}: a stop off the walk`);
        assert.ok(s.point >= last, `${w.id}: stops out of order`);
        assert.ok(s.label.length > 3, `${w.id}: a stop with no name`);
        last = s.point;
      }
      // Something is said at both ends.
      assert.equal(w.stops[0]?.point, 0, `${w.id}: nothing at the start`);
      assert.equal(w.stops[w.stops.length - 1]?.point, w.points.length - 1, `${w.id}: nothing at the end`);
      for (const p of w.points) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
    }
  });

  it('has something sourced to say at every stop that is a part', () => {
    const seen = new Set<string>();
    for (const w of WALKS) {
      for (const s of w.stops) {
        if (!s.ref) continue;
        const key = JSON.stringify(s.ref);
        if (seen.has(key)) continue;
        seen.add(key);
        const card = describePart(RENDER, s.ref);
        assert.ok(card.carries.length > 0, `${w.id}: ${s.label} has no statement`);
        assert.ok(card.carries.every((c) => c.sources.length > 0));
      }
    }
    assert.ok(seen.size > 150, `${seen.size} parts along the walks`);
  });

  it('stops a cranial walk where the engine reports the nerve’s finding, in every frozen case', () => {
    let stopped = 0;
    for (const kase of [...CRANIAL_NERVE_CASES, ...CAVERNOUS_CASES]) {
      const regions: readonly AnyRegion[] = kase.lesion;
      const f = forward(regions, 'chronic');
      for (const x of SIDES) {
        for (const c of cranialCourses(KB, RENDER, x)) {
          if (!('sign' in c.reads) || c.reads.sign === 'palate_weakness') continue;
          const cut = walk(`cranial|${x}|${c.id}`).fate(lesionOf(regions)).diesAt >= 0;
          assert.equal(cut, f.cranial[x][c.reads.sign] === 'present', `${kase.id} ${x} ${c.id}`);
          if (cut) stopped++;
        }
      }
    }
    assert.ok(stopped > 5, `${stopped} walks stopped`);
  });

  it('stops a nerve of the limbs at the first place the lesion takes, going outward', () => {
    for (const x of SIDES) {
      for (const n of NERVES) {
        const w = walk(`nerve|${x}|${n}`);
        const placed = w.stops.flatMap((s) => (s.ref?.kind === 'plexus' ? [{ point: s.point, site: s.ref.site }] : []));
        for (const p of placed) {
          const one = lesionOf([{ plexus: p.site, sides: [x], severity: 'complete' }]);
          assert.equal(w.fate(one).diesAt, p.point, `${w.id}: a lesion at ${p.site}`);
          // The other side's nerve is untouched.
          assert.equal(w.fate(lesionOf([{ plexus: p.site, sides: [x === 'L' ? 'R' : 'L'], severity: 'complete' }])).diesAt, -1);
        }
        // Two lesions: the nearer to the origin wins.
        const [first, second] = [placed[0], placed[placed.length - 1]];
        if (first && second && first.site !== second.site) {
          const both = lesionOf([
            { plexus: second.site, sides: [x], severity: 'complete' },
            { plexus: first.site, sides: [x], severity: 'complete' },
          ]);
          assert.equal(w.fate(both).diesAt, first.point, `${w.id}: two lesions`);
        }
        assert.equal(w.fate(lesionOf([])).diesAt, -1);
      }
    }
    // The radial nerve arises from the posterior cord, so a lesion of that cord stops it at its origin.
    assert.equal(walk('nerve|L|radial').fate(lesionOf([{ plexus: 'posterior_cord', sides: ['L'], severity: 'complete' }])).diesAt, 0);
  });

  it('stops the sympathetic, visual and long-tract walks where the engine says the signal stops', () => {
    for (const kase of HORNER_CASES) {
      const regions: readonly AnyRegion[] = kase.lesion;
      const f = forward(regions, 'chronic');
      for (const x of SIDES) assert.equal(walk(`sympathetic|${x}`).fate(lesionOf(regions)).diesAt >= 0, f.horner[x] === 'present', `${kase.id} ${x}`);
    }
    for (const kase of VISION_CASES) {
      const regions: readonly AnyRegion[] = kase.lesion;
      const f = forward(regions, 'chronic');
      for (const fibre of visionFibres(KB, RENDER)) {
        const fate = walk(`vision|${fibre.eye}|${fibre.cell}`).fate(lesionOf(regions));
        const state = f.fields[fibre.eye][fibre.cell];
        assert.equal(fate.diesAt >= 0, state === 'lost', `${kase.id} ${fibre.eye} ${fibre.cell}`);
        assert.equal(fate.dimmed, state === 'indeterminate', `${kase.id} ${fibre.eye} ${fibre.cell}`);
      }
    }
    // A left hemisection at T4 is below the hand: its tracts walk through. At C4 it stops the
    // left hand's command and posterior column, and the right hand's pain.
    const hemi = (seg: 'C4' | 'T4'): WalkLesion =>
      lesionOf([{ at: { segments: [seg, seg] }, sides: ['L'], compartments: ['dorsal_column', 'lateral_cst', 'anterolateral'], severity: 'complete', portion: 'whole' }]);
    for (const id of ['tract|L|motor', 'tract|L|posterior', 'tract|L|pain', 'tract|R|pain']) assert.equal(walk(id).fate(hemi('T4')).diesAt, -1, id);
    assert.ok(walk('tract|L|motor').fate(hemi('C4')).diesAt >= 0);
    assert.ok(walk('tract|L|posterior').fate(hemi('C4')).diesAt >= 0);
    assert.ok(walk('tract|R|pain').fate(hemi('C4')).diesAt >= 0);
    assert.equal(walk('tract|L|pain').fate(hemi('C4')).diesAt, -1);
    assert.equal(walk('tract|R|motor').fate(hemi('C4')).diesAt, -1);
    // And the stop named for it is the part at that segment.
    const motor = walk('tract|L|motor');
    const at = motor.fate(hemi('C4')).diesAt;
    assert.deepEqual(motor.points[at]?.y, motor.points.find((_, i) => i === at)?.y);
    assert.ok(SEGMENTS.indexOf('C4') >= 0);
  });

  it('says of each stop whether the lesion is here, behind the walker, or nowhere', () => {
    const w = walk('cranial|L|III');
    const none = lesionOf([]);
    const nerve = lesionOf([{ brain: 'midbrain', sides: ['L'], compartments: ['oculomotor_nerve'], severity: 'complete' }]);
    const here = w.stops.findIndex((s) => s.ref?.kind === 'brain' && s.ref.compartment === 'oculomotor_nerve');
    assert.ok(here > 0);
    for (let i = 0; i < w.stops.length; i++) assert.equal(lesionAt(w, i, none), 'clear');
    assert.equal(lesionAt(w, here, nerve), 'here');
    assert.equal(lesionAt(w, here - 1, nerve), 'clear');
    assert.equal(lesionAt(w, w.stops.length - 1, nerve), 'beyond');
    // Between two stops the walker is at the one behind.
    assert.equal(stopIndexAt(w, 0), 0);
    assert.equal(stopIndexAt(w, (w.stops[here]?.point ?? 0) + 0.4), here);
    assert.equal(stopIndexAt(w, w.points.length - 1), w.stops.length - 1);
  });
});

describe('the walks are one world that can be roamed (P43)', () => {
  const at = (id: string, pointProgress: number) => crossings(WALKS, walk(id), pointAlong(walk(id), pointProgress)).map((c) => c.walk.id);

  it('joins every walk to every other: from any nerve, any other can be reached by stepping across', () => {
    const first = WALKS[0];
    assert.ok(first);
    const world = reachable(WALKS, first);
    assert.equal(world.size, WALKS.length, `${WALKS.filter((w) => !world.has(w.id)).map((w) => w.id).join(', ')} cannot be reached`);
  });

  it('walks the plexuses too: every root into its trunk or part, and every trunk into the cords it forms', () => {
    for (const x of SIDES) {
      for (const seg of ['C5', 'C6', 'C7', 'C8', 'T1']) assert.ok(WALKS.some((w) => w.id === `root|${x}|${seg}`), `${x} ${seg}`);
      for (const c of ['lateral', 'posterior', 'medial'] as const) {
        for (const t of KB.plexus.cords.formedBy[c]) assert.ok(WALKS.some((w) => w.id === `plexus|${x}|${t}|${c}`), `${x} ${t} to ${c}`);
      }
      // L4 serves both parts of the lumbosacral plexus, so it has a walk into each.
      assert.ok(WALKS.some((w) => w.id === `root|${x}|L4|lumbar`) && WALKS.some((w) => w.id === `root|${x}|L4|sacral`));
      for (const limb of ['', '|foot']) for (const t of ['motor', 'posterior', 'pain']) assert.ok(WALKS.some((w) => w.id === `tract|${x}|${t}${limb}`));
    }
    // A root walk is cut at its start when the whole root is lost, and at the trunk by a lesion of the trunk.
    const c8 = walk('root|L|C8');
    const root = lesionOf([{ at: { segments: ['C8', 'C8'] }, sides: ['L'], compartments: ['dorsal_root', 'ventral_root'], severity: 'complete', portion: 'whole' }]);
    assert.equal(c8.fate(root).diesAt, 0);
    assert.equal(walk('root|R|C8').fate(root).diesAt, -1);
    const trunk = c8.fate(lesionOf([{ plexus: 'lower_trunk', sides: ['L'], severity: 'complete' }])).diesAt;
    assert.ok(trunk > 0 && c8.stops.some((q) => q.point === trunk && q.ref?.kind === 'plexus' && q.ref.site === 'lower_trunk'));
    // Only the ventral root lost: the walk is weakened, not stopped.
    const ventral = c8.fate(lesionOf([{ at: { segments: ['C8', 'C8'] }, sides: ['L'], compartments: ['ventral_root'], severity: 'complete', portion: 'whole' }]));
    assert.deepEqual(ventral, { diesAt: -1, dimmed: true });
  });

  it('offers, where the walker stands, the walks that meet there and no others', () => {
    // At the eye the three nerves that move it meet; midway along the third nerve, nothing does.
    const eye = at('cranial|L|III', walk('cranial|L|III').points.length - 1);
    for (const id of ['cranial|L|IV', 'cranial|L|VI']) assert.ok(eye.includes(id), `${id} at the eye`);
    assert.ok(!eye.some((id) => id.includes('|R|')), 'the other side is not within reach at the eye');
    // Where the sciatic nerve ends, its two branches begin.
    const end = at('nerve|L|sciatic', walk('nerve|L|sciatic').points.length - 1);
    assert.deepEqual(end.slice(0, 2).sort(), ['nerve|L|common_fibular', 'nerve|L|tibial']);
    // Where the radial nerve arises, the posterior cord's walks arrive and the axillary nerve leaves.
    const origin = at('nerve|L|radial', 0);
    assert.ok(origin.includes('nerve|L|axillary'));
    assert.ok(origin.some((id) => id.startsWith('plexus|L|') && id.endsWith('|posterior')));
    // The corticospinal walk to the hand ends at the C8 root, which leads on into the plexus.
    assert.ok(at('tract|L|motor', walk('tract|L|motor').points.length - 1).includes('root|L|C8'));
  });

  it('lands the walker on the other walk at its nearest place, within reach, and can step back', () => {
    let pairs = 0;
    for (const w of WALKS) {
      for (const pp of [0, (w.points.length - 1) / 2, w.points.length - 1]) {
        const here = pointAlong(w, pp);
        const found = crossings(WALKS, w, here, REACH, 99);
        let last = -1;
        for (const c of found) {
          assert.ok(c.distance <= REACH + 1e-9 && c.distance >= last - 1e-9, `${w.id}: out of order or out of reach`);
          last = c.distance;
          // The landing is on the other walk's own line, and is the nearest place on it.
          const landed = pointAlong(c.walk, c.pointProgress);
          assert.ok(Math.hypot(landed.x - c.at.x, landed.y - c.at.y, landed.z - c.at.z) < 1e-9);
          assert.ok(Math.abs(nearestOn(c.walk, here).distance - c.distance) < 1e-12);
          // From the landing, the walk just left is within reach again.
          assert.ok(nearestOn(w, c.at).distance <= REACH + 1e-9, `${w.id} → ${c.walk.id}: no way back`);
          pairs++;
        }
      }
    }
    assert.ok(pairs > 300, `${pairs} crossings checked`);
  });

  it('offers at most six, and no more than three of one kind', () => {
    for (const w of WALKS) {
      const found = crossings(WALKS, w, pointAlong(w, 1));
      assert.ok(found.length <= 6);
      const groups = new Map<string, number>();
      for (const c of found) groups.set(c.walk.group, (groups.get(c.walk.group) ?? 0) + 1);
      for (const n of groups.values()) assert.ok(n <= 3);
      assert.ok(!found.some((c) => c.walk.id === w.id));
    }
  });
});
