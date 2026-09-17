// Compiles src/ to browser JavaScript in dist/app and places the page beside it.
// Three.js is not bundled: the page loads a pinned build through an import map, which the
// offline worker keeps once fetched (D49).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
execFileSync(process.execPath, [join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.build.json'], {
  cwd: ROOT,
  stdio: 'inherit',
});
for (const f of ['index.html', 'manifest.webmanifest', 'icon.svg']) copyFileSync(join(ROOT, 'app', f), join(DIST, f));

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [relative(DIST, full).split(sep).join('/')];
  });
// The offline worker lists every built file and is versioned by their content.
const shell = files(DIST).sort();
const hash = createHash('sha256');
for (const f of shell) hash.update(f).update(readFileSync(join(DIST, f)));
const worker = readFileSync(join(ROOT, 'app', 'sw.template.js'), 'utf8')
  .replace("'__VERSION__'", JSON.stringify(hash.digest('hex').slice(0, 12)))
  .replace('__FILES__', JSON.stringify(shell));
writeFileSync(join(DIST, 'sw.js'), worker);

const out = files(DIST);
const bytes = out.reduce((n, f) => n + statSync(join(DIST, f)).size, 0);
console.log(`dist: ${out.length} files, ${(bytes / 1024).toFixed(1)} KiB (Three.js loads separately from the CDN)`);
