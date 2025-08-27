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
- **Styling**: Tailwind CSS
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: NextAuth.js
- **Upload**: Multer
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

1. **Dashboard principal** : `/admin`
2. **Gestion des projets** : `/admin/projects`
3. **Gestion des compétences** : `/admin/skills`
4. **Système de sauvegarde** : `/admin/versions`
5. **Optimisation SEO** : `/admin/seo`

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