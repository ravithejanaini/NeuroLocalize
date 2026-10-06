import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { forward } from '../src/engine/forward.ts';
import { allParts, cranialCourses } from '../src/geometry/brain.ts';
import { KB } from '../src/kb/kb.ts';
import { RENDER } from '../src/kb/render.ts';
import { SOURCE_IDS } from '../src/kb/sources.ts';
import { COMPARTMENTS, CRANIAL_TARGETS, PLEXUS_SITES, SEGMENTS, VISUAL_PARTS, type Side } from '../src/kb/vocab.ts';
import { cordRows, describePart, partCardHtml, partLesion, partName, plexusRows, refKey, rootRows, steppedRows, type PartRef } from '../src/render/describe.ts';

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
    assert.match(pyramid, /Right side: 25 muscles weak/);
    assert.match(pyramid, /Right Babinski sign(?!:)/);
    assert.doesNotMatch(pyramid, /Left/);
    // The third nerve: its palsy on its own side.
    const third = { kind: 'brain', level: 'midbrain', compartment: 'oculomotor_nerve', side: 'R' } as const;
    assert.equal(forward(partLesion(third), 'chronic').cranial.R.oculomotor_palsy, 'present');
    assert.match(find(third), /On the right: third nerve palsy/);
    // The label speaks of "this eye"; the card says "the eye", and nothing ends in "present".
    assert.match(find(third), /On the right: the eye does not adduct/);
    assert.doesNotMatch(find(third), /this eye|present/);
    // The chiasm: the outer half of each eye's field.
    const chiasm = card({ kind: 'vision', part: 'chiasm', side: 'L' });
    assert.equal(chiasm.name, 'The chiasm');
    assert.match(chiasm.findings.join(' | '), /Left eye: 5 parts of the field abnormal/);
    assert.match(chiasm.findings.join(' | '), /Right eye: 5 parts of the field abnormal/);
    // The left tract: the right half of both fields, and the pupil defect in the right eye.
    assert.match(find({ kind: 'vision', part: 'optic_tract', side: 'L' }), /Right pupil, afferent defect(?!:)/);
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

describe('the cord, the roots, the plexus and the end organs can be named too (P41)', () => {
  const seg = (name: string): number => (SEGMENTS as readonly string[]).indexOf(name);
  const find = (ref: PartRef): string => card(ref).findings.join(' | ');

  it('gives every part of the cord, every root and every place beyond them a name and a sourced statement', () => {
    const refs: PartRef[] = [
      ...COMPARTMENTS.map((compartment) => ({ kind: 'cord' as const, compartment, side: 'L' as const, k: seg('C6') })),
      ...SEGMENTS.map((_, k) => ({ kind: 'root' as const, side: 'R' as const, k })),
      ...PLEXUS_SITES.map((site) => ({ kind: 'plexus' as const, site, side: 'L' as const })),
      ...CRANIAL_TARGETS.map((target) => ({ kind: 'organ' as const, target, side: 'L' as const })),
    ];
    assert.equal(new Set(refs.map(refKey)).size, refs.length);
    assert.equal(new Set(refs.map((r) => partName(r))).size, refs.length, 'two parts share a name');
    for (const ref of refs) {
      const c = card(ref);
      assert.ok(c.carries.length > 0, `${c.name}: no statement`);
      for (const s of c.carries) {
        assert.ok(s.sources.length > 0, `${c.name}: ${s.id} cites nothing`);
        for (const src of s.sources) assert.ok((SOURCE_IDS as readonly string[]).includes(src), `${c.name}: ${src} is not a source`);
      }
    }
  });

  it('quotes for a part of the cord the rows the engine reads for it', () => {
    // A row that names a compartment in its own data must be quoted for that compartment.
    const named = (c: string): string[] => {
      const out: string[] = [];
      const walk = (v: unknown): void => {
        if (!v || typeof v !== 'object') return;
        const row = v as { meta?: { id: string } };
        if (row.meta?.id && JSON.stringify({ ...row, meta: undefined }).includes(`"${c}"`)) out.push(row.meta.id);
        for (const x of Object.values(v)) walk(x);
      };
      for (const top of [KB.pathways, KB.compartments, KB.autonomic, KB.observations]) walk(top);
      return out;
    };
    for (const c of COMPARTMENTS) {
      const quoted = cordRows(KB, c).map((m) => m.id);
      assert.equal(new Set(quoted).size, quoted.length);
      // The micturition centre names four parts of its arc; it is quoted once, at the lateral horn.
      for (const id of named(c)) assert.ok(quoted.includes(id) || id === 'autonomic.micturition-centre', `${c}: ${id} names it and is not quoted`);
    }
    // And each part does what its rows say, at a segment where it shows.
    assert.match(find({ kind: 'cord', compartment: 'dorsal_column', side: 'L', k: seg('C6') }), /Left side: vibration abnormal/);
    assert.match(find({ kind: 'cord', compartment: 'anterolateral', side: 'L', k: seg('C6') }), /Right side: pain abnormal/);
    assert.match(find({ kind: 'cord', compartment: 'lateral_cst', side: 'L', k: seg('C6') }), /Left Babinski sign/);
    assert.match(find({ kind: 'cord', compartment: 'descending_autonomic', side: 'L', k: seg('C6') }), /Left Horner syndrome/);
    assert.match(find({ kind: 'cord', compartment: 'intermediolateral', side: 'L', k: seg('T1') }), /Left Horner syndrome/);
  });

  it('reads a root as its dorsal and ventral parts together, with the reflexes and outflow of its segment', () => {
    const c6 = card({ kind: 'root', side: 'L', k: seg('C6') });
    assert.equal(c6.name, 'Left C6 root');
    assert.deepEqual(
      c6.carries.map((s) => s.id).filter((id) => id.startsWith('reflex.')),
      ['reflex.biceps', 'reflex.brachioradialis'],
    );
    assert.match(c6.findings.join(' | '), /Left biceps reflex: reduced or absent/);
    const t1 = card({ kind: 'root', side: 'L', k: seg('T1') });
    assert.ok(t1.carries.some((s) => s.id === 'autonomic.sympathetic-outflow'));
    assert.match(t1.findings.join(' | '), /Left Horner syndrome/);
    assert.ok(!rootRows(KB, seg('T6')).some((m) => m.id.startsWith('reflex.') || m.id === 'autonomic.sympathetic-outflow'));
  });

  it('quotes for a place beyond the roots the row of its trunk, cord or nerve, and names what takes it', () => {
    for (const site of PLEXUS_SITES) assert.ok(plexusRows(KB, site).length > 0, `${site}: no row`);
    assert.deepEqual(
      plexusRows(KB, 'upper_trunk').map((m) => m.id),
      ['plexus.trunks'],
    );
    assert.deepEqual(
      plexusRows(KB, 'radial_spiral_groove').map((m) => m.id),
      ['nerve.radial'],
    );
    const lower = card({ kind: 'plexus', site: 'lower_trunk', side: 'L' });
    assert.ok(lower.takenBy.some((t) => t.startsWith('lung apex')));
    assert.match(find({ kind: 'plexus', site: 'axillary', side: 'R' }), /Right shoulder abduction \(deltoid\): weak/);
  });

  it('says of an end organ which nerves reach it, quoting only the rows those courses were built from', () => {
    for (const target of CRANIAL_TARGETS) {
      const c = card({ kind: 'organ', target, side: 'L' });
      const courses = cranialCourses(KB, RENDER, 'L').filter((x) => x.target === target);
      assert.deepEqual(
        c.reachedBy,
        courses.map((x) => x.name),
      );
      assert.ok(courses.length > 0 && courses.every((x) => x.rows.length > 0), `${target}: a course with no row`);
      assert.deepEqual([...c.carries.map((s) => s.id)].sort(), [...new Set(courses.flatMap((x) => x.rows))].sort());
      assert.equal(c.changed, 0);
      assert.equal(partLesion({ kind: 'organ', target, side: 'L' }).length, 0);
    }
    const eye = card({ kind: 'organ', target: 'eye', side: 'L' });
    assert.deepEqual(eye.reachedBy, ['oculomotor nerve', 'trochlear nerve', 'abducens nerve']);
    assert.match(partCardHtml(eye), /Reached by/);
    assert.doesNotMatch(partCardHtml(eye), /Lost alone/);
  });
});
