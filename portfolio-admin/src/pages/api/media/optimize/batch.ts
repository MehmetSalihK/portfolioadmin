import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../lib/db';
import Media from '../../../../models/Media';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface OptimizationJob {
  id: string;
  mediaId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  originalSize: number;
  optimizedSize?: number;
  compressionRatio?: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Store des tâches en mémoire (en production, utiliser Redis ou une base de données)
const optimizationJobs = new Map<string, OptimizationJob>();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';

// Fonction d'optimisation avancée
const optimizeImageAdvanced = async (
  inputPath: string,
  outputPath: string,
  options: {
    quality: number;
    format: 'webp' | 'avif' | 'jpeg' | 'png';
    progressive?: boolean;
    lossless?: boolean;
  }
) => {
  const { quality, format, progressive = true, lossless = false } = options;
  
  let pipeline = sharp(inputPath);
  
  // Configuration selon le format
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({
        quality: lossless ? undefined : quality,
        lossless,
        effort: 6, // Maximum effort pour meilleure compression
      });
      break;
      
    case 'avif':
      pipeline = pipeline.avif({
        quality: lossless ? undefined : quality,
        lossless,
        effort: 9, // Maximum effort
      });
      break;
      
    case 'jpeg':
      pipeline = pipeline.jpeg({
        quality,
        progressive,
        mozjpeg: true, // Utiliser mozjpeg pour meilleure compression
      });
      break;
      
    case 'png':
      pipeline = pipeline.png({
        quality,
        progressive,
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
      break;
  }
  
  await pipeline.toFile(outputPath);
};

// Traiter une image
const processImage = async (
  media: any,
  options: {
    quality: number;
    formats: string[];
  }
): Promise<{ success: boolean; error?: string; stats?: any }> => {
  try {
    const originalPath = path.join(UPLOAD_DIR, media.filename);
    
    if (!fs.existsSync(originalPath)) {
      throw new Error('Fichier original introuvable');
    }
    
    const originalStats = fs.statSync(originalPath);
    const originalSize = originalStats.size;
    
    const optimizedVersions: any[] = [];
    let totalOptimizedSize = 0;
    
    // Traiter chaque format demandé
    for (const format of options.formats) {
      const ext = format === 'jpeg' ? 'jpg' : format;
      const optimizedFilename = media.filename.replace(/\.[^.]+$/, `_optimized.${ext}`);
      const optimizedPath = path.join(UPLOAD_DIR, optimizedFilename);
      
      await optimizeImageAdvanced(originalPath, optimizedPath, {
        quality: options.quality,
        format: format as any,
        progressive: true,
        lossless: format === 'png' && options.quality === 100,
      });
      
      const optimizedStats = fs.statSync(optimizedPath);
      const optimizedSize = optimizedStats.size;
      totalOptimizedSize += optimizedSize;
      
      optimizedVersions.push({
        format,
        filename: optimizedFilename,
        size: optimizedSize,
        url: `/uploads/${optimizedFilename}`,
        compressionRatio: ((originalSize - optimizedSize) / originalSize) * 100,
      });
    }
    
    // Calculer les statistiques moyennes
    const averageOptimizedSize = totalOptimizedSize / options.formats.length;
    const compressionRatio = ((originalSize - averageOptimizedSize) / originalSize) * 100;
    
    // Mettre à jour le document Media
    await Media.findByIdAndUpdate(media._id, {
      $set: {
        'optimization.optimizedSize': averageOptimizedSize,
        'optimization.compressionRatio': compressionRatio,
        'optimization.quality': options.quality,
        'processing.status': 'completed',
        'processing.processedAt': new Date(),
        'metadata.optimizedVersions': optimizedVersions,
        isOptimized: true,
        optimizedAt: new Date(),
      },
    });
    
    return {
      success: true,
      stats: {
        originalSize,
        optimizedSize: averageOptimizedSize,
        compressionRatio,
        formats: options.formats,
      },
    };
  } catch (error) {
    console.error('Erreur optimisation:', error);
    
    // Marquer comme échoué
    await Media.findByIdAndUpdate(media._id, {
      $set: {
        'processing.status': 'failed',
        'processing.error': error instanceof Error ? error.message : 'Erreur inconnue',
        'processing.processedAt': new Date(),
      },
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
};

// Traiter un lot d'images
const processBatch = async (
  mediaList: any[],
  options: {
    quality: number;
    formats: string[];
    batchSize: number;
  }
) => {
  const { batchSize } = options;
  
  for (let i = 0; i < mediaList.length; i += batchSize) {
    const batch = mediaList.slice(i, i + batchSize);
    
    // Traiter le lot en parallèle
    const promises = batch.map(async (media) => {
      const jobId = `${media._id}_${Date.now()}`;
      
      // Créer la tâche
      const job: OptimizationJob = {
        id: jobId,
        mediaId: media._id.toString(),
        filename: media.filename,
        status: 'processing',
        progress: 0,
        originalSize: media.fileSize,
        startedAt: new Date(),
      };
      
      optimizationJobs.set(jobId, job);
      
      try {
        // Marquer comme en cours
        await Media.findByIdAndUpdate(media._id, {
          $set: {
            'processing.status': 'processing',
          },
        });
        
        job.progress = 25;
        optimizationJobs.set(jobId, job);
        
        // Traiter l'image
        const result = await processImage(media, options);
        
        job.progress = 75;
        optimizationJobs.set(jobId, job);
        
        if (result.success && result.stats) {
          job.status = 'completed';
          job.progress = 100;
          job.optimizedSize = result.stats.optimizedSize;
          job.compressionRatio = result.stats.compressionRatio;
          job.completedAt = new Date();
        } else {
          job.status = 'failed';
          job.error = result.error;
        }
        
        optimizationJobs.set(jobId, job);
        
      } catch (error) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Erreur inconnue';
        optimizationJobs.set(jobId, job);
      }
    });
    
    await Promise.all(promises);
    
    // Pause entre les lots pour éviter la surcharge
    if (i + batchSize < mediaList.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  
  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    await dbConnect();
    
    const {
      quality = 85,
      formats = ['webp'],
      batchSize = 5,
      mediaIds,
    } = req.body;
    
    // Validation
    if (!Array.isArray(formats) || formats.length === 0) {
      return res.status(400).json({ error: 'Formats requis' });
    }
    
    if (quality < 60 || quality > 100) {
      return res.status(400).json({ error: 'Qualité doit être entre 60 et 100' });
    }
    
    // Récupérer les médias à optimiser
    let query: any = {
      type: 'image',
      $or: [
        { isOptimized: { $ne: true } },
        { 'processing.status': { $in: ['pending', 'failed'] } },
      ],
    };
    
    // Si des IDs spécifiques sont fournis
    if (mediaIds && Array.isArray(mediaIds)) {
      query._id = { $in: mediaIds };
    }
    
    const mediaList = await Media.find(query)
      .limit(batchSize * 10) // Limiter pour éviter la surcharge
      .sort({ createdAt: -1 });
    
    if (mediaList.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucune image à optimiser',
        count: 0,
      });
    }
    
    // Démarrer le traitement en arrière-plan
    processBatch(mediaList, { quality, formats, batchSize })
      .catch(error => {
        console.error('Erreur traitement lot:', error);
      });
    
    res.status(200).json({
      success: true,
      message: `Optimisation démarrée pour ${mediaList.length} images`,
      count: mediaList.length,
      jobIds: mediaList.map(media => `${media._id}_${Date.now()}`),
    });
    
  } catch (error) {
    console.error('Erreur API optimisation lot:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}

// Exporter les tâches pour les autres endpoints
export { optimizationJobs };