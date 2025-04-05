import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier l'authentification
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  // Seulement les requêtes GET sont autorisées
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await connectDB();
    
    // Récupérer le filtre depuis les paramètres de requête
    const { filter = 'all' } = req.query;
    
    // Construire la requête en fonction du filtre
    let query = {};
    if (filter !== 'all') {
      query = { status: filter };
    }
    
    // Récupérer les messages triés par date de création (les plus récents d'abord)
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
} 