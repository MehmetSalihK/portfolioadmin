import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/db';
import { SEO, SEOConfig } from '../../../models/SEO';
import Project from '../../../models/Project';
import Skill from '../../../models/Skill';
import Experience from '../../../models/Experience';
import Education from '../../../models/Education';
import Contact from '../../../models/Contact';
import HomePage from '../../../models/HomePage';
import { Media } from '../../../models/Media';

// Fonction pour analyser le contenu et générer des métadonnées SEO
function analyzeSEOContent(content: string, title?: string) {
  const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  const wordCount = words.length;
  
  // Compter la fréquence des mots
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Extraire les mots-clés les plus fréquents
  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  // Générer une description automatique
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const description = sentences.slice(0, 2).join('. ').substring(0, 155) + '...';
  
  // Calculer le score de lisibilité (simplifié)
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
  
  return {
    keywords,
    description,
    wordCount,
    readabilityScore,
    suggestedTitle: title || (sentences[0]?.substring(0, 60) + '...' || 'Page Title'),
  };
}

// Fonction pour générer des données structurées JSON-LD
function generateStructuredData(entityType: string, data: any) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  switch (entityType) {
    case 'project':
      return {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: data.title,
        description: data.description,
        url: `${baseUrl}/projects/${data.slug}`,
        author: {
          '@type': 'Person',
          name: 'Portfolio Owner',
        },
        dateCreated: data.createdAt,
        keywords: data.technologies?.join(', '),
        image: data.image ? `${baseUrl}${data.image}` : undefined,
      };
    
    case 'skill':
      return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: data.name,
        description: data.description,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Technical Skills',
        },
      };
    
    case 'experience':
      return {
        '@context': 'https://schema.org',
        '@type': 'WorkExperience',
        name: data.position,
        description: data.description,
        employer: {
          '@type': 'Organization',
          name: data.company,
        },
        startDate: data.startDate,
        endDate: data.endDate,
      };
    
    case 'education':
      return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOccupationalCredential',
        name: data.degree,
        description: data.description,
        educationalCredentialAwarded: data.degree,
        recognizedBy: {
          '@type': 'EducationalOrganization',
          name: data.institution,
        },
        startDate: data.startDate,
        endDate: data.endDate,
      };
    
    default:
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: data.title || 'Portfolio Page',
        description: data.description,
        url: `${baseUrl}/${entityType}`,
      };
  }
}

// Fonction pour optimiser automatiquement le SEO d'une entité
async function optimizeEntitySEO(entityType: string, entityId: string, data: any) {
  try {
    // Analyser le contenu
    const content = [
      data.title,
      data.description,
      data.content,
      Array.isArray(data.technologies) ? data.technologies.join(' ') : '',
      Array.isArray(data.skills) ? data.skills.join(' ') : '',
    ].filter(Boolean).join(' ');
    
    const analysis = analyzeSEOContent(content, data.title);
    
    // Générer les données structurées
    const structuredData = generateStructuredData(entityType, data);
    
    // Créer ou mettre à jour le SEO
    const seoData = {
      entityType,
      entityId,
      title: data.title || analysis.suggestedTitle,
      description: data.description || analysis.description,
      keywords: analysis.keywords,
      canonicalUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${entityType}/${data.slug || entityId}`,
      openGraph: {
        title: data.title || analysis.suggestedTitle,
        description: data.description || analysis.description,
        image: data.image || data.thumbnail,
        type: entityType === 'project' ? 'article' : 'website',
      },
      twitterCard: {
        card: 'summary_large_image',
        title: data.title || analysis.suggestedTitle,
        description: data.description || analysis.description,
        image: data.image || data.thumbnail,
      },
      structuredData,
      analysis: {
        wordCount: analysis.wordCount,
        readabilityScore: analysis.readabilityScore,
        keywordDensity: analysis.keywords.reduce((acc, keyword) => {
          acc[keyword] = (content.toLowerCase().split(keyword).length - 1) / analysis.wordCount * 100;
          return acc;
        }, {} as Record<string, number>),
      },
      robots: {
        index: true,
        follow: true,
        noarchive: false,
        nosnippet: false,
      },
      sitemap: {
        priority: entityType === 'homepage' ? 1.0 : entityType === 'project' ? 0.8 : 0.6,
        changefreq: entityType === 'homepage' ? 'daily' : 'weekly',
      },
    };
    
    const existingSEO = await SEO.findOne({ entityType, entityId });
    
    if (existingSEO) {
      Object.assign(existingSEO, seoData);
      existingSEO.updatedAt = new Date();
      await existingSEO.save();
      return existingSEO;
    } else {
      const newSEO = new SEO(seoData);
      await newSEO.save();
      return newSEO;
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation SEO:', error);
    throw error;
  }
}

// Fonction pour analyser les performances SEO
async function analyzeSEOPerformance() {
  try {
    const seoEntries = await SEO.find({});
    
    const analysis = {
      totalPages: seoEntries.length,
      averageReadability: 0,
      averageKeywordCount: 0,
      issuesFound: [] as string[],
      recommendations: [] as string[],
      scoreByType: {} as Record<string, number>,
    };
    
    if (seoEntries.length === 0) {
      return analysis;
    }
    
    let totalReadability = 0;
    let totalKeywords = 0;
    const typeScores = {} as Record<string, { total: number; count: number }>;
    
    for (const seo of seoEntries) {
      // Analyser la lisibilité
      if (seo.analysis?.readabilityScore) {
        totalReadability += seo.analysis.readabilityScore;
      }
      
      // Analyser les mots-clés
      if (seo.keywords?.length) {
        totalKeywords += seo.keywords.length;
      }
      
      // Calculer le score par type
      let score = 0;
      
      // Points pour les métadonnées de base
      if (seo.title && seo.title.length >= 30 && seo.title.length <= 60) score += 20;
      if (seo.description && seo.description.length >= 120 && seo.description.length <= 160) score += 20;
      if (seo.keywords && seo.keywords.length >= 3 && seo.keywords.length <= 10) score += 15;
      
      // Points pour Open Graph
      if (seo.openGraph?.title && seo.openGraph?.description) score += 15;
      
      // Points pour les données structurées
      if (seo.structuredData) score += 15;
      
      // Points pour la lisibilité
      if (seo.analysis?.readabilityScore && seo.analysis.readabilityScore >= 60) score += 15;
      
      if (!typeScores[seo.entityType]) {
        typeScores[seo.entityType] = { total: 0, count: 0 };
      }
      typeScores[seo.entityType].total += score;
      typeScores[seo.entityType].count += 1;
      
      // Identifier les problèmes
      if (!seo.title || seo.title.length < 30) {
        analysis.issuesFound.push(`Titre trop court pour ${seo.entityType} ${seo.entityId}`);
      }
      if (!seo.description || seo.description.length < 120) {
        analysis.issuesFound.push(`Description trop courte pour ${seo.entityType} ${seo.entityId}`);
      }
      if (!seo.keywords || seo.keywords.length < 3) {
        analysis.issuesFound.push(`Pas assez de mots-clés pour ${seo.entityType} ${seo.entityId}`);
      }
    }
    
    analysis.averageReadability = totalReadability / seoEntries.length;
    analysis.averageKeywordCount = totalKeywords / seoEntries.length;
    
    // Calculer les scores moyens par type
    for (const [type, data] of Object.entries(typeScores)) {
      analysis.scoreByType[type] = data.total / data.count;
    }
    
    // Générer des recommandations
    if (analysis.averageReadability < 60) {
      analysis.recommendations.push('Améliorer la lisibilité du contenu');
    }
    if (analysis.averageKeywordCount < 5) {
      analysis.recommendations.push('Ajouter plus de mots-clés pertinents');
    }
    if (analysis.issuesFound.length > analysis.totalPages * 0.3) {
      analysis.recommendations.push('Réviser les métadonnées de base');
    }
    
    return analysis;
  } catch (error) {
    console.error('Erreur lors de l\'analyse des performances SEO:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method!)) {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (req.method === 'GET') {
      const { action, entityType, entityId } = req.query;
      
      if (action === 'analyze') {
        // Analyser les performances SEO globales
        const analysis = await analyzeSEOPerformance();
        return res.status(200).json({ analysis });
      }
      
      if (action === 'config') {
        // Récupérer la configuration SEO globale
        const config = await SEOConfig.findOne({}) || new SEOConfig();
        return res.status(200).json({ config });
      }
      
      if (entityType && entityId) {
        // Récupérer le SEO d'une entité spécifique
        const seo = await SEO.findOne({ entityType, entityId });
        if (!seo) {
          return res.status(404).json({ message: 'SEO non trouvé' });
        }
        return res.status(200).json({ seo });
      }
      
      // Récupérer tous les SEO avec pagination
      const { page = 1, limit = 20, type } = req.query;
      
      const filter: any = {};
      if (type) filter.entityType = type;
      
      const seos = await SEO.find(filter)
        .sort({ updatedAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      
      const total = await SEO.countDocuments(filter);
      
      return res.status(200).json({
        seos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    }

    if (req.method === 'POST') {
      const { action, entityType, entityId, data } = req.body;
      
      if (action === 'optimize') {
        // Optimiser automatiquement le SEO d'une entité
        if (!entityType || !entityId || !data) {
          return res.status(400).json({ 
            message: 'Type d\'entité, ID et données requis' 
          });
        }
        
        const optimizedSEO = await optimizeEntitySEO(entityType, entityId, data);
        
        return res.status(200).json({
          message: 'SEO optimisé avec succès',
          seo: optimizedSEO,
        });
      }
      
      if (action === 'bulk-optimize') {
        // Optimiser le SEO de toutes les entités
        const results = [];
        
        // Optimiser les projets
        const projects = await Project.find({});
        for (const project of projects) {
          try {
            const seo = await optimizeEntitySEO('project', project._id.toString(), project.toObject());
            results.push({ type: 'project', id: project._id, status: 'success' });
          } catch (error) {
            results.push({ type: 'project', id: project._id, status: 'error', error: error.message });
          }
        }
        
        // Optimiser les compétences
        const skills = await Skill.find({});
        for (const skill of skills) {
          try {
            const seo = await optimizeEntitySEO('skill', skill._id.toString(), skill.toObject());
            results.push({ type: 'skill', id: skill._id, status: 'success' });
          } catch (error) {
            results.push({ type: 'skill', id: skill._id, status: 'error', error: error.message });
          }
        }
        
        return res.status(200).json({
          message: 'Optimisation en lot terminée',
          results,
          summary: {
            total: results.length,
            success: results.filter(r => r.status === 'success').length,
            errors: results.filter(r => r.status === 'error').length,
          },
        });
      }
      
      return res.status(400).json({ message: 'Action non reconnue' });
    }

    if (req.method === 'PUT') {
      const { entityType, entityId } = req.query;
      const updateData = req.body;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ 
          message: 'Type d\'entité et ID requis' 
        });
      }
      
      const seo = await SEO.findOneAndUpdate(
        { entityType, entityId },
        { ...updateData, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      
      return res.status(200).json({
        message: 'SEO mis à jour avec succès',
        seo,
      });
    }

    if (req.method === 'DELETE') {
      const { entityType, entityId } = req.query;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ 
          message: 'Type d\'entité et ID requis' 
        });
      }
      
      await SEO.findOneAndDelete({ entityType, entityId });
      
      return res.status(200).json({
        message: 'SEO supprimé avec succès',
      });
    }
  } catch (error) {
    console.error('Erreur API SEO:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error.message 
    });
  }
}

// Exporter les fonctions utilitaires
export {
  analyzeSEOContent,
  generateStructuredData,
  optimizeEntitySEO,
  analyzeSEOPerformance,
};