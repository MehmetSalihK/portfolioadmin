import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import Media from '@/models/Media';
import connectDB from '@/lib/db';

// API pour servir les images avec optimisation automatique selon le navigateur
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { path: filePath } = req.query;
    
    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ error: 'Chemin de fichier invalide' });
    }

    const fullPath = filePath.join('/');
    
    // Vérifier si c'est un ID de média ou un chemin de fichier
    const isMediaId = filePath.length === 1 && filePath[0].match(/^[0-9a-fA-F]{24}$/);
    
    if (isMediaId) {
      // Servir via ID de média avec optimisation automatique
      await connectDB();
      
      const media = await Media.findById(filePath[0]);
      if (!media) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      // Incrémenter les vues si public
      if (media.isPublic) {
        media.stats.views += 1;
        media.stats.lastAccessed = new Date();
        await media.save();
      }

      // Déterminer le meilleur format selon le navigateur
      const acceptHeader = req.headers.accept || '';
      const supportsWebP = acceptHeader.includes('image/webp');
      const supportsAVIF = acceptHeader.includes('image/avif');
      
      let bestUrl = media.url;
      
      // Prioriser les formats optimisés
      if (media.metadata?.optimizedVersions) {
        if (supportsAVIF && media.metadata.optimizedVersions.avif) {
          bestUrl = media.metadata.optimizedVersions.avif;
        } else if (supportsWebP && media.metadata.optimizedVersions.webp) {
          bestUrl = media.metadata.optimizedVersions.webp;
        } else if (media.metadata.optimizedVersions.optimized) {
          bestUrl = media.metadata.optimizedVersions.optimized;
        }
      }

      // Rediriger vers le fichier optimisé
      return res.redirect(302, bestUrl);
    }

    // Servir directement le fichier
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media');
    const requestedFile = path.join(uploadsDir, fullPath);
    
    // Vérification de sécurité
    if (!requestedFile.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    if (!existsSync(requestedFile)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Lire le fichier
    const fileBuffer = await fs.readFile(requestedFile);
    const stats = await fs.stat(requestedFile);
    
    // Déterminer le type MIME
    const ext = path.extname(requestedFile).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.pdf': 'application/pdf',
    };
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Headers de cache optimisés
    const maxAge = 31536000; // 1 an
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
    res.setHeader('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // Support des requêtes conditionnelles
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];
    
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
    
    if (ifNoneMatch === etag || 
        (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime)) {
      return res.status(304).end();
    }
    
    // Support des requêtes Range pour les vidéos
    const range = req.headers.range;
    if (range && mimeType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);
      
      return res.end(fileBuffer.slice(start, end + 1));
    }
    
    // Servir le fichier complet
    res.status(200).end(fileBuffer);
    
  } catch (error) {
    console.error('Erreur lors du service du fichier:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};