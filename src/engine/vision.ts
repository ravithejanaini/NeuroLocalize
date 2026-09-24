// The visual pathway (P8): which sectors of each eye's field a lesion takes, and which
// pupil shows a relative afferent defect. Every rule is a knowledge-base row; this file
// only walks them (docs/P8-analysis.md).
import type { Kb } from '../kb/types.ts';
import {
  FIELD_SECTORS,
  SIDES,
  VISUAL_PARTS,
  type FieldSector,
  type FieldState,
  type Severity,
  type Side,
  type SignState,
  type VisualPart,
} from '../kb/vocab.ts';
import type { Damage } from './lesion.ts';

/** A lesion of the visual pathway. The chiasm is midline: it is damaged from either side. */
export type VisionRegion = {
  readonly vision: VisualPart;
  readonly sides: readonly Side[];
  readonly severity: Severity;
};

export type VisionMap = {
  damage(part: VisualPart, side: Side): Damage;
  readonly empty: boolean;
};

export function mapVision(kb: Kb, regions: readonly VisionRegion[]): VisionMap {
  const cells = new Map<string, Damage>();
  for (const r of regions) {
    if (!(VISUAL_PARTS as readonly string[]).includes(r.vision)) throw new Error(`${r.vision} is not a part of the visual pathway`);
    const d: Damage = r.severity === 'complete' ? 2 : 1;
    // A midline part has no side: lesioning it on one side lesions it for both. A part is
    // midline only when every place holding it is (the chiasm); the calcarine banks sit in both
    // PCAs (P18) but also in one-sided places, so they keep their side.
    const holders = Object.values(kb.vision.places).filter((q) => q.parts.includes(r.vision));
    const midline = holders.length > 0 && holders.every((q) => q.midline === true);
    const sides = midline ? SIDES : r.sides;
    for (const side of sides) {
      const key = `${r.vision}|${side}`;
      cells.set(key, Math.max(cells.get(key) ?? 0, d) as Damage);
    }
  }
  return { damage: (part, side) => cells.get(`${part}|${side}`) ?? 0, empty: cells.size === 0 };
}

export type VisionFindings = {
  /** Each eye's field, sector by sector. */
  readonly fields: Readonly<Record<Side, Readonly<Record<FieldSector, FieldState>>>>;
  /** A relative afferent pupillary defect, by side. */
  readonly rapd: Readonly<Record<Side, SignState>>;
};

const opposite = (s: Side): Side => (s === 'L' ? 'R' : 'L');
const CENTRAL: Readonly<Record<string, Side>> = { central_left: 'L', central_right: 'R' };

/** The side of space a sector of one eye's field lies on: temporal is the eye's own side. */
export function sideOfSector(eye: Side, sector: FieldSector): Side {
  const central = CENTRAL[sector];
  if (central) return central;
  return sector.startsWith('temporal') ? eye : opposite(eye);
}
const verticalOf = (sector: FieldSector): 'upper' | 'lower' | null =>
  sector.endsWith('_superior') ? 'upper' : sector.endsWith('_inferior') ? 'lower' : null;

const worse = (a: Damage, b: Damage): Damage => (a > b ? a : b);

export function visionFindings(kb: Kb, map: VisionMap): VisionFindings {
  const fields = {} as Record<Side, Record<FieldSector, FieldState>>;
  const rapd: Record<Side, SignState> = { L: 'absent', R: 'absent' };
  const open: Record<Side, boolean> = { L: false, R: false };

  for (const eye of SIDES) {
    fields[eye] = {} as Record<FieldSector, FieldState>;
    for (const sector of FIELD_SECTORS) {
      const at = sideOfSector(eye, sector);
      const vertical = verticalOf(sector);
      let whole: Damage = 0;
      const halves: Record<'upper' | 'lower', Damage> = { upper: 0, lower: 0 };
      for (const part of VISUAL_PARTS) {
        const row = kb.vision.parts[part];
        for (const partSide of SIDES) {
          const d = map.damage(part, partSide);
          if (d === 0) continue;
          if (row.eye === 'same' && partSide !== eye) continue;
          const serves =
            row.field === 'whole' ? true : row.field === 'temporal' ? at === eye : at === opposite(partSide);
          if (!serves) continue;
          if (vertical) {
            if (row.quadrants === 'both' || row.quadrants === vertical) whole = worse(whole, d);
            continue;
          }
          // The centre of a half-field.
          if (row.centre === 'with' || row.centre === 'only') whole = worse(whole, d);
          else if (row.centre === 'half' && row.quadrants !== 'both' && row.quadrants !== 'none') {
            halves[row.quadrants] = worse(halves[row.quadrants], d);
          }
        }
      }
      const both = Math.min(halves.upper, halves.lower) as Damage;
      const any = worse(halves.upper, halves.lower);
      fields[eye][sector] =
        whole === 2 || both === 2 ? 'lost' : whole === 1 || any > 0 ? 'indeterminate' : 'normal';
    }
  }

  for (const part of VISUAL_PARTS) {
    const row = kb.vision.parts[part];
    for (const side of SIDES) {
      if (map.damage(part, side) === 0) continue;
      if (row.rapd === 'same') rapd[side] = 'present';
      else if (row.rapd === 'opposite') rapd[opposite(side)] = 'present';
      else if (row.rapd === 'open') open[side] = true;
    }
  }
  for (const side of SIDES) if (open[side] && rapd[side] === 'absent') rapd[side] = 'indeterminate';
  // A relative defect needs one side to be worse than the other.
  if (kb.vision.rapd.bothSidesUnsettled && SIDES.every((s) => rapd[s] === 'present')) {
    for (const side of SIDES) rapd[side] = 'indeterminate';
  }
  return { fields, rapd };
}

/** The parts a named place takes, for the candidates reverse inference ranks. */
export const placeRegions = (kb: Kb, place: keyof Kb['vision']['places'], side: Side): VisionRegion[] => {
  // A midline place takes both sides whichever side is asked for (the chiasm; both PCAs, P18).
  const sides: readonly Side[] = kb.vision.places[place].midline === true ? SIDES : [side];
  return kb.vision.places[place].parts.map((vision) => ({ vision, sides, severity: 'complete' as const }));
};
