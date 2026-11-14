/* Tailles gzip par route depuis build-manifest.json (mesure après optim). */
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const root = new URL('../.next/', import.meta.url).pathname.replace(/^\//, '');
const manifest = JSON.parse(readFileSync(join(root, 'build-manifest.json'), 'utf8'));

const shared = new Set([...(manifest.rootMainFiles || []), ...(manifest.polyfillFiles || [])]);
const low = manifest.lowPriorityFiles || [];

const size = (f) => {
  try {
    const p = join(root, f.replace(/^\/_next\//, '').replace(/^\//, ''));
    return gzipSync(readFileSync(p)).length;
  } catch {
    return 0;
  }
};

const rows = [];
for (const [route, files] of Object.entries(manifest.pages)) {
  if (route.startsWith('/api') || route.startsWith('/admin')) continue;
  const all = new Set([...files, ...shared, ...low]);
  let total = 0;
  for (const f of all) total += size(f);
  rows.push([route, +(total / 1024).toFixed(1)]);
}
rows.sort((a, b) => b[1] - a[1]);
for (const [r, kb] of rows) console.log(String(kb).padStart(7), r);
