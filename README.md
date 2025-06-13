# 🎨 Portfolio Admin Dashboard

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
</div>

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Interface d'administration](#-interface-dadministration)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [API Routes](#-api-routes)
- [État du projet](#-état-du-projet)
- [Améliorations prévues](#-améliorations-prévues)
- [Dépannage](#-dépannage)

## 🎯 À propos

Portfolio Admin est une solution "no-code" pour gérer votre portfolio en ligne. Plus besoin de modifier le code source pour mettre à jour votre site ! Grâce à une interface d'administration intuitive, vous pouvez modifier tout le contenu de votre portfolio en quelques clics.

## ✨ Fonctionnalités

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

Toutes ces modifications se font directement depuis l'interface d'administration, sans avoir besoin de toucher au code !

## 🛠 Technologies

Le projet utilise les technologies suivantes :

- **Frontend**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - TipTap Editor

- **Backend**
  - MongoDB
  - NextAuth.js
  - API Routes Next.js

- **Outils**
  - ESLint
  - Prettier
  - Git

## 📥 Installation

1. Clonez le repository
```bash
git clone https://github.com/votre-username/portfolio-admin.git
cd portfolio-admin
```

2. Installez les dépendances
```bash
npm install
# ou
yarn install
```

3. Configurez les variables d'environnement
```bash
cp .env.example .env.local
```

4. Lancez le serveur de développement
```bash
npm run dev
# ou
yarn dev
```

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
  - Interactions utilisateurs
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

<div align="center">
  <p>Développé par Mehmet Salih Kuscu pour une gestion de portfolio efficace et sans code</p>
</div>
