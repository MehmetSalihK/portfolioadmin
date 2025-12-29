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

[Voir la démo](https://votre-demo.vercel.app) • [Documentation](#-installation--démarrage) • [Signaler un bug](https://github.com/mehmetsalihkuscu/portfolio-admin/issues)

</div>

<br />

## 📋 Table des matières

- [🎯 À propos](#-à-propos)
- [✨ Fonctionnalités Détaillées](#-fonctionnalités-détaillées)
- [🛡️ Sécurité & Architecture](#%EF%B8%8F-sécurité--architecture)
- [💻 Guide Interface Admin](#-guide-interface-admin)
- [🛠 Stack Technique](#-stack-technique)
- [📁 Structure du Projet](#-structure-du-projet)
- [🌐 API Routes](#-api-routes)
- [📥 Installation Complète](#-installation-complète)
- [⚙️ Configuration](#%EF%B8%8F-configuration)
- [🔧 Dépannage (FAQ)](#-dépannage-faq)
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

## ✨ Fonctionnalités Détaillées

### 🎨 Gestion de Contenu (CMS)

- **Éditeur Riche (WYSIWYG)** : Mise en forme (gras, italique, listes, couleurs) sans écrire de HTML.
- **Prévisualisation Live** : Voyez vos changements avant de publier.
- **SEO Automatisé** : Métadonnées et OpenGraph générés dynamiquement.

### 🔐 Authentification & Sécurité

- **NextAuth.js** : Système de session robuste avec rotation de tokens.
- **Double Authentification (2FA)** : Codes temporaires envoyés par Email (via Resend).
- **Rôles** : Distinction claire entre Admin (accès total) et Visiteur (lecture seule).

### 📊 Projets & Compétences

- **CRUD Complet** : Ajoutez, modifiez, supprimez vos projets.
- **Catégorisation** : Triez vos projets par tags ou technologies.
- **Modales Interactives** : Présentation détaillée avec galerie d'images et liens.
- **Drag & Drop** : Réorganisez l'ordre d'affichage (Coming Soon).

### 📄 Gestion du CV

- **Upload PDF** : Mise à jour simple de votre CV.
- **Modale de visualisation** : Les recruteurs peuvent lire votre CV sans quitter le site.
- **Actions Rapides** : Boutons "Télécharger" ou "Ouvrir" intégrés.

---

## 🛡️ Sécurité & Architecture

Nous appliquons une politique de **"Secure by Default"**.

| Fonctionnalité        | Description                                                                      |
| :-------------------- | :------------------------------------------------------------------------------- |
| **🛡️ Rate Limiting**  | Protection anti-DDoS et Brute-Force (`10 req/min` sur login, `100 req/min` API). |
| **🔒 Validation Zod** | Schémas stricts pour toutes les entrées (API & Formulaires).                     |
| **🧹 Sanitization**   | Nettoyage HTML via `DOMPurify` pour prévenir les XSS.                            |
| **⛓️ HTTP Headers**   | Configuration durcie (HSTS, CSP, X-Frame-Options, No-Sniff).                     |
| **🕵️ Anti-Snooping**  | Blocage de la console et du `localStorage` accès en production.                  |

---

## 💻 Guide Interface Admin

Une interface pensée pour l'efficacité.

### 🏠 Dashboard Principal

Vue d'ensemble de votre activité, liens rapides vers les sections clés et statistiques de visite (via Vercel Analytics).

### 📝 Édition de Projets

Formulaires intuitifs pour décrire vos réalisations :

- **Infos de base** : Titre, sous-titre, dates.
- **Contenu riche** : Description détaillée de la mission.
- **Stack technique** : Suggestion automatique d'icônes.
- **Médias** : Galerie d'images avec redimensionnement automatique.

### 📍 Localisation

- **Autocomplétion** : Saisie facile d'adresses (API Géo).
- **Validation** : Formatage automatique.

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
| **TipTap**        | ![TipTap](https://img.shields.io/badge/TipTap-black?style=flat-square)                                        | Éditeur de texte riche           |

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

## 📁 Structure du Projet

```bash
portfolio-admin/
├── src/
│   ├── components/      # 🧱 Composants Réutilisables
│   │   ├── admin/       # UI Administration
│   │   ├── modals/      # CV, Projets...
│   │   └── ui/          # Boutons, Inputs, Cards...
│   ├── pages/
│   │   ├── api/         # ⚡ API Endpoints (Backend)
│   │   ├── admin/       # 🔐 Pages Admin
│   │   └── index.tsx    # 🏠 Page d'accueil publique
│   ├── styles/          # 🎨 Global CSS & Tailwind
│   ├── lib/             # 🛠 Utilitaires (DB, Auth...)
│   └── models/          # 💾 Schémas Mongoose
├── public/              # 🖼 Images, Favicons...
└── ...
```

---

## 🌐 API Routes

Documentation succincte des endpoints disponibles.

| Méthode  | Endpoint             | Description            | Accès     |
| :------- | :------------------- | :--------------------- | :-------- |
| `GET`    | `/api/projects`      | Liste tous les projets | Public    |
| `POST`   | `/api/projects`      | Crée un projet         | **Admin** |
| `PUT`    | `/api/projects/[id]` | Modifie un projet      | **Admin** |
| `DELETE` | `/api/projects/[id]` | Supprime un projet     | **Admin** |
| `GET`    | `/api/homepage`      | Données page d'accueil | Public    |
| `POST`   | `/api/auth/send-2fa` | Envoi code connexion   | Public    |

---

## 📥 Installation Complète

### Pré-requis

- Node.js 18+
- Compte MongoDB Atlas (Gratuit)
- Compte GitHub (pour l'OAuth)

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/mehmetsalihkuscu/portfolio-admin.git
cd portfolio-admin
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Variables d'Environnement

Créez `.env.local` et configurez :

```env
# 📦 Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio

# 🔐 Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=générez_une_chaine_aléatoire
# GitHub OAuth
GITHUB_ID=votre_client_id
GITHUB_SECRET=votre_client_secret

# 📧 Emails (2FA)
RESEND_API_KEY=re_123...
RESEND_EMAIL=onboarding@resend.dev

# 👤 Admin
ADMIN_EMAIL=votre@email.com
ADMIN_PASSWORD=votre_mot_de_passe
```

### 4️⃣ Lancer en local

```bash
npm run dev
```

---

## 🔧 Dépannage (FAQ)

<details>
<summary><strong>🔴 Erreur de connexion MongoDB ?</strong></summary>
<br>
Vérifiez que :
1. Votre IP est autorisée dans MongoDB Atlas (Network Access).
2. L'URI dans `.env.local` est correcte et entre guillemets si nécessaire.
3. Le nom d'utilisateur/mot de passe ne contient pas de caractères spéciaux non échappés.
</details>

<details>
<summary><strong>🔑 Erreur d'authentification GitHub ?</strong></summary>
<br>
Vérifiez que :
1. L'URL de callback dans GitHub Apps est bien `http://localhost:3000/api/auth/callback/github`.
2. Le Client ID et Secret sont corrects.
</details>

<details>
<summary><strong>✉️ Les emails 2FA n'arrivent pas ?</strong></summary>
<br>
1. Vérifiez vos logs serveur pour voir si Resend renvoie une erreur.
2. Assurez-vous d'avoir validé le domaine d'envoi si vous êtes en production.
3. En mode test, vous ne pouvez envoyer qu'à l'email de votre compte Resend.
</details>

---

## 🤝 Contribution

Les contributions sont les bienvenues !

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
