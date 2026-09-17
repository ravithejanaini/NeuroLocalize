import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { forward } from '../src/engine/forward.ts';
import { armAffected, armMuscleTable, armSkinTable, deformityChips } from '../src/render/arm.ts';
import { levelText } from '../src/render/examine.ts';
import { PRESETS } from '../src/render/presets.ts';
import { PLEXUS_SITES } from '../src/kb/vocab.ts';

const at = (site: (typeof PLEXUS_SITES)[number]) => forward([{ plexus: site, sides: ['L'], severity: 'complete' }], 'chronic');

describe('the arm in the findings panel', () => {
  it('names the deformity a lesion produces, and on which side', () => {
    const html = deformityChips(at('radial_spiral_groove'));
    assert.match(html, /Wrist drop<span class="deform-side">left</);
    assert.doesNotMatch(html, /Claw hand/);
    assert.match(deformityChips(at('long_thoracic')), /Winged scapula/);
    assert.match(deformityChips(forward([], 'chronic')), /No deformity/);
  });

  it('marks a deformity after upper-motor-neuron weakness as not settled', () => {
    const f = forward(
      [{ at: { segments: ['C4', 'C4'] }, sides: ['R'], compartments: ['lateral_cst'], severity: 'complete', portion: 'whole' }],
      'chronic',
    );
    assert.match(deformityChips(f), /Claw hand<span class="deform-side">right · not settled/);
  });

  it('lists every muscle and territory, quieting the unaffected ones', () => {
    const f = at('ulnar_elbow');
    const muscles = armMuscleTable(f);
    assert.equal((muscles.match(/<tr/g) ?? []).length, 15, 'a header and fourteen muscles');
    assert.match(muscles, /first dorsal interosseous<\/span><\/th><td class="st st-mus-weak">weak/);
    assert.match(armSkinTable(f), /little finger<\/th><td class="st st-lost">lost/);
    assert.match(armSkinTable(f), /<tr class="calm"><th>medial forearm/);
    assert.equal(armAffected(f), true);
    assert.equal(armAffected(forward([], 'chronic')), false);
  });

  it('shows a cord lesion that spares one modality as a split', () => {
    const f = forward(
      [{ at: { segments: ['C4', 'C4'] }, sides: ['L', 'R'], compartments: ['dorsal_column'], severity: 'complete', portion: 'whole' }],
      'chronic',
    );
    assert.match(armSkinTable(f), /pain intact · vib lost/);
  });

  it('offers a preset for each named palsy; four quieter places are reached through examination mode', () => {
    const offered = PRESETS.flatMap((p) => (p.kind === 'limb' ? [p.site] : []));
    const missing = PLEXUS_SITES.filter((s) => !offered.includes(s));
    assert.deepEqual(missing.sort(), ['dorsal_scapular', 'middle_trunk', 'suprascapular', 'lateral_cord'].sort());
  });

  it('names the places a plexus or nerve group could be', () => {
    assert.equal(
      levelText({ family: 'nerve_left', rostral: ['C5', 'C5'], caudal: ['C5', 'C5'], members: [], sites: ['ulnar_elbow', 'ulnar_wrist'] }),
      'ulnar nerve at the elbow or ulnar nerve at the wrist',
    );
    assert.equal(
      levelText({
        family: 'plexus_right',
        rostral: ['C5', 'C5'],
        caudal: ['C5', 'C5'],
        members: [],
        sites: ['upper_trunk', 'middle_trunk', 'lower_trunk', 'lateral_cord'],
      }),
      'any of 4 places — upper trunk, middle trunk, …',
    );
  });
});
