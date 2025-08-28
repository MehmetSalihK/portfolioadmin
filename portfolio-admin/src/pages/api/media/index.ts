import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import connectDB from '@/lib/db';
import Media from '@/models/Media';

let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp non disponible, les fonctionnalités d\'optimisation seront limitées');
  sharp = null;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media');
const isVercel = process.env.VERCEL === '1';

// Tailles prédéfinies pour les variantes d'images
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  xl: { width: 1920, height: 1080 },
};

const OPTIMIZATION_SETTINGS = {
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true,
  },
  webp: {
    quality: 80,
    effort: 4,
    lossless: false,
  },
  png: {
    compressionLevel: 8,
    adaptiveFiltering: true,
    palette: true,
  },
  avif: {
    quality: 75,
    effort: 4,
  },
};

// Types de fichiers autorisés
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/webm'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf', 'text/plain'],
};

// Fonction pour déterminer le type de média
function getMediaType(mimeType: string): string {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type;
    }
  }
  return 'other';
}

// Fonction pour générer les variantes d'images
async function generateImageVariants(inputPath: string, filename: string, originalFormat: string = 'jpeg'): Promise<any[]> {
  if (!sharp) {
    return [];
  }

  const variants = [];
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Formats à générer (ordre de priorité)
  const formats = ['webp', 'avif', originalFormat].filter((format, index, arr) => 
    arr.indexOf(format) === index // Supprimer les doublons
  );

  for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
    for (const format of formats) {
      try {
        let pipeline = image.clone()
          .resize(dimensions.width, dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3, // Meilleure qualité de redimensionnement
          });
        
        // Optimisation spécifique au format
        let extension: string;
        
        switch (format) {
          case 'webp':
            pipeline = pipeline.webp(OPTIMIZATION_SETTINGS.webp);
            extension = 'webp';
            break;
          case 'avif':
            pipeline = pipeline.avif(OPTIMIZATION_SETTINGS.avif);
            extension = 'avif';
            break;
          case 'jpeg':
          case 'jpg':
            pipeline = pipeline.jpeg(OPTIMIZATION_SETTINGS.jpeg);
            extension = 'jpg';
            break;
          case 'png':
            pipeline = pipeline.png(OPTIMIZATION_SETTINGS.png);
            extension = 'png';
            break;
          default:
            continue;
        }
        
        const variantFilename = `${path.parse(filename).name}_${sizeName}.${extension}`;
        const variantPath = path.join(uploadDir, variantFilename);

        await pipeline.toFile(variantPath);

        const stats = await fs.stat(variantPath);
        const variantMetadata = await sharp(variantPath).metadata();

        variants.push({
          size: sizeName,
          width: variantMetadata.width || dimensions.width,
          height: variantMetadata.height || dimensions.height,
          url: `/uploads/media/${variantFilename}`,
          fileSize: stats.size,
          format: format,
        });
      } catch (error) {
        console.error(`Erreur lors de la génération de la variante ${sizeName} ${format}:`, error);
      }
    }
  }

  return variants;
}

// Fonction pour optimiser les images avec compression intelligente
async function optimizeImage(inputPath: string, outputPath: string, options: {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif' | 'auto';
  progressive?: boolean;
  lossless?: boolean;
  keepMetadata?: boolean;
} = {}): Promise<{ originalSize: number; optimizedSize: number; compressionRatio: number }> {
  const originalStats = await fs.stat(inputPath);
  const originalSize = originalStats.size;

  if (!sharp) {
    await fs.copyFile(inputPath, outputPath);
    return {
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0,
    };
  }

  const {
    quality = 85,
    format = 'auto',
    progressive = true,
    lossless = false,
    keepMetadata = false,
  } = options;

  let pipeline = sharp(inputPath);
  const metadata = await pipeline.metadata();
  
  // Auto-rotation basée sur les métadonnées EXIF
  pipeline = pipeline.rotate();
  
  // Suppression des métadonnées pour réduire la taille (sauf si spécifié autrement)
  if (!keepMetadata) {
    pipeline = pipeline.withMetadata(false);
  }
  
  // Déterminer le format optimal
  let targetFormat = format;
  if (format === 'auto') {
    // Utiliser AVIF pour la meilleure compression, WebP en fallback
    targetFormat = 'avif';
    // Garder PNG pour les images avec transparence si nécessaire
    if (metadata.hasAlpha && metadata.format === 'png') {
      targetFormat = 'webp'; // WebP gère mieux la transparence qu'AVIF
    }
  }

  const settings = OPTIMIZATION_SETTINGS[targetFormat as keyof typeof OPTIMIZATION_SETTINGS];
  
  // Appliquer l'optimisation selon le format
  switch (targetFormat) {
    case 'avif':
      pipeline = pipeline.avif({
        ...settings,
        quality: lossless ? 100 : quality,
        lossless,
      });
      break;
    case 'webp':
      pipeline = pipeline.webp({
        ...settings,
        quality: lossless ? 100 : quality,
        lossless,
        effort: 6, // Maximum effort for better compression
      });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({
        ...settings,
        quality,
        progressive,
      });
      break;
    case 'png':
      pipeline = pipeline.png({
        ...settings,
        compressionLevel: 9,
        palette: !metadata.hasAlpha, // Use palette for non-transparent images
      });
      break;
  }

  // Appliquer des optimisations supplémentaires
  pipeline = pipeline
    .sharpen() // Légère netteté pour compenser la compression
    .normalise(); // Normaliser les couleurs

  await pipeline.toFile(outputPath);
  
  const optimizedStats = await fs.stat(outputPath);
  const optimizedSize = optimizedStats.size;
  const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

  return {
    originalSize,
    optimizedSize,
    compressionRatio,
  };
}

// Fonction pour créer des versions optimisées avec compression intelligente
async function createOptimizedVersions(inputPath: string, filename: string): Promise<{
  webp: string;
  avif: string;
  optimized: string;
  compressionStats: any;
}> {
  if (!sharp) {
    return {
      webp: '',
      avif: '',
      optimized: '',
      compressionStats: null,
    };
  }

  const baseName = path.parse(filename).name;
  const originalMetadata = await sharp(inputPath).metadata();
  
  // Noms des fichiers optimisés
  const avifFilename = `${baseName}_optimized.avif`;
  const webpFilename = `${baseName}_optimized.webp`;
  const optimizedFilename = `${baseName}_optimized${path.extname(filename)}`;
  
  const avifPath = path.join(uploadDir, avifFilename);
  const webpPath = path.join(uploadDir, webpFilename);
  const optimizedPath = path.join(uploadDir, optimizedFilename);

  // Options d'optimisation adaptatives basées sur la taille de l'image
  let qualitySettings = { avif: 75, webp: 80, original: 85 };
  
  if (originalMetadata.width && originalMetadata.width > 1920) {
    // Images très grandes - compression plus agressive
    qualitySettings = { avif: 65, webp: 70, original: 75 };
  } else if (originalMetadata.width && originalMetadata.width > 800) {
    // Images moyennes - compression équilibrée
    qualitySettings = { avif: 75, webp: 80, original: 85 };
  } else {
    // Petites images - préserver la qualité
    qualitySettings = { avif: 80, webp: 85, original: 90 };
  }

  // Créer version AVIF (meilleure compression)
  const avifStats = await optimizeImage(inputPath, avifPath, {
    format: 'avif',
    quality: qualitySettings.avif,
  });

  // Créer version WebP (fallback)
  const webpStats = await optimizeImage(inputPath, webpPath, {
    format: 'webp',
    quality: qualitySettings.webp,
  });

  // Créer version optimisée dans le format original
  const optimizedStats = await optimizeImage(inputPath, optimizedPath, {
    format: 'auto',
    quality: qualitySettings.original,
  });

  return {
    avif: `/uploads/media/${avifFilename}`,
    webp: `/uploads/media/${webpFilename}`,
    optimized: `/uploads/media/${optimizedFilename}`,
    compressionStats: {
      avif: avifStats,
      webp: webpStats,
      optimized: optimizedStats,
    },
  };
}

// Fonction pour détecter le format optimal basé sur le contenu de l'image
async function detectOptimalFormat(inputPath: string): Promise<{ format: string; reason: string }> {
  if (!sharp) {
    return { format: 'jpeg', reason: 'Sharp non disponible' };
  }

  try {
    const metadata = await sharp(inputPath).metadata();
    const stats = await sharp(inputPath).stats();
    
    // Analyser les caractéristiques de l'image
    const hasTransparency = metadata.hasAlpha;
    const isLowColor = stats.channels.every((channel: any) => channel.max - channel.min < 128);
    const isHighDetail = metadata.width && metadata.height && (metadata.width * metadata.height) > 1000000;
    
    // Logique de sélection du format
    if (hasTransparency) {
      return { format: 'webp', reason: 'Image avec transparence' };
    }
    
    if (isLowColor && !isHighDetail) {
      return { format: 'webp', reason: 'Image avec peu de couleurs' };
    }
    
    if (isHighDetail) {
      return { format: 'avif', reason: 'Image haute résolution - meilleure compression' };
    }
    
    // Par défaut, utiliser WebP pour un bon équilibre
    return { format: 'webp', reason: 'Format optimal par défaut' };
  } catch (error) {
    console.error('Erreur lors de la détection du format optimal:', error);
    return { format: 'jpeg', reason: 'Erreur de détection - fallback' };
  }
}

// Fonction pour extraire les métadonnées d'image
async function extractImageMetadata(filePath: string): Promise<any> {
  if (!sharp) {
    return null;
  }

  try {
    const metadata = await sharp(filePath).metadata();
    const stats = await sharp(filePath).stats();
    const optimalFormat = await detectOptimalFormat(filePath);

    // Calculer la complexité de l'image
    const complexity = stats.channels.reduce((acc: number, channel: any) => {
      return acc + (channel.max - channel.min);
    }, 0) / stats.channels.length;
    
    return {
      exif: metadata.exif ? metadata : null,
      colorPalette: stats.channels ? [
        { color: '#' + Math.floor(stats.channels[0].mean).toString(16).padStart(2, '0').repeat(3), percentage: 100 }
      ] : [],
      averageColor: stats.channels ? 
        '#' + stats.channels.map((c: any) => Math.floor(c.mean).toString(16).padStart(2, '0')).join('') : null,
      optimalFormat: optimalFormat,
      complexity: Math.round(complexity),
      aspectRatio: metadata.width && metadata.height ? (metadata.width / metadata.height).toFixed(2) : null,
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectDB();

    if (req.method === 'GET') {
      // Récupérer la liste des médias avec pagination et filtres
      const { page = 1, limit = 20, type, category, search } = req.query;
      
      const query: any = { archived: false };
      
      if (type && type !== 'all') {
        query.type = type;
      }
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const media = await Media.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Media.countDocuments(query);

      return res.status(200).json({
        media,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    }

    if (req.method === 'POST') {
      // Upload de nouveaux médias
      if (!isVercel && !existsSync(uploadDir)) {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const form = formidable({
        uploadDir: isVercel ? '/tmp' : uploadDir,
        keepExtensions: true,
        maxFileSize: isVercel ? 10 * 1024 * 1024 : 100 * 1024 * 1024, // 10MB sur Vercel, 100MB en local
        filter: ({ mimetype }) => {
          const allAllowedTypes = Object.values(ALLOWED_TYPES).flat();
          return allAllowedTypes.includes(mimetype || '');
        },
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ error: 'Erreur lors du téléchargement du fichier' });
        }

        const file = files.file?.[0];
        if (!file) {
          return res.status(400).json({ error: 'Aucun fichier trouvé' });
        }

        const mediaType = getMediaType(file.mimetype || '');
        if (mediaType === 'other') {
          return res.status(400).json({ error: 'Type de fichier non autorisé' });
        }

        const fileId = new mongoose.Types.ObjectId();
        const fileExtension = path.extname(file.originalFilename || '');
        const uniqueFilename = `${fileId}${fileExtension}`;
        
        let finalPath: string;
        let webPath: string;
        let fileSize: number;
        let dimensions: { width?: number; height?: number } = {};
        let variants: any[] = [];
        let metadata: any = null;

        let optimizationData: any = null;
        let optimizedVersions: any = null;

        if (isVercel) {
          // Sur Vercel, on stocke en base64 (pour la démo)
          const fileBuffer = await fs.readFile(file.filepath);
          fileSize = fileBuffer.length;
          webPath = `/api/media/serve/${fileId}`; // API pour servir les fichiers
        } else {
          finalPath = path.join(uploadDir, uniqueFilename);
          
          if (mediaType === 'image') {
            // Optimisation automatique avancée
            const optimizationResult = await optimizeImage(file.filepath, finalPath, {
              format: 'auto',
              quality: 85,
              progressive: true,
            });
            
            optimizationData = {
              originalSize: optimizationResult.originalSize,
              optimizedSize: optimizationResult.optimizedSize,
              compressionRatio: optimizationResult.compressionRatio,
              quality: 85,
            };
            
            // Détecter le format optimal pour cette image
            const optimalFormatInfo = await detectOptimalFormat(file.filepath);
            
            // Créer des versions optimisées supplémentaires (WebP, etc.)
            optimizedVersions = await createOptimizedVersions(file.filepath, uniqueFilename);
            
            // Détecter le format original
            const originalFormat = file.mimetype?.split('/')[1] || 'jpeg';
            
            // Générer les variantes avec optimisation intelligente
            variants = await generateImageVariants(finalPath, uniqueFilename, optimalFormatInfo.format);
            
            // Extraire les métadonnées enrichies
            metadata = await extractImageMetadata(finalPath);
            
            // Obtenir les dimensions
            if (sharp) {
              const imageMetadata = await sharp(finalPath).metadata();
              dimensions = {
                width: imageMetadata.width,
                height: imageMetadata.height,
              };
            }
          } else {
            // Pour les fichiers non-image, simple copie
            await fs.rename(file.filepath, finalPath);
          }
          
          const stats = await fs.stat(finalPath);
          fileSize = stats.size;
          webPath = `/uploads/media/${uniqueFilename}`;
        }

        // Créer l'enregistrement en base de données avec optimisation
        const mediaRecord = new Media({
          filename: uniqueFilename,
          originalName: file.originalFilename,
          title: fields.title?.[0] || file.originalFilename,
          description: fields.description?.[0] || '',
          altText: fields.altText?.[0] || '',
          type: mediaType,
          mimeType: file.mimetype,
          fileSize,
          dimensions,
          url: webPath,
          thumbnailUrl: variants.find(v => v.size === 'thumbnail')?.url || webPath,
          variants,
          tags: fields.tags?.[0] ? JSON.parse(fields.tags[0]) : [],
          category: fields.category?.[0] || 'other',
          isPublic: fields.isPublic?.[0] === 'true' || true,
          isOptimized: mediaType === 'image' && !!optimizationData,
          optimizedAt: mediaType === 'image' && optimizationData ? new Date() : null,
          uploadedBy: session.user?.email || 'unknown',
          metadata: {
            ...metadata,
            optimizedVersions: optimizedVersions ? {
              webp: optimizedVersions.webp,
              optimized: optimizedVersions.optimized,
            } : undefined,
          },
          optimization: optimizationData,
          processing: {
            status: 'completed',
            processedAt: new Date(),
          },
        });

        await mediaRecord.save();

        res.status(200).json({
          success: true,
          message: 'Média uploadé avec succès',
          media: mediaRecord,
        });
      });
    }

    if (req.method === 'PUT') {
      // Mettre à jour les métadonnées d'un média
      const { id } = req.query;
      const { title, description, altText, tags, category, isPublic } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID du média requis' });
      }

      const media = await Media.findById(id);
      if (!media) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      // Mettre à jour les champs
      if (title !== undefined) media.title = title;
      if (description !== undefined) media.description = description;
      if (altText !== undefined) media.altText = altText;
      if (tags !== undefined) media.tags = tags;
      if (category !== undefined) media.category = category;
      if (isPublic !== undefined) media.isPublic = isPublic;

      await media.save();

      res.status(200).json({
        success: true,
        message: 'Média mis à jour avec succès',
        media,
      });
    }

    if (req.method === 'DELETE') {
      // Supprimer un média
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID du média requis' });
      }

      const media = await Media.findById(id);
      if (!media) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      // Supprimer les fichiers physiques
      if (!isVercel) {
        try {
          const mainFilePath = path.join(process.cwd(), 'public', media.url);
          if (existsSync(mainFilePath)) {
            await fs.unlink(mainFilePath);
          }

          // Supprimer les variantes
          for (const variant of media.variants) {
            const variantPath = path.join(process.cwd(), 'public', variant.url);
            if (existsSync(variantPath)) {
              await fs.unlink(variantPath);
            }
          }
        } catch (error) {
          console.error('Erreur suppression fichiers:', error);
        }
      }

      await Media.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Média supprimé avec succès',
      });
    }

    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method || '')) {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API média:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}