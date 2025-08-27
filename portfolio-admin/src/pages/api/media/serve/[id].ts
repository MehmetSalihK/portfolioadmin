import { NextApiRequest, NextApiResponse } from 'next';
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

    // Vérifier si le média est public ou si l'utilisateur est authentifié
    if (!media.isPublic) {
      // Ici, vous pourriez ajouter une vérification d'authentification
      // Pour l'instant, on permet l'accès à tous les médias
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