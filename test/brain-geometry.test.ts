import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { mapBrain } from '../src/engine/brain.ts';
import { crossingOffsets, forward, isBrain, isCord, isSacral, mapLesion } from '../src/engine/forward.ts';
import { brainFate, cranialCourses, faceMotorPath, faceSensoryPath, fibreFate, partPoint, targetPoint, visionFibres, visualPartPoint } from '../src/geometry/brain.ts';
import { isVision, type AnyRegion } from '../src/engine/forward.ts';
import { mapVision } from '../src/engine/vision.ts';
import { GENICULATE_CASES } from '../spec/expectations/geniculate.ts';
import { OCCIPITAL_CASES } from '../spec/expectations/occipital.ts';
import { SECTORANOPIA_CASES } from '../spec/expectations/sectoranopia.ts';
import { VISION_CASES } from '../spec/expectations/vision.ts';
import { ANGLE_CASES } from '../spec/expectations/angle.ts';
import { CAVERNOUS_CASES } from '../spec/expectations/cavernous.ts';
import { CRANIAL_NERVE_CASES } from '../spec/expectations/cranial-nerves.ts';
import { FACIAL_CANAL_CASES } from '../spec/expectations/facial-canal.ts';
import { JUGULAR_CASES } from '../spec/expectations/jugular.ts';
import { MIDBRAIN_CASES } from '../spec/expectations/midbrain.ts';
import { NERVE_CASES } from '../spec/expectations/nerves.ts';
import { ORBIT_CASES } from '../spec/expectations/orbit.ts';
import { POSTERIOR_CASES } from '../spec/expectations/posterior.ts';
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

  it('draws each cranial nerve of P29 outside the brainstem, on its own side (S61, S62, S63, S120, S51)', () => {
    const nerves = [
      ['midbrain', 'oculomotor_nerve'],
      ['midbrain', 'trochlear_nerve'],
      ['pons', 'abducens_nerve'],
      ['pons', 'facial_nerve'],
      ['medulla', 'hypoglossal_nerve'],
      // P30: the cavernous sinus's own parts.
      ['midbrain', 'ophthalmic_maxillary'],
      ['midbrain', 'carotid_sympathetic'],
      // P31: at the cerebellopontine angle.
      ['pons', 'vestibulocochlear_nerve'],
      ['pons', 'trigeminal_root'],
      // P32: the fissure.
      ['midbrain', 'ophthalmic_orbit'],
      // P33: the jugular foramen's nerves.
      ['medulla', 'glossopharyngeal_nerve'],
      ['medulla', 'vagus_nerve'],
      ['medulla', 'accessory_nerve'],
      // P34: in the neck.
      ['medulla', 'sympathetic_chain'],
      ['medulla', 'carotid_plexus_neck'],
      // P35: the facial nerve in the temporal bone.
      ['pons', 'facial_above_geniculate'],
      ['pons', 'facial_above_stapedius'],
      ['pons', 'facial_above_chorda'],
    ] as const;
    for (const [level, c] of nerves) {
      const r = L.levels[level].radius;
      for (const side of SIDES) {
        const at = partPoint(RENDER, level, c, side, 'face');
        assert.ok(Math.hypot(at.x, at.z) > r, `${side} ${c} is inside the ${level}`);
        assert.equal(at.x < 0, side === 'L', `${side} ${c} is on the wrong side`);
      }
    }
    // The third and sixth leave ventrally; the fourth runs laterally around the midbrain.
    const at = (level: 'midbrain' | 'pons', c: Parameters<typeof partPoint>[2]) => partPoint(RENDER, level, c, 'L', 'face');
    assert.ok(at('midbrain', 'oculomotor_nerve').z < at('midbrain', 'peduncle').z, 'the third nerve is ventral, in the interpeduncular fossa');
    assert.ok(at('pons', 'abducens_nerve').z < at('pons', 'basis').z, 'the sixth runs ventral to the basilar pons');
    assert.ok(Math.abs(at('midbrain', 'trochlear_nerve').x) > Math.abs(at('midbrain', 'peduncle').x), 'the fourth is lateral, around the midbrain');
  });

  it('puts the subthalamic nucleus below the thalamus and medial to the capsule (S125)', () => {
    const stn = partPoint(RENDER, 'thalamus', 'subthalamic', 'L', 'face');
    assert.ok(stn.y < partPoint(RENDER, 'thalamus', 'vpl', 'L', 'face').y, 'below the thalamic nuclei');
    assert.ok(Math.abs(stn.x) < Math.abs(partPoint(RENDER, 'capsule', 'capsule_posterior_motor', 'L', 'arm').x), 'medial to the capsule');
    assert.ok(stn.y > L.levels.midbrain.y, 'above the midbrain');
  });

  it('draws every part a territory names', () => {
    for (const row of Object.values(KB.brain.territories)) {
      for (const c of row.compartments) assert.ok(partPoint(RENDER, row.level, c, 'R', 'face'), `${row.level} ${c}`);
      // P12: and every part it takes at another level (D77).
      for (const a of row.also ?? []) for (const c of a.compartments) assert.ok(partPoint(RENDER, a.level, c, 'R', 'face'), `${a.level} ${c}`);
    }
  });
});

describe('the cranial nerves are drawn as the engine reads them (P37)', () => {
  const CASES = [...BRAIN_CASES, ...POSTERIOR_CASES, ...MIDBRAIN_CASES, ...NERVE_CASES, ...CRANIAL_NERVE_CASES, ...CAVERNOUS_CASES, ...ANGLE_CASES, ...ORBIT_CASES, ...JUGULAR_CASES, ...FACIAL_CANAL_CASES];

  it('stops a pulse on a nerve exactly when the engine reports that nerve’s sign, in every case', () => {
    let checked = 0;
    let stopped = 0;
    for (const kase of CASES) {
      const bmap = mapBrain(KB, kase.lesion.filter(isBrain));
      const f = forward(kase.lesion, 'chronic');
      for (const side of SIDES) {
        for (const course of cranialCourses(KB, RENDER, side)) {
          const fate = brainFate(bmap, course.elements);
          const drawn = fate.diesAt >= 0 ? 'cut' : fate.dimmed ? 'part' : 'clear';
          const where = `${kase.id} ${side} ${course.id}`;
          if ('division' in course.reads) {
            const state = f.faceDivision[side][course.reads.division];
            assert.equal(drawn === 'clear', state === 'intact', `${where}: drawn ${drawn}, engine ${state}`);
            assert.equal(drawn === 'cut', state === 'lost', `${where}: drawn ${drawn}, engine ${state}`);
          } else {
            const state = f.cranial[side][course.reads.sign];
            if (course.reads.sign === 'palate_weakness') {
              // The palate also has a supply from both hemispheres, which the nerve's course does not draw.
              if (drawn !== 'clear') assert.equal(state, 'present', where);
            } else {
              assert.equal(drawn !== 'clear', state === 'present', `${where}: drawn ${drawn}, engine ${state}`);
            }
          }
          checked++;
          if (drawn !== 'clear') stopped++;
        }
      }
    }
    assert.ok(checked > 1000, `only ${checked} courses checked`);
    assert.ok(stopped > 60, `only ${stopped} pulses stopped: the cases do not exercise the nerves`);
  });

  it('draws every course through parts that have a position, to an organ on its own side', () => {
    for (const side of SIDES) {
      const courses = cranialCourses(KB, RENDER, side);
      assert.equal(new Set(courses.map((c) => c.id)).size, courses.length, 'two courses share an id');
      for (const c of courses) {
        assert.ok(c.elements.length > 0, `${c.id} passes no part`);
        assert.equal(c.points.length, c.elements.length + 1, `${c.id}: one point a part, and the organ`);
        const organ = targetPoint(RENDER, c.target, side);
        assert.equal(organ.x < 0, side === 'L', `${side} ${c.target} is on the wrong side`);
        // A motor course ends at its organ; a sensory one begins there.
        assert.deepEqual(c.dir === 'motor' ? c.points[c.points.length - 1] : c.points[0], organ, `${c.id} does not reach its organ`);
      }
    }
  });

  it('starts the fourth nerve on the side opposite its eye, and no other', () => {
    for (const c of cranialCourses(KB, RENDER, 'L')) {
      const first = c.dir === 'motor' ? c.elements[0] : c.elements[c.elements.length - 1];
      if (c.id === 'IV') assert.equal(first?.side, 'R', 'the trochlear nucleus serves the other eye (S120)');
      if (c.id === 'III' || c.id === 'VI') assert.equal(first?.side, 'L', `${c.id} is uncrossed`);
    }
  });
});

describe('the visual pathway is drawn as the engine reads it (P38)', () => {
  const CASES = [...VISION_CASES, ...OCCIPITAL_CASES, ...GENICULATE_CASES, ...SECTORANOPIA_CASES, ...ORBIT_CASES];
  const fibres = visionFibres(KB, RENDER);

  it('stops a pulse on a fibre exactly where the engine loses that cell of the field, in every case', () => {
    let checked = 0;
    let stopped = 0;
    for (const kase of CASES) {
      const lesion: readonly AnyRegion[] = kase.lesion;
      const vmap = mapVision(KB, lesion.filter(isVision));
      const f = forward(kase.lesion, 'chronic');
      for (const fibre of fibres) {
        const state = f.fields[fibre.eye][fibre.cell];
        const fate = fibreFate(vmap, state, fibre);
        const where = `${kase.id} ${fibre.eye} ${fibre.cell}`;
        const damaged = fibre.parts.filter((p) => vmap.damage(p.part, p.side) > 0);
        // A lost cell must have a damaged part on its drawn fibre to stop at; a seen one, none
        // that carries all of it.
        if (state === 'lost') assert.ok(fate.diesAt > 0, `${where}: lost, but nothing on the fibre is damaged`);
        if (state === 'normal') assert.equal(damaged.filter((p) => p.how === 'whole').length, 0, `${where}: seen, but a part that carries it is damaged`);
        if (state === 'indeterminate') assert.ok(damaged.length > 0, `${where}: unsettled, with nothing damaged on the fibre`);
        checked++;
        if (fate.diesAt > 0) stopped++;
      }
    }
    assert.ok(checked > 300 && stopped > 60, `${checked} fibres checked, ${stopped} stopped`);
  });

  it('crosses the nasal fibres at the chiasm and no others', () => {
    for (const fibre of fibres) {
      const tract = fibre.parts.find((p) => p.part === 'optic_tract');
      const nerve = fibre.parts.find((p) => p.part === 'optic_nerve');
      assert.ok(tract && nerve, `${fibre.eye} ${fibre.cell} has no nerve or no tract`);
      assert.equal(nerve.side, fibre.eye, 'the optic nerve is the eye’s own');
      // Each tract carries the opposite half of space: the temporal field's fibres — from the
      // nasal retina — are the ones that change sides.
      assert.equal(tract.side !== fibre.eye, fibre.fieldSide === fibre.eye, `${fibre.eye} ${fibre.cell}`);
      assert.equal(tract.side !== fibre.fieldSide, true, 'a tract carries the opposite half-field');
      // And only the crossing fibres pass the chiasm as the engine reads it.
      assert.equal(fibre.parts.some((p) => p.part === 'chiasm'), fibre.fieldSide === fibre.eye, `${fibre.eye} ${fibre.cell}: chiasm`);
    }
  });

  it('runs every fibre backward from the eye, with the chiasm on the midline', () => {
    assert.equal(visualPartPoint(KB, RENDER, 'chiasm', 'L').x, 0);
    assert.equal(visualPartPoint(KB, RENDER, 'chiasm', 'R').x, 0);
    for (const fibre of fibres) {
      assert.ok(fibre.points.length >= 4, `${fibre.eye} ${fibre.cell} is too short`);
      const first = fibre.points[0];
      const last = fibre.points[fibre.points.length - 1];
      assert.ok(first && last && last.z > first.z + 3, `${fibre.eye} ${fibre.cell} does not run back to the occipital lobe`);
    }
    // Meyer loop dips below and in front of the parietal fibres (S91, S93).
    const meyer = visualPartPoint(KB, RENDER, 'meyer_loop', 'L');
    const parietal = visualPartPoint(KB, RENDER, 'parietal_radiation', 'L');
    assert.ok(meyer.y < parietal.y && meyer.z < parietal.z);
    assert.ok(visualPartPoint(KB, RENDER, 'calcarine_lower', 'L').y < visualPartPoint(KB, RENDER, 'calcarine_upper', 'L').y);
  });
});
