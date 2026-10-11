import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { declutter, type LabelBox } from '../src/render/declutter.ts';

const box = (left: number, top: number, rank = 2, shown = false, width = 60, height = 12): LabelBox => ({ left, top, width, height, rank, shown });
const overlap = (a: LabelBox, b: LabelBox): boolean => a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;

describe('names that would overlap are not all shown (P44)', () => {
  it('shows every name when none overlap', () => {
    assert.deepEqual(declutter([box(0, 0), box(100, 0), box(0, 40)]), [true, true, true]);
    assert.deepEqual(declutter([]), []);
  });

  it('never shows two names that overlap, whatever is given', () => {
    let seed = 5;
    const rnd = (): number => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let round = 0; round < 40; round++) {
      const boxes = Array.from({ length: 60 }, () => box(rnd() * 400, rnd() * 200, Math.floor(rnd() * 5), rnd() < 0.5, 30 + rnd() * 80));
      const shown = declutter(boxes);
      const kept = boxes.filter((_, i) => shown[i]);
      for (let i = 0; i < kept.length; i++) for (let j = i + 1; j < kept.length; j++) assert.ok(!overlap(kept[i] as LabelBox, kept[j] as LabelBox), `round ${round}`);
      // And nothing is hidden for no reason: every hidden name overlaps one that is shown.
      boxes.forEach((b, i) => {
        if (!shown[i]) assert.ok(kept.some((k) => overlap({ ...k, left: k.left - 2, top: k.top - 2, width: k.width + 4, height: k.height + 4 }, b)), `round ${round}: hidden without cause`);
      });
    }
  });

  it('gives the place to the name that matters more', () => {
    assert.deepEqual(declutter([box(0, 0, 3), box(10, 0, 0)]), [false, true]);
    assert.deepEqual(declutter([box(0, 0, 0), box(10, 0, 3)]), [true, false]);
  });

  it('between equals keeps the name already on the screen, so names do not flicker', () => {
    assert.deepEqual(declutter([box(0, 0, 2, false), box(10, 0, 2, true)]), [false, true]);
    assert.deepEqual(declutter([box(0, 0, 2, true), box(10, 0, 2, false)]), [true, false]);
    // With nothing to choose between them, the first given.
    assert.deepEqual(declutter([box(0, 0, 2), box(10, 0, 2)]), [true, false]);
    // But importance comes before staying put.
    assert.deepEqual(declutter([box(0, 0, 3, true), box(10, 0, 1, false)]), [false, true]);
  });

  it('keeps a breathing space between names', () => {
    // Two boxes 1px apart are too close with the default padding, and fine with none.
    assert.deepEqual(declutter([box(0, 0), box(61, 0)]), [true, false]);
    assert.deepEqual(declutter([box(0, 0), box(61, 0)], 0), [true, true]);
  });
});
