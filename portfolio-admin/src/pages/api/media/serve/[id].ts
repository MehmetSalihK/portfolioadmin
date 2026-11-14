import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Media from '@/models/Media';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    await connectDB();

    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'ID de média invalide' });
    }

    const media = await Media.findById(id);
    
    if (!media) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    // Média non public : seul l'administrateur y accède. 404 (et non 403)
    // pour ne pas révéler l'existence du média à un tiers.
    if (!media.isPublic) {
      let isAdmin = false;
      try {
        const session = await getServerSession(req, res, authOptions);
        isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';
      } catch {
        isAdmin = false;
      }
      if (!isAdmin) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }
    }

    // Incrémenter le compteur de vues
    await Media.findByIdAndUpdate(id, {
      $inc: { 'stats.views': 1 },
      'stats.lastAccessed': new Date(),
    });

    // Sur Vercel, les fichiers sont stockés en base64 dans un champ séparé
    // Pour cette démo, on redirige vers l'URL publique
    if (media.url.startsWith('http')) {
      return res.redirect(media.url);
    }

    // Si c'est un chemin local, on redirige vers le fichier statique
    return res.redirect(media.url);
  } catch (error) {
    console.error('Erreur lors du service du média:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}