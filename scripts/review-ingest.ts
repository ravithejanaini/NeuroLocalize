// Takes returned review files, keeps each one under review/responses/, and rewrites
// review/triage.md from every review kept so far.
//   npm run review:ingest -- path/to/neurolocalize-review-….json [more files]
//   npm run review:ingest            (rebuilds the triage from what is already kept)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { buildWorksheet } from './review-data.ts';
import { parseResponse, triage, type ReviewResponse } from './review-lib.ts';

const ROOT = resolve(import.meta.dirname, '..');
const KEPT = resolve(ROOT, 'review', 'responses');
mkdirSync(KEPT, { recursive: true });

let failed = false;
for (const arg of process.argv.slice(2)) {
  const r = parseResponse(readFileSync(resolve(arg), 'utf8'));
  if (!r.ok) {
    console.error(`${arg}: refused — ${r.error}`);
    failed = true;
    continue;
  }
  const who = (r.value.reviewer.name || 'reviewer').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reviewer';
  const target = resolve(KEPT, `${r.value.savedAt.slice(0, 10)}-${who}.json`);
  if (existsSync(target)) console.log(`${basename(target)}: replaced with the newer file`);
  writeFileSync(target, `${JSON.stringify(r.value, null, 1)}\n`);
  console.log(`${arg}: kept as review/responses/${basename(target)} (${Object.keys(r.value.answers).length} answers)`);
}

const responses: ReviewResponse[] = [];
for (const f of readdirSync(KEPT).filter((f) => f.endsWith('.json')).sort()) {
  const r = parseResponse(readFileSync(resolve(KEPT, f), 'utf8'));
  if (r.ok) responses.push(r.value);
  else {
    console.error(`review/responses/${f}: unreadable — ${r.error}`);
    failed = true;
  }
}

const ws = buildWorksheet();
writeFileSync(resolve(ROOT, 'review', 'triage.md'), `${triage(ws, responses)}\n`);
const wrong = responses.reduce((n, r) => n + Object.values(r.answers).filter((a) => a.verdict === 'wrong').length, 0);
console.log(`review/triage.md: ${responses.length} review(s), ${wrong} item(s) marked wrong`);
if (failed) process.exitCode = 1;
