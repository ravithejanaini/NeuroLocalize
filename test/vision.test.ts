import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { forward } from '../src/engine/forward.ts';
import { hypotheses } from '../src/engine/hypotheses.ts';
import { slotKey, type Slot } from '../src/engine/reverse.ts';
import { placeRegions } from '../src/engine/vision.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { FIELD_SECTORS, SIDES, type FieldSector } from '../src/kb/vocab.ts';
import { examSlots } from '../src/render/slots.ts';
import { fieldChart, visionAffected, visionPanel } from '../src/render/vision.ts';

const at = (place: Parameters<typeof placeRegions>[1], side: 'L' | 'R' = 'L') => forward(placeRegions(KB, place, side), 'chronic');
const classesOf = (svg: string): Map<string, string> =>
  new Map(
    [...svg.matchAll(/class="fsec ([a-z-]+)"[^>]*><title>([^<]+)<\/title>/g)].map((m) => [m[2] ?? '', m[1] ?? '']),
  );

describe('the visual field chart (P8)', () => {
  it('draws every sector of each eye, once, each with its own wedge', () => {
    for (const eye of SIDES) {
      const svg = fieldChart(eye, () => 'normal');
      const paths = [...svg.matchAll(/class="fsec [^"]*" d="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(paths.length, FIELD_SECTORS.length, eye);
      assert.equal(new Set(paths).size, FIELD_SECTORS.length, `${eye}: two sectors share a wedge`);
    }
  });

  it('takes each sector’s state from the engine, and puts the temporal half away from the nose', () => {
    const tract = at('optic_tract');
    for (const eye of SIDES) {
      const marks = classesOf(fieldChart(eye, (s) => tract.fields[eye][s]));
      for (const sector of FIELD_SECTORS) {
        const title = [...marks.keys()].find((k) => k.includes(sector.replace(/_/g, ' ')) || k.includes(sectorWord(sector)));
        assert.ok(title, `${eye} ${sector} has no mark`);
        assert.equal(marks.get(title), `fs-${tract.fields[eye][sector]}`, `${eye} ${sector}`);
      }
    }
    // A left tract lesion loses the right half-field: the left eye's nasal side, the right eye's temporal side.
    assert.equal(tract.fields.L.nasal_superior, 'lost');
    assert.equal(tract.fields.R.temporal_superior, 'lost');
    assert.equal(tract.fields.L.temporal_superior, 'normal');
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
    // Both nerves equally cut: no relative defect can be read (D61).
    const both = forward([...placeRegions(KB, 'optic_nerve', 'L'), ...placeRegions(KB, 'optic_nerve', 'R')], 'chronic');
    assert.equal(both.rapd.L, 'indeterminate');
    assert.equal(both.rapd.R, 'indeterminate');
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
    // P24 adds the lateral geniculate nucleus, a seventh place on each side.
    assert.equal(vision.length, 7 * 2 + 2);
  });
});

/** The words the chart puts in a sector's title, for the test above. */
function sectorWord(sector: FieldSector): string {
  if (sector === 'central_left') return 'patient’s left';
  if (sector === 'central_right') return 'patient’s right';
  return sector.startsWith('temporal') ? 'temporal' : 'nasal';
}
