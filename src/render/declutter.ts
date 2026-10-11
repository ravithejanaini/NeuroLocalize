// P44: which names to show when they would lie on top of one another. Pure: boxes in, a choice
// out. The inspection of 2026-10-12 counted 35 pairs of overlapping names at the Vision station
// and 25 looking down the cord; a name that cannot be read is worse than one that is not shown.

/** A name as it would be drawn: its box on the screen, how much it matters, and whether it was shown last time. */
export type LabelBox = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  /** Lower matters more: 0 is what the view is about. */
  readonly rank: number;
  readonly shown: boolean;
};

const overlaps = (a: LabelBox, b: LabelBox, pad: number): boolean =>
  a.left < b.left + b.width + pad && b.left < a.left + a.width + pad && a.top < b.top + b.height + pad && b.top < a.top + a.height + pad;

/**
 * Chooses the names to show so that no two overlap. The more important is placed first; between
 * equals, the one already on the screen keeps its place, so names do not flicker as the camera
 * turns; after that, the order given.
 */
export function declutter(boxes: readonly LabelBox[], pad = 2): boolean[] {
  const order = boxes
    .map((b, i) => ({ b, i }))
    .sort((p, q) => p.b.rank - q.b.rank || Number(q.b.shown) - Number(p.b.shown) || p.i - q.i);
  const kept: LabelBox[] = [];
  const out = boxes.map(() => false);
  for (const { b, i } of order) {
    if (kept.some((k) => overlaps(k, b, pad))) continue;
    kept.push(b);
    out[i] = true;
  }
  return out;
}
