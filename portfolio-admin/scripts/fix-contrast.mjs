/**
 * C2 — Passe de contraste : le texte secondaire à 30–55 % d'encre tombe
 * sous le seuil WCAG AA (≈2.5–3.1:1). On relève toutes les classes
 * `text-…/30…55` à `/60` (≈4.4:1 sur Papier et sur Encre).
 * Les classes déjà à /60+ et les opacités de bordures/fond ne sont pas touchées.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const targets = /text-\[rgb\(var\(--foreground-rgb\)\)\]\/(30|35|40|45|50|55)(?![0-9])/g;

let totalFiles = 0;
let totalRepl = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      const src = readFileSync(full, 'utf8');
      const out = src.replace(targets, (m, op) => `text-[rgb(var(--foreground-rgb))]/60`);
      if (out !== src) {
        const n = (src.match(targets) || []).length;
        totalFiles++;
        totalRepl += n;
        writeFileSync(full, out);
      }
    }
  }
}

walk(root);
console.log(`C2 : ${totalRepl} classes relevées à /60 dans ${totalFiles} fichiers`);
