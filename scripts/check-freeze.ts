// Expectations are written from sources before the engine exists, then frozen. Changing
// one afterwards is allowed only alongside an amendment that says why.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const TAG = 'expectations-frozen';
const DIR = 'spec/expectations';
const AMENDMENTS = `${DIR}/AMENDMENTS.md`;

const git = (...args: string[]): string =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

let tagged = true;
try {
  git('rev-parse', '--verify', '--quiet', `refs/tags/${TAG}`);
} catch {
  tagged = false;
}

if (!tagged) {
  console.log(`check-freeze: no "${TAG}" tag yet — expectations are still being written`);
  process.exit(0);
}

const changed = new Set(
  [
    git('diff', '--name-only', TAG, '--', DIR),
    git('ls-files', '--others', '--exclude-standard', '--', DIR),
  ]
    .join('\n')
    .split('\n')
    .filter(Boolean),
);

const substantive = [...changed].filter((f) => f !== AMENDMENTS);
if (substantive.length === 0) {
  console.log(`check-freeze: ok — expectations unchanged since ${TAG}`);
  process.exit(0);
}
if (!changed.has(AMENDMENTS)) {
  console.error(`✗ expectations changed since ${TAG} without an amendment:`);
  for (const f of substantive) console.error(`    ${f}`);
  console.error(`  Fix the knowledge base instead, or record the reason and source in ${AMENDMENTS}.`);
  process.exit(1);
}
console.log(`check-freeze: ${substantive.length} amended file(s) since ${TAG}, recorded in ${AMENDMENTS}`);
