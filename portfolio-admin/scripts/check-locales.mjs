/* Vérifie : (1) symétrie des clés fr/en/tr, (2) clés t() utilisées dans src présentes. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const locales = {};
for (const loc of ['fr', 'en', 'tr']) {
  locales[loc] = JSON.parse(readFileSync(join(root, 'public', 'locales', loc, 'common.json'), 'utf8'));
}

const flatten = (obj, prefix = '', out = new Set()) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
  return out;
};

const sets = { fr: flatten(locales.fr), en: flatten(locales.en), tr: flatten(locales.tr) };
let ok = true;
for (const loc of ['en', 'tr']) {
  for (const k of sets.fr) if (!sets[loc].has(k)) { console.log(`MANQUE ${loc}: ${k}`); ok = false; }
  for (const k of sets[loc]) if (!sets.fr.has(k)) { console.log(`EN TROP ${loc}: ${k}`); ok = false; }
}
console.log(`Clés fr=${sets.fr.size} en=${sets.en.size} tr=${sets.tr.size} — ${ok ? 'SYMÉTRIE OK' : 'ASYMÉTRIE!'}`);

/* Clés utilisées via t('...') ou t("...") dans src (littérales uniquement) */
const used = new Set();
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(name)) {
      const src = readFileSync(p, 'utf8');
      for (const m of src.matchAll(/\bt\(\s*['"`]([a-zA-Z0-9_.]+)['"`]/g)) used.add(m[1]);
    }
  }
};
walk(join(root, 'src'));

const missing = [];
for (const key of used) {
  let node = locales.fr, okKey = true;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) node = node[part];
    else { okKey = false; break; }
  }
  if (!okKey) missing.push(key);
}
console.log(missing.length ? `Clés utilisées MANQUANTES:\n  ${missing.join('\n  ')}` : `Toutes les ${used.size} clés t() littérales existent en fr.`);
