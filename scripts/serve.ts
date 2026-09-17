// Serves dist/ for local checking. ES modules need http://, not file://.
//   node scripts/serve.ts [folder] [port]   e.g. `node scripts/serve.ts review 5179`
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const DIST = resolve(import.meta.dirname, '..', process.argv[2] ?? 'dist');
const PORT = Number(process.argv[3] ?? process.env.PORT ?? 5178);
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const file = normalize(join(DIST, path === '/' ? (existsSync(join(DIST, 'index.html')) ? 'index.html' : 'review.html') : path));
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(PORT, () => console.log(`serving ${DIST} on http://localhost:${PORT}`));
