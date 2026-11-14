# Audit de sécurité — mehmetsalihk.fr

> **Date** : 13 novembre 2026
> **Périmètre** : application Next.js 14 (Pages Router) + API, admin, uploads, authentification
> **Cadre** : OWASP ASVS 5.0.0 + OWASP Top 10 (2021)
> **État** : corrections appliquées et validées localement — **aucun déploiement effectué**
> **Validation** : `tsc` 0 erreur · `next lint` 0 erreur · `next build` 109/109 pages · `npm run test:security` **29/29**

---

## 1. Résumé exécutif

L'audit a porté sur l'implémentation réelle (jamais le README), avec preuves par ligne avant toute
déclaration. **15 phases** ont été menées ; les failles confirmées ont été corrigées, puis revérifiées
par tests automatisés contre un build de production local.

### Failles critiques corrigées

| # | Faille | Impact avant | Correctif |
|---|--------|--------------|-----------|
| 1 | **Contournement total de la 2FA** : `authorize()` acceptait le mot de passe magique `verified-2fa` sans aucune vérification | N'importe qui obtenait une session admin en appelant `signIn('credentials', {password:'verified-2fa'})` | Session exige désormais un **cookie HMAC signé** (`msk_2fa`, 5 min, lié à l'email) émis uniquement par `/api/auth/verify-2fa` après validation réelle du code |
| 2 | **Reset de mot de passe admin anonyme** : `POST /api/setup-admin` réécrivait `ADMIN_PASSWORD` en base sans authentification | Prise de contrôle totale | `requireAdmin` (401/403) |
| 3 | **~40 endpoints de gestion sans contrôle de rôle** (sync, backup, skills, education, experiences, messages, settings, SEO, analytics…) | Lecture/écriture/suppression anonyme de données admin | Garde centralisée `requireAdmin` = session **+ rôle admin** |
| 4 | **Path traversal sur suppression de fichiers** : `path.join(cwd,'public',filePath)` acceptait `../../../.env` | Suppression arbitraire de fichiers | Résolution + contrainte de dossier (`resolveSafePath`/`isPathInside`) |
| 5 | **Uploads sans validation de contenu** : MIME déclaré par le client accepté (y compris SVG/HTML) | **XSS stocké** servi depuis l'origine | Liste blanche d'extensions + **magic bytes** ; SVG refusé |
| 6 | **Écriture de fichier arbitraire via recadrage** : `newFilename` non sanitisé (`../../x`) | Écriture hors du dossier uploads | Nom sanitisé, format en liste blanche, dimensions/qualité bornées |
| 7 | **Credentials admin en clair dans `vercel.json`** (commités dans l'historique git) | Divulgation d'identifiants | Bloc `env` supprimé du fichier (rotation requise — §11) |
| 8 | **CSP avec `unsafe-eval` + `unsafe-inline` sur `script-src`** en production | XSS facilité | CSP stricte en prod (script thème externalisé), permissive en dev |
| 9 | **Middleware de sécurité jamais déployé** (fichier à la racine alors que Next cherche dans `src/` avec structure `src/pages`) | Rate-limit et garde admin **inactives** | Déplacé en `src/middleware.ts`, manifest vérifié (`ƒ Middleware 49.5 kB`) |
| 10 | **PII exposées** : events analytics publics (IP/UA), `diplomaData` en base64 dans `__NEXT_DATA__`, emails dans les logs | Fuite de données personnelles | GET admin, IP anonymisées /24-/48, champs retirés du rendu, logs nettoyés |

### État final mesuré

```
npm audit        : 54 vulns (3 critical) → 23 vulns (1 critical)   [mongoose & next-auth corrigés]
CSP prod         : script-src 'self' https://va.vercel-scripts.com  [0 unsafe-*]
HTML rendu       : 0 script exécutable inline, 0 handler on*= inline
Gardes           : 7 endpoints testés → 401 ; /admin → 307 login ; bypass 2FA → erreur + 0 cookie
Rate-limit       : 429 observés (contact 6/min, send-2fa 5/min)
test:security    : 29/29 PASS
```

---

## 2. Méthodologie & garanties

- **Preuves par ligne** : chaque déclaration est précédée d'une inspection du code source ou d'un
  test exécuté (requêtes locales contre `next start`).
- **Aucun test intrusif en production** : toutes les validations ont été faites sur un build local
  (`next start -p 3002`). Le site en ligne n'a jamais été attaqué ni modifié.
- **Aucune protection désactivée** pour faire passer un test ; **aucun secret exposé** ;
  **aucun commit** effectué pendant le chantier (offre de commit en §12).
- **Aucune action infrastructure** (DNS, Cloudflare, hébergeur, base de production, déploiement)
  n'a été réalisée — toutes sont listées §11 et nécessitent votre accord.
- Backups de tous les fichiers modifiés : `$env:TEMP\portfolio-admin-backup-20261113`
  (restauration possible fichier par fichier).

---

## 3. Authentification & 2FA (ASVS V2/V6)

### Faille historique (confirmée par test)

L'ancien `authorize()` contenait :

```ts
if (credentials.password === 'verified-2fa') { /* crée la session admin */ }
// + fallback : credentials.password === process.env.ADMIN_PASSWORD
```

Le jeton `verified-2fa` étant envoyé en clair par la page client, **n'importe qui** pouvait le
réutiliser sans jamais recevoir de code à 6 chiffres.

### Correctif appliqué

- `src/lib/two-fa.ts` (nouveau) : preuve 2FA = cookie **HttpOnly + Secure + SameSite=Lax**
  `msk_2fa`, valeur `email|exp.HMAC-SHA256(NEXTAUTH_SECRET)`, TTL 5 min, liée à l'email,
  comparaison en temps constant.
- `/api/auth/verify-2fa` : émet ce cookie **après** validation réelle du code (3 tentatives max,
  anti-rejeu `deleteOne`, rate-limit 10/min). L'ancien JWT auto-signé de 24 h (jeton transportable)
  a été **supprimé**.
- `authorize()` : exige le jeton de passage `verified-2fa` **et** la preuve cookie valide.
  Le mot de passe réel n'est plus jamais accepté dans `authorize` (il est vérifié à l'étape 1 par
  `send-2fa`).
- `send-2fa` : rate-limit 5/min (anti credential-storming + spam d'emails), types stricts
  (`typeof === 'string'`, longueurs bornées) contre l'injection NoSQL par objets.

### Preuve de test (build prod local)

```
POST /api/auth/callback/credentials {password:'verified-2fa'} sans cookie
→ 302 Location: /api/auth/error?error=Vérification en deux étapes requise ou expirée
→ cookie de session ABSENT (jar vide)
→ logs serveur : « 2FA: preuve absente ou invalide »
```

### Sessions & cookies (ASVS V3)

- NextAuth `strategy: 'jwt'`, `maxAge: 24 h`.
- Cookies constatés : `__Host-next-auth.csrf-token`, `__Secure-next-auth.callback-url` —
  **HttpOnly, Secure, SameSite=Lax**, préfixes `__Host-`/`__Secure-` (Vercel/HTTPS).
- `NEXTAUTH_SECRET` obligatoire (throw si absent) ; aucun secret en dur dans le code.

---

## 4. Contrôle d'accès (ASVS V4 / Top 10 A01)

### Garde centralisée

Nouveau `src/lib/auth-guard.ts` :

- `requireAdmin(req,res)` → 401 si pas de session, **403 si `role !== 'admin'`**, sinon `{user}`.
- Remplace les vérifications « session seule » redondantes et hétérogènes.

### Routes couvertes (échantillon des 40+ endpoints)

| Domaine | Endpoints | État |
|---|---|---|
| Admin système | `admin/sync`, `setup-admin`, `test-email`, `init-categories`, `admin/settings`, `admin/seo`, `admin/stats`, `admin/cv`, `admin/skill-categories` | ✅ admin |
| Sauvegardes | `backup`, `backup/schedule`, `backup/versions`, `admin/backup/{export,import}` | ✅ admin |
| Contenus | `projects`, `projects/[id]`, `projects/reorder`, `experiences`, `education`, `skills`, `admin/skills`, `skills/[id]`, `skills/update-categories`, `homepage` | ✅ admin |
| Messages & analytics | `admin/messages`, `messages/[id]/status`, `analytics/{events GET, realtime, stats}`, `dashboard/{activity,stats}` | ✅ admin |
| Médias & uploads | `upload`, `upload-media`, `media`, `media/[id]`, `media/crop`, `media/serve/[id]`, `media/optimize/{batch,status}` | ✅ admin |
| GitHub | `github/sync` | ✅ admin |
| **Endpoints publics maintenus** (volontairement) | `messages POST` (contact), `contact`, `maintenance GET`, `admin/settings GET`, `media/serve/[...path]` (fichiers publics), pages publiques | ✅ inchangés |

### Pages admin

`src/middleware.ts` : redirection **307** vers `/<locale>/admin/login?callbackUrl=…` pour toute page
`/admin/*` sans jeton de session, locales `fr`/`en`/`tr` gérées, pages de connexion exemptées.
Vérifié : `/admin/projects → 307`, `/en/admin/projects → 307 /en/admin/login`, `/admin/login → 200`.

> **Bug découvert** : le middleware initial était à la racine du projet. Avec une structure
> `src/pages`, Next.js calcule `rootDir = src/` et ne détecte que `src/middleware.ts` —
> le manifest était vide (`"middleware": {}`) : **la protection était morte**. Fichier déplacé,
> manifest revérifié.

---

## 5. Injection & validation des entrées (ASVS V5 / Top 10 A03)

- **NoSQL** : types stricts partout où le corps atteint une requête Mongo
  (`typeof === 'string'` avant `findOne({email})` — rejette `{ $ne: null }`).
- **Mass-assignment / opérateurs** : garde `clé.startsWith('$') || __proto__|constructor|prototype`
  sur les updates `PUT`/`POST` de `projects`, `experiences`, `education`, `skills`,
  `admin/settings` ; listes blanches typées sur `media/[id]`, `media/index`.
- **ObjectId** : `mongoose.Types.ObjectId.isValid(id)` sur les routes `[id]`
  (projects, skills, education, media, reorder).
- **ReDoS** : recherche média échappée (`escapeRegExp`) + longueur bornée ; tags projet échappés.
- **Zod** : `loginSchema` (serveur + client), `contactSchema` (formulaire public), validation
  stricte de `send-2fa`/`analytics/events POST` (types + longueurs + taille de `data` bornée).
- **Erreurs** : messages génériques en réponse (plus de `error.message`/`stack` — fuites
  d'informations internes supprimées : `admin/sync`, `crop`, `experiences`, `test-email`…).

---

## 6. Fichiers & uploads (ASVS V6.4 / Top 10 A04-A08)

Nouveaux utilitaires : `src/utils/pathSafety.ts`, `src/utils/uploadSafety.ts`.

- **Path traversal** : `resolveSafePath(root, …segments)` refuse contrôle/NUL/absolu/`..`,
  puis vérifie le containment après résolution. Appliqué à toutes les suppressions
  (`upload`, `upload-media`, `media/[id]`, `media/index`, `media/serve/[...path]`,
  `media/crop`, `education/[id]`).
- **Magic bytes** : `sniffFileKind` reconnaît JPEG/PNG/GIF/WEBP/AVIF/MP4/WebM/MP3/WAV/Ogg/PDF/texte ;
  l'extension (liste blanche) doit correspondre au contenu réel. Le MIME client est toujours
  considéré comme non fiable.
- **SVG refusé en upload** (XSS stocké) ; s'il existait un vieux SVG, il est servi avec
  `Content-Security-Policy: … sandbox` + `nosniff`.
- **`media/serve/[...path]`** : chaque segment validé + containment dans `uploads/media`
  (l'ancien `startsWith` acceptait un dossier voisin de nom préfixé).
- **Médias non publics** : `media/serve/[id]` renvoie **404** (et non 403) aux non-admins
  pour ne pas révéler l'existence du fichier.

---

## 7. Transport & en-têtes HTTP (ASVS V8)

En-têtes vérifiés sur le build de production local (`next start -p 3002`) :

| En-tête | Valeur | État |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ sous-domaines vérifiés (`mail.mehmetsalihk.fr` = Roundcube HTTPS OK) avant d'ajouter `includeSubDomains`/`preload` |
| `Content-Security-Policy` | `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: + hôtes images ; frame-src 'self' blob:; connect-src 'self' https://vitals.vercel-insights.com` | ✅ **0 `unsafe-*` sur script-src en prod** |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ (+ `frame-ancestors`) |
| `Referrer-Policy` | `origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | ✅ |

**Décisions documentées :**

- `style-src` conserve `'unsafe-inline'` : React/Next émettent des attributs `style` en SSR ;
  les bloquer casserait le rendu. Sans effet sur l'exécution de script.
- Le script de thème anti-FOUC a été externalisé (`public/theme-init.js`) pour permettre un
  `script-src` strict — il reste **synchrone volontairement** (désactivation ESLint justifiée :
  c'est la condition de l'absence de flash de thème).
- **Dev** : CSP permissive (`unsafe-eval`/`unsafe-inline`) indispensable à react-refresh/HMR —
  jamais appliquée en production (`NODE_ENV` conditionne la valeur).
- **Vercel Analytics/Speed Insights** : `script-src`/`connect-src` contiennent leurs domaines
  officiels (`va.vercel-scripts.com`, `vitals.vercel-insights.com`) — analytics non cassé.
- JSON-LD et `__NEXT_DATA__` sont des blocs JSON **non exécutables** (`type="application/ld+json"`,
  `application/json`) : conformes CSP (vérifié : 0 script exécutable inline dans le HTML).
- Le hook `useSecurity.ts` (« anti-F12 ») a été **supprimé** : DevTools n'est pas une mesure de
  sécurité ; il étouffait la console et détruisait la préférence de thème localStorage.

---

## 8. Rate limiting & DDoS/bot (ASVS V4.3 / Top 10 A07)

`src/utils/rateLimit.ts` réécrit **serverless-safe** (l'ancien `Map` en mémoire ne valait que pour
une instance et disparaissait à chaque cold start) :

1. **Backend partagé Upstash Redis (REST)** si `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
   sont définis (`INCR` + `PEXPIRE`, fail-soft vers le local si indisponible).
2. Sinon : **fenêtre locale documentée comme best effort** (jamais présentée comme une protection
   distribuée).
- IP : `req.ip` (Vercel) d'abord, sinon 1er saut `x-forwarded-for` (longueur bornée 45).
- Sans IP : **prod = compteur « unknown » partagé (fail-closed)** ; dev local = pas de limite
  (aucun exposé en production).
- `Retry-After` + `X-RateLimit-*` sur les 429.

**Middleware** (`src/middleware.ts`) — portées indépendantes / minute :

| Portée | Limite | Cible |
|---|---|---|
| `auth:signin` | 10 | `/api/auth/{callback,signin}` (credential stuffing) |
| `auth` | 60 | reste de `/api/auth/*` |
| `contact` | 6 | `/api/contact`, `/api/messages` (spam) |
| `auth:send-2fa` / `auth:verify-2fa` | 5 / 10 | codes 2FA (forcement) |
| `analytics` | 60 | `/api/analytics/*` |
| `api` | 120 | tout le reste de `/api/*` |

**Preuves de test** : 8× `POST /api/contact` → 429 au 7e ; 7× `send-2fa` → 429 après 5.

---

## 9. Confidentialité / PII (ASVS V8.1, RGPD)

- **Analytics** : `GET /api/analytics/{events,realtime}` → admin (contenaient IP, user-agent,
  sessionId) ; `POST events` validé (types/longueurs/taille) et **IP anonymisée au stockage**
  (`/24` IPv4, `/48` IPv6).
- **`formations.tsx`** : `diplomaData` (fichier en base64), `diplomaFilePath`, `diplomaFileName`
  retirés du rendu public (partaient dans `__NEXT_DATA__` HTML).
- **Logs serveur nettoyés** : plus aucune adresse email, aucun contenu de formulaire, aucun
  `req.body` complet, aucune variable d'environnement, aucun mot de passe en log
  (13 commentaires DEBUG supprimés dans `send-2fa`, logs `contact`/`settings`/`education`/
  `skills`/`verify-2fa` réduits à des messages neutres).
- **API** : email retiré des réponses `send-2fa` et `admin/sync` ; stack/objet d'erreur retirés
  des réponses `admin/sync`, `test-email`, `crop`.
- **Bundles** : `NEXT_PUBLIC_RESEND_EMAIL` n'est plus référencé dans le code (l'adresse n'est donc
  plus inlinée dans le JS public) ; seule référence restante = `NEXT_PUBLIC_GITHUB_ID` (client ID
  OAuth — public par conception) dans une page admin.
- **Cookies** : aucun cookie non HttpOnly contenant une donnée sensible ; session JWT chiffrée
  par NextAuth.

---

## 10. Dépendances (Top 10 A06)

`npm audit` (avant → après `npm audit fix`, **sans** `--force`) :

| | Avant | Après |
|---|---|---|
| Total | **54** | **23** |
| Critical | **3** (mongoose, next, next-auth) | **1** (next) |
| High | 32 | 7 |

- **mongoose 8.13.1 → 8.24.9** : corrige les CVE critiques (sanitizeFilter, prototype pollution…).
- **next-auth 4.24.4 → 4.24.15** : corrige les CVE critiques (homoglyph @, Bearer malformé…).
- **next 14.2.20 → 14.2.35** : dernier correctif de la branche 14.x.
- **sharp, dompurify, undici, ws…** : correctifs appliqués dans la plage existante.

**Reste (non appliqué — nécessite votre accord, §11)** :

- `next` : le correctif intégral demande **Next 16.4.6 (changement majeur 14 → 16)** — migration
  à planifier (App Router possible, mais Pages Router conservé ici). Certaines CVE restantes
  concernent des fonctionnalités non utilisées (App Router, Server Actions, AVIF/SVG optimizer —
  le SVG est bloqué à l'upload), mais l'upgrade reste recommandé à moyen terme.
- `zod 3 → 4`, `sharp 0.34 → 0.35`, `postcss` (via next 16) : ruptures majeures, à traiter avec
  la migration Next.
- Dépendances imbriquées (`miniflare`, `@fastify/busboy`, `undici` de wrangler…) : outillage dev
  Cloudflare, non exposé en production.

---

## 11. Monitoring, backups & tests automatisés

- **Logs structurés sans secrets/PII** (§9) — pas de plateforme de monitoring surdimensionnée :
  les logs Vercel + console neutre suffisent pour ce volume ; aucun agent lourd ajouté.
- **Tests automatisés** : `npm run test:security` (`scripts/security-check.mjs`, zéro dépendance) :
  - headers (CSP stricte, HSTS, nosniff, clickjacking, referrer, permissions) ;
  - gardes non authentifiées (7 endpoints → 401, redirections admin 307, pages d'auth 200) ;
  - HTML (0 script exécutable inline, 0 handler `on*=`) ;
  - **scan de secrets** sur les fichiers de code (PEM, `mongodb+srv://` avec identifiants,
    `re_`, `sk-`, `ghp_`, `AKIA`, `xox`, `ADMIN_PASSWORD=` en dur) — **0 détection / 200 fichiers**.
  - Mode `--dev` pour la CSP permissive, `--scan-only` sans serveur.
- **Backups de fichiers** (avant toute modification) : `$env:TEMP\portfolio-admin-backup-20261113`.
- **Sauvegardes de données** : endpoints `backup/{export,import,schedule,versions}` existants,
  désormais réservés admin.

---

## 12. Actions nécessitant votre accord (infrastructure / décision)

> Aucune de ces actions n'a été réalisée. Elles sont **indispensables avant ou après déploiement**.

| # | Action | Priorité | Pourquoi |
|---|---|---|---|
| A1 | **Définir `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans le dashboard Vercel** puis déployer | **Bloquant** | Ces variables ont été retirées de `vercel.json` (creds en clair) : sans elles, le compte admin par défaut n'existe pas |
| A2 | **Rotation du mot de passe admin** (nouveau mot de passe fort, jamais en clair dans le repo) | **Haute** | L'ancien apparaît dans l'historique git (`vercel.json` commité) |
| A3 | **Configurer Upstash Redis** (`UPSTASH_REDIS_REST_URL` + `_TOKEN`) dans Vercel | **Haute** | Sans lui, le rate-limit repose sur une fenêtre locale best effort (non distribuée entre instances) |
| A4 | **Rotation de `NEXTAUTH_SECRET`** (recommandé) | Moyenne | Préventif — aucun indice de divulgation, mais l'audit ne peut pas prouver l'absence de fuite ancienne |
| A5 | **Migration Next.js 14 → 16** (corrige la dernière CVE critique) | Moyenne | Changement majeur : à planifier, test de régression complet requis |
| A6 | **Purger `.env` local** des variables mortes (`JWT_SECRET`, `RESEND_*_ADMIN`, `TWO_FA_EMAIL`, `NEXT_PUBLIC_RESEND_EMAIL`, `NEXT_PUBLIC_API_URL`) | Basse | Inutilisées dans le code ; surface de confusion réduite |
| A7 | **Supprimer les scripts d'inspection** `scripts/inspect-*.mjs` (si plus utiles) + purge éventuelle des backups temporaires | Basse | Hygiène de repo |
| A8 | **Déploiement** (Vercel) après validation visuelle | — | Aucun déploiement effectué pendant l'audit ; le site en ligne tourne encore sur l'ancienne version |
| A9 | **Ouvrir la session dans l'app OpenCode** (navigateur) | — | Permet les tests visuels, screenshots, Lighthouse/CWV et la validation « CSP ne casse rien » en exécution réelle — **non fait** : navigateur déconnecté |

---

## 13. Limites de l'audit (honêteté des résultats)

- **Navigateur déconnecté** : aucun test visuel, aucun screenshot, aucun Lighthouse/CWV, aucune
  vérification « la CSP ne casse rien à l'exécution » côté client (le HTML et les headers ont été
  validés côté serveur ; le rendu React reste à confirmer visuellement — A9).
- **Pas de test en production** : conformément à la règle, toutes les validations sont locales.
- **Rate-limit local** : sans IP exploitable, le dev n'impose pas de limite (comportement voulu,
  documenté) — les 429 observés viennent des limites par endpoint côté handler.
- **Upstash absent** : le comportement distribué du rate-limit n'a pas pu être testé (à faire
  après A3 : rejouer `npm run test:security` + un burst de requêtes).
- **Audit de dépendances résiduel** : 23 vulns restantes documentées §10, aucune corrigible sans
  rupture majeure.
- **Aucun pentest applicatif complet** (fuzzing, business logic approfondie) : les58 routes API ont
  été balayées mécaniquement (auth, validation, fuites), pas fuzzées.

---

## 14. Checklist priorisée

### 🔴 P0 — avant déploiement
- [ ] A1 : `ADMIN_EMAIL`/`ADMIN_PASSWORD` définis dans Vercel
- [ ] A2 : rotation du mot de passe admin
- [ ] Rebuild + `npm run test:security` vert sur le build final
- [ ] Validation visuelle (CSP, thème, 2FA de bout en bout) — nécessite navigateur (A9)

### 🟠 P1 — haute priorité
- [ ] A3 : Upstash configuré + test de burst du rate-limit distribué
- [ ] Vérifier en prod déployée : headers (HSTS/CSP), `/admin` → 307, 401 sur endpoints protégés
- [ ] A4 : rotation `NEXTAUTH_SECRET`
- [ ] A5 : planifier la migration Next 16 (dernière CVE critique)

### 🟡 P2 — amélioration continue
- [ ] A6/A7 : purge `.env` et scripts d'inspection
- [ ] Brancher `test:security` en CI (pré-merge)
- [ ] Revue des logs Vercel pendant 1-2 semaines (détection d'anomalies)
- [ ] Rotation planifiée des backups de données

### ✅ Effectué et validé (récapitulatif)
- [x] 2FA : bypass supprimé, preuve HMAC serveur, anti-rejeu, rate-limits
- [x] 40+ endpoints → `requireAdmin` (session + rôle)
- [x] Middleware admin + rate-limit effectivement déployé (bug `src/` corrigé)
- [x] Path traversal, magic bytes, SVG bloqué, écriture arbitraire bloquée
- [x] CSP stricte en prod (0 `unsafe-*`), HSTS complet, en-têtes complets
- [x] Mass-assignment / opérateurs Mongo / ObjectId / ReDoS
- [x] PII : analytics, diplômes, logs, bundles, réponses API
- [x] Credentials retirés de `vercel.json`
- [x] `useSecurity` supprimé (DevTools ≠ sécurité)
- [x] npm audit 54 → 23 (mongoose/next-auth corrigés)
- [x] `test:security` 29/29 · tsc 0 · lint 0 · build 109/109

---

## Annexe A — Utilitaires créés

| Fichier | Rôle |
|---|---|
| `src/lib/auth-guard.ts` | `requireAdmin` / `requireSession` / `withAdmin` / `allowMethods` |
| `src/lib/two-fa.ts` | Preuve 2FA HMAC (signatures, cookies, lecture d'en-tête) |
| `src/utils/pathSafety.ts` | `resolveSafePath` / `isPathInside` (anti-traversal) |
| `src/utils/uploadSafety.ts` | Sanitisation noms, extension whitelist, magic bytes, `readFileHead` |
| `src/utils/rateLimit.ts` | Rate-limit Upstash/local, `enforceRateLimit`, en-têtes 429 |
| `src/middleware.ts` | Rate-limit `/api/*` + garde session pages `/admin` (locales fr/en/tr) |
| `scripts/security-check.mjs` | Tests automatisés headers + gardes + scan secrets (`npm run test:security`) |
| `public/theme-init.js` | Script de thème externalisé (CSP stricte compatible) |

## Annexe B — Restaurer une version antérieure

```powershell
# Exemple : restaurer un fichier modifié
Copy-Item "$env:TEMP\portfolio-admin-backup-20261113\<chemin>" "<chemin>" -Force
# useSecurity.ts supprimé :
Copy-Item "$env:TEMP\portfolio-admin-backup-20261113\src\utils\hooks\useSecurity.ts" "src\utils\hooks\"
```

## Annexe C — Rejouer les validations

```bash
npx tsc --noEmit          # 0 erreur
npx next lint             # 0 erreur
npm run build             # 109 pages + Middleware
npx next start -p 3002    # puis, dans un autre terminal :
npm run test:security     # 29/29 attendu
```
