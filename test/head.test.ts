import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { territoryRegions } from '../src/engine/hypotheses.ts';
import { forward } from '../src/engine/forward.ts';
import { KB } from '../src/kb/kb.ts';
import { TERRITORIES } from '../src/kb/vocab.ts';
import { crossedSide, headAffected, headHtml } from '../src/render/head.ts';
import { PRESETS } from '../src/render/presets.ts';

const at = (t: (typeof TERRITORIES)[number]) => forward(territoryRegions(KB, t, 'L'), 'chronic');

describe('the head and brainstem in the findings panel', () => {
  it('calls a brainstem lesion crossed, and nothing above or below it', () => {
    assert.equal(crossedSide(at('lateral_medullary')), 'L');
    assert.equal(crossedSide(at('medial_medullary')), 'L');
    assert.equal(crossedSide(at('ventral_pons')), 'L');
    assert.equal(crossedSide(at('midbrain_peduncle')), 'L');
    assert.equal(crossedSide(at('internal_capsule')), null, 'the tongue weakness is on the weak side');
    assert.equal(crossedSide(at('mca_cortex')), null);
    assert.equal(crossedSide(at('dorsal_pons')), null, 'no body deficit');
    const hemicord = forward(
      [{ at: { segments: ['C4', 'C4'] }, sides: ['L'], compartments: ['dorsal_column', 'lateral_cst', 'anterolateral'], severity: 'complete', portion: 'whole' }],
      'chronic',
    );
    assert.equal(crossedSide(hemicord), null, 'a cord lesion has no head sign');
  });

  it('writes the forehead rule into the facial findings', () => {
    assert.match(headHtml(at('internal_capsule')), /<td class="st st-lost">lower face weak, forehead spared/);
    assert.match(headHtml(at('ventral_pons')), /<td class="st st-lost">whole face weak, forehead too/);
    assert.match(headHtml(at('lateral_medullary')), /Crossed: signs in the left head with a deficit in the right body/);
    assert.match(headHtml(at('lateral_medullary')), /Vertigo<\/span><span class="v">present/);
  });

  it('says so when the head is normal', () => {
    assert.equal(headAffected(forward([], 'chronic')), false);
    assert.match(headHtml(forward([], 'chronic')), /Face, eyes, tongue and palate normal/);
  });

  it('offers a preset for every territory', () => {
    const offered = PRESETS.flatMap((p) => (p.kind === 'brain' ? [p.territory] : []));
    assert.deepEqual([...offered].sort(), [...TERRITORIES].sort());
  });
});
