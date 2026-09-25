// Prints the best-ranked group of every frozen reverse examination at each of its timepoints,
// one line per examination, so a change to the engine can be diffed against the line before it.
// Used in P23 to report every ranking the saddle redesign moved, not only the ones a test caught.
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { prepareSync, reverse } from '../src/engine/reverse.ts';
import { RENDER } from '../src/kb/render.ts';
import { examSlots } from '../src/render/slots.ts';

type Case = { readonly id: string; readonly observations: readonly unknown[]; readonly expectations: readonly { readonly timepoint: string }[] };
const dir = resolve(import.meta.dirname, '..', 'spec', 'expectations');
const slots = examSlots(RENDER);
const lines: string[] = [];
for (const file of readdirSync(dir).filter((f) => f.startsWith('reverse') && f.endsWith('.ts')).sort()) {
  const mod = (await import(`../spec/expectations/${file}`)) as Record<string, unknown>;
  for (const value of Object.values(mod)) {
    if (!Array.isArray(value)) continue;
    for (const c of value as Case[]) {
      if (!c || typeof c !== 'object' || !('observations' in c)) continue;
      for (const tp of [...new Set(c.expectations.map((e) => e.timepoint))]) {
        prepareSync(tp as 'chronic');
        const r = reverse(c.observations as never, tp as 'chronic', slots);
        const g = r.groups[0];
        const where = g ? `${g.family} ${g.sites.length ? g.sites.join('/') : g.rostral.join('–')} (${g.mismatches})` : 'none';
        lines.push(`${c.id} @${tp}: ${where}${r.unexplained ? ' [unexplained]' : ''}`);
      }
    }
  }
}
console.log(lines.join('\n'));
