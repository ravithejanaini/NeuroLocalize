import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_CASES as CASES } from '../spec/expectations/index.ts';
import { forward } from '../src/engine/forward.ts';
import { SEGMENTS } from '../src/kb/vocab.ts';

describe('engine contract', () => {
  it('findings never depend on the disputed lamination model (A—11)', () => {
    for (const kase of CASES) {
      for (const ev of kase.evaluations) {
        assert.deepEqual(
          forward(kase.lesion, ev.timepoint, { laminationModel: 'classical' }),
          forward(kase.lesion, ev.timepoint, { laminationModel: 'revised' }),
          `${kase.id} at ${ev.timepoint}`,
        );
      }
    }
  });

  it('is deterministic', () => {
    for (const kase of CASES) {
      const ev = kase.evaluations[0];
      if (!ev) continue;
      assert.deepEqual(forward(kase.lesion, ev.timepoint), forward(kase.lesion, ev.timepoint));
    }
  });

  it('an intact cord produces no deficit at any timepoint', () => {
    for (const t of ['hyperacute', 'acute', 'subacute', 'chronic'] as const) {
      const f = forward([], t);
      for (const x of ['L', 'R'] as const) {
        for (const seg of SEGMENTS) {
          assert.equal(f.sensory[x].pain_temperature[seg], 'intact');
          assert.equal(f.sensory[x].posterior_column[seg], 'intact');
          assert.deepEqual(f.motor[x][seg], { lesion: 'none', tone: 'normal' });
        }
        assert.ok(Object.values(f.reflexes[x]).every((r) => r === 'normal'));
        assert.equal(f.babinski[x], 'absent');
        assert.equal(f.horner[x], 'absent');
      }
      assert.equal(f.bladder, 'normal');
      assert.equal(f.romberg, 'absent');
      assert.equal(f.dysreflexia, 'none');
      assert.deepEqual(f.qualifiers, { upper_limb_predominant_weakness: false, sacral_sparing: false });
    }
  });

  it('refuses a vertebra the knowledge base cannot map', () => {
    assert.throws(
      () => forward([{ at: { vertebra: 'T3' }, sides: ['L'], compartments: ['dorsal_column'], severity: 'complete', portion: 'whole' }], 'chronic'),
      /No knowledge-base row maps the T3 vertebra/,
    );
  });

  it('refuses a span given caudal end first', () => {
    assert.throws(
      () => forward([{ at: { segments: ['T8', 'T4'] }, sides: ['L'], compartments: ['dorsal_column'], severity: 'complete', portion: 'whole' }], 'chronic'),
      /rostral end first/,
    );
  });
});
