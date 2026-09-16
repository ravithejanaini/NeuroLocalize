import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_CASES as CASES } from '../spec/expectations/index.ts';
import { forward } from '../src/engine/forward.ts';
import { check } from './harness.ts';

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
