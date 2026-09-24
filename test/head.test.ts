import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { territoryRegions } from '../src/engine/hypotheses.ts';
import { forward } from '../src/engine/forward.ts';
import { KB } from '../src/kb/kb.ts';
import { TERRITORIES } from '../src/kb/vocab.ts';
import { aphasiaName, crossedSide, headAffected, headHtml, languageAffected, languageHtml } from '../src/render/head.ts';
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

describe('language and attention in the findings panel (P10)', () => {
  const on = (t: (typeof TERRITORIES)[number], side: 'L' | 'R') => forward(territoryRegions(KB, t, side), 'chronic');

  it('names each aphasia from its three findings, as S103 classifies them (D69)', () => {
    assert.match(aphasiaName(on('broca_area', 'L')) ?? '', /^Broca aphasia/);
    assert.match(aphasiaName(on('wernicke_area', 'L')) ?? '', /^Wernicke aphasia/);
    assert.match(aphasiaName(on('supramarginal', 'L')) ?? '', /^conduction aphasia/);
    assert.match(aphasiaName(on('mca_whole', 'L')) ?? '', /^global aphasia/);
    assert.match(aphasiaName(on('mca_cortex', 'L')) ?? '', /^Broca aphasia/, 'D70: the superior division holds Broca area');
    // P21: the border zones keep repetition.
    assert.match(aphasiaName(on('borderzone_anterior', 'L')) ?? '', /^transcortical motor aphasia/);
    assert.match(aphasiaName(on('borderzone_posterior', 'L')) ?? '', /^transcortical sensory aphasia/);
    const both = forward([...territoryRegions(KB, 'borderzone_anterior', 'L'), ...territoryRegions(KB, 'borderzone_posterior', 'L')], 'chronic');
    assert.match(aphasiaName(both) ?? '', /^mixed transcortical aphasia/, 'C63: named, though not a place');
    assert.equal(aphasiaName(on('borderzone_anterior', 'R')), null);
  });

  it('names nothing when speech is normal, and nothing in the right hemisphere (D68)', () => {
    assert.equal(aphasiaName(on('broca_area', 'R')), null);
    assert.equal(aphasiaName(on('internal_capsule', 'L')), null);
    assert.equal(languageAffected(on('broca_area', 'R')), false);
  });

  it('shows neglect by the side of space, and says when it is unsettled (C32)', () => {
    const right = languageHtml(on('supramarginal', 'R'));
    assert.match(right, /Neglect, left<\/span><span class="v st-sign-present">present/);
    assert.match(right, /Neglect, right<\/span><span class="v quiet">absent/);
    assert.match(languageHtml(on('supramarginal', 'L')), /Neglect, right<\/span><span class="v st-sign-present">uncertain/);
  });
  it('never calls a locked-in patient fluent: anarthria is not aphasia (P17, S133)', () => {
    const locked = languageHtml(on('ventral_pons_bilateral', 'L'));
    assert.match(locked, /dysarthria or anarthria, not aphasia/);
    assert.match(locked, /No aphasia/);
    assert.doesNotMatch(locked, /Speech fluent/);
    // One side of the pons leaves speech to the other side's muscles: no bulbar line.
    assert.doesNotMatch(languageHtml(on('ventral_pons', 'L')), /anarthria/);
  });
});
