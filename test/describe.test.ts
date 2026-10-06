import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { forward } from '../src/engine/forward.ts';
import { allParts } from '../src/geometry/brain.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { SOURCE_IDS } from '../src/kb/sources.ts';
import { VISUAL_PARTS, type Side } from '../src/kb/vocab.ts';
import { describePart, partCardHtml, partLesion, partName, steppedRows, type PartRef } from '../src/render/describe.ts';

const brainRefs = (side: Side): PartRef[] =>
  allParts(RENDER)
    .filter((p) => p.side === side)
    .map((p) => ({
      kind: 'brain' as const,
      level: p.level,
      compartment: p.compartment,
      side,
      ...(p.level === 'cortex' && (p.compartment === 'motor_cortex' || p.compartment === 'sensory_cortex') ? { region: p.region } : {}),
    }));
const visionRefs = (side: Side): PartRef[] => VISUAL_PARTS.map((part) => ({ kind: 'vision' as const, part, side }));
const ALL = [...brainRefs('L'), ...brainRefs('R'), ...visionRefs('L'), ...visionRefs('R')];
const card = (ref: PartRef) => describePart(RENDER, ref);

describe('a part named on the stage says only what the model holds (P39)', () => {
  it('names every drawn part, and no two marks on one side share a name', () => {
    for (const side of ['L', 'R'] as const) {
      const names = [...brainRefs(side), ...visionRefs(side)].map((r) => partName(r));
      assert.equal(new Set(names).size, names.length, `two parts on side ${side} share a name`);
      for (const n of names) assert.ok(n.length > 4);
    }
  });

  it('gives every part at least one statement, each a row of the knowledge base with sources that exist', () => {
    const ids = new Set([...steppedRows(KB).map((r) => r.meta.id), ...VISUAL_PARTS.map((p) => KB.vision.parts[p].meta.id)]);
    for (const ref of ALL) {
      const c = card(ref);
      assert.ok(c.carries.length > 0, `${c.name}: no statement`);
      for (const s of c.carries) {
        assert.ok(ids.has(s.id), `${c.name}: ${s.id} is not a row`);
        assert.ok(s.sources.length > 0, `${c.name}: ${s.id} cites nothing`);
        for (const src of s.sources) assert.ok((SOURCE_IDS as readonly string[]).includes(src), `${c.name}: ${src} is not a source`);
      }
    }
  });

  it('lists a statement only when its route passes through the part', () => {
    for (const ref of ALL) {
      if (ref.kind !== 'brain') continue;
      for (const s of card(ref).carries) {
        const row = steppedRows(KB).find((r) => r.meta.id === s.id && r.steps.some((x) => x.level === ref.level && x.compartment === ref.compartment));
        assert.ok(row, `${partName(ref)}: ${s.id} does not pass through it`);
      }
    }
  });

  it('reports no finding for a part the engine reads nothing from, and some finding for the rest', () => {
    const silent: string[] = [];
    for (const ref of ALL) {
      const c = card(ref);
      assert.equal(c.findings.length === 0, c.changed === 0, c.name);
      if (c.changed === 0) silent.push(c.name);
    }
    // Gaze from the frontal eye field and the neck areas of the strips have no slot in the
    // examination; the language areas and border zones of the right hemisphere, not being the
    // dominant one, give nothing the model reads.
    assert.deepEqual(silent.sort(), [
      'Left frontal eye field',
      'Left motor cortex — neck area',
      'Left sensory cortex — neck area',
      'Right anterior border zone',
      'Right frontal eye field',
      'Right inferior frontal gyrus',
      'Right motor cortex — neck area',
      'Right posterior border zone',
      'Right posterior superior temporal gyrus',
      'Right sensory cortex — neck area',
    ]);
  });

  it('reports the engine’s own findings for the lesion of that part alone', () => {
    const find = (ref: PartRef): string => card(ref).findings.join(' | ');
    // The pyramid: weakness, brisk reflexes and a Babinski sign on the other side (frozen in spec/expectations/brain.ts).
    const pyramid = find({ kind: 'brain', level: 'medulla', compartment: 'pyramid', side: 'L' });
    assert.match(pyramid, /Right · weak/);
    assert.match(pyramid, /Right Babinski sign — present/);
    assert.doesNotMatch(pyramid, /Left/);
    // The third nerve: its palsy on its own side.
    const third = { kind: 'brain', level: 'midbrain', compartment: 'oculomotor_nerve', side: 'R' } as const;
    assert.equal(forward(partLesion(third), 'chronic').cranial.R.oculomotor_palsy, 'present');
    assert.match(find(third), /Right third nerve palsy/);
    // The chiasm: the outer half of each eye's field.
    const chiasm = card({ kind: 'vision', part: 'chiasm', side: 'L' });
    assert.equal(chiasm.name, 'The chiasm');
    assert.match(chiasm.findings.join(' | '), /Left eye · abnormal — 5 parts of the field/);
    assert.match(chiasm.findings.join(' | '), /Right eye · abnormal — 5 parts of the field/);
    // The left tract: the right half of both fields, and the pupil defect in the right eye.
    assert.match(find({ kind: 'vision', part: 'optic_tract', side: 'L' }), /Right pupil, afferent defect — present/);
  });

  it('names the places that take a part', () => {
    const third = card({ kind: 'brain', level: 'midbrain', compartment: 'oculomotor_nerve', side: 'L' });
    assert.ok(third.takenBy.some((t) => t.startsWith('cavernous sinus')));
    assert.ok(third.takenBy.some((t) => t.startsWith('orbital apex')));
    const nerve = card({ kind: 'vision', part: 'optic_nerve', side: 'L' });
    assert.ok(nerve.takenBy.some((t) => t.startsWith('orbital apex')));
  });

  it('escapes what it prints and caps a long list', () => {
    const html = partCardHtml({ name: '<b>x</b>', carries: [], takenBy: [], findings: Array.from({ length: 20 }, (_, i) => `f${i} & <`), changed: 20 });
    assert.ok(!html.includes('<b>x</b>'));
    assert.match(html, /and 8 more/);
    assert.match(html, /f0 &amp; &lt;/);
  });
});
