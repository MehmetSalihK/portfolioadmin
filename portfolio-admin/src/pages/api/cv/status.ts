import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import CV from '@/models/CV';

// Endpoint public : indique seulement si un CV est disponible.
// Ne révèle jamais le fichier ni aucune donnée (taille, nom, etc.).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await connectDB();
    const activeCV = await CV.findOne({ isActive: true }).select('_id').lean();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({ available: Boolean(activeCV) });
  } catch (error) {
    console.error('Erreur statut CV:', error);
    return res.status(500).json({ available: false });
  }
}
