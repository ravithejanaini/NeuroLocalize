// The visual pathway (P8): which sectors of each eye's field a lesion takes, and which
// pupil shows a relative afferent defect. Every rule is a knowledge-base row; this file
// only walks them (docs/P8-analysis.md).
import type { Kb } from '../kb/types.ts';
import {
  FIELD_CELLS,
  FIELD_SECTORS,
  SIDES,
  cellsOf,
  VISUAL_PARTS,
  type FieldCell,
  type FieldRegion,
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
    const sides = isMidlinePart(kb, r.vision) ? SIDES : r.sides;
    for (const side of sides) {
      const key = `${r.vision}|${side}`;
      cells.set(key, Math.max(cells.get(key) ?? 0, d) as Damage);
    }
  }
  return { damage: (part, side) => cells.get(`${part}|${side}`) ?? 0, empty: cells.size === 0 };
}

export type VisionFindings = {
  /** Each eye's field, sector by sector. */
  readonly fields: Readonly<Record<Side, Readonly<Record<FieldRegion, FieldState>>>>;
  /** A relative afferent pupillary defect, by side. */
  readonly rapd: Readonly<Record<Side, SignState>>;
};

const opposite = (s: Side): Side => (s === 'L' ? 'R' : 'L');
const CENTRAL: Readonly<Record<string, Side>> = { central_left: 'L', central_right: 'R' };

/** The side of space a sector of one eye's field lies on: temporal is the eye's own side. */
export function sideOfSector(eye: Side, sector: FieldRegion): Side {
  const central = CENTRAL[sector];
  if (central) return central;
  return sector.startsWith('temporal') ? eye : opposite(eye);
}
export const verticalOf = (sector: FieldRegion): 'upper' | 'lower' | null =>
  sector.includes('_superior') ? 'upper' : sector.includes('_inferior') ? 'lower' : null;
/** P28: which band of a quadrant a cell lies in; null for the centre. */
export const bandOf = (cell: FieldCell): 'horizontal' | 'vertical' | null =>
  cell.endsWith('_horizontal') ? 'horizontal' : cell.endsWith('_vertical') ? 'vertical' : null;
/** P28 (D149): a coarse sector read from its cells — lost or normal only when all agree. */
export const combineCells = (states: readonly FieldState[]): FieldState =>
  states.every((x) => x === 'lost') ? 'lost' : states.every((x) => x === 'normal') ? 'normal' : 'indeterminate';

const worse = (a: Damage, b: Damage): Damage => (a > b ? a : b);

/** P38: a part that has no side — the chiasm — because every place holding it is midline. */
export function isMidlinePart(kb: Kb, part: VisualPart): boolean {
  const holders = Object.values(kb.vision.places).filter((q) => q.parts.includes(part));
  return holders.length > 0 && holders.every((q) => q.midline === true);
}

/**
 * How the part `part` on side `partSide` carries one cell of one eye's field: all of it, the
 * upper or lower half of the centre, or not at all. The one rule both the findings and the
 * drawn pathway read (P38).
 */
export function carries(kb: Kb, part: VisualPart, partSide: Side, eye: Side, sector: FieldCell): 'whole' | 'upper' | 'lower' | null {
  const row = kb.vision.parts[part];
  if (row.eye === 'same' && partSide !== eye) return null;
  const at = sideOfSector(eye, sector);
  const serves = row.field === 'whole' ? true : row.field === 'temporal' ? at === eye : at === opposite(partSide);
  if (!serves) return null;
  const vertical = verticalOf(sector);
  if (vertical) {
    const inBand = row.band === undefined || row.band === bandOf(sector);
    return inBand && (row.quadrants === 'both' || row.quadrants === vertical) ? 'whole' : null;
  }
  // The centre of a half-field.
  if (row.centre === 'with' || row.centre === 'only') return 'whole';
  if (row.centre === 'half' && row.quadrants !== 'both' && row.quadrants !== 'none') return row.quadrants;
  return null;
}

/** P38: every part that carries one cell of one eye's field, along the pathway from the eye back. */
export function carriers(kb: Kb, eye: Side, sector: FieldCell): { readonly part: VisualPart; readonly side: Side; readonly how: 'whole' | 'upper' | 'lower' }[] {
  const out: { part: VisualPart; side: Side; how: 'whole' | 'upper' | 'lower' }[] = [];
  for (const part of VISUAL_PARTS) {
    for (const side of SIDES) {
      const how = carries(kb, part, side, eye, sector);
      if (!how) continue;
      // A midline part is one thing; name it once.
      if (isMidlinePart(kb, part) && out.some((c) => c.part === part)) continue;
      out.push({ part, side, how });
    }
  }
  return out;
}

export function visionFindings(kb: Kb, map: VisionMap): VisionFindings {
  const fields = {} as Record<Side, Record<FieldRegion, FieldState>>;
  const rapd: Record<Side, SignState> = { L: 'absent', R: 'absent' };
  const open: Record<Side, boolean> = { L: false, R: false };

  for (const eye of SIDES) {
    fields[eye] = {} as Record<FieldRegion, FieldState>;
    for (const sector of FIELD_CELLS) {
      let whole: Damage = 0;
      const halves: Record<'upper' | 'lower', Damage> = { upper: 0, lower: 0 };
      for (const part of VISUAL_PARTS) {
        for (const partSide of SIDES) {
          const d = map.damage(part, partSide);
          if (d === 0) continue;
          const how = carries(kb, part, partSide, eye, sector);
          if (how === 'whole') whole = worse(whole, d);
          else if (how) halves[how] = worse(halves[how], d);
        }
      }
      const both = Math.min(halves.upper, halves.lower) as Damage;
      const any = worse(halves.upper, halves.lower);
      fields[eye][sector] =
        whole === 2 || both === 2 ? 'lost' : whole === 1 || any > 0 ? 'indeterminate' : 'normal';
    }
    // The coarse quadrants, from their two cells (D149); the centre's halves are cells already.
    for (const sector of FIELD_SECTORS) fields[eye][sector] = combineCells(cellsOf(sector).map((c) => fields[eye][c]));
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
  // A relative defect needs one side to be worse than the other (S95, D131).
  if (SIDES.every((s) => rapd[s] === 'present')) {
    for (const side of SIDES) rapd[side] = kb.vision.rapd.whenEqual;
  }
  return { fields, rapd };
}

/** The parts a named place takes, for the candidates reverse inference ranks. */
export const placeRegions = (kb: Kb, place: keyof Kb['vision']['places'], side: Side): VisionRegion[] => {
  // A midline place takes both sides whichever side is asked for (the chiasm; both PCAs, P18).
  const sides: readonly Side[] = kb.vision.places[place].midline === true ? SIDES : [side];
  return kb.vision.places[place].parts.map((vision) => ({ vision, sides, severity: 'complete' as const }));
};
