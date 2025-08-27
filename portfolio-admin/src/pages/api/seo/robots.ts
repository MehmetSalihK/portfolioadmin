import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import { SEOConfig } from '../../../models/SEO';

// Configuration par défaut pour robots.txt
const DEFAULT_ROBOTS_CONFIG = {
  userAgent: '*',
  allow: [
    '/',
    '/projects',
    '/skills',
    '/experience',
    '/education',
    '/contact',
    '/about',
    '/api/media/serve/*',
  ],
  disallow: [
    '/admin',
    '/api/auth/*',
    '/api/backup/*',
    '/api/analytics/*',
    '/api/maintenance/*',
    '/_next/*',
    '/private/*',
    '*.json',
    '*.xml',
  ],
  crawlDelay: 1,
  sitemap: '/api/seo/sitemap',
  host: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

// Fonction pour générer le contenu robots.txt
function generateRobotsContent(config: any): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  let content = '';
  
  // User-agent principal
  content += `User-agent: ${config.userAgent || '*'}\n`;
  
  // Règles Allow
  if (config.allow && Array.isArray(config.allow)) {
    for (const path of config.allow) {
      content += `Allow: ${path}\n`;
    }
  }
  
  // Règles Disallow
  if (config.disallow && Array.isArray(config.disallow)) {
    for (const path of config.disallow) {
      content += `Disallow: ${path}\n`;
    }
  }
  
  // Crawl-delay
  if (config.crawlDelay && config.crawlDelay > 0) {
    content += `Crawl-delay: ${config.crawlDelay}\n`;
  }
  
  // Règles spécifiques pour les bots de recherche
  const searchBots = [
    'Googlebot',
    'Bingbot',
    'Slurp', // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
  ];
  
  for (const bot of searchBots) {
    content += `\nUser-agent: ${bot}\n`;
    content += `Allow: /\n`;
    
    // Disallow spécifique pour les bots de recherche
    const botDisallow = [
      '/admin',
      '/api/auth/*',
      '/api/backup/*',
      '/private/*',
    ];
    
    for (const path of botDisallow) {
      content += `Disallow: ${path}\n`;
    }
    
    if (config.crawlDelay && config.crawlDelay > 0) {
      content += `Crawl-delay: ${Math.max(1, config.crawlDelay - 1)}\n`;
    }
  }
  
  // Règles pour les bots agressifs
  const aggressiveBots = [
    'AhrefsBot',
    'MJ12bot',
    'DotBot',
    'SemrushBot',
    'MajesticSEO',
    'BLEXBot',
  ];
  
  for (const bot of aggressiveBots) {
    content += `\nUser-agent: ${bot}\n`;
    content += `Crawl-delay: 10\n`;
    content += `Disallow: /\n`;
  }
  
  // Règles pour les scrapers
  const scrapers = [
    'HTTrack',
    'Wget',
    'WebReaper',
    'WebCopier',
    'Offline Explorer',
    'Teleport',
    'TeleportPro',
    'WebStripper',
    'NetAnts',
    'FlashGet',
    'Go-http-client',
  ];
  
  for (const scraper of scrapers) {
    content += `\nUser-agent: ${scraper}\n`;
    content += `Disallow: /\n`;
  }
  
  // Sitemap
  content += `\n# Sitemap\n`;
  if (config.sitemap) {
    const sitemapUrl = config.sitemap.startsWith('http') 
      ? config.sitemap 
      : `${baseUrl}${config.sitemap}`;
    content += `Sitemap: ${sitemapUrl}\n`;
  }
  
  // Host (pour Yandex principalement)
  if (config.host) {
    content += `\n# Host\n`;
    content += `Host: ${config.host.replace(/^https?:\/\//, '')}\n`;
  }
  
  // Commentaires informatifs
  content += `\n# Generated automatically by Portfolio Admin\n`;
  content += `# Last updated: ${new Date().toISOString()}\n`;
  
  return content;
}

// Fonction pour valider la configuration robots.txt
function validateRobotsConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.allow && !Array.isArray(config.allow)) {
    errors.push('Le champ "allow" doit être un tableau');
  }
  
  if (config.disallow && !Array.isArray(config.disallow)) {
    errors.push('Le champ "disallow" doit être un tableau');
  }
  
  if (config.crawlDelay && (typeof config.crawlDelay !== 'number' || config.crawlDelay < 0)) {
    errors.push('Le champ "crawlDelay" doit être un nombre positif');
  }
  
  if (config.sitemap && typeof config.sitemap !== 'string') {
    errors.push('Le champ "sitemap" doit être une chaîne de caractères');
  }
  
  if (config.host && typeof config.host !== 'string') {
    errors.push('Le champ "host" doit être une chaîne de caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Cache pour robots.txt
let robotsCache: { content: string; lastGenerated: Date } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST', 'PUT'].includes(req.method!)) {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();

    if (req.method === 'GET') {
      const { type = 'txt', force } = req.query;
      
      // Vérifier le cache
      const now = new Date();
      if (!force && robotsCache && 
          (now.getTime() - robotsCache.lastGenerated.getTime()) < CACHE_DURATION) {
        
        if (type === 'txt') {
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 heure
          return res.status(200).send(robotsCache.content);
        } else {
          return res.status(200).json({ 
            robots: robotsCache.content,
            lastGenerated: robotsCache.lastGenerated 
          });
        }
      }
      
      // Récupérer la configuration
      let seoConfig = await SEOConfig.findOne({});
      if (!seoConfig) {
        seoConfig = new SEOConfig({
          robots: DEFAULT_ROBOTS_CONFIG,
        });
        await seoConfig.save();
      }
      
      const robotsConfig = seoConfig.robots || DEFAULT_ROBOTS_CONFIG;
      const content = generateRobotsContent(robotsConfig);
      
      // Mettre à jour le cache
      robotsCache = {
        content,
        lastGenerated: now,
      };
      
      if (type === 'txt') {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.status(200).send(content);
      } else {
        return res.status(200).json({
          robots: content,
          config: robotsConfig,
          lastGenerated: now,
        });
      }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Mettre à jour la configuration robots.txt
      const { robots: newRobotsConfig } = req.body;
      
      if (!newRobotsConfig) {
        return res.status(400).json({ 
          message: 'Configuration robots.txt requise' 
        });
      }
      
      // Valider la configuration
      const validation = validateRobotsConfig(newRobotsConfig);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: 'Configuration invalide',
          errors: validation.errors 
        });
      }
      
      // Mettre à jour ou créer la configuration
      let seoConfig = await SEOConfig.findOne({});
      if (!seoConfig) {
        seoConfig = new SEOConfig();
      }
      
      seoConfig.robots = { ...DEFAULT_ROBOTS_CONFIG, ...newRobotsConfig };
      seoConfig.updatedAt = new Date();
      await seoConfig.save();
      
      // Invalider le cache
      robotsCache = null;
      
      // Générer le nouveau contenu
      const content = generateRobotsContent(seoConfig.robots);
      
      return res.status(200).json({
        message: 'Configuration robots.txt mise à jour avec succès',
        robots: content,
        config: seoConfig.robots,
      });
    }
  } catch (error) {
    console.error('Erreur API robots:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error.message 
    });
  }
}

// Exporter les fonctions utilitaires
export {
  generateRobotsContent,
  validateRobotsConfig,
  DEFAULT_ROBOTS_CONFIG,
};