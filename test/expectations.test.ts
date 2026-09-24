import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_CASES } from '../spec/expectations/index.ts';
import { BRAIN_CASES } from '../spec/expectations/brain.ts';
import { PLEXUS_CASES } from '../spec/expectations/plexus.ts';
import { LEG_CASES } from '../spec/expectations/leg.ts';
import { VISION_CASES } from '../spec/expectations/vision.ts';
import { LANGUAGE_CASES } from '../spec/expectations/language.ts';
import { CEREBELLUM_CASES } from '../spec/expectations/cerebellum.ts';
import { POSTERIOR_CASES } from '../spec/expectations/posterior.ts';
import { MIDBRAIN_CASES } from '../spec/expectations/midbrain.ts';
import { NERVE_CASES } from '../spec/expectations/nerves.ts';
import { BASAL_CASES } from '../spec/expectations/basal.ts';
import { BASILAR_CASES } from '../spec/expectations/basilar.ts';
import { CORTEX_CASES } from '../spec/expectations/cortex.ts';
import { forward } from '../src/engine/forward.ts';
import { KB as KB_FOR_TERRITORIES } from '../src/kb/kb.ts';
import { check, territoryFailures, visionPlaceFailures } from './harness.ts';

const CASES = [...ALL_CASES, ...PLEXUS_CASES, ...LEG_CASES, ...BRAIN_CASES, ...VISION_CASES, ...LANGUAGE_CASES, ...CEREBELLUM_CASES, ...POSTERIOR_CASES, ...MIDBRAIN_CASES, ...NERVE_CASES, ...BASAL_CASES, ...CORTEX_CASES, ...BASILAR_CASES];

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

describe('places of the visual pathway match their frozen cases (P8)', () => {
  it('each place takes exactly what its case takes', () => {
    assert.deepEqual(visionPlaceFailures(KB_FOR_TERRITORIES).map((f) => f.message), []);
  });
});

describe('named territories match their frozen cases (D46)', () => {
  it('each territory takes exactly what its case takes', () => {
    assert.deepEqual(territoryFailures(KB_FOR_TERRITORIES).map((f) => f.message), []);
  });
});
