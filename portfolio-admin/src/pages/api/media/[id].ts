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
  console.warn('Sharp non disponible');
  sharp = null;
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media');
const isVercel = process.env.VERCEL === '1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectDB();

    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'ID de média invalide' });
    }

    if (req.method === 'GET') {
      // Récupérer un média spécifique
      const media = await Media.findById(id);
      
      if (!media) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      // Incrémenter le compteur de vues
      await Media.findByIdAndUpdate(id, {
        $inc: { 'stats.views': 1 },
        'stats.lastAccessed': new Date(),
      });

      return res.status(200).json({ media });
    }

    if (req.method === 'PUT') {
      // Mettre à jour un média
      const {
        title,
        description,
        altText,
        tags,
        category,
        isPublic,
      } = req.body;

      const updateData: any = {};
      
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (altText !== undefined) updateData.altText = altText;
      if (tags !== undefined) updateData.tags = tags;
      if (category !== undefined) updateData.category = category;
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      const media = await Media.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!media) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      return res.status(200).json({
        success: true,
        message: 'Média mis à jour avec succès',
        media,
      });
    }

    if (req.method === 'DELETE') {
      // Supprimer un média
      const media = await Media.findById(id);
      
      if (!media) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      // Supprimer les fichiers physiques
      if (!isVercel) {
        try {
          // Supprimer le fichier principal
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

          // Supprimer la miniature si elle existe
          if (media.thumbnailUrl) {
            const thumbnailPath = path.join(process.cwd(), 'public', media.thumbnailUrl);
            if (existsSync(thumbnailPath)) {
              await fs.unlink(thumbnailPath);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la suppression des fichiers:', error);
        }
      }

      // Supprimer l'enregistrement de la base de données
      await Media.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Média supprimé avec succès',
      });
    }

    if (req.method === 'PATCH') {
      // Actions spéciales (archiver, restaurer, régénérer variantes)
      const { action } = req.body;

      const media = await Media.findById(id);
      if (!media) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      switch (action) {
        case 'archive':
          await Media.findByIdAndUpdate(id, {
            archived: true,
            archivedAt: new Date(),
          });
          return res.status(200).json({
            success: true,
            message: 'Média archivé avec succès',
          });

        case 'restore':
          await Media.findByIdAndUpdate(id, {
            archived: false,
            archivedAt: null,
          });
          return res.status(200).json({
            success: true,
            message: 'Média restauré avec succès',
          });

        case 'regenerate-variants':
          if (media.type !== 'image' || !sharp || isVercel) {
            return res.status(400).json({
              error: 'Impossible de régénérer les variantes pour ce type de média',
            });
          }

          try {
            const originalPath = path.join(process.cwd(), 'public', media.url);
            if (!existsSync(originalPath)) {
              return res.status(404).json({ error: 'Fichier original non trouvé' });
            }

            // Supprimer les anciennes variantes
            for (const variant of media.variants) {
              const variantPath = path.join(process.cwd(), 'public', variant.url);
              if (existsSync(variantPath)) {
                await fs.unlink(variantPath);
              }
            }

            // Régénérer les variantes
            const IMAGE_SIZES = {
              thumbnail: { width: 150, height: 150 },
              small: { width: 400, height: 300 },
              medium: { width: 800, height: 600 },
              large: { width: 1200, height: 900 },
            };

            const newVariants = [];
            const image = sharp(originalPath);

            for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
              try {
                const variantFilename = `${path.parse(media.filename).name}_${sizeName}.webp`;
                const variantPath = path.join(uploadDir, variantFilename);

                await image
                  .resize(dimensions.width, dimensions.height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                  })
                  .webp({ quality: 80 })
                  .toFile(variantPath);

                const stats = await fs.stat(variantPath);
                const variantMetadata = await sharp(variantPath).metadata();

                newVariants.push({
                  size: sizeName,
                  width: variantMetadata.width || dimensions.width,
                  height: variantMetadata.height || dimensions.height,
                  url: `/uploads/media/${variantFilename}`,
                  fileSize: stats.size,
                  format: 'webp',
                });
              } catch (error) {
                console.error(`Erreur lors de la régénération de la variante ${sizeName}:`, error);
              }
            }

            await Media.findByIdAndUpdate(id, {
              variants: newVariants,
              isOptimized: true,
              optimizedAt: new Date(),
            });

            return res.status(200).json({
              success: true,
              message: 'Variantes régénérées avec succès',
              variants: newVariants,
            });
          } catch (error) {
            console.error('Erreur lors de la régénération des variantes:', error);
            return res.status(500).json({
              error: 'Erreur lors de la régénération des variantes',
            });
          }

        default:
          return res.status(400).json({ error: 'Action non reconnue' });
      }
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('Erreur API média [id]:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}