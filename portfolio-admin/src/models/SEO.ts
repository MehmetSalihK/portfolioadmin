import mongoose from 'mongoose';

// Schéma pour les métadonnées Open Graph
const OpenGraphSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 60,
  },
  description: {
    type: String,
    maxlength: 160,
  },
  image: {
    url: String,
    width: Number,
    height: Number,
    alt: String,
  },
  type: {
    type: String,
    default: 'website',
    enum: ['website', 'article', 'profile', 'book', 'music', 'video'],
  },
  siteName: String,
  locale: {
    type: String,
    default: 'fr_FR',
  },
  url: String,
});

// Schéma pour les métadonnées Twitter Card
const TwitterCardSchema = new mongoose.Schema({
  card: {
    type: String,
    default: 'summary_large_image',
    enum: ['summary', 'summary_large_image', 'app', 'player'],
  },
  title: {
    type: String,
    maxlength: 70,
  },
  description: {
    type: String,
    maxlength: 200,
  },
  image: {
    url: String,
    alt: String,
  },
  site: String, // @username
  creator: String, // @username
});

// Schéma pour les données structurées JSON-LD
const StructuredDataSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Person', 'Organization', 'WebSite', 'Article', 'BlogPosting', 'CreativeWork', 'SoftwareApplication'],
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Schéma pour l'analyse SEO
const SEOAnalysisSchema = new mongoose.Schema({
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  issues: [{
    type: {
      type: String,
      enum: ['error', 'warning', 'info'],
    },
    category: {
      type: String,
      enum: ['title', 'description', 'keywords', 'images', 'links', 'performance', 'accessibility', 'structure'],
    },
    message: String,
    suggestion: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
    },
  }],
  metrics: {
    titleLength: Number,
    descriptionLength: Number,
    keywordDensity: Number,
    imagesWithoutAlt: Number,
    internalLinks: Number,
    externalLinks: Number,
    headingStructure: {
      h1Count: Number,
      h2Count: Number,
      h3Count: Number,
      hasProperHierarchy: Boolean,
    },
    readabilityScore: Number,
    loadTime: Number,
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now,
  },
});

// Schéma principal SEO
const SEOSchema = new mongoose.Schema({
  // Référence à l'entité (page, projet, etc.)
  entityType: {
    type: String,
    required: true,
    enum: ['page', 'project', 'blog', 'homepage', 'about', 'contact'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  
  // Métadonnées de base
  title: {
    type: String,
    required: true,
    maxlength: 60,
  },
  description: {
    type: String,
    required: true,
    maxlength: 160,
  },
  keywords: [{
    type: String,
    maxlength: 50,
  }],
  
  // URL et canonique
  canonicalUrl: String,
  alternateUrls: [{
    lang: String,
    url: String,
  }],
  
  // Métadonnées avancées
  openGraph: OpenGraphSchema,
  twitterCard: TwitterCardSchema,
  structuredData: [StructuredDataSchema],
  
  // Configuration des robots
  robots: {
    index: {
      type: Boolean,
      default: true,
    },
    follow: {
      type: Boolean,
      default: true,
    },
    archive: {
      type: Boolean,
      default: true,
    },
    snippet: {
      type: Boolean,
      default: true,
    },
    imageindex: {
      type: Boolean,
      default: true,
    },
    maxSnippet: Number,
    maxImagePreview: {
      type: String,
      enum: ['none', 'standard', 'large'],
      default: 'large',
    },
  },
  
  // Priorité et fréquence pour le sitemap
  sitemap: {
    priority: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    changeFreq: {
      type: String,
      enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
      default: 'monthly',
    },
    lastMod: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Analyse et optimisation
  analysis: SEOAnalysisSchema,
  
  // Configuration avancée
  hreflang: [{
    lang: String,
    url: String,
  }],
  breadcrumbs: [{
    name: String,
    url: String,
  }],
  
  // Métadonnées de performance
  performance: {
    loadTime: Number,
    firstContentfulPaint: Number,
    largestContentfulPaint: Number,
    cumulativeLayoutShift: Number,
    firstInputDelay: Number,
    mobileScore: Number,
    desktopScore: Number,
    lastMeasured: Date,
  },
  
  // Statut et configuration
  isActive: {
    type: Boolean,
    default: true,
  },
  autoOptimize: {
    type: Boolean,
    default: true,
  },
  
  // Métadonnées de gestion
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastOptimized: Date,
});

// Schéma pour la configuration SEO globale
const SEOConfigSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
  },
  siteUrl: {
    type: String,
    required: true,
  },
  defaultTitle: String,
  titleTemplate: {
    type: String,
    default: '%s | Portfolio',
  },
  defaultDescription: String,
  defaultKeywords: [String],
  defaultImage: {
    url: String,
    width: Number,
    height: Number,
    alt: String,
  },
  
  // Configuration des réseaux sociaux
  social: {
    twitter: String,
    facebook: String,
    linkedin: String,
    github: String,
    instagram: String,
  },
  
  // Configuration Google
  google: {
    analyticsId: String,
    searchConsoleId: String,
    adsenseId: String,
    tagManagerId: String,
  },
  
  // Configuration des outils SEO
  tools: {
    enableSitemap: {
      type: Boolean,
      default: true,
    },
    enableRobotsTxt: {
      type: Boolean,
      default: true,
    },
    enableStructuredData: {
      type: Boolean,
      default: true,
    },
    enableOpenGraph: {
      type: Boolean,
      default: true,
    },
    enableTwitterCard: {
      type: Boolean,
      default: true,
    },
    autoGenerateMetaTags: {
      type: Boolean,
      default: true,
    },
  },
  
  // Configuration de l'analyse automatique
  analysis: {
    enabled: {
      type: Boolean,
      default: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
    lastRun: Date,
    nextRun: Date,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index pour optimiser les performances
SEOSchema.index({ slug: 1 }, { unique: true });
SEOSchema.index({ entityType: 1, entityId: 1 });
SEOSchema.index({ isActive: 1 });
SEOSchema.index({ 'sitemap.lastMod': -1 });
SEOSchema.index({ updatedAt: -1 });
SEOSchema.index({ 'analysis.score': -1 });

// Middleware pour mettre à jour updatedAt
SEOSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified() && !this.isNew && this.sitemap) {
    this.sitemap.lastMod = new Date();
  }
  next();
});

// Méthodes statiques
SEOSchema.statics.generateSitemap = function() {
  return this.find({ isActive: true })
    .select('slug sitemap.priority sitemap.changeFreq sitemap.lastMod')
    .sort({ 'sitemap.priority': -1, 'sitemap.lastMod': -1 });
};

SEOSchema.statics.getBySlug = function(slug: string) {
  return this.findOne({ slug, isActive: true });
};

SEOSchema.statics.analyzeAll = function() {
  return this.find({ isActive: true, autoOptimize: true });
};

// Méthodes d'instance
SEOSchema.methods.generateMetaTags = function() {
  const tags = [];
  
  // Titre
  if (this.title) {
    tags.push(`<title>${this.title}</title>`);
    tags.push(`<meta property="og:title" content="${this.title}" />`);
    tags.push(`<meta name="twitter:title" content="${this.twitterCard?.title || this.title}" />`);
  }
  
  // Description
  if (this.description) {
    tags.push(`<meta name="description" content="${this.description}" />`);
    tags.push(`<meta property="og:description" content="${this.description}" />`);
    tags.push(`<meta name="twitter:description" content="${this.twitterCard?.description || this.description}" />`);
  }
  
  // Keywords
  if (this.keywords && this.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${this.keywords.join(', ')}" />`);
  }
  
  // Canonical URL
  if (this.canonicalUrl) {
    tags.push(`<link rel="canonical" href="${this.canonicalUrl}" />`);
  }
  
  // Robots
  const robotsContent = [];
  if (this.robots.index) robotsContent.push('index'); else robotsContent.push('noindex');
  if (this.robots.follow) robotsContent.push('follow'); else robotsContent.push('nofollow');
  if (!this.robots.archive) robotsContent.push('noarchive');
  if (!this.robots.snippet) robotsContent.push('nosnippet');
  if (!this.robots.imageindex) robotsContent.push('noimageindex');
  
  tags.push(`<meta name="robots" content="${robotsContent.join(', ')}" />`);
  
  return tags.join('\n');
};

SEOSchema.methods.generateStructuredData = function() {
  return this.structuredData
    .filter((data: any) => data.isActive)
    .map((data: any) => ({
      '@context': 'https://schema.org',
      '@type': data.type,
      ...data.data
    }));
};

// Créer les modèles
const SEO = mongoose.models.SEO || mongoose.model('SEO', SEOSchema);
const SEOConfig = mongoose.models.SEOConfig || mongoose.model('SEOConfig', SEOConfigSchema);

export { SEO, SEOConfig };
export default SEO;