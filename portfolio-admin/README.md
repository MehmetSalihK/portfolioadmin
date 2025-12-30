# Portfolio Admin

🚀 **Système d'administration avancé pour portfolio personnel** avec sauvegarde automatique et optimisation SEO.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Système de sauvegarde](#système-de-sauvegarde)
- [Optimisation SEO](#optimisation-seo)
- [Contribution](#contribution)
- [Licence](#licence)

## ✨ Fonctionnalités

### 🎯 Gestion de contenu

- ✅ Gestion des projets avec médias
- ✅ Compétences et catégories
- ✅ Expériences professionnelles
- ✅ Formation et éducation
- ✅ Upload et gestion de fichiers

### 🔒 Sécurité et authentification

- ✅ **Authentification 2FA** (Two-Factor Authentication)
- ✅ **Envoi d'emails** de vérification avec Resend
- ✅ **Codes temporaires** avec expiration automatique
- ✅ **Interface sécurisée** de vérification
- ✅ **Tokens JWT** pour la session
- ✅ **Rate Limiting** (Protection DDOS/Brute-Force)
- ✅ **Validation Zod** (Schémas stricts pour les entrées)
- ✅ **Sanitization HTML** (Protection XSS avec DOMPurify)
- ✅ **Headers de Sécurité** (HSTS, No-Sniff, X-Frame-Options)

### 🔄 Système de sauvegarde avancé

- ✅ **Sauvegardes automatiques** (complètes, incrémentales, différentielles)
- ✅ **Versioning** de toutes les entités
- ✅ **Restauration** avec résolution de conflits
- ✅ **Comparaison** entre versions
- ✅ **Programmation** automatique des sauvegardes
- ✅ **Compression** et vérification d'intégrité

### 🚀 Optimisation SEO avancée

- ✅ **Analyse automatique** du contenu
- ✅ **Métadonnées** Open Graph et Twitter Cards
- ✅ **Données structurées** JSON-LD
- ✅ **Sitemap XML** dynamique
- ✅ **Robots.txt** intelligent
- ✅ **Dashboard SEO** avec métriques

## 🛠 Technologies

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: NextAuth.js + 2FA
- **Email**: Resend pour l'envoi d'emails 2FA
- **Sécurité**: JWT, Rate Limiting, Zod, DOMPurify, CSP
- **Media**: Multer, React Easy Crop, Browser Image Compression
- **Sauvegarde**: node-cron, compression
- **SEO**: Analyse automatique, génération de métadonnées

## 📦 Installation

1. **Cloner le repository**

```bash
git clone https://github.com/votre-username/portfolio-admin.git
cd portfolio-admin
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration de l'environnement**

```bash
cp .env.example .env.local
```

4. **Configurer les variables d'environnement**

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/portfolio-admin

# Authentification
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-key
JWT_SECRET=votre-jwt-secret-pour-2fa

# Configuration 2FA
RESEND_API_KEY=votre-cle-api-resend
TWO_FA_EMAIL_FROM=noreply@votre-domaine.com

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# SEO
SITE_URL=https://votre-site.com
SITE_NAME=Votre Portfolio
```

5. **Démarrer le serveur de développement**

```bash
npm run dev
```

## ⚙️ Configuration

### Sauvegarde automatique

Le système de sauvegarde est configuré par défaut avec :

- **Sauvegarde complète** : Quotidienne à 2h00
- **Sauvegarde incrémentale** : Toutes les 6 heures
- **Sauvegarde différentielle** : Hebdomadaire le dimanche

### Configuration SEO

Accédez à `/admin/seo` pour configurer :

- Métadonnées globales du site
- Paramètres Open Graph
- Configuration Twitter Cards
- Génération automatique du sitemap

## 🎮 Utilisation

### Interface d'administration

1. **Connexion sécurisée** : `/admin/login` (avec 2FA)
2. **Vérification 2FA** : `/admin/verify-2fa`
3. **Dashboard principal** : `/admin`
4. **Gestion des projets** : `/admin/projects`
5. **Gestion des compétences** : `/admin/skills`
6. **Système de sauvegarde** : `/admin/versions`
7. **Optimisation SEO** : `/admin/seo`

### Sauvegarde et restauration

```typescript
// Créer une sauvegarde manuelle
POST /api/backup
{
  "type": "full", // ou "incremental", "differential"
  "description": "Sauvegarde avant mise à jour"
}

// Restaurer une sauvegarde
POST /api/backup/restore
{
  "backupId": "backup-id",
  "conflictResolution": "overwrite" // ou "skip", "merge"
}
```

### Authentification 2FA

```typescript
// Envoyer un code 2FA
POST /api/auth/send-2fa
{
  "email": "admin@example.com",
  "password": "votre-mot-de-passe"
}

// Vérifier le code 2FA
POST /api/auth/verify-2fa
{
  "email": "admin@example.com",
  "code": "123456"
}
```

### Optimisation SEO

```typescript
// Optimiser le SEO d'une entité
POST /api/seo/optimize
{
  "entityType": "project",
  "entityId": "project-id"
}

// Analyse SEO globale
GET /api/seo/analyze
```

## 📚 API Documentation

### Endpoints principaux

#### Sauvegarde

- `GET /api/backup` - Liste des sauvegardes
- `POST /api/backup` - Créer une sauvegarde
- `POST /api/backup/restore` - Restaurer une sauvegarde
- `GET /api/backup/versions` - Gestion des versions
- `GET /api/backup/schedule` - Tâches programmées

#### SEO

- `GET /api/seo` - Analyse SEO globale
- `POST /api/seo/optimize` - Optimisation automatique
- `GET /api/seo/sitemap` - Génération du sitemap
- `GET /api/seo/robots` - Configuration robots.txt

#### Authentification 2FA

- `POST /api/auth/send-2fa` - Envoyer le code 2FA
- `POST /api/auth/verify-2fa` - Vérifier le code 2FA
- `GET /api/auth/session` - Vérifier la session

#### Contenu

- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/[id]` - Modifier un projet
- `DELETE /api/projects/[id]` - Supprimer un projet

## 🔄 Système de sauvegarde

### Types de sauvegarde

1. **Complète** : Sauvegarde de toutes les données
2. **Incrémentale** : Seulement les changements depuis la dernière sauvegarde
3. **Différentielle** : Changements depuis la dernière sauvegarde complète

### Fonctionnalités avancées

- **Compression automatique** avec gzip
- **Vérification d'intégrité** par checksum
- **Nettoyage automatique** des anciennes sauvegardes
- **Interface de comparaison** entre versions
- **Restauration sélective** par entité

## 🔒 Système d'authentification 2FA

### Fonctionnement

Le système d'authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire :

1. **Première étape** : Saisie de l'email et mot de passe
2. **Deuxième étape** : Réception d'un code de vérification par email
3. **Validation** : Saisie du code pour accéder à l'administration

### Configuration requise

- **Service email** : Resend configuré avec une clé API valide
- **Variables d'environnement** : JWT_SECRET et RESEND_API_KEY
- **Base de données** : Collection TwoFactorAuth pour les codes temporaires

### Sécurité

- **Codes temporaires** : Expiration automatique après 10 minutes
- **Tokens JWT** : Session sécurisée après validation
- **Nettoyage automatique** : Suppression des codes utilisés

### Protection CSRF : Validation des requêtes

## 🛡️ Architecture de Sécurité Avancée

### 1. Protection Réseau (Middleware)

- **Rate Limiting** : Limite stricte des requêtes par IP (`10 req/min` pour l'auth, `100 req/min` pour l'API).
- **Headers HTTP** : Configuration durcie via `next.config.js` (CSP, HSTS, etc.).

### 2. Intégrité des Données

- **Validation Zod** : Toutes les entrées (Login, Contact, Settings) sont validées par des schémas stricts avant traitement.
- **Sanitization** : Nettoyage systématique des entrées et du rendu HTML via `isomorphic-dompurify` pour prévenir les XSS.

### 3. Contrôle d'Accès

- **Vérification de Session** : Audit strict sur toutes les routes API sensibles.
- **Hook de Sécurité** : Nettoyage proactif du stockage local et de la console en production.

## 🚀 Optimisation SEO

### Analyse automatique

- **Extraction de mots-clés** du contenu
- **Calcul de lisibilité** (score Flesch)
- **Génération de descriptions** automatiques
- **Optimisation des titres** selon les bonnes pratiques

### Métadonnées générées

- **Open Graph** pour les réseaux sociaux
- **Twitter Cards** pour Twitter
- **JSON-LD** pour les données structurées
- **Meta tags** optimisés pour les moteurs de recherche

### Sitemap dynamique

- **Génération automatique** basée sur le contenu
- **Priorisation intelligente** des pages
- **Support des images** dans le sitemap
- **Mise à jour en temps réel**

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

- Ouvrir une issue sur GitHub
- Consulter la documentation API
- Vérifier les logs de sauvegarde dans `/admin/versions`

---

**Développé avec ❤️ pour une gestion de portfolio optimale**
