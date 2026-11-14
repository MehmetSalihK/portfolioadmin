import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import connectDB from '@/lib/db';
import Media from '@/models/Media';
import { resolveSafePath } from '@/utils/pathSafety';
import { sanitizeFilename } from '@/utils/uploadSafety';

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
    const guard = await requireAdmin(req, res);
    if (!guard) return;

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
    } = req.body || {};

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

    // Validation stricte des options de recadrage
    if (!cropOptions || typeof cropOptions !== 'object') {
      return res.status(400).json({ error: 'Options de recadrage manquantes' });
    }
    const { x, y, width, height, outputWidth, outputHeight, quality = 85, format = 'jpeg' } = cropOptions;

    if (![x, y, width, height].every((n) => typeof n === 'number' && Number.isFinite(n))) {
      return res.status(400).json({ error: 'Paramètres de recadrage invalides' });
    }
    if (x < 0 || y < 0 || width <= 0 || height <= 0 || width > 20000 || height > 20000) {
      return res.status(400).json({ error: 'Paramètres de recadrage invalides' });
    }

    // Liste blanche des formats (une extension arbitraire permettait
    // d'écrire n'importe quel type de fichier dans public/uploads/media).
    const safeFormat: 'jpeg' | 'png' | 'webp' = (['jpeg', 'png', 'webp'] as const).includes(
      format as never
    )
      ? (format as 'jpeg' | 'png' | 'webp')
      : 'jpeg';
    const safeQuality =
      typeof quality === 'number' && Number.isFinite(quality)
        ? Math.min(100, Math.max(1, Math.round(quality)))
        : 85;
    const safeOutputWidth =
      typeof outputWidth === 'number' && Number.isFinite(outputWidth) && outputWidth > 0
        ? Math.min(8000, Math.round(outputWidth))
        : undefined;
    const safeOutputHeight =
      typeof outputHeight === 'number' && Number.isFinite(outputHeight) && outputHeight > 0
        ? Math.min(8000, Math.round(outputHeight))
        : undefined;

    const originalPath = resolveSafePath(
      path.join(process.cwd(), 'public'),
      String(originalMedia.url || '').replace(/^\/+/, '')
    );

    if (!originalPath || !existsSync(originalPath)) {
      return res.status(404).json({ error: 'Fichier original non trouvé' });
    }

    try {
      // Nom de sortie sanitisé : le chemin doit rester dans uploadDir
      // (avant : `newFilename` acceptait « ../../x » → écriture arbitraire).
      const baseName = sanitizeFilename(
        String(newFilename || `${path.parse(originalMedia.filename).name}_cropped_${Date.now()}`)
          .replace(/\.[a-z0-9]{1,10}$/i, '')
      );
      const outputFilename = `${baseName}.${safeFormat}`;
      const outputPath = resolveSafePath(uploadDir, outputFilename);
      if (!outputPath) {
        return res.status(400).json({ error: 'Nom de fichier invalide' });
      }
      const webPath = `/uploads/media/${outputFilename}`;

      // Effectuer le recadrage
      let image = sharp(originalPath)
        .extract({ left: Math.round(x), top: Math.round(y), width: Math.round(width), height: Math.round(height) });

      // Redimensionner si spécifié (dimensions bornées)
      if (safeOutputWidth && safeOutputHeight) {
        image = image.resize(safeOutputWidth, safeOutputHeight, {
          fit: 'fill',
        });
      }

      // Appliquer le format (liste blanche) et la qualité bornée
      switch (safeFormat) {
        case 'jpeg':
          image = image.jpeg({ quality: safeQuality });
          break;
        case 'png':
          image = image.png({ quality: safeQuality });
          break;
        case 'webp':
          image = image.webp({ quality: safeQuality });
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
          mimeType: `image/${safeFormat}`,
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
        const backupName = `backup_${sanitizeFilename(String(originalMedia.filename || 'file'))}`;
        const backupPath = resolveSafePath(uploadDir, backupName);
        if (!backupPath) {
          return res.status(400).json({ error: 'Nom de fichier invalide' });
        }
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
            mimeType: `image/${safeFormat}`,
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
        // Pas de message d'erreur interne en réponse.
        error: 'Erreur lors du recadrage de l\'image'
      });
    }
  } catch (error) {
    console.error('Erreur API crop:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}