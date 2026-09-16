// The paths signals take, as ordered lists of compartments. The engine judges a deficit by
// the worst damage along a route; the renderer animates the same route, so what is drawn
// and what is computed cannot drift apart.
import type { Kb } from '../kb/types.ts';
import type { Compartment, SensoryModality, Side } from '../kb/vocab.ts';
import { opposite, type Damage, type LesionMap } from './lesion.ts';

export type Element = { readonly compartment: Compartment; readonly side: Side; readonly segment: number };

export type Route = {
  readonly elements: readonly Element[];
  /** Index in `elements` where the fibre changes side, or -1 if it does not cross in the cord. */
  readonly crossesAt: number;
};

const onSide = (x: Side, l: 'ipsilateral' | 'contralateral'): Side => (l === 'ipsilateral' ? x : opposite(x));
const down = (from: number, to: number): number[] => {
  const out: number[] = [];
  for (let k = from; k >= to; k--) out.push(k);
  return out;
};

/** Crossing offsets the knowledge base allows, fewest first. */
export function crossingOffsets(kb: Kb): number[] {
  const [lo, hi] = kb.pathways.spinothalamic.crossingOffset;
  const out: number[] = [];
  for (let o = lo; o <= hi; o++) out.push(o);
  return out;
}

/** Input entering at segment `s` on side `x`, travelling to the top of the cord. */
export function sensoryRoute(kb: Kb, x: Side, modality: SensoryModality, s: number, offset: number): Route {
  const root: Element[] = kb.compartments.dorsalRoot.carries.includes(modality)
    ? [{ compartment: 'dorsal_root', side: x, segment: s }]
    : [];

  if (modality === 'posterior_column') {
    const col = onSide(x, kb.pathways.posteriorColumn.ascendsOn);
    return {
      elements: [...root, ...down(s, 0).map((k): Element => ({ compartment: 'dorsal_column', side: col, segment: k }))],
      crossesAt: -1,
    };
  }

  const cross = Math.max(0, s - offset);
  const up = onSide(x, kb.pathways.spinothalamic.ascendsOn);
  const horn = down(s, cross).map((k): Element => ({ compartment: 'dorsal_horn', side: x, segment: k }));
  const commissure: Element[] = [
    { compartment: 'commissure', side: x, segment: cross },
    { compartment: 'commissure', side: opposite(x), segment: cross },
  ];
  const tract = down(cross, 0).map((k): Element => ({ compartment: 'anterolateral', side: up, segment: k }));
  return { elements: [...root, ...horn, ...commissure, ...tract], crossesAt: root.length + horn.length };
}

/** Command from the top of the cord to the muscles of segment `s` on side `x`. */
export function motorRoute(kb: Kb, x: Side, s: number): Route {
  const tract = onSide(x, kb.pathways.corticospinal.descendsOn);
  const descending = [...down(s - 1, 0)].reverse().map((k): Element => ({ compartment: 'lateral_cst', side: tract, segment: k }));
  const lmn = kb.compartments.motorNeuron.lowerMotorNeuron.map((c): Element => ({ compartment: c, side: x, segment: s }));
  return { elements: [...descending, ...lmn], crossesAt: -1 };
}

/**
 * Damage an element does to the signal on this route. A partial central lesion of the
 * spinothalamic tract spares sacral input — an observation (S06), applied here so that
 * neither the engine nor the renderer needs to know the disputed geometry behind it.
 */
export function damageAlong(map: LesionMap, kb: Kb, e: Element, inputIsSacral: boolean): Damage {
  const d = map.damage(e.compartment, e.side, e.segment);
  const sparing = kb.observations.sacralSparing;
  const spared =
    e.compartment === 'anterolateral' &&
    sparing.compartment === 'anterolateral' &&
    d === 1 &&
    inputIsSacral &&
    map.centralPartial('anterolateral', e.side, e.segment);
  return spared ? 0 : d;
}
