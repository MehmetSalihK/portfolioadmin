import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import { SEO } from '../../../models/SEO';
import Project from '../../../models/Project';
import Skill from '../../../models/Skill';
import Experience from '../../../models/Experience';
import Education from '../../../models/Education';
import Contact from '../../../models/Contact';
import HomePage from '../../../models/HomePage';
import { Media } from '../../../models/Media';
import Category from '../../../models/Category';

// Interface pour les entrées du sitemap
interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: {
    url: string;
    title?: string;
    caption?: string;
  }[];
}

// Fonction pour générer les URLs du sitemap
async function generateSitemapEntries(): Promise<SitemapEntry[]> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const entries: SitemapEntry[] = [];
  
  try {
    // Page d'accueil
    const homePage = await HomePage.findOne({});
    entries.push({
      url: baseUrl,
      lastmod: homePage?.updatedAt?.toISOString() || new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    });
    
    // Pages statiques
    const staticPages = [
      { path: '/about', changefreq: 'monthly' as const, priority: 0.8 },
      { path: '/projects', changefreq: 'weekly' as const, priority: 0.9 },
      { path: '/skills', changefreq: 'monthly' as const, priority: 0.7 },
      { path: '/experience', changefreq: 'monthly' as const, priority: 0.7 },
      { path: '/education', changefreq: 'yearly' as const, priority: 0.6 },
      { path: '/contact', changefreq: 'yearly' as const, priority: 0.8 },
    ];
    
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}${page.path}`,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority,
      });
    }
    
    // Projets
    const projects = await Project.find({ isVisible: true }).sort({ createdAt: -1 });
    for (const project of projects) {
      const images = [];
      
      // Ajouter l'image principale
      if (project.image) {
        images.push({
          url: `${baseUrl}${project.image}`,
          title: project.title,
          caption: project.description?.substring(0, 100),
        });
      }
      
      // Ajouter les images de la galerie
      if (project.gallery && Array.isArray(project.gallery)) {
        for (const img of project.gallery.slice(0, 5)) { // Limiter à 5 images
          images.push({
            url: `${baseUrl}${img}`,
            title: project.title,
          });
        }
      }
      
      entries.push({
        url: `${baseUrl}/projects/${project.slug || project._id}`,
        lastmod: project.updatedAt?.toISOString() || project.createdAt?.toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
        images: images.length > 0 ? images : undefined,
      });
    }
    
    // Compétences (si elles ont des pages dédiées)
    const skills = await Skill.find({}).sort({ name: 1 });
    for (const skill of skills) {
      entries.push({
        url: `${baseUrl}/skills/${skill.slug || skill._id}`,
        lastmod: skill.updatedAt?.toISOString() || skill.createdAt?.toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      });
    }
    
    // Expériences
    const experiences = await Experience.find({}).sort({ startDate: -1 });
    for (const experience of experiences) {
      entries.push({
        url: `${baseUrl}/experience/${experience.slug || experience._id}`,
        lastmod: experience.updatedAt?.toISOString() || experience.createdAt?.toISOString(),
        changefreq: 'yearly',
        priority: 0.7,
      });
    }
    
    // Formations
    const educations = await Education.find({}).sort({ startDate: -1 });
    for (const education of educations) {
      entries.push({
        url: `${baseUrl}/education/${education.slug || education._id}`,
        lastmod: education.updatedAt?.toISOString() || education.createdAt?.toISOString(),
        changefreq: 'yearly',
        priority: 0.6,
      });
    }
    
    // Catégories
    const categories = await Category.find({}).sort({ name: 1 });
    for (const category of categories) {
      entries.push({
        url: `${baseUrl}/category/${category.slug || category._id}`,
        lastmod: category.updatedAt?.toISOString() || category.createdAt?.toISOString(),
        changefreq: 'monthly',
        priority: 0.5,
      });
    }
    
    // Médias publics (si applicable)
    const publicMedia = await Media.find({ 
      isPublic: true,
      type: { $in: ['image', 'video'] }
    }).sort({ createdAt: -1 }).limit(50);
    
    for (const media of publicMedia) {
      entries.push({
        url: `${baseUrl}/media/${media._id}`,
        lastmod: media.updatedAt?.toISOString() || media.createdAt?.toISOString(),
        changefreq: 'monthly',
        priority: 0.4,
        images: media.type === 'image' ? [{
          url: `${baseUrl}${media.url}`,
          title: media.title || media.filename,
          caption: media.description,
        }] : undefined,
      });
    }
    
    return entries;
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    return entries;
  }
}

// Fonction pour générer le XML du sitemap
function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlEntries = entries.map(entry => {
    let xml = `  <url>
`;
    xml += `    <loc>${escapeXml(entry.url)}</loc>
`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>
`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>
`;
    xml += `    <priority>${entry.priority.toFixed(1)}</priority>
`;
    
    // Ajouter les images si présentes
    if (entry.images && entry.images.length > 0) {
      for (const image of entry.images) {
        xml += `    <image:image>
`;
        xml += `      <image:loc>${escapeXml(image.url)}</image:loc>
`;
        if (image.title) {
          xml += `      <image:title>${escapeXml(image.title)}</image:title>
`;
        }
        if (image.caption) {
          xml += `      <image:caption>${escapeXml(image.caption)}</image:caption>
`;
        }
        xml += `    </image:image>
`;
      }
    }
    
    xml += `  </url>`;
    return xml;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries}
</urlset>`;
}

// Fonction pour échapper les caractères XML
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Fonction pour générer le sitemap index (si nécessaire)
function generateSitemapIndex(sitemaps: string[]): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const now = new Date().toISOString();
  
  const xmlEntries = sitemaps.map(sitemap => `  <sitemap>
    <loc>${baseUrl}/api/seo/sitemap/${sitemap}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</sitemapindex>`;
}

// Cache pour le sitemap
let sitemapCache: { xml: string; lastGenerated: Date } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    
    const { type = 'xml', force } = req.query;
    
    // Vérifier le cache
    const now = new Date();
    if (!force && sitemapCache && 
        (now.getTime() - sitemapCache.lastGenerated.getTime()) < CACHE_DURATION) {
      
      if (type === 'xml') {
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 heure
        return res.status(200).send(sitemapCache.xml);
      } else {
        return res.status(200).json({ 
          sitemap: sitemapCache.xml,
          lastGenerated: sitemapCache.lastGenerated 
        });
      }
    }
    
    // Générer le sitemap
    const entries = await generateSitemapEntries();
    const xml = generateSitemapXML(entries);
    
    // Mettre à jour le cache
    sitemapCache = {
      xml,
      lastGenerated: now,
    };
    
    if (type === 'xml') {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(xml);
    } else {
      return res.status(200).json({
        sitemap: xml,
        lastGenerated: now,
        entriesCount: entries.length,
        entries: entries.map(entry => ({
          url: entry.url,
          lastmod: entry.lastmod,
          priority: entry.priority,
          imagesCount: entry.images?.length || 0,
        })),
      });
    }
  } catch (error) {
    console.error('Erreur API sitemap:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error.message 
    });
  }
}

// Exporter les fonctions utilitaires
export {
  generateSitemapEntries,
  generateSitemapXML,
  generateSitemapIndex,
};