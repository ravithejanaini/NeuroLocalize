import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { forward } from '../src/engine/forward.ts';
import { DEFORMITIES } from '../src/kb/vocab.ts';

describe('deformities (D36)', () => {
  it('leaves a deformity open when the weakness is of the upper motor neuron', () => {
    const f = forward(
      [{ at: { segments: ['C4', 'C4'] }, sides: ['L'], compartments: ['lateral_cst'], severity: 'complete', portion: 'whole' }],
      'chronic',
    );
    assert.equal(f.muscles.L.interossei, 'weak');
    for (const d of DEFORMITIES) assert.equal(f.deformities.L[d], 'indeterminate', d);
    for (const d of DEFORMITIES) assert.equal(f.deformities.R[d], 'absent', d);
  });

  it('counts anterior horn loss as lower motor neuron', () => {
    const f = forward(
      [{ at: { segments: ['T1', 'T1'] }, sides: ['L'], compartments: ['anterior_horn'], severity: 'complete', portion: 'whole' }],
      'chronic',
    );
    assert.equal(f.deformities.L.claw_hand, 'present');
  });

  it('needs every listed muscle for a posture made of several', () => {
    const f = forward([{ plexus: 'axillary', sides: ['L'], severity: 'complete' }], 'chronic');
    assert.equal(f.muscles.L.deltoid, 'weak');
    assert.equal(f.deformities.L.waiters_tip, 'absent');
  });
});
