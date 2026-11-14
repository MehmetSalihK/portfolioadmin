#!/usr/bin/env node
/**
 * Vérifications de sécurité automatisées (aucune dépendance externe).
 *
 * Usage :
 *   node scripts/security-check.mjs                 # headers + gardes + scan secrets (URL par défaut)
 *   node scripts/security-check.mjs http://localhost:3002
 *   node scripts/security-check.mjs --dev            # CSP permissive attendue (next dev)
 *   node scripts/security-check.mjs --scan-only      # scan de secrets uniquement (pas de serveur requis)
 *
 * Codes retour : 0 = tout vert, 1 = au moins un échec.
 * Aucune requête intrusive : uniquement des GET/POST non authentifiés
 * vers des endpoints de test connus, jamais d'attaque réelle.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DEV_MODE = args.includes('--dev');
const SCAN_ONLY = args.includes('--scan-only');
const BASE_URL = args.find((a) => /^https?:\/\//.test(a)) || 'http://localhost:3002';

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

/* ───────────────────────── 1. Headers HTTP ───────────────────────── */

async function checkHeaders() {
  console.log(`\n── Headers HTTP (${BASE_URL}) ──`);
  let res;
  try {
    res = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
  } catch (err) {
    check('serveur joignable', false, String(err.message || err));
    return;
  }
  check('page publique / accessible', res.status === 200, `status=${res.status}`);

  const h = res.headers;
  const csp = h.get('content-security-policy') || '';
  const scriptSrc = (csp.split(/;\s*/).find((d) => d.startsWith('script-src')) || '');

  check('CSP présente', csp.length > 0);
  check(
    "CSP script-src sans 'unsafe-eval'",
    DEV_MODE || !/unsafe-eval/.test(scriptSrc),
    DEV_MODE ? 'mode dev' : scriptSrc || 'absent'
  );
  check(
    "CSP script-src sans 'unsafe-inline'",
    DEV_MODE || !/unsafe-inline/.test(scriptSrc),
    DEV_MODE ? 'mode dev' : scriptSrc || 'absent'
  );
  for (const dir of ['base-uri', 'object-src', 'frame-ancestors', 'form-action']) {
    check(`CSP directive ${dir}`, new RegExp(`${dir}\\s+'`).test(csp));
  }
  check('X-Content-Type-Options: nosniff', h.get('x-content-type-options') === 'nosniff');
  check(
    'anti-clickjacking (X-Frame-Options ou frame-ancestors)',
    Boolean(h.get('x-frame-options')) || /frame-ancestors/.test(csp)
  );
  check('Referrer-Policy présent', Boolean(h.get('referrer-policy')));
  check('Permissions-Policy présent', Boolean(h.get('permissions-policy')));
  const hsts = h.get('strict-transport-security') || '';
  check('HSTS présent', hsts.length > 0, hsts);
  if (hsts.length > 0) {
    const maxAge = Number((hsts.match(/max-age=(\d+)/) || [])[1] || 0);
    check('HSTS max-age ≥ 1 an', maxAge >= 31536000, `max-age=${maxAge}`);
    check('HSTS includeSubDomains', /includeSubDomains/.test(hsts));
  }
}

/* ─────────────────── 2. Gardes non authentifiées ─────────────────── */

async function checkGuards() {
  console.log('\n── Gardes API & pages admin (sans session) ──');

  const expectStatus = async (name, url, method, expected) => {
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method,
        redirect: 'manual',
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? '{}' : undefined,
      });
      const ok = Array.isArray(expected) ? expected.includes(res.status) : res.status === expected;
      check(name, ok, `${method} ${url} → ${res.status} (attendu ${expected})`);
      return res;
    } catch (err) {
      check(name, false, String(err.message || err));
      return null;
    }
  };

  await expectStatus('GET /api/analytics/realtime → 401', '/api/analytics/realtime', 'GET', 401);
  await expectStatus('GET /api/analytics/events → 401', '/api/analytics/events', 'GET', 401);
  await expectStatus('GET /api/dashboard/stats → 401', '/api/dashboard/stats', 'GET', 401);
  await expectStatus('POST /api/setup-admin → 401', '/api/setup-admin', 'POST', 401);
  await expectStatus('POST /api/admin/sync → 401', '/api/admin/sync', 'POST', 401);
  await expectStatus('GET /api/backup → 401', '/api/backup', 'GET', 401);
  await expectStatus('GET /api/admin/backup/export → 401', '/api/admin/backup/export', 'GET', 401);

  // Pages admin : redirection vers la connexion (307/308)
  const redirect = await expectStatus(
    '/admin/projects → redirection login',
    '/admin/projects',
    'GET',
    [307, 308]
  );
  if (redirect) {
    const loc = redirect.headers.get('location') || '';
    check('redirection admin vers /admin/login', loc.includes('/admin/login'), loc);
  }
  await expectStatus('/admin/login accessible (200)', '/admin/login', 'GET', 200);
  await expectStatus('/admin/verify-2fa accessible (200)', '/admin/verify-2fa', 'GET', 200);

  // HTML : aucun script exécutable inline (bloqué par la CSP stricte)
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>/g)].filter((m) => {
      const tag = m[0];
      // Les blocs JSON non exécutables (JSON-LD, __NEXT_DATA__) ne sont pas
      // des scripts exécutables : ils n'entrent pas dans script-src.
      return !/application\/(ld\+json|json)/.test(tag);
    });
    check(
      'HTML sans script exécutable inline',
      inlineScripts.length === 0,
      `${inlineScripts.length} trouvé(s)${inlineScripts[0] ? ` : ${inlineScripts[0][0].slice(0, 80)}` : ''}`
    );
    check('HTML sans gestionnaire inline (on*=)', !/\son(click|load|error|mouseover)\s*=/.test(html));
  } catch (err) {
    check('analyse HTML', false, String(err.message || err));
  }
}

/* ───────────────────── 3. Scan de secrets (code source) ───────────────────── */

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'public', 'coverage', '.turbo']);
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.yml', '.yaml']);

const SECRET_PATTERNS = [
  { name: 'clé privée PEM', re: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'chaîne MongoDB avec identifiants', re: /mongodb(\+srv)?:\/\/[^\s:]+:[^\s@]+@/ },
  { name: 'clé API Resend (re_…)', re: /\bre_[A-Za-z0-9]{20,}/ },
  { name: 'clé OpenAI (sk-…)', re: /\bsk-[A-Za-z0-9_-]{20,}/ },
  { name: 'token GitHub (ghp_…)', re: /\bghp_[A-Za-z0-9]{36}/ },
  { name: 'token AWS (AKIA…)', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'token Slack (xox…)', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'identifiant admin en dur (ADMIN_PASSWORD=)', re: /ADMIN_PASSWORD\s*=\s*["'][^"']+["']/ },
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full, out);
    } else if (CODE_EXT.has(entry.slice(entry.lastIndexOf('.')))) {
      out.push(full);
    }
  }
  return out;
}

function scanSecrets() {
  console.log('\n── Scan de secrets (code source tracké) ──');
  // .env et .env.* ne sont PAS trackés : on les exclut volontairement du
  // scan de code (ils contiennent les secrets légitimes locaux).
  const files = walk(ROOT).filter((f) => !/\.env(\..+)?$/.test(f));
  let hits = 0;
  for (const file of files) {
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const { name, re } of SECRET_PATTERNS) {
      const match = content.match(re);
      if (match) {
        hits += 1;
        check(`secret détecté : ${name}`, false, `${relative(ROOT, file)} → ${match[0].slice(0, 12)}…`);
      }
    }
  }
  if (hits === 0) {
    check(`aucun secret dans ${files.length} fichiers de code`, true);
  }
}

/* ───────────────────────────── Main ───────────────────────────── */

async function main() {
  console.log('=== Vérifications de sécurité ===');
  if (!SCAN_ONLY) {
    await checkHeaders();
    await checkGuards();
  }
  scanSecrets();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} vérifications OK`);
  if (failed.length > 0) {
    console.log('ÉCHECS :');
    for (const f of failed) console.log(`  - ${f.name} ${f.detail}`);
    process.exit(1);
  }
  console.log('Tout est vert.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
