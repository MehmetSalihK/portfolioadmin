import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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
  console.warn('Sharp non disponible, les fonctionnalités de recadrage seront limitées');
  sharp = null;
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media');
const isVercel = process.env.VERCEL === '1';

interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  outputWidth?: number;
  outputHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    if (!sharp) {
      return res.status(500).json({ 
        error: 'Fonctionnalité de recadrage non disponible (Sharp non installé)' 
      });
    }

    await connectDB();

    const {
      mediaId,
      cropOptions,
      saveAsNew = true,
      newFilename,
    }: {
      mediaId: string;
      cropOptions: CropOptions;
      saveAsNew?: boolean;
      newFilename?: string;
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({ error: 'ID de média invalide' });
    }

    const originalMedia = await Media.findById(mediaId);
    if (!originalMedia) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    if (originalMedia.type !== 'image') {
      return res.status(400).json({ error: 'Le recadrage n\'est disponible que pour les images' });
    }

    // Validation des options de recadrage
    const { x, y, width, height, outputWidth, outputHeight, quality = 85, format = 'jpeg' } = cropOptions;
    
    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      return res.status(400).json({ error: 'Paramètres de recadrage invalides' });
    }

    const originalPath = path.join(process.cwd(), 'public', originalMedia.url);
    
    if (!existsSync(originalPath)) {
      return res.status(404).json({ error: 'Fichier original non trouvé' });
    }

    try {
      // Créer le nom du fichier de sortie
      const fileId = new mongoose.Types.ObjectId();
      const outputFilename = newFilename || 
        `${path.parse(originalMedia.filename).name}_cropped_${Date.now()}.${format}`;
      const outputPath = path.join(uploadDir, outputFilename);
      const webPath = `/uploads/media/${outputFilename}`;

      // Effectuer le recadrage
      let image = sharp(originalPath)
        .extract({ left: Math.round(x), top: Math.round(y), width: Math.round(width), height: Math.round(height) });

      // Redimensionner si spécifié
      if (outputWidth && outputHeight) {
        image = image.resize(outputWidth, outputHeight, {
          fit: 'fill',
        });
      }

      // Appliquer le format et la qualité
      switch (format) {
        case 'jpeg':
          image = image.jpeg({ quality });
          break;
        case 'png':
          image = image.png({ quality });
          break;
        case 'webp':
          image = image.webp({ quality });
          break;
      }

      await image.toFile(outputPath);

      // Obtenir les informations du fichier créé
      const stats = await fs.stat(outputPath);
      const metadata = await sharp(outputPath).metadata();

      if (saveAsNew) {
        // Créer un nouvel enregistrement de média
        const newMedia = new Media({
          filename: outputFilename,
          originalName: `${originalMedia.originalName}_cropped`,
          title: `${originalMedia.title} (Recadré)`,
          description: originalMedia.description,
          altText: originalMedia.altText,
          type: 'image',
          mimeType: `image/${format}`,
          fileSize: stats.size,
          dimensions: {
            width: metadata.width,
            height: metadata.height,
          },
          url: webPath,
          tags: [...originalMedia.tags, 'recadré'],
          category: originalMedia.category,
          isOptimized: true,
          optimizedAt: new Date(),
          uploadedBy: originalMedia.uploadedBy,
        });

        await newMedia.save();

        return res.status(200).json({
          success: true,
          message: 'Image recadrée avec succès',
          media: newMedia,
          originalMedia: originalMedia,
        });
      } else {
        // Remplacer le fichier original (sauvegarder l'ancien d'abord)
        const backupPath = path.join(uploadDir, `backup_${originalMedia.filename}`);
        await fs.copyFile(originalPath, backupPath);
        
        // Remplacer le fichier original
        await fs.copyFile(outputPath, originalPath);
        await fs.unlink(outputPath);

        // Mettre à jour l'enregistrement
        const updatedMedia = await Media.findByIdAndUpdate(
          mediaId,
          {
            fileSize: stats.size,
            dimensions: {
              width: metadata.width,
              height: metadata.height,
            },
            mimeType: `image/${format}`,
            isOptimized: true,
            optimizedAt: new Date(),
          },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: 'Image recadrée et remplacée avec succès',
          media: updatedMedia,
          backupCreated: true,
        });
      }
    } catch (error) {
      console.error('Erreur lors du recadrage:', error);
      return res.status(500).json({ 
        error: 'Erreur lors du recadrage de l\'image',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  } catch (error) {
    console.error('Erreur API crop:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}