// Turns a lesion description into a lookup of damage by compartment, side and segment.
import type { Kb } from '../kb/types.ts';
import {
  COMPARTMENTS,
  SEGMENTS,
  SIDES,
  type Compartment,
  type Portion,
  type Segment,
  type Severity,
  type Side,
  type Vertebra,
} from '../kb/vocab.ts';

export type LesionRegion = {
  readonly at: { readonly segments: readonly [Segment, Segment] } | { readonly vertebra: Vertebra };
  readonly sides: readonly Side[];
  readonly compartments: readonly Compartment[];
  readonly severity: Severity;
  readonly portion: Portion;
};

/** 0 none, 1 partial, 2 complete. */
export type Damage = 0 | 1 | 2;

type Cell = { damage: Damage; centralPartialOnly: boolean };

export const idx = (s: Segment): number => SEGMENTS.indexOf(s);
export const opposite = (s: Side): Side => (s === 'L' ? 'R' : 'L');

// Roots are outside the cord, so a transection is defined over the cord's own compartments.
const CORD = COMPARTMENTS.filter((c) => c !== 'dorsal_root' && c !== 'ventral_root');

export type LesionMap = {
  readonly segments: readonly number[];
  damage(c: Compartment, side: Side, k: number): Damage;
  /** True when every contribution at this cell was a partial lesion of the central portion. */
  centralPartial(c: Compartment, side: Side, k: number): boolean;
  /** Most rostral segment at which the whole cord is completely divided, or -1. */
  readonly transectionAt: number;
};

function resolve(region: LesionRegion, kb: Kb): readonly [number, number] {
  if ('segments' in region.at) {
    const [from, to] = region.at.segments;
    const a = idx(from);
    const b = idx(to);
    if (a > b) throw new Error(`Lesion span ${from}–${to} runs caudal to rostral; give the rostral end first.`);
    return [a, b];
  }
  const { vertebra } = region.at;
  const row = kb.vertebrae.find((v) => v.vertebra === vertebra);
  if (!row) throw new Error(`No knowledge-base row maps the ${vertebra} vertebra to cord segments.`);
  return [idx(row.segments[0]), idx(row.segments[1])];
}

export function mapLesion(lesion: readonly LesionRegion[], kb: Kb): LesionMap {
  const cells = new Map<string, Cell>();
  const covered = new Set<number>();
  const key = (c: Compartment, side: Side, k: number): string => `${c}|${side}|${k}`;

  for (const region of lesion) {
    const [a, b] = resolve(region, kb);
    const damage: Damage = region.severity === 'complete' ? 2 : 1;
    const centralPartial = region.severity === 'partial' && region.portion === 'central';
    for (let k = a; k <= b; k++) {
      covered.add(k);
      for (const side of region.sides) {
        for (const c of region.compartments) {
          const prev = cells.get(key(c, side, k));
          cells.set(key(c, side, k), {
            damage: prev ? (Math.max(prev.damage, damage) as Damage) : damage,
            centralPartialOnly: prev ? prev.centralPartialOnly && centralPartial : centralPartial,
          });
        }
      }
    }
  }

  const damageAt = (c: Compartment, side: Side, k: number): Damage => cells.get(key(c, side, k))?.damage ?? 0;

  let transectionAt = -1;
  for (const k of [...covered].sort((x, y) => x - y)) {
    if (SIDES.every((side) => CORD.every((c) => damageAt(c, side, k) === 2))) {
      transectionAt = k;
      break;
    }
  }

  return {
    segments: [...covered].sort((x, y) => x - y),
    damage: damageAt,
    centralPartial: (c, side, k) => cells.get(key(c, side, k))?.centralPartialOnly ?? false,
    transectionAt,
  };
}
