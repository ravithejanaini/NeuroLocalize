import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_CASES } from '../spec/expectations/index.ts';
import { forward } from '../src/engine/forward.ts';
import { SHAPES } from '../src/geometry/lesion3d.ts';
import { RENDER } from '../src/kb/render.ts';
import { SEGMENTS, type Timepoint } from '../src/kb/vocab.ts';
import { bodyDots, bodyMapSvg, myotomeState, myotomeTable, sensoryLevelText, SAMPLE_INPUTS, sliceSvg } from '../src/render/svg.ts';

const findingsFor = (id: string, t: Timepoint = 'chronic') => {
  const kase = ALL_CASES.find((c) => c.id === id);
  assert.ok(kase, id);
  return forward(kase.lesion, t);
};
const k = (s: (typeof SEGMENTS)[number]): number => SEGMENTS.indexOf(s);

describe('body map (D21)', () => {
  it('marks exactly the landmarks S21 gives, and nothing for the segments it omits', () => {
    const fromS21 = ['C6', 'C7', 'C8', 'T1', 'T2', 'T4', 'T6', 'T10', 'L3', 'L4', 'L5', 'S1'];
    assert.deepEqual(RENDER.dermatomeLandmarks.landmarks.map((l) => l.segment), fromS21);
  });

  it('draws the patient’s left on the viewer’s right, mirrored, inside the frame', () => {
    const dots = bodyDots(RENDER, findingsFor('hemisection-T8-left'), 'pain_temperature');
    for (const d of dots) {
      assert.ok(d.x > 0 && d.x < 200 && d.y > 0 && d.y < 364, `${d.side} ${d.segment} outside the frame`);
      assert.ok(d.side === 'L' ? d.x > 100 : d.x < 100, `${d.side} ${d.segment} on the wrong half`);
    }
  });

  it('shows Brown-Séquard as the frozen findings describe it', () => {
    const f = findingsFor('hemisection-T8-left');
    const state = (m: 'pain_temperature' | 'posterior_column', side: 'L' | 'R', seg: string): string | undefined =>
      bodyDots(RENDER, f, m).find((d) => d.side === side && d.segment === seg)?.state;
    for (const seg of ['L3', 'L4', 'L5', 'S1', 'S3–S5']) {
      assert.equal(state('pain_temperature', 'R', seg), 'lost', `right pain ${seg}`);
      assert.equal(state('pain_temperature', 'L', seg), 'intact', `left pain ${seg}`);
      assert.equal(state('posterior_column', 'L', seg), 'lost', `left vibration ${seg}`);
      assert.equal(state('posterior_column', 'R', seg), 'intact', `right vibration ${seg}`);
    }
    assert.equal(state('pain_temperature', 'R', 'T10'), 'indeterminate', 'the umbilicus sits in the crossing band');
    for (const seg of ['C6', 'T4', 'T6']) assert.equal(state('pain_temperature', 'R', seg), 'intact');
  });

  it('flags the saddle as a convention and labels every dot', () => {
    const svg = bodyMapSvg(RENDER, findingsFor('cauda-L3-Co1'), 'pain_temperature');
    assert.match(svg, /S3–S5 — perianal: lost \(segment assignment is a convention\)/);
    assert.equal((svg.match(/<title>/g) ?? []).length, bodyDots(RENDER, findingsFor('cauda-L3-Co1'), 'pain_temperature').length);
  });

  it('states the sensory level against the landmarks', () => {
    assert.equal(
      sensoryLevelText(RENDER, findingsFor('hemisection-T8-left'), 'R', 'pain_temperature'),
      'first affected at T9 — below the xiphoid (T6), above the umbilicus (T10)',
    );
    assert.equal(sensoryLevelText(RENDER, findingsFor('hemisection-T8-left'), 'R', 'posterior_column'), 'intact at every segment');
    assert.match(sensoryLevelText(RENDER, findingsFor('syrinx-C4-T1'), 'L', 'pain_temperature'), /intact again below T4$/);
  });
});

describe('myotome grid (C9)', () => {
  it('covers C5 to S2 without a gap, and marks the contested rows', () => {
    const rows = RENDER.myotomes.rows;
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const row = rows[i];
      assert.ok(prev && row);
      assert.equal(k(row.span[0]), k(prev.span[1]) + 1, `gap before ${row.span[0]}`);
    }
    assert.deepEqual(rows.filter((r) => r.otherAccount).map((r) => r.span[0]), ['C7', 'C8']);
    const html = myotomeTable(RENDER, findingsFor('root-C6-left'));
    assert.equal((html.match(/class="contested"/g) ?? []).length, 2);
  });

  it('reads the engine: a left C6 root gives LMN at C6 on the left only', () => {
    const f = findingsFor('root-C6-left');
    assert.equal(myotomeState(f, 'L', ['C6', 'C6']), 'lmn');
    assert.equal(myotomeState(f, 'R', ['C6', 'C6']), 'none');
    assert.equal(myotomeState(f, 'L', ['C5', 'C5']), 'none');
  });

  it('takes the worst state across a multi-segment row', () => {
    const f = findingsFor('complete-T4');
    assert.equal(myotomeState(f, 'L', ['T2', 'L1']), 'lmn', 'the lesioned T4 anterior horn lies inside T2–L1');
  });
});

describe('slice (D23)', () => {
  it('draws only fibres that still run at that level', () => {
    const svg = sliceSvg(RENDER, k('T8'), 'classical', null);
    const marks = [...svg.matchAll(/data-region="(\w+)"/g)].map((m) => m[1]);
    const running = SAMPLE_INPUTS.filter((f) => k(f.segment) > k('T8')).map((f) => f.region);
    assert.deepEqual(new Set(marks), new Set(running));
    assert.equal(marks.length, running.length * 2 * 3, 'both sides, three tracts');
    assert.doesNotMatch(svg, /class="lesion"/);
  });

  it('shows the lesion hatch only when given one, and moves fibres with the model', () => {
    assert.match(sliceSvg(RENDER, k('T8'), 'classical', SHAPES.hemisectionLeft), /class="lesion"/);
    const at = (model: 'classical' | 'revised'): string =>
      sliceSvg(RENDER, k('C4'), model, null).match(/<text class="fib"[^>]*data-tract="anterolateral"[^>]*data-region="leg"/)?.[0] ?? '';
    assert.ok(at('classical') && at('revised'));
    assert.notEqual(at('classical'), at('revised'), 'the disputed lamination must be visible in the slice');
  });
});
