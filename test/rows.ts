// Walks the knowledge base and yields every row's metadata, with the path to reach it.
import type { Kb, Meta } from '../src/kb/types.ts';

export type Located = { readonly path: readonly (string | number)[]; readonly meta: Meta };

export function locateRows(kb: Kb): Located[] {
  const out: Located[] = [];
  const visit = (node: unknown, path: (string | number)[]): void => {
    if (Array.isArray(node)) {
      node.forEach((child, i) => visit(child, [...path, i]));
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if ('meta' in record) out.push({ path, meta: record.meta as Meta });
    for (const [k, v] of Object.entries(record)) if (k !== 'meta') visit(v, [...path, k]);
  };
  visit(kb, []);
  return out;
}

export const metaRows = (kb: Kb): Meta[] => locateRows(kb).map((r) => r.meta);
