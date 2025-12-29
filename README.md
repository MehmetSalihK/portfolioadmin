# 🎨 Portfolio Admin Dashboard

<div align="center">

**🌍 Langues / Languages / Diller**

[![Français](https://img.shields.io/badge/Langue-Français-blue?style=for-the-badge&logo=flag-icon&logoColor=white)](README.md)
[![English](https://img.shields.io/badge/Language-English-red?style=for-the-badge&logo=flag-icon&logoColor=white)](README_EN.md)
[![Türkçe](https://img.shields.io/badge/Dil-Türkçe-white?style=for-the-badge&logo=flag-icon&logoColor=red)](README_TR.md)

---

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

  <br />
  
  <h3>🚀 Une solution No-Code moderne pour gérer votre portfolio professionnel</h3>
  
  <p>Fini les modifications manuelles du code source ! Gérez tout depuis une interface élégante.</p>

[Voir la démo](https://votre-demo.vercel.app) • [Documentation](#-installation-rapide) • [Signaler un bug](https://github.com/mehmetsalihkuscu/portfolio-admin/issues)

</div>

<br />

## 📋 Table des matières

- [🎯 À propos](#-à-propos)
- [✨ Fonctionnalités Clés](#-fonctionnalités-clés)
- [🛡️ Sécurité & Architecture](#%EF%B8%8F-sécurité--architecture)
- [💻 Interface d'Administration](#-interface-dadministration)
- [🛠 Stack Technique](#-stack-technique)
- [📥 Installation & Démarrage](#-installation--démarrage)
- [🚀 Déploiement](#-déploiement)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## 🎯 À propos

**Portfolio Admin** est né d'un besoin simple : permettre aux développeurs de se concentrer sur ce qu'ils aiment (coder) sans perdre de temps sur la maintenance du contenu de leur portfolio.

> "Votre portfolio doit évoluer aussi vite que vos compétences."

### Pourquoi utiliser Portfolio Admin ?

- **⚡ Gain de temps** : Modifiez un texte ou ajoutez un projet en 30 secondes.
- **🎨 Design Premium** : Une interface soignée, responsive et animée par défaut.
- **🔐 Sécurité Maximale** : Vos données sont protégées par les standards de l'industrie.
- **📱 100% Responsive** : Gérez votre site depuis votre mobile.

---

## ✨ Fonctionnalités Clés

### 🎨 Gestion de Contenu (CMS)

- **Éditeur Riche** : Mise en forme avancée (gras, italique, listes...) sans HTML.
- **Prévisualisation Live** : Voyez vos changements avant de publier.
- **Gestion des Médias** : Upload, redimensionnement et optimisation automatique des images.

### 🔐 Authentification & Sécurité

- **NextAuth.js** : Système de session robuste.
- **Double Authentification (2FA)** : Protection via Email (Resend).
- **Rôles** : Distinction claire entre Admin et Visiteur public.

### 📊 Projets & Compétences

- **CRUD Complet** : Ajoutez, modifiez, supprimez vos projets.
- **Drag & Drop** : Réorganisez vos projets facilement (Coming Soon).
- **Modales Interactives** : Présentation détaillée de chaque réalisation.

### 🌍 Autres

- **Bilingue par défaut** : Prêt pour l'internationalisation.
- **SEO Ready** : Métadonnées dynamiques et Sitemap généré automatiquement.

---

## 🛡️ Sécurité & Architecture

Nous appliquons une politique de **"Secure by Default"**.

| Fonctionnalité        | Description                                                                      |
| :-------------------- | :------------------------------------------------------------------------------- |
| **🛡️ Rate Limiting**  | Protection anti-DDoS et Brute-Force (`10 req/min` sur login, `100 req/min` API). |
| **🔒 Validation Zod** | Schémas stricts pour toutes les entrées (API & Formulaires).                     |
| **🧹 Sanitization**   | Nettoyage HTML via `DOMPurify` pour prévenir les XSS.                            |
| **⛓️ HTTP Headers**   | Configuration durcie (HSTS, CSP, X-Frame-Options).                               |
| **🕵️ Anti-Snooping**  | Blocage de la console et du `localStorage` en production.                        |

---

## 💻 Interface d'Administration

Une interface pensée pour l'efficacité.

### 🏠 Dashboard Principal

Vue d'ensemble de votre activité, liens rapides vers les sections clés et statistiques de visite (via Vercel Analytics).

### 📝 Édition de Projets

Formulaires intuitifs pour décrire vos réalisations :

- **Titre & Sous-titre**
- **Description riche**
- **Stack technique** (icônes automatiques)
- **Liens** (GitHub, Live Demo)
- **Galerie d'images**

### 👤 Profil & CV

- Mettez à jour votre **Bio** et vos **Réseaux Sociaux**.
- Uploadez votre **CV (PDF)** : Il sera accessible via une modale élégante sur le site public.

---

## 🛠 Stack Technique

Une architecture moderne, performante et maintenable.

### 🎨 Frontend

| Tech              | Badge                                                                                                         | Description                      |
| :---------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------- |
| **Next.js 14**    | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)                         | App Router & Server Components   |
| **TypeScript**    | ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white) | Typage strict pour la robustesse |
| **Tailwind CSS**  | ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Styling utilitaire et rapide     |
| **Framer Motion** | ![Framer](https://img.shields.io/badge/Framer-0055FF?style=flat-square&logo=framer&logoColor=white)           | Animations fluides               |

### ⚙️ Backend

| Tech         | Badge                                                                                                     | Description                    |
| :----------- | :-------------------------------------------------------------------------------------------------------- | :----------------------------- |
| **Node.js**  | ![Node](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)     | Runtime JavaScript             |
| **MongoDB**  | ![Mongo](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)      | Base de données NoSQL flexible |
| **Mongoose** | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white) | ODM pour MongoDB               |

### 🔒 Sécurité & Outils

| Tech         | Badge                                                                                                  | Usage                          |
| :----------- | :----------------------------------------------------------------------------------------------------- | :----------------------------- |
| **NextAuth** | ![Auth](https://img.shields.io/badge/NextAuth-purple?style=flat-square&logo=nextdotjs&logoColor=white) | Gestion de session             |
| **Zod**      | ![Zod](https://img.shields.io/badge/Zod-3068B7?style=flat-square&logo=zod&logoColor=white)             | Validation de données          |
| **Resend**   | ![Resend](https://img.shields.io/badge/Resend-black?style=flat-square&logo=resend&logoColor=white)     | Envoi d'emails transactionnels |

---

## 📥 Installation & Démarrage

Suivez ces étapes pour lancer votre propre instance en moins de 5 minutes.

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/mehmetsalihkuscu/portfolio-admin.git
cd portfolio-admin
```

### 2️⃣ Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3️⃣ Configuration (.env.local)

Copiez le fichier d'exemple et remplissez vos clés.

```bash
cp .env.example .env.local
```

**Variables requises :**

```env
# 📦 Database
MONGODB_URI=mongodb+srv://...

# 🔐 Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_super_secret

# 📧 Emails (2FA)
RESEND_API_KEY=re_123...
RESEND_EMAIL=onboarding@resend.dev

# 👤 Admin Initial
ADMIN_EMAIL=mon.email@gmail.com
```

### 4️⃣ Lancer en local

```bash
npm run dev
```

Rendez-vous sur [http://localhost:3000](http://localhost:3000) 🚀

---

## 🚀 Déploiement

Le projet est optimisé pour **Vercel**.

1.  Forkez ce repo.
2.  Importez-le sur Vercel.
3.  Ajoutez vos variables d'environnement dans les _Settings_ du projet Vercel.
4.  Cliquez sur **Deploy**.

---

## 🤝 Contribution

Les contributions sont les bienvenues !
Si vous avez une idée d'amélioration, n'hésitez pas.

1.  **Forkez** le projet
2.  Créez votre branche (`git checkout -b feature/SuperFeature`)
3.  Commitez vos changements (`git commit -m '✨ Add SuperFeature'`)
4.  Pushez (`git push origin feature/SuperFeature`)
5.  Ouvrez une **Pull Request**

---

## 📄 Licence

Distribué sous la licence **MIT**. Voir `LICENSE` pour plus d'informations.

---

<div align="center">
  
  **Fait avec ❤️ par [Mehmet Salih Kuscu](https://github.com/mehmetsalihkuscu)**
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mehmetsalihkuscu)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/mehmetsalihkuscu)
  [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contact@mehmetsalihk.fr)

</div>
