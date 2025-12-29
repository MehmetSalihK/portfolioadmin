# 🎨 Portfolio Admin Dashboard

<div align="center">
  
  **🌍 Languages / Langues / Diller:**
  [🇫🇷 Français](README.md) | [🇬🇧 English](README_EN.md) | [🇹🇷 Türkçe](README_TR.md)
  
</div>

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000.svg?logo=vercel)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  
</div>

<div align="center">
  <p><em>Une solution no-code moderne pour gérer votre portfolio professionnel</em></p>
</div>

## 📋 Table des matières

- [🎯 À propos](#🎯-à-propos)
- [🚀 Démo en ligne](#🚀-démo-en-ligne)
- [✨ Fonctionnalités principales](#✨-fonctionnalités-principales)
- [💻 Interface d'administration](#💻-interface-dadministration)
- [🛠 Technologies utilisées](#🛠-technologies-utilisées)
- [📥 Installation rapide](#📥-installation-rapide)
- [⚙️ Configuration](#⚙️-configuration)
- [📁 Structure du projet](#📁-structure-du-projet)
- [🌐 API Routes](#🌐-api-routes)
- [🚧 État du projet](#🚧-état-actuel-du-projet)
- [🔧 Dépannage](#🔧-dépannage)
- [🤝 Contribution](#🤝-contribution)
- [📄 Licence](#📄-licence)

## 🎯 À propos

Portfolio Admin est une solution **no-code** moderne et intuitive pour gérer votre portfolio professionnel en ligne. Fini les modifications manuelles du code source ! Grâce à une interface d'administration élégante et puissante, vous pouvez :

- ✅ **Modifier le contenu** de votre portfolio en temps réel
- ✅ **Gérer vos projets** avec un système de modales interactives
- ✅ **Personnaliser votre CV** avec affichage modal intégré
- ✅ **Optimiser votre présence** avec analytics intégrés
- ✅ **Maintenir votre site** avec un mode maintenance professionnel

> 🎯 **Objectif** : Permettre aux développeurs de se concentrer sur leur code plutôt que sur la maintenance de leur portfolio

## 🚀 Démo en ligne

🌐 **Site de démonstration** : [Voir la démo](https://votre-demo.vercel.app)

📱 **Interface d'administration** : [Admin Dashboard](https://votre-demo.vercel.app/admin)

> 💡 **Astuce** : Utilisez les identifiants de démonstration pour tester l'interface d'administration

## ✨ Fonctionnalités principales

- 🎨 **Gestion No-Code**

  - Modification du contenu sans toucher au code
  - Interface utilisateur intuitive
  - Mise à jour en temps réel
  - Prévisualisation des changements

- 🔐 **Authentification Sécurisée**

  - NextAuth.js pour la gestion des sessions
  - Protection des routes admin
  - Authentification GitHub

- 📊 **Gestion des Projets**

  - Ajout/Modification/Suppression de projets sans coder
  - Upload d'images avec prévisualisation
  - Organisation par drag & drop (à venir)
  - Gestion des catégories
  - **Affichage modal interactif**
    - Modales pour visualiser les détails complets
    - Prévention de l'interaction avec l'arrière-plan
    - Fermeture intuitive (clic extérieur ou bouton X)
    - Animations fluides et design responsive

- 📝 **Gestion du Contenu**

  - Éditeur de texte riche intuitif
  - Mise en forme avancée (gras, italique, couleurs...)
  - Modification des sections de la page d'accueil
  - Personnalisation des liens sociaux

- 📄 **Affichage du CV**
  - **Modale CV interactive** : Visualisation du CV directement sur la page d'accueil
  - **Aperçu intégré** : Affichage du PDF dans une iframe sans quitter la page
  - **Actions rapides** : Boutons pour télécharger ou ouvrir dans un nouvel onglet
  - **Design responsive** : Interface adaptée à tous les écrans
  - **Expérience utilisateur optimisée** : Animations fluides et fermeture intuitive

## 💻 Interface d'Administration

L'interface d'administration vous permet de :

### 1. Page d'Accueil

- Modifier le titre principal
- Personnaliser le sous-titre
- Éditer la section "À propos"
- Gérer vos liens sociaux (GitHub, LinkedIn, Twitter)

### 2. Projets

- Ajouter de nouveaux projets
- Modifier les projets existants
- Supprimer des projets
- Réorganiser l'ordre d'affichage

### 3. Mise en Forme du Texte

Notre éditeur de texte riche permet de :

- Mettre en gras, italique, souligné
- Changer la couleur du texte
- Créer des listes à puces
- Aligner le texte (gauche, centre, droite)
- Ajouter des titres et sous-titres

### 4. Gestion des Médias

- Upload d'images pour les projets
- Redimensionnement automatique
- Optimisation des images
- Gestion de la galerie

### 5. Affichage du CV

- **Modale interactive** : Le CV s'affiche dans une modale élégante
- **Visualisation directe** : Aperçu du PDF sans quitter la page d'accueil
- **Actions utilisateur** : Téléchargement et ouverture dans un nouvel onglet
- **Interface moderne** : Design cohérent avec le thème du site
- **Accessibilité** : Navigation au clavier et fermeture intuitive

### 6. Gestion de la Position Géographique

- **Auto-complétion intelligente** : Suggestions d'adresses françaises en temps réel
- **Interface intuitive** : Saisie facilitée avec suggestions contextuelles
- **Validation automatique** : Format d'adresse standardisé
- **Affichage dynamique** : Position mise à jour instantanément sur le site
- **Géolocalisation** : Support des codes postaux et villes françaises

### 7. Analytics et Suivi

- **Vercel Analytics** : Suivi automatique des visiteurs et pages vues
- **Données en temps réel** : Statistiques de trafic instantanées
- **Respect de la vie privée** : Analytics sans cookies tiers
- **Performance optimisée** : Impact minimal sur les performances du site
- **Intégration transparente** : Configuration automatique sans intervention

Toutes ces modifications se font directement depuis l'interface d'administration, sans avoir besoin de toucher au code !

## 🛠 Technologies utilisées

<div align="center">

### 🎨 Frontend

| Technologie                                                                               | Version  | Description                     |
| ----------------------------------------------------------------------------------------- | -------- | ------------------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?logo=next.js)                | `14.0.0` | Framework React full-stack      |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?logo=typescript)         | `5.0.0`  | Typage statique pour JavaScript |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?logo=tailwind-css) | `3.4.0`  | Framework CSS utilitaire        |
| ![TipTap](https://img.shields.io/badge/TipTap-2.0.0-orange)                               | `2.0.0`  | Éditeur de texte riche          |

### 🔧 Backend & Base de données

| Technologie                                                             | Version | Description                   |
| ----------------------------------------------------------------------- | ------- | ----------------------------- |
| ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb) | `7.0`   | Base de données NoSQL         |
| ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.0.0-purple)   | `4.0.0` | Authentification pour Next.js |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.0.0-red)            | `8.0.0` | ODM pour MongoDB              |

### 📊 Analytics & Déploiement

| Technologie                                                                          | Description                         |
| ------------------------------------------------------------------------------------ | ----------------------------------- |
| ![Vercel Analytics](https://img.shields.io/badge/Vercel_Analytics-black?logo=vercel) | Suivi des performances et visiteurs |
| ![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)                     | Plateforme de déploiement           |

### 🛠 Outils de développement

| Outil                                                                   | Description                  |
| ----------------------------------------------------------------------- | ---------------------------- |
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint)       | Linter JavaScript/TypeScript |
| ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier) | Formateur de code            |
| ![Git](https://img.shields.io/badge/Git-F05032?logo=git)                | Contrôle de version          |

</div>

## 📥 Installation rapide

### 🚀 Installation en 5 minutes

#### 1️⃣ Cloner le projet

```bash
# Clonez le repository
git clone https://github.com/mehmetsalihkuscu/portfolio-admin.git
cd portfolio-admin/portfolio-admin
```

#### 2️⃣ Installer les dépendances

```bash
# Avec npm (recommandé)
npm install

# Ou avec yarn
yarn install

# Ou avec pnpm (plus rapide)
pnpm install
```

#### 3️⃣ Configuration de l'environnement

```bash
# Créer le fichier de configuration
cp .env.example .env.local

# Éditer les variables d'environnement
nano .env.local  # ou votre éditeur préféré
```

#### 4️⃣ Lancer le serveur de développement

```bash
# Démarrer en mode développement
npm run dev

# Le site sera accessible sur http://localhost:3000
```

#### 5️⃣ Accéder à l'interface d'administration

```bash
# Interface d'admin disponible sur :
# http://localhost:3000/admin
```

### ⚡ Installation rapide avec un seul script

```bash
# Script d'installation automatique
curl -fsSL https://raw.githubusercontent.com/mehmetsalihkuscu/portfolio-admin/main/install.sh | bash
```

> 💡 **Astuce** : Assurez-vous d'avoir Node.js 18+ et npm installés sur votre système

## ⚙️ Configuration

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Database (MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_nextauth

# Admin credentials
ADMIN_EMAIL=votre_email_admin
ADMIN_PASSWORD=votre_mot_de_passe_admin

# GitHub OAuth
GITHUB_ID=votre_github_id
GITHUB_SECRET=votre_github_secret

# Configuration de l'API Resend
RESEND_API_KEY=votre_cle_api_resend
RESEND_EMAIL=votre_email_resend
```

## 📁 Structure du projet

```
portfolio-admin/
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── ProjectCard.tsx        # Carte de projet avec modal
│   │   ├── EnhancedProjectCard.tsx # Version améliorée avec modal
│   │   ├── modals/
│   │   │   └── CVModal.tsx        # Modale d'affichage du CV
│   │   └── ...                    # Autres composants
│   ├── pages/          # Pages et API routes
│   ├── styles/         # Styles globaux
│   ├── lib/           # Utilitaires et configurations
│   └── models/        # Modèles MongoDB
├── public/            # Assets statiques
└── ...
```

## 🌐 API Routes

### GET /api/homepage

- Récupère les données de la page d'accueil

### POST /api/homepage

- Met à jour les données de la page d'accueil

### GET /api/projects

- Liste tous les projets

### POST /api/projects

- Crée un nouveau projet

### PUT /api/projects/[id]

- Met à jour un projet existant

### DELETE /api/projects/[id]

- Supprime un projet

## 🚧 État Actuel du Projet

### ✅ Fonctionnalités Terminées

- Authentification sécurisée avec GitHub
- Éditeur de texte riche pour la page d'accueil
  - Formatage du texte (gras, italique, souligné)
  - Changement de couleur
  - Alignement du texte
- Gestion du contenu de la page d'accueil
  - Modification du titre et sous-titre
  - Édition de la section "À propos"
  - Gestion des liens sociaux
- Upload d'images basique
- Structure de base de données MongoDB
- **Affichage avancé des projets**
  - Modales interactives pour les détails complets des projets
  - Boutons "Lire plus" stylisés (bleu et soulignés)
  - Affichage des images en grand format dans les modales
  - Description complète avec technologies et liens
  - Prévention de l'interaction avec l'arrière-plan
  - Fermeture par clic extérieur ou bouton de fermeture
  - Animations fluides et design responsive
  - Support du mode sombre
  - Blocage du défilement de la page lors de l'ouverture des modales

### 🔄 En Cours de Développement

- Interface d'administration complète
  - Dashboard principal avec statistiques
  - Navigation intuitive entre les sections
  - Thème sombre/clair
- Gestion avancée des projets
  - Interface drag & drop pour réorganiser
  - Catégorisation des projets
  - Tags et filtres
- Système de médias amélioré
  - Galerie d'images
  - Recadrage et redimensionnement
  - Optimisation automatique
- Prévisualisation en temps réel des modifications

### 📝 Fonctionnalités Prévues

- Analytics et statistiques
  - Suivi des visites
  - Temps passé par page
- Système de sauvegarde et versions
- Export/Import des données
- Mode maintenance
- Optimisation SEO avancée
- Tests automatisés
- Documentation API complète

## ⚠️ Note Importante

Ce projet est actuellement en développement actif. Certaines fonctionnalités peuvent être instables ou incomplètes. Les contributions et retours sont les bienvenus !

## 🔧 Dépannage

### Problèmes courants

1. **Erreur de connexion MongoDB**

```bash
# Vérifiez que votre URI MongoDB est correct
# Assurez-vous que votre IP est autorisée dans MongoDB Atlas
```

2. **Erreur d'authentification**

```bash
# Vérifiez vos variables d'environnement GitHub
# Assurez-vous que les callbacks OAuth sont correctement configurés
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment vous pouvez contribuer :

### 🐛 Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/mehmetsalihkuscu/portfolio-admin/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Décrivez le problème en détail avec des étapes de reproduction

### ✨ Proposer une fonctionnalité

1. Créez une issue avec le template "Feature Request"
2. Décrivez la fonctionnalité souhaitée et son utilité
3. Attendez l'approbation avant de commencer le développement

### 🔧 Contribuer au code

1. **Fork** le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

### 📝 Guidelines de contribution

- Suivez les conventions de code existantes
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Utilisez des messages de commit clairs et descriptifs

### 🏆 Contributeurs

Merci à tous les contributeurs qui ont participé à ce projet !

<a href="https://github.com/mehmetsalihkuscu/portfolio-admin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mehmetsalihkuscu/portfolio-admin" />
</a>

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2024 Mehmet Salih Kuscu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <p><strong>Développé avec ❤️ par <a href="https://github.com/mehmetsalihkuscu">Mehmet Salih Kuscu</a></strong></p>
  <p><em>Pour une gestion de portfolio efficace et sans code</em></p>
  
  [![GitHub](https://img.shields.io/badge/GitHub-mehmetsalihkuscu-black?logo=github)](https://github.com/mehmetsalihkuscu)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Mehmet%20Salih%20Kuscu-blue?logo=linkedin)](https://linkedin.com/in/mehmetsalihkuscu)
  [![Email](https://img.shields.io/badge/Email-contact@mehmetsalihk.fr-red?logo=gmail)](mailto:contact@mehmetsalihk.fr)
</div>
