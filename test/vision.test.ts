import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { forward } from '../src/engine/forward.ts';
import { hypotheses } from '../src/engine/hypotheses.ts';
import { slotKey, type Slot } from '../src/engine/reverse.ts';
import { placeRegions } from '../src/engine/vision.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { FIELD_CELLS, FIELD_SECTORS, SIDES, cellsOf } from '../src/kb/vocab.ts';
import { SECTOR_NAME } from '../src/render/examine.ts';
import { examSlots } from '../src/render/slots.ts';
import { fieldChart, visionAffected, visionPanel } from '../src/render/vision.ts';

const at = (place: Parameters<typeof placeRegions>[1], side: 'L' | 'R' = 'L') => forward(placeRegions(KB, place, side), 'chronic');
const classesOf = (svg: string): Map<string, string> =>
  new Map(
    [...svg.matchAll(/class="fsec ([a-z-]+)"[^>]*><title>([^<]+)<\/title>/g)].map((m) => [m[2] ?? '', m[1] ?? '']),
  );

describe('the visual field chart (P8)', () => {
  it('draws every cell of each eye, once, each with its own wedge (P28)', () => {
    for (const eye of SIDES) {
      const svg = fieldChart(eye, () => 'normal');
      const paths = [...svg.matchAll(/class="fsec [^"]*" d="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(paths.length, FIELD_CELLS.length, eye);
      assert.equal(new Set(paths).size, FIELD_CELLS.length, `${eye}: two cells share a wedge`);
    }
  });

  it('draws each cell beside its own meridian: horizontal cells touch y = 50, vertical cells x = 50 (P28)', () => {
    for (const eye of SIDES) {
      const svg = fieldChart(eye, () => 'normal');
      for (const cell of FIELD_CELLS.filter((c) => !c.startsWith('central'))) {
        const m = [...svg.matchAll(/<path class="fsec [^"]*" d="([^"]+)"><title>([^<]+)<\/title>/g)].find((x) => (x[2] ?? '').includes(SECTOR_NAME[cell]));
        assert.ok(m, `${eye} ${cell} is not drawn`);
        // The wedge's two rim points: after L and at the end of the arc.
        const nums = (m[1] ?? '').match(/-?\d+\.\d+/g)?.map(Number) ?? [];
        const rim = [[nums[0], nums[1]], [nums[nums.length - 2], nums[nums.length - 1]]];
        const touches = cell.endsWith('_horizontal') ? rim.some(([, y]) => Math.abs((y ?? 0) - 50) < 0.01) : rim.some(([x]) => Math.abs((x ?? 0) - 50) < 0.01);
        assert.ok(touches, `${eye} ${cell} is not beside its meridian: ${m[1]}`);
        // And on the right side and height: temporal away from the nose, superior above the centre.
        const cx = ((rim[0]?.[0] ?? 0) + (rim[1]?.[0] ?? 0)) / 2;
        const cy = ((rim[0]?.[1] ?? 0) + (rim[1]?.[1] ?? 0)) / 2;
        const viewerLeft = cell.startsWith('temporal') === (eye === 'L');
        assert.equal(cx < 50, viewerLeft, `${eye} ${cell} is on the wrong side`);
        assert.equal(cy < 50, cell.includes('_superior'), `${eye} ${cell} is at the wrong height`);
      }
    }
  });

  it('takes each sector’s state from the engine, and puts the temporal half away from the nose', () => {
    const tract = at('optic_tract');
    for (const eye of SIDES) {
      const marks = classesOf(fieldChart(eye, (s) => tract.fields[eye][s]));
      for (const sector of FIELD_CELLS) {
        const title = [...marks.keys()].find((k) => k.includes(SECTOR_NAME[sector]));
        assert.ok(title, `${eye} ${sector} has no mark`);
        assert.equal(marks.get(title), `fs-${tract.fields[eye][sector]}`, `${eye} ${sector}`);
      }
      // The coarse sectors still read as before: each quadrant is its two cells (D149).
      for (const sector of FIELD_SECTORS) {
        assert.ok(cellsOf(sector).every((c) => tract.fields[eye][c] === tract.fields[eye][sector]), `${eye} ${sector}`);
      }
    }
    // A left tract lesion loses the right half-field: the left eye's nasal side, the right eye's temporal side.
    assert.equal(tract.fields.L.nasal_superior, 'lost');
    assert.equal(tract.fields.R.temporal_superior, 'lost');
    assert.equal(tract.fields.L.temporal_superior, 'normal');
  });

  it('reads a quadrant half-lost as unsettled, and lists the cells in the panel (P28, D149)', () => {
    const wedge = at('lgn_crest');
    assert.equal(wedge.fields.L.nasal_superior_horizontal, 'lost');
    assert.equal(wedge.fields.L.nasal_superior_vertical, 'normal');
    assert.equal(wedge.fields.L.nasal_superior, 'indeterminate');
    const panel = visionPanel(wedge);
    assert.match(panel, /upper inner quadrant, beside the horizontal meridian<\/th><td class="st st-field-lost">lost/);
    assert.doesNotMatch(panel, /<th>upper inner quadrant \(nasal\)<\/th>/);
    // A whole lesion still reads, and lists, whole quadrants.
    assert.match(visionPanel(at('optic_tract')), /<th>upper inner quadrant \(nasal\)<\/th>/);
  });

  it('shows macular sparing as the centre kept, and a whole occipital lesion as the centre lost', () => {
    const pca = at('pca_occipital');
    assert.equal(pca.fields.L.central_right, 'normal');
    assert.equal(pca.fields.L.nasal_superior, 'lost');
    const whole = at('occipital_cortex');
    assert.equal(whole.fields.L.central_right, 'lost');
    assert.match(visionPanel(pca), /afferent pupillary defect/);
    assert.match(visionPanel(pca), /st-field-lost/);
    assert.equal(visionAffected(forward([], 'chronic')), false);
    assert.equal(visionAffected(pca), true);
  });

  it('leaves the centre unsettled when only one radiation is cut', () => {
    for (const place of ['meyer_loop', 'parietal_radiation'] as const) {
      const f = at(place);
      assert.equal(f.fields.L.central_right, 'indeterminate', place);
      assert.equal(f.fields.L.central_left, 'normal', place);
    }
  });

  it('puts the pupillary defect on the right side of the pathway', () => {
    assert.equal(at('optic_nerve').rapd.L, 'present');
    assert.equal(at('optic_nerve').rapd.R, 'absent');
    assert.equal(at('optic_tract').rapd.R, 'present', 'opposite the lesion');
    assert.equal(at('optic_tract').rapd.L, 'absent');
    assert.equal(at('chiasm').rapd.L, 'indeterminate', 'C27');
    assert.equal(at('pca_occipital').rapd.L, 'absent', 'behind the geniculate');
    // Both nerves equally cut: no relative defect (S95; D61, corrected by D131 for R30).
    const both = forward([...placeRegions(KB, 'optic_nerve', 'L'), ...placeRegions(KB, 'optic_nerve', 'R')], 'chronic');
    assert.equal(both.rapd.L, 'absent');
    assert.equal(both.rapd.R, 'absent');
  });

  it('offers a pressable control for every field slot the engine can suggest', () => {
    const offered = new Set(
      SIDES.flatMap((eye) => [...fieldChart(eye, () => 'normal', new Map()).matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1])),
    );
    const wanted = examSlots(RENDER)
      .filter((s): s is Extract<Slot, { kind: 'field' }> => s.kind === 'field')
      .map(slotKey);
    assert.deepEqual([...offered].sort(), wanted.sort());
  });

  it('is a candidate at every named place, the chiasm and both PCAs once', () => {
    const vision = hypotheses().filter((h) => h.family.startsWith('visual'));
    assert.equal(vision.filter((h) => h.family === 'visual_chiasm').length, 1, 'the chiasm is midline');
    assert.equal(vision.filter((h) => h.family === 'visual_both').length, 1, 'both PCAs are one candidate (P18)');
    // P24 adds the lateral geniculate nucleus, a seventh place on each side; P28 its crest and
    // its horns, a ninth.
    assert.equal(vision.length, 9 * 2 + 2);
  });
});
