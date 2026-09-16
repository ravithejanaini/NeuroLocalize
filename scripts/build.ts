// Compiles src/ to browser JavaScript in dist/app and places the page beside it.
// Three.js is not bundled: the page loads a pinned build through an import map.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
execFileSync(process.execPath, [join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.build.json'], {
  cwd: ROOT,
  stdio: 'inherit',
});
copyFileSync(join(ROOT, 'app', 'index.html'), join(DIST, 'index.html'));

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [relative(DIST, full).split(sep).join('/')];
  });
const out = files(DIST);
const bytes = out.reduce((n, f) => n + statSync(join(DIST, f)).size, 0);
console.log(`dist: ${out.length} files, ${(bytes / 1024).toFixed(1)} KiB (Three.js loads separately from the CDN)`);
