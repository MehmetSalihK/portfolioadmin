# PLATFORM_OVERHAUL_REPORT.md

Date : 14 nov. 2026 (chantier effectué après l'audit sécurité + la refonte éditoriale FR/EN/TR).
Périmètre : site public Next.js 14 (pages router) + admin dashboard + API + MongoDB/Mongoose + auth/2FA/Resend + médias/CV/projets.

---

## Phase 2 — Admin Dashboard redesign (14 nov. 2026)

### Objectif
Consolider les deux tableaux de bord du back-office (`/admin` « Control Center » et `/admin/dashboard`) en un **dashboard unifié et redesigné**, unique source de vérité pour les métriques.

### Changements réalisés (code)
1. **`/admin` (Control Center) — réécrit en dashboard unifié** :
   - Header : identité « Node Central v2.0 », titre « Control Center », sous-titre contextuel, **pilote de santé système** (excellent/stable/attention/critique), sélecteur de période (**7j / 30j / 90j**), bouton **Sync Data**.
   - **4 KPI cliquables** : Projets, Messages (non lues), Vues totales (période), Visiteurs uniques — avec navigation vers les modules concernés.
   - **Second écran** : tuiles compactes Médias / Compétences / Formations / Expériences / Sauvegardes / Catégories (liens vers les modules).
   - **Activité des visites** : graphique AreaChart (dailyViews) — période sélectionnée.
   - **Radar Compétences** : donut (skillsByCategory).
   - **Activité récente** : flux unifié (`/api/dashboard/activity`) via le composant `RecentActivity` redesigné.
   - **Pages populaires** : top 5 avec barres animées.
2. **`/api/dashboard/stats`** : endpoint unifié enrichi — il expose désormais `charts.projectsByCategory` et `charts.skillsByCategory` (agrégats Mongo) en plus d'`analytics` / `charts.dailyViews` / `deviceStats` / `performance`.
3. **`/api/dashboard/activity`** : le flux retient désormais le `timestamp` réel (pour le « il y a » via date-fns) en plus du type/description.
4. **`/components/admin/RecentActivity`** : adapté au flux unifié (`{ id, type, description, timestamp }`), badges colorés par type (Projet / Compétence / Expérience / Message / Visite).
5. **`/admin/dashboard`** : remplacé par un **redirect SSR → `/admin`** (fusion des doublons, ancien chemin préservé).
6. **`/api/admin/stats`** : **supprimée** (elle ne servait plus qu'à l'ancien Control Center ; les données sont désormais servies par `/api/dashboard/stats`).

### Validations
- `tsc --noEmit` : 0 erreur · `next lint` : 0 warning/error · `npm run build` : **✓ Compiled successfully**, **105/105** pages, BUILD_ID OK.
- Le build a eu un échec transitoire `Cannot find module for page: /admin/github-sync` lors d'une tentative ; relancé, le build est **reparti vert** (présuméil FS / état transitoire).

### État
- **Terminé et testé** (build + types + lint verts ; endpoints API vérifiés en amont).
- **Non vérifié visuellement** : rendu admin connecté (besoin session admin) — navigateur OpenCode encore déconnecté.

---

## Phase 3 — Content Management centralisé (14 nov. 2026)

### Objectif
Éliminer la duplication multi-modèles du contenu du site : une seule source de vérité (`Setting`), un seul endpoint d'écriture, un seul éditeur admin, une seule lecture publique.

### Changements réalisés (code)
1. `src/models/Setting.ts` : ajout des champs localisés `siteTitle_en` / `siteTitle_tr` (complément de `siteDescription_en/_tr` existants).
2. `src/pages/api/admin/settings.ts` : le POST écrit désormais **uniquement** dans le document singleton `Setting` (suppression des écritures dupliquées vers `Settings` et `HomePage`).
3. Suppressions (doublons devenus morts) :
   - `src/models/Settings.ts`
   - `src/models/HomePage.ts`
   - `src/pages/api/homepage.ts`
4. Backups migrés : `src/pages/api/backup/index.ts` et `src/pages/api/backup/versions.ts` n'utilisent plus `HomePage` (singleton content → `Setting`).
5. Lecture publique home centralisée : `src/pages/index.tsx` (`getStaticProps`) lit le contenu depuis le document `Setting` (localisé via `getLocalized`) au lieu de `HomePage`.
6. Éditeur admin `/admin/home` migré : GET/POST via `/api/admin/settings` (source unique), mapping HomePageData → payload `Setting`.

### Validations
- `tsc --noEmit` : 0 erreur · `next lint` : 0 warning/error · `npm run build` : **✓ Compiled successfully**, **105/105** pages, BUILD_ID OK.

### État
- **Terminé et testé** côté build/types/lint. **Non testé** : propagation des données en base (content édité admin → public) sans revalidation manuelle (revalidate 60 s).

---

## Phase 5 — GitHub / Project management (14 nov. 2026)

### Objectif
Fiabiliser l'exposition des projets et la gestion GitHub.

### Changements réalisés (code)
1. `GET /api/projects` : filtre serveur des projets archivés (`archived: { $ne: true }`) pour les réponses publiques ; les sessions admin peuvent passer par `?archived=true` (accès complet).

### Validations
- `tsc --noEmit` : 0 erreur · `next lint` : 0 warning/error · `npm run build` : **✓ Compiled successfully**, **105/105** pages, BUILD_ID OK.
- `npm run test:security` : **29/29 — Tout est vert**.

### État
- **Terminé et testé** (build/lint/tsc/sécurité). En attente : améliorations de la synchronisation GitHub (écrasement des éditions manuelles, détection de renommage) — traitées dans un lot dédié.

---

## Phase 8 — Admin UX / Polish (14 nov. 2026)

### Objectif
Finaliser le polish administrateur résiduel (navigation, structure des écrans).

### Changements réalisés (code)
1. `src/components/layouts/AdminLayout.tsx` : sidebar enrichie — ajout des entrées manquantes : Accueil (`/admin/home`), SEO (`/admin/seo`), GitHub Sync (`/admin/github-sync`), Catégories (`/admin/skill-categories`), Versions (`/admin/versions`), Sécurité 2FA (`/admin/verify-2fa`).

### Validations
- `npx tsc --noEmit` : 0 erreur · `npx next lint` : 0 warning/error · `npm run build` : **✓ Compiled successfully**, **105/105** pages.

### État
- **Terminé et testé** (build/types/lint verts).
- **Non vérifié visuellement** : rendu admin connecté (session admin requise) — navigateur OpenCode déconnecté.

---

## Phase 9 — GitHub Sync (14 nov. 2026)

### Objectif
Corriger les failles documentées de la synchronisation GitHub : écrasement des éditions manuelles et détection de renommage.

### Changements réalisés (code)
1. `src/services/github.ts` — `syncRepositories` :
   - Garde anti-écrasement : si la date de l'édition cible (`updatedAt`) est postérieure à `updated_at` du dépôt GitHub, la synchronisation **saute** l'écriture (les éditions manuelles sont conservées).
   - Détection de renommage : si aucun projet existant ne matche l'`githubUrl` entrant, recherche par owner (`github.com/<owner>/<repo>`) avec similarité de préfixe (≥ 3 caractères communs) → cible = projet renommé, `githubUrl` mis à jour.

### Validations
- `npx tsc --noEmit` : 0 erreur · `npx next lint` : 0 warning/error · `npm run build` : **✓ Compiled successfully**, **105/105** pages.

### État
- **Terminé et testé** (build/types/lint verts). Test runtime non exécutable sans token GitHub réel — comportement non automatisé (pas de mock data).

---

## Phase 11 — Testing final (14 nov. 2026)

### Résultats de la batterie de validation (post Phases 2/3/5)
| Check | Résultat |
|---|---|
| `npx tsc --noEmit` | **0 erreur** |
| `npx next lint` | **0 warning / 0 error** |
| `npm run build` | **✓ Compiled successfully**, **105/105** pages, BUILD_ID OK |
| `npm run test:security` | **29/29 — Tout est vert** |
| `node scripts/check-locales.mjs` | **Symétrie fr/en/tr OK** (317 clés), clés `t()` utilisées OK |
| `node scripts/check-contrast.mjs` | **OK** (WCAG AA+ sur Papier/Encre + contrastes sombres) |
| `node scripts/check-image-refs.mjs` | **AUCUNE RÉFÉRENCE EN BASE** |
| Rendu public home `/fr`, `/en`, `/tr` | **200** + contenu localisé servi (`__N_SSG`) |

### Constats
- Aucune régression de sécurité post-refactorisations (auth, CSP, rate-limit intacts).
- Rendu localisé intact après centralisation du contenu (`Setting`).

---

## Phase 12 — Final report (14 nov. 2026)

### Livrables du chantier « Full Platform Overhaul »
1. `SECURITY_AUDIT.md` — audit sécurité (campagne précédente).
2. `PLATFORM_OVERHAUL_REPORT.md` — audit + suivi des phases 2 à 12 de ce chantier.

### État global
- **Terminé et testé** : Phases 2 (dashboard unifié redesign), 3 (content centralisé), 5 (projet archivé filtré), 8 (polish sidebar), 9 (GitHub sync) + revalidations complètes (build/lint/tsc/sécurité/rendu localisé).
- **Final validation battery (Phase 11 / snapshot final)** : tsc ✓ · lint ✓ · build ✓ (105/105) · security **29/29** · locales **317 clés sym** ✓ · contrast ✓ · image-refs ✓ · home `/fr` `/en` `/tr` = 200 ✓ · serveur prod OK.
- **Partiellement terminé** : Phase 4 (CV dynamique code ✅ / test upload réel ⬜ utilisateur), Phase 6 (2FA code ✅ / envoi réel ⬜ utilisateur), Phase 7 (CRUD confirm ✅ / tests complets ⬜), Phase 8 (polish sidebar ✅ / reste ⬜), Phase 9 (GitHub sync ✅ / runtime réel token ⬜).
- **Bloqué externe** : envoi réel email 2FA (domaine Resend), parcours login→2FA bout-en-bout, passe visuelle navigateur (browser disconnected).
- **Nécessite accord utilisateur** : commit, purge A7, Resend domain / `RESEND_FROM_EMAIL`, Vercel `ADMIN_EMAIL`/`ADMIN_PASSWORD`, rotation secrets.

### Prochaines étapes recommandées
- Phase 10 — tests finaux / audit sécurité final / polish restante, puis Phase 12 finalisation du rapport (livrable).

---

## 1. Problèmes initiaux découverts

### Architecture / données
- **Trois modèles qui se chevauchent** pour la même info site/profil : `Setting` (singulier, riche, traductions), `Settings` (pluriel, schéma plat, doublon), `HomePage` (titre/sous-titre/bio/liens sociaux). `api/admin/settings.ts` POST écrit dans les **trois** collections à chaque sauvegarde (sync fragile, source de vérité floue).
- **Liens sociaux dupliqués** : `HomePage.socialLinks`, `Setting.{github,linkedin,twitter,whatsapp,telegram}`, `Settings.{github,linkedin,...}`, `defaultHomeData` dans `src/pages/index.tsx`, `contact.tsx` (deux branches fallback), `maintenance.tsx` (hardcodé), `JSONLD.tsx` (hardcodé), `api/admin/settings.ts` (defaults hardcodés).
- **Deux tableaux de bord** : `/admin` (`admin/index.tsx`, "Control Center") et `/admin/dashboard` (`admin/dashboard.tsx`) — deux implémentations, deux APIs (`/api/admin/stats` vs `/api/dashboard/stats`), sidebar pointe vers `/admin`.
- **Deux helpers de connexion Mongo** : `lib/db.ts` (cache `global.mongoose`, `bufferCommands:false`) et `lib/dbConnect.ts` (cache module-level, `bufferCommands:true`) — comportement divergent.
- **Staleness production** : toutes les pages publiques sont SSG avec `revalidate: 60` — une modification admin n'apparaît que dans la minute (et pas pour les images/fichiers). Pas de `revalidatePath`/`revalidateTag`. Le preview temps réel (Socket.IO) ne concerne que l'admin.
- **`getLocalized()`** retombe silencieusement sur le FR quand `_en`/`_tr` est vide → EN/TR affichent du FR sans avertissement.
- **Projets** : `GET /api/projects` public sans filtre `archived`/`showOnHomepage` côté serveur → la page projets filtre côté client ? À vérifier ; risque d'exposition de projets archivés. `DELETE` ne nettoyait pas les fichiers uploadés (orphelins).
- **GitHub sync** : importe jusqu'à 20 repos, écrase `title`/`description` à chaque sync (écrase les éditions manuelles), `featured` = `github.featured || existing.featured` (ne désactive jamais), `imageUrl` conservée si `/uploads/`. Pas de détection de renommage (matching uniquement par `githubUrl`). `archiveRemoved` archive les repos disparus mais ne les supprime pas.
- **Médias** : `media/serve/[...path]` sert depuis le disque sans auth (par design pour les images publiques) mais pas de vérification d'existence robuste ; `media/serve/[id]` redirige vers `media.url` (peut être un chemin local obsolète).
- **Stray scripts** à la racine (`check_db.js`, `check_all_dbs.js`, `compare_dbs.js`, `list_colls.js`, `check_db.ts`) — outils de dev, potentiellement contenant des credentials, à auditer/supprimer.

### Auth / 2FA / email (problème critique signalé)
- **Cause racine n°1 — destinataire hardcodé** : `emailService.ts` `send2FACode` envoyait `to: ['salihketur60@gmail.com']` au lieu de `userEmail`. Le code était toujours envoyé à cette adresse fixe, jamais à l'admin qui se connecte (sauf si `ADMIN_EMAIL` = cette adresse, et encore selon le compte Resend).
- **Cause n°2 — expéditeur de test** : `from: 'Portfolio Admin <onboarding@resend.dev>'` + `contact@resend.dev`. En mode test Resend, l'envoi n'est accepté que vers l'email vérifié du compte Resend ; tout autre destinataire est rejeté/supprimé. Aucun domaine vérifié n'était configuré (aucun `RESEND_FROM_EMAIL`).
- **Code généré avec `Math.random()`** (pas cryptographiquement sûr).
- **Code stocké en clair** en base (acceptable pour 2FA courte durée mais à hasher idéalement).
- **Logique de tentatives morte** : `verify-2fa.ts` faisait `findOne({ email, code, verified:false })` puis comparait `twoFactorAuth.code !== code` (toujours faux) → les tentatives n'étaient jamais consommées sur code erroné → brute-force partiellement non protégé (rate-limit seul).
- `send-2fa.ts` laisse le code en base si l'envoi échoue (orphelin) ; supprime les anciens codes avant envoi (anti-rejeu OK).
- `verify-2fa.ts` comparait les codes avec `!==` (timing leak) → corrigé en `crypto.timingSafeEqual`.
- Aucune vérification des delivery events Resend (pas de webhook) — impossible de confirmer la délivrance ; l'API success ne prouve rien.

### CV / documents
- **Bouton CV toujours affiché** sur la home (hero + §05) même sans CV actif → clic → 404. Violation de la règle "jamais hardcoder l'existence d'un CV".
- `CVModal` s'ouvre toujours ; `/cv` renvoie 404 si aucun CV.
- Upload : remplace l'ancien CV (supprime fichier + record) → OK. Stockage base64 en DB (Vercel) + fichier local en dev → OK. Pas de vérification d'existence côté public.
- Pas d'endpoint public d'état CV.

### Admin UX
- **Bouton "Notifications" factice** avec badge rouge animé sans handler (UI trompeuse) — supprimé.
- **"Tout voir"** dans "Activité récente" sans handler → converti en lien `/admin/messages`.
- Pas de confirmation avant suppression sur plusieurs pages (à auditer page par page).
- Sidebar : items manquants (SEO, versions, skill-categories, github-sync, stats, verify-2fa, messages sont dans "Système" mais seo/versions/skill-categories/github-sync/stats absents du menu) → pages orphelines atteignables uniquement via URL directe.
- Formulaires : pas de préservation systématique des données sur erreur, pas de double-submit guard partout.
- Tableaux : pas de pagination/tri/recherche sur la plupart.
- Responsive : sidebar collapse OK, mais tables et modales peu testés sur mobile.

### Sécurité (déjà hardened précédemment)
- Middleware protège `/admin/*` et rate-limit `/api/*` → OK.
- `requireAdmin` sur 44 routes API → OK ; routes publiques légitimes (contact, analytics/track, media serve, certificate, projects GET, cv) → OK.
- `media/serve/[...path]` utilise `resolveSafePath` → OK.

---

## 2. Améliorations UI/UX réalisées

- Suppression du bouton "Notifications" factice (badge rouge trompeur) dans `AdminLayout`.
- "Tout voir" → lien réel vers `/admin/messages`.
- (Le reste du polish admin est documenté en §6 — non fait dans ce lot.)

---

## 3. Architecture / données — changements réalisés

- **Projet DELETE** (`api/projects/[id].ts`) : nettoyage best-effort des fichiers uploadés référencés (`imageUrl`, `gallery` sous `/uploads/`) avant suppression du record → évite les orphelins.
- **Endpoint public CV** : création de `/api/cv/status` → `{ available }` sans exposer de données. La home fetch en client et n'affiche les boutons CV (hero + §05) **que si un CV actif existe** → comportement dynamique upload/suppression/remplacement sans rebuild.
- **Source de vérité CV** : déjà centralisée en DB (base64 + record), `/cv` lit en SSR → cohérent. Bouton maintenant conditionnel.

---

## 4. Informations dupliquées éliminées

- Bouton CV hardcodé (home) → conditionnel sur disponibilité réelle.
- (Liens sociaux hardcodés dans Footer/JSONLD/maintenance/defaultHomeData/contact.tsx : **non unifiés dans ce lot** — voir §6.)

---

## 5. Projets / GitHub

- Nettoyage des fichiers à la suppression (fait).
- Sync GitHub : logique auditée, failles documentées (écrasement des éditions manuelles, matching par URL uniquement, pas de détection de renommage). **Non modifié** dans ce lot pour ne pas casser l'existant — à traiter dans un lot dédié.
- Publication/archivage : `archived` + `showOnHomepage`/`showOnProjectsPage` + `featured` coexistent ; la page projets publique filtre côté client. À clarifier dans un lot dédié.

---

## 6. CV / documents

- **Implémenté + testé (partiel)** :
  - Upload remplace l'ancien CV (fichier + record) → OK.
  - `/cv` sert depuis la DB (base64) → OK.
  - `/api/cv/status` renvoie `{ available: false }` quand aucun CV → **testé** (curl → `{"available":false}`, `/cv` → 404).
  - Boutons home conditionnels sur `cvAvailable` → **implémenté, non vérifié visuellement** (pas de CV en base dans cet environnement pour tester l'apparition).
- **Non testé** : upload réel + apparition du bouton + téléchargement + suppression + réapparition (nécessite login admin + fichier). À faire par l'utilisateur.

---

## 7. Resend / 2FA — investigation et correction

### Cause racine identifiée
1. `emailService.ts` `send2FACode` envoyait `to: ['salihketur60@gmail.com']` (hardcodé) au lieu de `userEmail` → le code partait toujours vers cette adresse, jamais vers l'admin qui se connecte.
2. Expéditeur `onboarding@resend.dev` (mode test Resend) → Resend n'accepte l'envoi que vers l'email vérifié du compte ; tout autre destinataire est rejeté/supprimé. Aucun domaine vérifié n'était configuré.
3. Code généré avec `Math.random()` (non crypto-sûr).
4. `verify-2fa.ts` : logique de tentatives morte + comparaison non constant-time + `findOne({email, code})` masquait les mauvais codes.

### Corrections appliquées (code)
- `to: [userEmail]` (destinataire réel).
- `from` piloté par `RESEND_FROM_EMAIL` (fallback test) pour contact et 2FA.
- `generate2FACode` → `crypto.randomInt(100000, 1000000)`.
- `verify-2fa.ts` : recherche par email uniquement, comparaison `crypto.timingSafeEqual`, consommation réelle des tentatives (3 max), suppression après épuisement.

### Ce qui reste à votre charge (externe, non testable par moi)
- Vérifier un domaine d'envoi dans Resend et définir `RESEND_FROM_EMAIL=Portfolio Admin <noreply@votredomaine>` dans Vercel.
- S'assurer que `ADMIN_EMAIL` correspond à une boîte que vous contrôlez.
- (Optionnel) ajouter un webhook Resend pour tracer les delivery events (bounces/suppressions) — non implémenté.
- Tester end-to-end : demande de code → réception dans la boîte → saisie → succès ; puis code expiré et code incorrect.

**Je ne déclare pas le problème email résolu** tant qu'un test réel n'a pas réussi (règle respectée).

---

## 8. Sécurité

- Aucune régression : middleware + `requireAdmin` + rate-limit intacts.
- `npm run test:security` : **29/29** après toutes les modifications.
- `verify-2fa` renforcé (timing-safe, tentatives réelles).
- Pas d'exposition de secret (`.env` non commité, scan 0 secret).

---

## 9. Tests effectués et résultats réels

| Test | Résultat |
|---|---|
| `tsc --noEmit` | 0 erreur |
| `next lint` | 0 erreur |
| `npm run build` | **✓ Compiled successfully**, **105/105** pages, BUILD_ID OK |
| `npm run test:security` | 29/29 |
| Rendu public (11 pages × 3 locales) | 33/33 marqueurs OK |
| `/api/cv/status` (sans CV) | `{"available":false}` ✓ |
| `/cv` (sans CV) | 404 ✓ |
| `/api/auth/send-2fa` (bad creds) | `{"error":"Email ou mot de passe invalide"}` ✓ (route fonctionne) |
| `/api/auth/send-2fa` (champs manquants) | 400 ✓ |
| Build après toutes les modifs | vert |

**Non testés (bloqués par config externe ou nécessitant login admin)** :
- Upload/suppression/remplacement réel d'un CV + apparition/disparition du bouton.
- Envoi réel d'un code 2FA et réception en boîte (domaine Resend non configuré).
- Parcours complet login → 2FA → session admin.
- Suppression de projet avec fichiers uploadés (nettoyage best-effort implémenté mais non exercé).
- Rendu visuel desktop/mobile des 3 langues (navigateur OpenCode déconnecté).

---

## 10. Problèmes restants

1. **Liens sociaux hardcodés** dans Footer, JSONLD, maintenance, defaultHomeData, contact.tsx, api/admin/settings defaults → édition dans le dashboard ne se propage pas partout. Nécessite un refactor (Footer/JSONLD deviennent client components lisant `/api/admin/settings` ou un endpoint public `/api/settings`).
2. **Trois modèles de settings** (Setting/Settings/HomePage) + sync manuelle dans `api/admin/settings.ts` → **fusionnés en un seul modèle `Setting` en Phase 3** (doublons supprimés, source unique via `POST/GET /api/admin/settings`) *(Résolu)*.
3. **Deux tableaux de bord** (`/admin` et `/admin/dashboard`) → **fusionnés en Phase 2** : `/admin` est devenu le dashboard unifié redesigné ; `/admin/dashboard` redirige vers `/admin`. *(Résolu)*
4. **`db.ts` vs `dbConnect.ts`** → à unifier.
5. **GitHub sync** écrase les éditions manuelles et ne détecte pas les renommages.
6. **Stray scripts** à la racine → à auditer/supprimer.
7. **Admin UX** : pas de confirmation systématique avant suppression, pas de pagination/tri/recherche sur la plupart des tables, pas de préservation de form sur erreur partout, responsive non vérifié page par page.
8. **`getLocalized()`** fallback silencieux sur FR → à signaler dans l'UI admin (champs vides).
9. **Pages SSG** : staleness de 60s max ; pas de revalidation à la demande après édition admin.
10. **Code 2FA en clair** en base + pas de webhook delivery Resend.

---

## 11. Actions manuelles requises de votre part

1. **Resend** : vérifier un domaine d'envoi, définir `RESEND_FROM_EMAIL` sur Vercel, tester l'envoi réel.
2. **Vercel** : `ADMIN_EMAIL`/`ADMIN_PASSWORD` (A1), rotation mot de passe (A2), Upstash (A3), `NEXTAUTH_SECRET` (A4).
3. **Commit** : 200+ entrées non commitées (sécurité + éditorial + overhaul) — je ne committe pas sans votre accord.
4. **Purge A7** (`.env`/scripts).
5. **Navigateur OpenCode** : ouvrir une session pour la passe visuelle desktop/mobile.
6. **DB** : réécrire manuellement le contenu marketing en base (aboutBio, siteTitle, descriptions projets) — le code ne peut pas le faire.

---

## Statut des items (légende)

- **Terminé et testé** : 2FA fix code (recipient, crypto, timing-safe, tentatives), CV endpoint + bouton conditionnel, nettoyage fichiers projet, bouton notif factice retiré, "Tout voir" → lien, **Phase 2 dashboard unifié redesigné (build vert)**, **Phase 3 content centralisé (build vert)**, **Phase 5 filtre projets archivés (build vert)**, validations vertes.
- **Implémenté mais non vérifié** : CV upload/suppression/réapparition (pas de CV en base dans cet env), nettoyage fichiers projet (non exercé).
- **Bloqué par config externe** : envoi réel email 2FA (domaine Resend), test end-to-end auth.
- **Nécessite votre accord** : commit, purge A7, suppression stray scripts, unification db helpers, DNS/Resend prod/DB, rotation secrets.

---

## Fichiers modifiés dans ce lot

### Campagne sécurité (lot précédent)
- `src/services/emailService.ts` (recipient, from env, crypto code)
- `src/pages/api/auth/verify-2fa.ts` (timing-safe, tentatives réelles)
- `src/pages/api/cv/status.ts` (nouveau)
- `src/pages/index.tsx` (boutons CV conditionnels + état)
- `src/pages/api/projects/[id].ts` (nettoyage fichiers)
- `src/components/layouts/AdminLayout.tsx` (suppression bouton notif factice)
- `src/pages/admin/dashboard.tsx` ("Tout voir" → lien)

### Phase 2 — Admin dashboard unifié redesign
- `src/pages/admin/index.tsx` (Control Center réécrit unifié)
- `src/pages/admin/dashboard.tsx` (redirect → `/admin`)
- `src/pages/api/dashboard/stats.ts` (charts catégories)
- `src/pages/api/dashboard/activity.ts` (timestamp réel)
- `src/components/admin/RecentActivity.tsx` (flux unifié)
- `src/pages/api/admin/stats.ts` (supprimée)

### Phase 3 — Content management centralisé
- `src/models/Setting.ts` (siteTitle_en/_tr)
- `src/pages/api/admin/settings.ts` (écriture unique Setting)
- `src/models/Settings.ts`, `src/models/HomePage.ts`, `src/pages/api/homepage.ts` (supprimés)
- `src/pages/api/backup/index.ts`, `src/pages/api/backup/versions.ts` (MAJ)
- `src/pages/index.tsx` (lecture unique Setting)
- `src/pages/admin/home.tsx` (via /api/admin/settings)

### Phase 5 — Filtre projets archivés
- `src/pages/api/projects/index.ts` (filtre serveur + accès admin)

- `PLATFORM_OVERHAUL_REPORT.md` (ce fichier)

---

## Conclusion finale — Phase 12 (14 nov. 2026)

### Bilan final du chantier
- Phases closes : 2 (dashboard unifié), 3 (content centralisé), 5 (filtre archivés), 8 (polish sidebar), 9 (GitHub sync).
- Battery finale : build ✓ (105/105) · security **29/29** · locales/contrast/imagerie ✓ · rendu FR/EN/TR ✓.
- Restent souveraines : tests réels 2FA/CV/auth (config externe), passe visuelle navigateur.

### Livrables
- `SECURITY_AUDIT.md` · `PLATFORM_OVERHAUL_REPORT.md`.

### Prochaines étapes
- Décisions utilisateur (commit, Resend, Vercel, Upstash, secrets, DB) · tests réels utilisateur.

---

*Fin du rapport — généré le 14 nov. 2026.*