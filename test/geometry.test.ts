import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_CASES } from '../spec/expectations/index.ts';
import type { Case } from '../spec/expectations/types.ts';
import { crossingOffsets, forward, isSacral, mapLesion, routeState, type LesionRegion } from '../src/engine/forward.ts';
import { spanOf, SHAPES, toRegions, type RootCut, type Volume } from '../src/geometry/lesion3d.ts';
import { fate, motorPath, sensoryPath, speedOf, type PathOptions } from '../src/geometry/paths.ts';
import { segmentBounds, segmentsBetween, segmentTop } from '../src/geometry/ruler.ts';
import { CORD_COMPARTMENTS, discAt, fibrePoint, samples, widthCm } from '../src/geometry/section.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { SEGMENTS, SENSORY_MODALITIES, SIDES, type Segment } from '../src/kb/vocab.ts';
import { check } from './harness.ts';

const k = (s: Segment): number => SEGMENTS.indexOf(s);
const MODELS = ['classical', 'revised'] as const;

describe('segment ruler (D16)', () => {
  it('honours every sourced anchor and runs caudally without reversing', () => {
    for (const a of RENDER.ruler.anchors) assert.equal(segmentTop(RENDER, k(a.segment)), a.vertebraTop);
    assert.equal(segmentTop(RENDER, SEGMENTS.length), RENDER.ruler.cordEndsAtVertebra);
    for (let i = 0; i < SEGMENTS.length; i++) {
      const [top, bottom] = segmentBounds(RENDER, i);
      assert.ok(bottom > top, `${SEGMENTS[i]} has no extent`);
    }
  });

  it('agrees with the engine: the L1 vertebra holds exactly the conus segments', () => {
    const row = KB.vertebrae.find((v) => v.vertebra === 'L1');
    assert.ok(row);
    const expected = SEGMENTS.slice(k(row.segments[0]), k(row.segments[1]) + 1);
    assert.deepEqual(segmentsBetween(RENDER, 19, 20).map((i) => SEGMENTS[i]), expected);
  });

  it('cross-check: the L2 segment falls within the T9–T12 lumbar expansion of S30', () => {
    const [top] = segmentBounds(RENDER, k('L2'));
    assert.ok(top >= 15 && top < 19, `L2 starts at vertebral ${top}`);
  });
});

describe('cross-section', () => {
  it('is wide in the enlargements, narrow in the thoracic cord, and tapers at the conus', () => {
    const w = RENDER.cord.widthCm;
    const mid = (r: readonly [number, number]): number => (r[0] + r[1]) / 2;
    assert.equal(widthCm(RENDER, k('C6')), mid(w.cervical));
    assert.equal(widthCm(RENDER, k('T6')), mid(w.thoracic));
    assert.equal(widthCm(RENDER, k('L4')), mid(w.lumbar));
    assert.ok(widthCm(RENDER, k('Co1')) < widthCm(RENDER, k('S3')));
    // S24's actual claim is relational: the thoracic cord is the narrow part.
    assert.ok(widthCm(RENDER, k('T6')) < widthCm(RENDER, k('C6')) / 1.4);
    assert.ok(widthCm(RENDER, k('T6')) < widthCm(RENDER, k('L4')) / 1.4);
  });

  it('draws the lateral horn only from T1 to L2', () => {
    assert.equal(discAt(RENDER, 'intermediolateral', 'L', k('C8')), null);
    assert.equal(discAt(RENDER, 'intermediolateral', 'L', k('L3')), null);
    assert.ok(discAt(RENDER, 'intermediolateral', 'L', k('T1')));
    assert.ok(discAt(RENDER, 'intermediolateral', 'L', k('L2')));
  });

  it('mirrors the right side and keeps samples inside each region', () => {
    for (const c of CORD_COMPARTMENTS) {
      const l = discAt(RENDER, c, 'L', k('T1'));
      const r = discAt(RENDER, c, 'R', k('T1'));
      assert.ok(l && r);
      assert.equal(r.x, -l.x);
      for (const p of samples(l)) assert.ok(Math.hypot(p.x - l.x, p.z - l.z) <= l.r);
    }
  });

  it('places gracilis medial to cuneatus, and lower inputs more medially (S27)', () => {
    const at = (s: Segment): number => Math.abs(fibrePoint(RENDER, 'dorsal_column', 'L', k('C2'), k(s), 'classical')?.x ?? NaN);
    assert.ok(at('S4') < at('L2'));
    assert.ok(at('T7') < at('T5'), 'a gracilis fibre lies medial to a cuneatus fibre');
    assert.ok(at('T5') < at('C6'));
    // S27 splits the column at T6: T7 and below medially (gracilis), T5 and above laterally.
    const centre = Math.abs(discAt(RENDER, 'dorsal_column', 'L', k('C2'))?.x ?? NaN);
    for (const s of ['T7', 'L3', 'S5'] as const) assert.ok(at(s) < centre, `${s} should lie in the medial half`);
    for (const s of ['T5', 'C6', 'C1'] as const) assert.ok(at(s) > centre, `${s} should lie in the lateral half`);
  });

  it('holds the classical spinothalamic arrangement constant, and shifts lower-limb fibres ventrally on ascent in the revised one (S23)', () => {
    const z = (model: 'classical' | 'revised', level: Segment): number =>
      fibrePoint(RENDER, 'anterolateral', 'L', k(level), k('L4'), model)?.z ?? NaN;
    assert.equal(z('classical', 'C4'), z('classical', 'L1'));
    assert.ok(z('revised', 'C4') < z('revised', 'T12'));
  });

  it('keeps every fibre inside its tract, at every level, under both models', () => {
    for (const model of MODELS)
      for (const c of ['dorsal_column', 'anterolateral', 'lateral_cst'] as const)
        for (let level = 0; level < SEGMENTS.length; level++)
          for (let s = 0; s < SEGMENTS.length; s++) {
            const d = discAt(RENDER, c, 'L', level);
            const p = fibrePoint(RENDER, c, 'L', level, s, model);
            assert.ok(d && p);
            assert.ok(Math.hypot(p.x - d.x, p.z - d.z) <= d.r + 1e-9, `${c} ${model} ${SEGMENTS[level]} input ${SEGMENTS[s]}`);
          }
  });
});

describe('conduction speeds (D14, D15)', () => {
  it('orders the fibres as the sources do, with C fifteen times slower than Aδ', () => {
    const v = (c: Parameters<typeof speedOf>[1]): number => speedOf(RENDER, c);
    assert.ok(v('c') < v('adelta') && v('adelta') < v('abeta'));
    assert.equal(v('adelta') / v('c'), 15);
    assert.equal(v('corticospinal'), 67.4);
  });
});

const T8 = spanOf(RENDER, 'T8', 'T8');
const covered = (volumes: Volume[]): string[] =>
  toRegions(RENDER, volumes)
    .map((r) => `${r.compartments.join()}:${r.sides.join()}:${r.severity}${r.portion === 'central' ? ':central' : ''}`)
    .sort();

describe('lesion volumes are measured, not assumed (D18, D19)', () => {
  it('a left hemisection takes every left compartment and nothing on the right', () => {
    assert.deepEqual(covered([{ shape: SHAPES.hemisectionLeft, ...T8 }]), CORD_COMPARTMENTS.map((c) => `${c}:L:complete`).sort());
  });

  it('an anterior-two-thirds lesion spares the posterior columns and dorsal horns (S07)', () => {
    const spared = new Set(['dorsal_column', 'dorsal_horn']);
    const expected = CORD_COMPARTMENTS.filter((c) => !spared.has(c)).flatMap((c) => [`${c}:L:complete`, `${c}:R:complete`]).sort();
    assert.deepEqual(covered([{ shape: SHAPES.anterior, ...T8 }]), expected);
  });

  it('a posterior lesion takes both posterior columns and nothing else', () => {
    assert.deepEqual(covered([{ shape: SHAPES.posterior, ...T8 }]), ['dorsal_column:L:complete', 'dorsal_column:R:complete']);
  });

  it('a small central syrinx takes only the commissure', () => {
    assert.deepEqual(covered([{ shape: SHAPES.syrinx, ...T8 }]), ['commissure:L:complete', 'commissure:R:complete']);
  });

  it('a large central lesion clips both long tracts centrally and takes the commissure', () => {
    const got = covered([{ shape: SHAPES.centralCord, ...spanOf(RENDER, 'C5', 'C5') }]);
    for (const want of [
      'lateral_cst:L:partial:central',
      'anterolateral:L:partial:central',
      'commissure:L:complete',
      'commissure:R:complete',
    ]) {
      assert.ok(got.includes(want), `missing ${want} in ${got.join(' ')}`);
    }
    assert.ok(!got.some((g) => g.startsWith('dorsal_column')), 'posterior columns must be spared');
  });
});

// The P1 exit condition: a lesion placed in 3D must yield the frozen findings.
const volumeFor: Record<string, { volumes: Volume[]; roots?: RootCut[] }> = {
  'complete-T4': { volumes: [{ shape: SHAPES.complete, ...spanOf(RENDER, 'T4', 'T4') }] },
  'complete-T12': { volumes: [{ shape: SHAPES.complete, ...spanOf(RENDER, 'T12', 'T12') }] },
  'complete-T5': { volumes: [{ shape: SHAPES.complete, ...spanOf(RENDER, 'T5', 'T5') }] },
  'complete-T6': { volumes: [{ shape: SHAPES.complete, ...spanOf(RENDER, 'T6', 'T6') }] },
  'complete-T7': { volumes: [{ shape: SHAPES.complete, ...spanOf(RENDER, 'T7', 'T7') }] },
  'complete-T10': { volumes: [{ shape: SHAPES.complete, ...spanOf(RENDER, 'T10', 'T10') }] },
  'complete-T11': { volumes: [{ shape: SHAPES.complete, ...spanOf(RENDER, 'T11', 'T11') }] },
  'hemisection-T8-left': { volumes: [{ shape: SHAPES.hemisectionLeft, ...T8 }] },
  'hemisection-C7-left': { volumes: [{ shape: SHAPES.hemisectionLeft, ...spanOf(RENDER, 'C7', 'C7') }] },
  'anterior-T6': { volumes: [{ shape: SHAPES.anterior, ...spanOf(RENDER, 'T6', 'T6') }] },
  'central-cord-C4-C6': { volumes: [{ shape: SHAPES.centralCord, ...spanOf(RENDER, 'C4', 'C6') }] },
  'syrinx-C4-T1': { volumes: [{ shape: SHAPES.syrinx, ...spanOf(RENDER, 'C4', 'T1') }] },
  'posterior-columns-T6': { volumes: [{ shape: SHAPES.posterior, ...spanOf(RENDER, 'T6', 'T6') }] },
  'conus-at-L1-vertebra': { volumes: [{ shape: SHAPES.complete, top: 19, bottom: 20 }] },
  'root-C6-left': { volumes: [], roots: [{ side: 'L', from: 'C6', to: 'C6', roots: ['dorsal_root', 'ventral_root'] }] },
  'cauda-L3-Co1': {
    volumes: [],
    roots: SIDES.map((side): RootCut => ({ side, from: 'L3', to: 'Co1', roots: ['dorsal_root', 'ventral_root'] })),
  },
};

describe('P1 exit: lesions placed in 3D reproduce the frozen findings', () => {
  for (const kase of ALL_CASES) {
    const placed = volumeFor[kase.id];
    if (!placed) continue;
    it(`${kase.id} — ${kase.pattern}`, () => {
      const regions = toRegions(RENDER, placed.volumes, placed.roots);
      const failures = kase.evaluations.flatMap((ev) => {
        const f = forward(regions, ev.timepoint);
        return ev.assertions.flatMap((a) => check(a, f).map((m) => `${ev.timepoint}: ${m}`));
      });
      assert.deepEqual(failures, []);
    });
  }

  it('covers every focal case that has a volumetric equivalent', () => {
    assert.equal(Object.keys(volumeFor).length, 16);
    for (const id of Object.keys(volumeFor)) assert.ok(ALL_CASES.some((c: Case) => c.id === id), id);
  });
});

const OPTIONS: PathOptions = { model: 'classical', painFibre: 'adelta' };

describe('pulses die exactly where the engine says the signal is lost (D18)', () => {
  it('agrees with the engine on every route in every case, under both models', () => {
    let routes = 0;
    for (const kase of ALL_CASES) {
      const map = mapLesion(kase.lesion as readonly LesionRegion[], KB);
      for (const x of SIDES)
        for (const m of SENSORY_MODALITIES)
          for (let s = 0; s < SEGMENTS.length; s++)
            for (const o of m === 'posterior_column' ? [0] : crossingOffsets(KB)) {
              const engine = routeState(map, KB, sensoryPathRoute(x, m, s, o), isSacral(KB, s));
              for (const model of MODELS) {
                const path = sensoryPath(KB, RENDER, x, m, s, o, { ...OPTIONS, model });
                const f = fate(map, KB, path, isSacral(KB, s));
                const drawn = f.diesAtPoint >= 0 ? 'lost' : f.dimmed ? 'impaired' : 'intact';
                assert.equal(drawn, engine, `${kase.id} ${x} ${m} ${SEGMENTS[s]} offset ${o} ${model}`);
                routes++;
              }
            }
    }
    assert.ok(routes > 10_000, `only ${routes} routes checked`);
  });

  it('kills a pulse only inside the lesion that killed it', () => {
    const volume: Volume = { shape: SHAPES.hemisectionLeft, ...T8 };
    const lesioned = new Set(segmentsBetween(RENDER, volume.top, volume.bottom));
    const map = mapLesion(toRegions(RENDER, [volume]), KB);
    for (const x of SIDES)
      for (let s = 0; s < SEGMENTS.length; s++) {
        const path = sensoryPath(KB, RENDER, x, 'posterior_column', s, 0, OPTIONS);
        const f = fate(map, KB, path, isSacral(KB, s));
        if (f.diesAtPoint < 0) continue;
        const i = path.elementPoint.indexOf(f.diesAtPoint);
        const e = path.route.elements[i];
        assert.ok(e && lesioned.has(e.segment), `pulse from ${x} ${SEGMENTS[s]} died outside the lesion`);
      }
    for (const x of SIDES)
      for (let s = 0; s < SEGMENTS.length; s++) {
        const f = fate(map, KB, motorPath(KB, RENDER, x, s, OPTIONS), false);
        if (f.diesAtPoint < 0) continue;
        assert.equal(x, 'L', 'a left hemisection must not stop a right motor command');
      }
  });
});

function sensoryPathRoute(x: 'L' | 'R', m: 'pain_temperature' | 'posterior_column', s: number, o: number) {
  return sensoryPath(KB, RENDER, x, m, s, o, OPTIONS).route;
}
