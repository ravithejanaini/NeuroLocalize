import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_CASES } from '../spec/expectations/index.ts';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { PLEXUS_CASES } from '../spec/expectations/plexus.ts';
import { forward } from '../src/engine/forward.ts';
import { KB as KB_FOR_TERRITORIES } from '../src/kb/kb.ts';
import { check, territoryFailures } from './harness.ts';

const CASES = [...ALL_CASES, ...PLEXUS_CASES, ...BRAIN_CASES];

describe('frozen expectations', () => {
  for (const kase of CASES) {
    describe(`${kase.id} — ${kase.pattern}`, () => {
      for (const ev of kase.evaluations) {
        it(`${ev.timepoint}: ${ev.assertions.length} assertions`, () => {
          const findings = forward(kase.lesion, ev.timepoint);
          const failures = ev.assertions.flatMap((a) =>
            check(a, findings).map((m) => `${m}   ← ${a.cite.join(', ')} (${a.basis})`),
          );
          assert.deepEqual(failures, []);
        });
      }
    });
  }
});

describe('named territories match their frozen cases (D46)', () => {
  it('each territory takes exactly what its case takes', () => {
    assert.deepEqual(territoryFailures(KB_FOR_TERRITORIES).map((f) => f.message), []);
  });
});
